/**
 * User profile: thin wrapper around the store + realtime subscription.
 */

import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { scheduleSavedataProfileUploadFromStore } from '@/lib/supabase/savedataStoreScheduling';
import { useUserProfileStore } from '@/store/userProfileStore';
import type { UserProfile } from '@/types/UserProfile';
import { useCallback } from 'react';

export function useUserProfile() {
  const { googlePlayUserId, user } = useSupabaseAuth();
  const savedataUserId = googlePlayUserId ?? user?.id ?? null;
  const getState = useUserProfileStore.getState;
  const profile = useUserProfileStore((state) => state.profile);
  const isLoading = useUserProfileStore((state) => state.isLoading);
  const error = useUserProfileStore((state) => state.error);

  const initializeProfileForUser = useUserProfileStore(
    (state) => state.initializeProfileForUser,
  );
  const storeUpdateProfile = useUserProfileStore((state) => state.updateProfile);
  const clearProfile = useUserProfileStore((state) => state.clearProfile);
  const storeApplyServerProfile = useUserProfileStore(
    (state) => state.applyServerProfile,
  );

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      await storeUpdateProfile(updates);
      scheduleSavedataProfileUploadFromStore(savedataUserId);
    },
    [savedataUserId, storeUpdateProfile],
  );

  const applyServerProfile = useCallback(
    (nextProfile: UserProfile) => {
      storeApplyServerProfile(nextProfile);
      scheduleSavedataProfileUploadFromStore(savedataUserId);
    },
    [savedataUserId, storeApplyServerProfile],
  );

  return {
    profile,
    isLoading,
    error,
    getState,
    /** @deprecated Prefer `initializeProfileForUser`; kept for call sites. */
    loadProfileFromRemote: initializeProfileForUser,
    initializeProfileForUser,
    updateProfile,
    clearProfile,
    applyServerProfile,
  };
}

