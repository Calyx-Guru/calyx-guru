/**
 * User profile types for Zustand store
 */

export interface UserProfile {
  // Identifications
  id: string;
  updated_at: string | undefined;
  username: string | undefined;
  email: string | undefined;
  phone_number: string | undefined;

  // Profile Information
  full_name: string | undefined;
  avatar_url: string | undefined;
  bio: string | undefined;
  website: string | undefined;
  gender: string | undefined;
  date_of_birth: string | undefined;
  location: string | undefined;
  birth_place: string | undefined;
  family_status: string | undefined;
  occupation: string | undefined;
  interests: string[] | undefined;
  social_links: Record<string, any> | undefined;

  // Account Settings
  account_type: string | undefined;
  status: string | undefined;
  subscription_status: string | undefined;
  preferences: Record<string, any> | undefined;
  notification_settings: Record<string, any> | undefined;
  privacy_settings: Record<string, any> | undefined;
  language: string | undefined;
  timezone: string | undefined;
  profile_completion: number;
  referral_code: string | undefined;
  referred_by: string | undefined;
  custom_fields: Record<string, any> | undefined;

  // Security
  two_factor_enabled: boolean;
  failed_login_attempts: number;
  lockout_until: string | undefined;
  password_reset_token: string | undefined;
  password_reset_expires_at: string | undefined;

  // Timestamps
  created_at: string | undefined;
  modified_at: string | undefined;
  last_active_at: string | undefined;
  last_login_at: string | undefined;
  deactivated_at: string | undefined;
  deleted_at: string | undefined;
}
