/**
 * User profile: thin wrapper around the store + realtime subscription.
 */

import { useUserProfileStore } from '@/store/userProfileStore';

export function useUserProfile() {
  const getState = useUserProfileStore.getState;
  const profile = useUserProfileStore((state) => state.profile);  
  const isLoading = useUserProfileStore((state) => state.isLoading);
  const error = useUserProfileStore((state) => state.error);
  
  const initializeProfileForUser = useUserProfileStore(
    (state) => state.initializeProfileForUser,
  );
  const updateProfile = useUserProfileStore((state) => state.updateProfile);
  const clearProfile = useUserProfileStore((state) => state.clearProfile);
  const applyServerProfile = useUserProfileStore(
    (state) => state.applyServerProfile,
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
