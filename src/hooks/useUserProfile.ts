/**
 * User profile: thin wrapper around the store + realtime subscription.
 */

import { subscribeToProfileChangesV2 } from '@/lib/supabase/userProfileService';
import { useUserProfileStore } from '@/store/userProfileStore';
import { useEffect } from 'react';

export function useUserProfile() {
  const profile = useUserProfileStore((state) => state.profile);
  const isLoading = useUserProfileStore((state) => state.isLoading);
  const error = useUserProfileStore((state) => state.error);
  const profileRemoteDisabled = useUserProfileStore(
    (state) => state.profileRemoteDisabled,
  );
  const initializeProfileForUser = useUserProfileStore(
    (state) => state.initializeProfileForUser,
  );
  const updateProfile = useUserProfileStore((state) => state.updateProfile);
  const clearProfile = useUserProfileStore((state) => state.clearProfile);
  const applyServerProfile = useUserProfileStore(
    (state) => state.applyServerProfile,
  );

  useEffect(() => {
    if (!profile?.id || profileRemoteDisabled) return;

    const unsubscribe = subscribeToProfileChangesV2(profile.id, (updated) => {
      applyServerProfile(updated);
    });

    return () => {
      unsubscribe?.();
    };
  }, [profile?.id, profileRemoteDisabled, applyServerProfile]);

  return {
    profile,
    isLoading,
    error,
    profileRemoteDisabled,
    /** @deprecated Prefer `initializeProfileForUser`; kept for call sites. */
    loadProfileFromRemote: initializeProfileForUser,
    initializeProfileForUser,
    updateProfile,
    clearProfile,
    applyServerProfile,
  };
}
