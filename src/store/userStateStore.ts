/**
 * Zustand store for per-user app state (kaucim history, …): same sync pattern as {@link useUserProfileStore}.
 */

import { INITIAL_PET_POWER } from "@/constants";
import {
  clampUserState,
  kaucimHistoryExceedsLimit,
  trimKaucimHistory,
} from "@/lib/app/kaucimHistoryLimit";
import { now } from "@/lib/app/time";
import {
  fetchUserState,
  updateUserState,
} from "@/lib/supabase/userStateService";
import { RemoteSyncedUserDocument } from "@/store/RemoteSyncedUserDocument";
import type {
  KAUCIM_CONCERNS,
  KaucimResult,
  KaucimState,
  UserState,
} from "@/types/UserState";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

const STORAGE_KEY = "userState";

function createDefaultUserState(userId: string): UserState {
  return {
    id: userId,
    petPower: INITIAL_PET_POWER,
    lastKaucimTimestamp: 0,
    lastKaucimResults: {},
    kaucimHistory: [],
    kaucimStoryUnlocks: {},
    lastKaucimRollTimestamp: 0,
    kaucimJourneyProgress: 0,
  };
}

export interface UserStateStore {
  userState: UserState | null;
  isLoading: boolean;
  error: string | null;
  remoteDisabledKey: boolean;

  initializeUserStateForUser: (userId: string | null) => Promise<void>;
  updateUserState: (updates: Partial<UserState>) => Promise<void>;
  clearUserState: () => Promise<void>;
  applyServerUserState: (record: UserState) => void;
  pushKaucimHistory: (result: KaucimResult) => Promise<KaucimState[]>;
  unlockKaucimStory: (
    concern: KAUCIM_CONCERNS,
    stickNumber: number,
  ) => Promise<void>;
  updatePetPower: (power: number) => Promise<void>;
}

export const useUserStateStore = create<UserStateStore>()(
  devtools(
    (set, get) => {
      const sync = new RemoteSyncedUserDocument<UserState, UserStateStore>({
        storageKey: STORAGE_KEY,
        fetchRemote: (userId) => fetchUserState(userId),
        updateRemote: (userId, updates) => updateUserState(userId, updates),
        createDefault: createDefaultUserState,
        recordKey: "userState",
        get,
        set,
      });

      return {
        userState: null,
        isLoading: true,
        error: null,
        remoteDisabledKey: false,

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

        updatePetPower: async (power: number) => {
          const prev = get().userState;
          if (!prev) return;
          await sync.updateRecord({
            petPower: power,
          });
        },

        pushKaucimHistory: async (
          result: KaucimResult,
        ): Promise<KaucimState[]> => {
          const prev = get().userState;
          if (!prev) return [];
          const history = prev.kaucimHistory.slice(0);
          const startOfDayTimestamp =
            Math.floor(result.timestamp / 86400000) * 86400000;
          const existing = history.find(
            (it) => it.startOfDayTimestamp === startOfDayTimestamp,
          );
          if (existing) {
            existing.results[result.concern] = result;
          } else {
            history.push({
              startOfDayTimestamp,
              results: { [result.concern]: result },
            });
          }
          const merged = clampUserState({ ...prev, kaucimHistory: history });
          await sync.updateRecord({
            kaucimHistory: merged.kaucimHistory,
          });
          return merged.kaucimHistory;
        },

        unlockKaucimStory: async (
          concern: KAUCIM_CONCERNS,
          stickNumber: number,
        ) => {
          const prev = get().userState;
          if (!prev) return;
          const storyUnlocks = prev.kaucimStoryUnlocks?.[concern] || {};
          if (storyUnlocks[stickNumber]) return;
          storyUnlocks[stickNumber] = now();
          await sync.updateRecord({
            kaucimStoryUnlocks: {
              ...prev.kaucimStoryUnlocks,
              [concern]: storyUnlocks,
            },
          });
        },
      };
    },
    { name: "UserStateStore" },
  ),
);
