import { ENV } from '@/constants/env';
import { LEGACY_MOCK_AUTH_USER_ID } from '@/lib/auth/savedataUserId';

/** Fixed ids/emails used only by the in-app mock Supabase auth client. */
export const MOCK_DEV_USER_ID = '00000000-0000-4000-8000-000000000001';
export const MOCK_DEV_EMAIL = 'test@example.com';

export function isMockDevUserId(userId: string | null | undefined): boolean {
  return (
    userId === MOCK_DEV_USER_ID || userId === LEGACY_MOCK_AUTH_USER_ID
  );
}

export function isMockDevEmail(email: string | null | undefined): boolean {
  return email?.trim().toLowerCase() === MOCK_DEV_EMAIL;
}

/** True when local persisted auth/profile data came from mock-mode dev sign-in. */
export function isStaleMockDevIdentity(
  userId: string | null | undefined,
  email?: string | null,
): boolean {
  if (ENV.USE_MOCK_DATA) return false;
  return isMockDevUserId(userId) || isMockDevEmail(email);
}
