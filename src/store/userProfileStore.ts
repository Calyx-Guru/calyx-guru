/**
 * Zustand store for user profile: remote-first hydrate, local cache, debounced serial remote saves.
 */

import {
  fetchUserProfile,
  updateUserProfile,
} from '@/lib/supabase/userProfileService';
import { RemoteSyncedUserDocument } from '@/store/RemoteSyncedUserDocument';
import { UserProfile } from '@/types/UserProfile';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const STORAGE_KEY = 'userProfile';

function createDefaultProfile(userId: string): UserProfile {
  return {
    id: userId,
    updated_at: undefined,
    username: undefined,
    email: undefined,
    phone_number: undefined,
    full_name: undefined,
    avatar_url: undefined,
    bio: undefined,
    website: undefined,
    gender: undefined,
    date_of_birth: undefined,
    element: undefined,
    location: undefined,
    birth_place: undefined,
    family_status: undefined,
    occupation: undefined,
    interests: undefined,
    social_links: undefined,
    account_type: undefined,
    status: undefined,
    subscription_status: undefined,
    preferences: undefined,
    notification_settings: undefined,
    privacy_settings: undefined,
    language: undefined,
    timezone: undefined,
    profile_completion: 0,
    referral_code: undefined,
    referred_by: undefined,
    custom_fields: undefined,
    two_factor_enabled: false,
    failed_login_attempts: 0,
    lockout_until: undefined,
    password_reset_token: undefined,
    password_reset_expires_at: undefined,
    created_at: undefined,
    modified_at: undefined,
    last_active_at: undefined,
    last_login_at: undefined,
    deactivated_at: undefined,
    deleted_at: undefined,
  };
}

export interface UserProfileStore {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  /**
   * After the first `fetchUserProfile` throws, we treat the DB as unreachable for this signed-in
   * session: no further profile reads/writes to Supabase until `clearProfile` (e.g. sign-out).
   */
  remoteDisabledKey: boolean;

  initializeProfileForUser: (userId: string | null) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  clearProfile: () => Promise<void>;
  applyServerProfile: (profile: UserProfile) => void;
}

export const useUserProfileStore = create<UserProfileStore>()(
  devtools((set, get) => {
    const sync = new RemoteSyncedUserDocument<UserProfile, UserProfileStore>({
      storageKey: STORAGE_KEY,
      fetchRemote: (userId) => fetchUserProfile(userId),
      updateRemote: (userId, updates) => updateUserProfile(userId, updates),
      createDefault: createDefaultProfile,
      recordKey: 'profile',
      get,
      set
    });

    return {
      profile: null,
      isLoading: true,
      error: null,
      remoteDisabledKey: false,

      initializeProfileForUser: sync.initializeForUser,
      updateProfile: sync.updateRecord,
      clearProfile: sync.clearRecord,
      applyServerProfile: sync.applyServerRecord,
    };
  }, { name: 'UserProfileStore' }),
);
