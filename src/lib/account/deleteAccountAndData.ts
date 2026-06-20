import { isSavedataStorageUserId } from '@/lib/auth/savedataUserId';
import {
  deleteSavedataFromStorage,
  deleteSavedataKindFromStorage,
} from '@/lib/supabase/savedataStorageService';
import { resetSavedataSync } from '@/lib/supabase/savedataSync';

export type DeleteAccountTarget = {
  googlePlayUserId?: string | null;
  supabaseUserId?: string | null;
  guestUserId?: string | null;
};

/**
 * Delete remote user data before clearing local state (Google Play policy).
 * Throws if a required remote delete fails.
 */
export async function deleteRemoteUserData(
  target: DeleteAccountTarget,
): Promise<void> {
  const ids = new Set(
    [target.googlePlayUserId, target.supabaseUserId].filter(
      (id): id is string => !!id,
    ),
  );

  for (const userId of ids) {
    if (isSavedataStorageUserId(userId)) {
      await deleteSavedataFromStorage(userId);
    }
  }
}

/** Delete cloud progression (`state.json`) only; keeps `profile.json`. */
export async function deleteRemoteProgression(
  target: DeleteAccountTarget,
): Promise<void> {
  const ids = new Set(
    [target.googlePlayUserId, target.supabaseUserId].filter(
      (id): id is string => !!id,
    ),
  );

  for (const userId of ids) {
    if (isSavedataStorageUserId(userId)) {
      await deleteSavedataKindFromStorage(userId, 'state');
    }
  }
}

export async function deleteUserProgression(
  target: DeleteAccountTarget,
  resetLocalProgression: () => Promise<void>,
): Promise<void> {
  resetSavedataSync();
  await deleteRemoteProgression(target);
  await resetLocalProgression();
}
