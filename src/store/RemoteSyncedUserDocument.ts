/**
 * Shared remote-first + persisted local storage + debounced serial sync for per-user documents (profile, user state, …).
 */

import { storage } from '@/lib/storage';

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
  debounceMs: number;
  /** Load from API; return null if there is simply no row yet (do not disable remote). Throw only on real failures. */
  fetchRemote: (userId: string) => Promise<T | null>;
  updateRemote: (userId: string, updates: Partial<T>) => Promise<T | null>;
  createDefault: (userId: string) => T;
  recordKey: keyof S & string;
  remoteDisabledKey: keyof S & string;
  get: () => S;
  set: (partial: Partial<S>) => void;
  /** Console / log context */
  label: string;
}

export class RemoteSyncedUserDocument<T extends { id: string }, S extends object> {
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private isRemoteWriting = false;
  private needsAnotherRemoteWrite = false;
  private remoteFlushEpoch = 0;

  constructor(private readonly cfg: RemoteSyncedUserDocumentConfig<T, S>) {}

  initializeForUser = async (userId: string): Promise<void> => {
    this.remoteFlushEpoch++;
    this.cancelDebounce();
    this.needsAnotherRemoteWrite = false;
    this.patch({ isLoading: true, error: null });

    const loadEpoch = this.remoteFlushEpoch;

    if (!this.getRemoteDisabled()) {
      try {
        const remote = await this.cfg.fetchRemote(userId);
        if (loadEpoch !== this.remoteFlushEpoch) return;
        if (remote) {
          this.patch({
            [this.cfg.recordKey]: remote,
            isLoading: false,
            error: null,
            [this.cfg.remoteDisabledKey]: false,
          });
          try {
            await storage.setItem(
              this.cfg.storageKey,
              JSON.stringify(remote),
            );
          } catch (e) {
            console.error(
              `[${this.cfg.label}] Error saving remote record to local storage:`,
              e,
            );
          }
          return;
        }
      } catch (err) {
        if (loadEpoch !== this.remoteFlushEpoch) return;
        this.patch({ [this.cfg.remoteDisabledKey]: true });
        console.warn(
          `[${this.cfg.label}] Remote unreachable (first fetch failed); using local storage only:`,
          err,
        );
      }
    }

    try {
      const raw = await storage.getItem(this.cfg.storageKey);
      if (loadEpoch !== this.remoteFlushEpoch) return;
      if (raw) {
        const parsed = JSON.parse(raw) as T;
        if (parsed?.id === userId) {
          this.patch({
            [this.cfg.recordKey]: parsed,
            isLoading: false,
            error: null,
          });
          return;
        }
      }
    } catch (e) {
      console.error(`[${this.cfg.label}] Error reading local record:`, e);
    }

    if (loadEpoch !== this.remoteFlushEpoch) return;
    const def = this.cfg.createDefault(userId);
    this.patch({
      [this.cfg.recordKey]: def,
      isLoading: false,
      error: null,
    });
    try {
      await storage.setItem(this.cfg.storageKey, JSON.stringify(def));
    } catch (e) {
      console.error(`[${this.cfg.label}] Error saving default record locally:`, e);
    }
  };

  updateRecord = async (updates: Partial<T>): Promise<void> => {
    const prev = this.getRecord();
    if (!prev) return;

    const merged = { ...prev, ...updates } as T;
    this.patch({ [this.cfg.recordKey]: merged, error: null });

    try {
      await storage.setItem(this.cfg.storageKey, JSON.stringify(merged));
    } catch (e) {
      console.error(`[${this.cfg.label}] Error saving record to local storage:`, e);
    }

    this.scheduleRemoteFlush();
  };

  clearRecord = async (): Promise<void> => {
    this.remoteFlushEpoch++;
    this.cancelDebounce();
    this.needsAnotherRemoteWrite = false;
    try {
      await storage.removeItem(this.cfg.storageKey);
    } catch (e) {
      console.error(`[${this.cfg.label}] Error clearing local record:`, e);
    }
    this.patch({
      [this.cfg.recordKey]: null,
      error: null,
      isLoading: false,
      [this.cfg.remoteDisabledKey]: false,
    });
  };

  applyServerRecord = (record: T): void => {
    this.patch({ [this.cfg.recordKey]: record, error: null });
    void storage.setItem(this.cfg.storageKey, JSON.stringify(record)).catch(
      (e) =>
        console.error(
          `[${this.cfg.label}] Error persisting server record locally:`,
          e,
        ),
    );
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
    return Boolean(
      (this.cfg.get() as Record<string, unknown>)[this.cfg.remoteDisabledKey],
    );
  }

  private cancelDebounce(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  private scheduleRemoteFlush(): void {
    if (this.getRemoteDisabled()) return;
    this.cancelDebounce();
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      void this.flushRemote();
    }, this.cfg.debounceMs);
  }

  private async flushRemote(): Promise<void> {
    if (this.getRemoteDisabled()) return;

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
                `[${this.cfg.label}] Error persisting record after remote sync:`,
                e,
              );
            }
          }
        } catch (err) {
          if (epochBefore !== this.remoteFlushEpoch) break;
          const message =
            err instanceof Error ? err.message : 'Failed to sync record';
          this.patch({ error: message });
          console.error(`[${this.cfg.label}] Remote sync error:`, err);
          break;
        }

        if (!this.needsAnotherRemoteWrite) break;
      }
    } finally {
      this.isRemoteWriting = false;
    }
  }
}
