import { isGuestUserId } from '@/lib/app/guestMode';
import { isGooglePlayUserId } from '@/lib/auth/googlePlaySignIn';

const SUPABASE_AUTH_USER_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Supabase Auth user id (email/password, OAuth, …). */
export function isSupabaseAuthUserId(
  userId: string | null | undefined,
): boolean {
  return (
    !!userId &&
    !isGuestUserId(userId) &&
    !isGooglePlayUserId(userId) &&
    SUPABASE_AUTH_USER_ID_RE.test(userId)
  );
}

/** Users whose profile/state JSON is stored under `{prefix}/{userId}/` in Storage. */
export function isSavedataStorageUserId(
  userId: string | null | undefined,
): boolean {
  return isGooglePlayUserId(userId) || isSupabaseAuthUserId(userId);
}

export function resolveSavedataStorageUserId(
  recordId: string | null | undefined,
  fallbackUserId?: string | null,
): string | null {
  if (recordId && isSavedataStorageUserId(recordId)) return recordId;
  if (fallbackUserId && isSavedataStorageUserId(fallbackUserId)) {
    return fallbackUserId;
  }
  return null;
}
