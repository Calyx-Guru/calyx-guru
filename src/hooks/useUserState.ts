import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { scheduleSavedataStateUploadFromStore } from '@/lib/supabase/savedataStoreScheduling';
import { useUserStateStore } from '@/store/userStateStore';
import type {
  KAUCIM_CONCERNS,
  KaucimResult,
  KaucimState,
  UserState,
} from '@/types/UserState';
import { useCallback } from 'react';

export function useUserState() {
  const { googlePlayUserId } = useSupabaseAuth();
  const getState = useUserStateStore.getState;
  const userState = useUserStateStore((s) => s.userState);
  const isLoading = useUserStateStore((s) => s.isLoading);
  const error = useUserStateStore((s) => s.error);

  const initializeUserStateForUser = useUserStateStore(
    (s) => s.initializeUserStateForUser,
  );
  const storeUpdateUserState = useUserStateStore((s) => s.updateUserState);
  const clearUserState = useUserStateStore((s) => s.clearUserState);
  const storeApplyServerUserState = useUserStateStore(
    (s) => s.applyServerUserState,
  );
  const storePushKaucimHistory = useUserStateStore((s) => s.pushKaucimHistory);
  const storeUnlockKaucimStory = useUserStateStore((s) => s.unlockKaucimStory);
  const storeUpdatePetPower = useUserStateStore((s) => s.updatePetPower);

  const scheduleStateUpload = useCallback(() => {
    scheduleSavedataStateUploadFromStore(googlePlayUserId);
  }, [googlePlayUserId]);

  const updateUserState = useCallback(
    async (updates: Partial<UserState>) => {
      await storeUpdateUserState(updates);
      scheduleStateUpload();
    },
    [scheduleStateUpload, storeUpdateUserState],
  );

  const applyServerUserState = useCallback(
    (record: UserState) => {
      storeApplyServerUserState(record);
      scheduleStateUpload();
    },
    [scheduleStateUpload, storeApplyServerUserState],
  );

  const pushKaucimHistory = useCallback(
    async (result: KaucimResult): Promise<KaucimState[]> => {
      const history = await storePushKaucimHistory(result);
      scheduleStateUpload();
      return history;
    },
    [scheduleStateUpload, storePushKaucimHistory],
  );

  const unlockKaucimStory = useCallback(
    async (concern: KAUCIM_CONCERNS, stickNumber: number) => {
      await storeUnlockKaucimStory(concern, stickNumber);
      scheduleStateUpload();
    },
    [scheduleStateUpload, storeUnlockKaucimStory],
  );

  const updatePetPower = useCallback(
    async (power: number) => {
      await storeUpdatePetPower(power);
      scheduleStateUpload();
    },
    [scheduleStateUpload, storeUpdatePetPower],
  );

  return {
    getState,
    userState,
    isLoading,
    error,
    initializeUserStateForUser,
    updateUserState,
    clearUserState,
    applyServerUserState,
    pushKaucimHistory,
    unlockKaucimStory,
    updatePetPower,
  };
}
