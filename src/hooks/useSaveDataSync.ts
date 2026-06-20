import { useSaveDataSyncInternal } from "@/contexts/SaveDataSyncContext";

/**
 * Access Google Play savedata sync (Supabase Storage `calyx-users` bucket).
 *
 * Profile and state are stored as separate JSON files under `{mock|prod}/{userId}/`.
 * Local writes debounce to remote uploads (3s) via the profile/state stores.
 */
export function useSaveDataSync() {
  return useSaveDataSyncInternal();
}
