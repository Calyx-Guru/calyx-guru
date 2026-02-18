/**
 * Custom hook for accessing and managing user profile
 * Provides convenient access to the user profile store and common operations
 */

import {
  fetchUserProfile,
  subscribeToProfileChangesV2,
  updateUserProfile,
} from '@/lib/supabase/userProfileService';
import { useUserProfileStore } from '@/store/userProfileStore';
import { UserProfile } from '@/types/profile';
import { useCallback, useEffect } from 'react';

export function useUserProfile() {
  const profile = useUserProfileStore((state) => state.profile);
  const isLoading = useUserProfileStore((state) => state.isLoading);
  const error = useUserProfileStore((state) => state.error);
  const setProfile = useUserProfileStore((state) => state.setProfile);
  const updateProfileStore = useUserProfileStore(
    (state) => state.updateProfile,
  );
  const clearProfile = useUserProfileStore((state) => state.clearProfile);
  const setLoading = useUserProfileStore((state) => state.setLoading);
  const setError = useUserProfileStore((state) => state.setError);

  /**
   * Load user profile by ID
   */
  const loadProfile = useCallback(
    async (userId: string) => {
      setLoading(true);
      try {
        const userProfile = await fetchUserProfile(userId);
        if (userProfile) {
          setProfile(userProfile);
        }
        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load profile';
        setError(errorMessage);
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    },
    [setProfile, setLoading, setError],
  );

  /**
   * Update user profile
   */
  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!profile) return;

      setLoading(true);
      try {
        const updatedProfile = await updateUserProfile(profile.id, updates);
        if (updatedProfile) {
          setProfile(updatedProfile);
        }
        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update profile';
        setError(errorMessage);
        console.error('Error updating profile:', err);
      } finally {
        setLoading(false);
      }
    },
    [profile, setProfile, setLoading, setError],
  );

  /**
   * Subscribe to real-time profile changes
   */
  useEffect(() => {
    if (!profile?.id) return;

    const unsubscribe = subscribeToProfileChangesV2(
      profile.id,
      (updatedProfile) => {
        setProfile(updatedProfile);
      },
    );

    return () => {
      unsubscribe?.();
    };
  }, [profile?.id, setProfile]);

  return {
    profile,
    isLoading,
    error,
    loadProfile,
    updateProfile,
    clearProfile,
    setProfile,
  };
}
