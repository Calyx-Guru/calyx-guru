/**
 * Shared remote-first + persisted local storage + debounced serial sync for per-user documents (profile, user state, …).
 */

import { isGuestUserId } from '@/lib/app/guestMode';
import { isStaleMockDevIdentity } from '@/lib/auth/mockDevIdentity';
import { isSavedataStorageUserId } from '@/lib/auth/savedataUserId';
import { getStoredUserEmail } from '@/lib/auth/userEmailStorage';
import {
  hydrateSavedataFromStorage,
  resetSavedataSync,
  scheduleSavedataProfileUpload,
  scheduleSavedataStateUpload,
} from '@/lib/supabase/savedataSync';
import type { SavedataKind } from '@/lib/supabase/savedataStorageService';
import {
  isSavedataStorageEnabled,
  upsertSavedataJson,
} from '@/lib/supabase/savedataStorageService';
import { storage } from '@/lib/storage';

function isLocalOnlyUserId(userId: string | null | undefined): boolean {
  return isGuestUserId(userId) || isSavedataStorageUserId(userId);
}

const REMOTE_DEBOUNCE_MS = 400;

export function entityToRemoteUpdates<T extends { id: string }>(
  entity: T,
): Partial<T> {
  const updates: Partial<T> = {};
  for (const key of Object.keys(entity) as (keyof T)[]) {
    if (key === 'id') continue;
    const v = entity[key];
    if (v !== undefined) {
      (updates as Record<string, unknown>)[key as string] = v;
    }
  }
  return updates;
}

export interface RemoteSyncedUserDocumentConfig<
  T extends { id: string },
  S extends object,
> {
  storageKey: string;
  debounceMs?: number;
  /** When set, Google Play users sync this document via Supabase Storage (`calyx-users`). */
  savedataKind?: SavedataKind;
  /** Load from API; return null if there is simply no row yet (do not disable remote). Throw only on real failures. */
  fetchRemote: (userId: string) => Promise<T | null>;
  updateRemote: (userId: string, updates: Partial<T>) => Promise<T | null>;
  createDefault: (userId: string) => T;
  recordKey: keyof S & string;
  get: () => S;
  set: (partial: Partial<S>) => void;
}

export class RemoteSyncedUserDocument<T extends { id: string }, S extends object> {
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private isRemoteWriting = false;
  private needsAnotherRemoteWrite = false;
  private remoteFlushEpoch = 0;
  private debounceMs = REMOTE_DEBOUNCE_MS;
  private label: string;
  private currentUserId: string | null = null;
  private currentStoragePathKey: string | null = null;

  constructor(private readonly cfg: RemoteSyncedUserDocumentConfig<T, S>) {
    this.debounceMs = cfg.debounceMs ?? REMOTE_DEBOUNCE_MS;
    this.label = cfg.recordKey;
  }

  initializeForUser = async (userId: string | null): Promise<void> => {
    this.currentUserId = userId;
    this.currentStoragePathKey =
      userId && isSavedataStorageUserId(userId)
        ? await getStoredUserEmail()
        : null;
    this.remoteFlushEpoch++;
    this.cancelDebounce();
    this.needsAnotherRemoteWrite = false;
    resetSavedataSync();
    this.patch({ isLoading: true, error: null });

    const loadEpoch = this.remoteFlushEpoch;
    let shouldBackfillSavedata = false;

    if (
      userId &&
      isSavedataStorageUserId(userId) &&
      this.cfg.savedataKind &&
      this.currentStoragePathKey
    ) {
      try {
        const remote = await hydrateSavedataFromStorage<T>(
          this.currentStoragePathKey,
          userId,
          this.cfg.savedataKind,
        );
        if (loadEpoch !== this.remoteFlushEpoch) return;
        if (remote) {
          this.patch({
            [this.cfg.recordKey]: remote,
            isLoading: false,
            error: null,
          });
          try {
            await storage.setItem(this.cfg.storageKey, JSON.stringify(remote));
          } catch (e) {
            console.error(
              `[${this.label}] Error saving savedata record to local storage:`,
              e,
            );
          }
          return;
        }
        shouldBackfillSavedata = true;
      } catch (err) {
        if (loadEpoch !== this.remoteFlushEpoch) return;
        shouldBackfillSavedata = true;
        console.warn(
          `[${this.label}] Savedata storage fetch failed; using local storage:`,
          err,
        );
      }
    }

    if (!this.getRemoteDisabled() && userId && !isLocalOnlyUserId(userId)) {
      try {
        const remote = await this.cfg.fetchRemote(userId);
        if (loadEpoch !== this.remoteFlushEpoch) return;
        if (remote) {
          this.patch({
            [this.cfg.recordKey]: remote,
            isLoading: false,
            error: null,
            remoteDisabledKey: false,
          });
          try {
            await storage.setItem(
              this.cfg.storageKey,
              JSON.stringify(remote),
            );
          } catch (e) {
            console.error(
              `[${this.label}] Error saving remote record to local storage:`,
              e,
            );
          }
          return;
        }
      } catch (err) {
        if (loadEpoch !== this.remoteFlushEpoch) return;
        this.patch({ remoteDisabledKey: true });
        console.warn(
          `[${this.label}] Remote unreachable (first fetch failed); using local storage only:`,
          err,
        );
      }
    }

    try {
      const raw = await storage.getItem(this.cfg.storageKey);
      if (loadEpoch !== this.remoteFlushEpoch) return;
      if (raw) {
        const parsed = JSON.parse(raw) as T;
        const parsedEmail =
          typeof (parsed as { email?: unknown }).email === 'string'
            ? (parsed as { email: string }).email
            : undefined;

        if (isStaleMockDevIdentity(parsed.id, parsedEmail)) {
          console.warn(
            `[${this.label}] Discarding stale mock-mode local cache for ${parsed.id}`,
          );
          await storage.removeItem(this.cfg.storageKey);
        } else {
          const record = this.withUserId(parsed, userId);
          this.patch({
            [this.cfg.recordKey]: record,
            isLoading: false,
            error: null,
          });
          try {
            await storage.setItem(this.cfg.storageKey, JSON.stringify(record));
          } catch (e) {
            console.error(`[${this.label}] Error persisting local record:`, e);
          }
          if (shouldBackfillSavedata && userId) {
            this.backfillSavedataToStorage(record, userId);
          }
          return;
        }
      }
    } catch (e) {
      console.error(`[${this.label}] Error reading local record:`, e);
    }

    if (loadEpoch !== this.remoteFlushEpoch) return;
    const def = this.withUserId(this.cfg.createDefault(userId ?? ''), userId);
    this.patch({
      [this.cfg.recordKey]: def,
      isLoading: false,
      error: null,
    });
    try {
      await storage.setItem(this.cfg.storageKey, JSON.stringify(def));
    } catch (e) {
      console.error(`[${this.label}] Error saving default record locally:`, e);
    }
  };

  updateRecord = async (updates: Partial<T>): Promise<void> => {
    const prev = this.getRecord();
    if (!prev) return;

    const merged = this.withUserId({ ...prev, ...updates } as T, this.currentUserId);
    this.patch({ [this.cfg.recordKey]: merged, error: null });

    try {
      await storage.setItem(this.cfg.storageKey, JSON.stringify(merged));
      console.info(`[${this.label}] Record saved to local storage:`, merged);
    } catch (e) {
      console.error(`[${this.label}] Error saving record to local storage:`, e);
    }

    this.scheduleRemoteFlush();
    this.scheduleSavedataFlush();
  };

  clearRecord = async (): Promise<void> => {
    this.currentUserId = null;
    this.currentStoragePathKey = null;
    this.remoteFlushEpoch++;
    this.cancelDebounce();
    this.needsAnotherRemoteWrite = false;
    resetSavedataSync();
    try {
      await storage.removeItem(this.cfg.storageKey);
    } catch (e) {
      console.error(`[${this.label}] Error clearing local record:`, e);
    }
    this.patch({
      [this.cfg.recordKey]: null,
      error: null,
      isLoading: false,
      remoteDisabledKey: false,
    });
  };

  applyServerRecord = (record: T): void => {
    const normalized = this.withUserId(record, this.currentUserId);
    this.patch({ [this.cfg.recordKey]: normalized, error: null });
    void storage.setItem(this.cfg.storageKey, JSON.stringify(normalized)).catch(
      (e) =>
        console.error(
          `[${this.label}] Error persisting server record locally:`,
          e,
        ),
    );
    this.scheduleSavedataFlush();
  };

  private patch(partial: Record<string, unknown>): void {
    this.cfg.set(partial as unknown as Partial<S>);
  }

  private getRecord(): T | null {
    return (
      ((this.cfg.get() as Record<string, unknown>)[this.cfg.recordKey] as
        | T
        | null) ?? null
    );
  }

  private getRemoteDisabled(): boolean {
    return Boolean((this.cfg.get() as Record<string, unknown>).remoteDisabledKey);
  }

  private cancelDebounce(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  private shouldSkipRemoteSync(): boolean {
    const userId = this.currentUserId ?? this.getRecord()?.id ?? null;
    return this.getRemoteDisabled() || isLocalOnlyUserId(userId);
  }

  private scheduleRemoteFlush(): void {
    if (this.shouldSkipRemoteSync()) return;
    this.cancelDebounce();
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      void this.flushRemote();
    }, this.debounceMs);
  }

  private scheduleSavedataFlush(): void {
    const userId = this.resolveSavedataUserId();
    const storagePathKey = this.currentStoragePathKey;
    if (!userId || !storagePathKey || !this.cfg.savedataKind) {
      return;
    }

    const getPayload = (): T | null => {
      const record = this.getRecord();
      if (!record) return null;
      return this.withUserId(record, userId);
    };

    if (this.cfg.savedataKind === 'profile') {
      scheduleSavedataProfileUpload(userId, storagePathKey, getPayload);
    } else {
      scheduleSavedataStateUpload(userId, storagePathKey, getPayload);
    }
  }

  private resolveSavedataUserId(): string | null {
    const record = this.getRecord();
    if (record?.id && isSavedataStorageUserId(record.id)) {
      return record.id;
    }
    if (this.currentUserId && isSavedataStorageUserId(this.currentUserId)) {
      return this.currentUserId;
    }
    return null;
  }

  private withUserId(record: T, userId: string | null): T {
    if (!userId) return record;
    return { ...record, id: userId };
  }

  /** Upload local record when remote savedata file is missing (non-blocking). */
  private backfillSavedataToStorage(record: T, userId: string): void {
    const storagePathKey = this.currentStoragePathKey;
    if (
      !this.cfg.savedataKind ||
      !isSavedataStorageEnabled(userId, storagePathKey)
    ) {
      return;
    }

    const payload = this.withUserId(record, userId);
    void upsertSavedataJson(storagePathKey!, this.cfg.savedataKind, payload)
      .then(() => {
        console.info(
          `[${this.label}] Backfilled local savedata to storage in background`,
        );
      })
      .catch((err) => {
        console.warn(`[${this.label}] Savedata backfill failed:`, err);
      });
  }

  private async flushRemote(): Promise<void> {
    if (this.shouldSkipRemoteSync()) return;

    if (this.isRemoteWriting) {
      this.needsAnotherRemoteWrite = true;
      return;
    }

    this.isRemoteWriting = true;
    try {
      while (true) {
        this.needsAnotherRemoteWrite = false;
        const record = this.getRecord();
        if (!record?.id) break;

        const epochBefore = this.remoteFlushEpoch;

        try {
          const payload = entityToRemoteUpdates(record);
          const updated = await this.cfg.updateRemote(record.id, payload);
          if (epochBefore !== this.remoteFlushEpoch) break;
          if (updated && this.getRecord()?.id === record.id) {
            this.patch({ [this.cfg.recordKey]: updated, error: null });
            try {
              await storage.setItem(
                this.cfg.storageKey,
                JSON.stringify(updated),
              );
            } catch (e) {
              console.error(
                `[${this.label}] Error persisting record after remote sync:`,
                e,
              );
            }
          }
        } catch (err) {
          if (epochBefore !== this.remoteFlushEpoch) break;
          const message =
            err instanceof Error ? err.message : 'Failed to sync record';
          this.patch({ error: message });
          console.error(`[${this.label}] Remote sync error:`, err);
          break;
        }

        if (!this.needsAnotherRemoteWrite) break;
      }
    } finally {
      this.isRemoteWriting = false;
    }
  }
}
