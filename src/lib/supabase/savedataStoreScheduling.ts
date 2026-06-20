import { resolveSavedataStorageUserId } from '@/lib/auth/savedataUserId';
import { isSavedataStorageEnabled } from '@/lib/supabase/savedataStorageService';
import {
  scheduleSavedataProfileUpload,
  scheduleSavedataStateUpload,
} from '@/lib/supabase/savedataSync';
import { useUserProfileStore } from '@/store/userProfileStore';
import { useUserStateStore } from '@/store/userStateStore';

export { resolveSavedataStorageUserId as resolveSavedataUserId };

/** Debounced upload of the latest profile from the Zustand store. */
export function scheduleSavedataProfileUploadFromStore(
  fallbackUserId?: string | null,
): void {
  const profile = useUserProfileStore.getState().profile;
  const userId = resolveSavedataStorageUserId(profile?.id, fallbackUserId);
  if (!userId || !isSavedataStorageEnabled(userId)) return;

  scheduleSavedataProfileUpload(userId, () => {
    const latest = useUserProfileStore.getState().profile;
    return latest ? { ...latest, id: userId } : null;
  });
}

/** Debounced upload of the latest user state from the Zustand store. */
export function scheduleSavedataStateUploadFromStore(
  fallbackUserId?: string | null,
): void {
  const userState = useUserStateStore.getState().userState;
  const userId = resolveSavedataStorageUserId(userState?.id, fallbackUserId);
  if (!userId || !isSavedataStorageEnabled(userId)) return;

  scheduleSavedataStateUpload(userId, () => {
    const latest = useUserStateStore.getState().userState;
    return latest ? { ...latest, id: userId } : null;
  });
}
