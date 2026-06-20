import {
  fetchSavedataJson,
  getSavedataObjectPath,
  isSavedataStorageEnabled,
  type SavedataKind,
  upsertSavedataJson,
} from "@/lib/supabase/savedataStorageService";

export const SAVEDATA_SYNC_DEBOUNCE_MS = 3000;

export type SavedataSyncStatus = {
  isUploadingProfile: boolean;
  isUploadingState: boolean;
  lastError: string | null;
};

type SyncListener = (status: SavedataSyncStatus) => void;

const listeners = new Set<SyncListener>();

let status: SavedataSyncStatus = {
  isUploadingProfile: false,
  isUploadingState: false,
  lastError: null,
};

function emit(): void {
  for (const listener of listeners) {
    listener(status);
  }
}

function patchStatus(partial: Partial<SavedataSyncStatus>): void {
  status = { ...status, ...partial };
  emit();
}

export function getSavedataSyncStatus(): SavedataSyncStatus {
  return status;
}

export function subscribeSavedataSync(listener: SyncListener): () => void {
  listeners.add(listener);
  listener(status);
  return () => listeners.delete(listener);
}

class DebouncedSavedataUploader<T extends { id: string }> {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private userId: string | null = null;
  private getPayload: (() => T | null) | null = null;
  private isUploading = false;
  private needsAnotherWrite = false;
  private epoch = 0;

  constructor(
    private readonly kind: SavedataKind,
    private readonly uploadingKey: keyof SavedataSyncStatus,
  ) {}

  schedule(userId: string, getPayload: () => T | null): void {
    if (!isSavedataStorageEnabled(userId)) {
      console.warn(
        `[savedata:${this.kind}] Skipping upload — storage sync disabled for userId=${userId || "(empty)"}`,
      );
      return;
    }

    this.userId = userId;
    this.getPayload = getPayload;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.flush();
    }, SAVEDATA_SYNC_DEBOUNCE_MS);
    console.info(
      `[savedata:${this.kind}] Upload scheduled in ${SAVEDATA_SYNC_DEBOUNCE_MS}ms for ${userId}`,
    );
  }

  cancel(): void {
    this.epoch++;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.userId = null;
    this.getPayload = null;
    this.needsAnotherWrite = false;
    patchStatus({ [this.uploadingKey]: false } as Partial<SavedataSyncStatus>);
  }

  private async flush(): Promise<void> {
    if (!this.userId || !this.getPayload) return;

    if (this.isUploading) {
      this.needsAnotherWrite = true;
      return;
    }

    this.isUploading = true;
    patchStatus({ [this.uploadingKey]: true, lastError: null } as Partial<SavedataSyncStatus>);

    try {
      while (true) {
        this.needsAnotherWrite = false;
        const userId = this.userId;
        const getPayload = this.getPayload;
        if (!userId || !getPayload) break;

        const epochBefore = this.epoch;
        const payload = getPayload();
        if (!payload) break;

        try {
          await upsertSavedataJson(userId, this.kind, { ...payload, id: userId });
          console.info(
            `[savedata:${this.kind}] Uploaded ${getSavedataObjectPath(userId, this.kind)}`,
          );
          patchStatus({ lastError: null });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Failed to upload savedata";
          patchStatus({ lastError: message });
          console.error(`[savedata:${this.kind}] Upload failed:`, err);
          break;
        }

        if (epochBefore !== this.epoch) break;
        if (!this.needsAnotherWrite) break;
      }
    } finally {
      this.isUploading = false;
      patchStatus({ [this.uploadingKey]: false } as Partial<SavedataSyncStatus>);
    }
  }
}

const profileUploader = new DebouncedSavedataUploader<{ id: string }>(
  "profile",
  "isUploadingProfile",
);
const stateUploader = new DebouncedSavedataUploader<{ id: string }>(
  "state",
  "isUploadingState",
);

export function scheduleSavedataProfileUpload(
  userId: string,
  getPayload: () => { id: string } | null,
): void {
  profileUploader.schedule(userId, getPayload);
}

export function scheduleSavedataStateUpload(
  userId: string,
  getPayload: () => { id: string } | null,
): void {
  stateUploader.schedule(userId, getPayload);
}

export function resetSavedataSync(): void {
  profileUploader.cancel();
  stateUploader.cancel();
  patchStatus({
    isUploadingProfile: false,
    isUploadingState: false,
    lastError: null,
  });
}

export async function hydrateSavedataFromStorage<T extends { id: string }>(
  userId: string,
  kind: SavedataKind,
): Promise<T | null> {
  if (!isSavedataStorageEnabled(userId)) return null;
  const remote = await fetchSavedataJson<T>(userId, kind);
  if (!remote) return null;
  return { ...remote, id: userId };
}
