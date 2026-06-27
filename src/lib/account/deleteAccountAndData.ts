import { isSavedataStorageUserId, isGoogleEmailUserId } from '@/lib/auth/savedataUserId';
import {
  deleteSavedataFromStorage,
  deleteSavedataKindFromStorage,
} from '@/lib/supabase/savedataStorageService';
import { resetSavedataSync } from '@/lib/supabase/savedataSync';

export type DeleteAccountTarget = {
  supabaseUserId?: string | null;
  guestUserId?: string | null;
  userEmail?: string | null;
};

function hasSavedataTarget(target: DeleteAccountTarget): boolean {
  const storagePathKey = target.userEmail?.trim();
  if (!storagePathKey) return false;

  return (
    (!!target.supabaseUserId &&
      isSavedataStorageUserId(target.supabaseUserId)) ||
    isGoogleEmailUserId(storagePathKey)
  );
}

async function deleteSavedataForTarget(target: DeleteAccountTarget): Promise<void> {
  const storagePathKey = target.userEmail?.trim();
  if (!storagePathKey) return;
  await deleteSavedataFromStorage(storagePathKey);
}

async function deleteSavedataProgressionForTarget(
  target: DeleteAccountTarget,
): Promise<void> {
  const storagePathKey = target.userEmail?.trim();
  if (!storagePathKey) return;
  await deleteSavedataKindFromStorage(storagePathKey, 'state');
}

/**
 * Delete remote user data before clearing local state.
 * Throws if a required remote delete fails.
 */
export async function deleteRemoteUserData(
  target: DeleteAccountTarget,
): Promise<void> {
  if (hasSavedataTarget(target)) {
    await deleteSavedataForTarget(target);
  }
}

/** Delete cloud progression (`state.json`) only; keeps `profile.json`. */
export async function deleteRemoteProgression(
  target: DeleteAccountTarget,
): Promise<void> {
  if (hasSavedataTarget(target)) {
    await deleteSavedataProgressionForTarget(target);
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
