/**
 * Zustand store for user profile management
 * Handles storing, updating, and clearing user profile data
 */

import { UserProfile } from '@/types/profile';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UserProfileStore {
  // State
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearProfile: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUserProfileStore = create<UserProfileStore>()(
  devtools(
    (set) => ({
      // Initial state
      profile: null,
      isLoading: false,
      error: null,

      // Actions
      setProfile: (profile) => set({ profile, error: null }),

      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
          error: null,
        })),

      clearProfile: () => set({ profile: null, error: null }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),
    }),
    {
      name: 'UserProfileStore',
    },
  ),
);
