/**
 * Zustand store for per-user app state (kaucim history, …): same sync pattern as {@link useUserProfileStore}.
 */

import {
  clampUserState,
  kaucimHistoryExceedsLimit,
  trimKaucimHistory,
} from '@/lib/app/kaucimHistoryLimit';
import {
  fetchUserState,
  updateUserState,
} from '@/lib/supabase/userStateService';
import { RemoteSyncedUserDocument } from '@/store/RemoteSyncedUserDocument';
import type { UserState } from '@/types/UserState';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const STORAGE_KEY = 'userState';
const REMOTE_DEBOUNCE_MS = 400;

function createDefaultUserState(userId: string): UserState {
  return {
    id: userId,
    kaucimHistory: [],
  };
}

export interface UserStateStore {
  userState: UserState | null;
  isLoading: boolean;
  error: string | null;
  userStateRemoteDisabled: boolean;

  initializeUserStateForUser: (userId: string) => Promise<void>;
  updateUserState: (updates: Partial<UserState>) => Promise<void>;
  clearUserState: () => Promise<void>;
  applyServerUserState: (record: UserState) => void;
}

export const useUserStateStore = create<UserStateStore>()(
  devtools((set, get) => {
    const sync = new RemoteSyncedUserDocument<UserState, UserStateStore>({
      storageKey: STORAGE_KEY,
      debounceMs: REMOTE_DEBOUNCE_MS,
      fetchRemote: (userId) => fetchUserState(userId),
      updateRemote: (userId, updates) => updateUserState(userId, updates),
      createDefault: createDefaultUserState,
      recordKey: 'userState',
      remoteDisabledKey: 'userStateRemoteDisabled',
      get,
      set,
      label: 'UserState',
    });

    return {
      userState: null,
      isLoading: false,
      error: null,
      userStateRemoteDisabled: false,

      initializeUserStateForUser: async (userId: string) => {
        await sync.initializeForUser(userId);
        const s = get().userState;
        if (s && kaucimHistoryExceedsLimit(s.kaucimHistory)) {
          await sync.updateRecord({
            kaucimHistory: trimKaucimHistory(s.kaucimHistory),
          });
        }
      },

      updateUserState: async (updates: Partial<UserState>) => {
        const prev = get().userState;
        if (!prev) return;
        const merged = clampUserState({ ...prev, ...updates });
        await sync.updateRecord({
          ...updates,
          kaucimHistory: merged.kaucimHistory,
        });
      },

      clearUserState: sync.clearRecord,

      applyServerUserState: (record: UserState) => {
        sync.applyServerRecord(clampUserState(record));
      },
    };
  }, { name: 'UserStateStore' }),
);
