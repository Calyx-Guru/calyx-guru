/**
 * User profile types for Zustand store
 */

export interface UserProfile {
  // Identifications
  id: string;
  updated_at: string | null;
  username: string | null;
  email: string | null;
  phone_number: string | null;

  // Profile Information
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  gender: string | null;
  date_of_birth: string | null;
  location: string | null;
  birth_place: string | null;
  family_status: string | null;
  occupation: string | null;
  interests: string[] | null;
  social_links: Record<string, any> | null;

  // Account Settings
  account_type: string | null;
  status: string | null;
  subscription_status: string | null;
  preferences: Record<string, any> | null;
  notification_settings: Record<string, any> | null;
  privacy_settings: Record<string, any> | null;
  language: string | null;
  timezone: string | null;
  profile_completion: number;
  referral_code: string | null;
  referred_by: string | null;
  custom_fields: Record<string, any> | null;

  // Security
  two_factor_enabled: boolean;
  failed_login_attempts: number;
  lockout_until: string | null;
  password_reset_token: string | null;
  password_reset_expires_at: string | null;

  // Timestamps
  created_at: string;
  modified_at: string;
  last_active_at: string | null;
  last_login_at: string | null;
  deactivated_at: string | null;
  deleted_at: string | null;
}
