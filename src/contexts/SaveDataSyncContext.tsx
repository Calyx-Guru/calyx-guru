import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserState } from "@/hooks/useUserState";
import {
  fetchSavedataJson,
  getSavedataDebugInfo,
  getSavedataObjectPath,
  isSavedataStorageEnabled,
  upsertSavedataJson,
} from "@/lib/supabase/savedataStorageService";
import {
  getSavedataSyncStatus,
  hydrateSavedataFromStorage,
  resetSavedataSync,
  subscribeSavedataSync,
  type SavedataSyncStatus,
} from "@/lib/supabase/savedataSync";
import { storage } from "@/lib/storage";
import type { UserProfile } from "@/types/UserProfile";
import type { UserState } from "@/types/UserState";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const PROFILE_STORAGE_KEY = "userProfile";
const STATE_STORAGE_KEY = "userState";

export type SavedataSyncActionResult = {
  ok: boolean;
  kind: "profile" | "state" | "all";
  path?: string;
  message: string;
};

type SaveDataSyncContextValue = {
  userId: string | null;
  isEnabled: boolean;
  syncStatus: SavedataSyncStatus;
  debugInfo: ReturnType<typeof getSavedataDebugInfo>;
  readProfile: () => Promise<UserProfile | null>;
  readState: () => Promise<UserState | null>;
  upsertProfile: (profile: UserProfile) => Promise<void>;
  upsertState: (state: UserState) => Promise<void>;
  refreshFromStorage: () => Promise<void>;
  pushLocalProfileToRemote: () => Promise<SavedataSyncActionResult>;
  pushLocalStateToRemote: () => Promise<SavedataSyncActionResult>;
  pullAllFromRemote: () => Promise<SavedataSyncActionResult[]>;
};

export const SaveDataSyncContext = createContext<SaveDataSyncContextValue | null>(
  null,
);

export function SaveDataSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userEmail } = useSupabaseAuth();
  const { profile, applyServerProfile } = useUserProfile();
  const { userState, applyServerUserState } = useUserState();
  const [syncStatus, setSyncStatus] = useState(getSavedataSyncStatus);

  useEffect(() => subscribeSavedataSync(setSyncStatus), []);

  const userId = user?.id ?? null;
  const storagePathKey = userEmail;
  const isEnabled = isSavedataStorageEnabled(userId, storagePathKey);
  const debugInfo = useMemo(
    () => getSavedataDebugInfo(userId, storagePathKey),
    [storagePathKey, userId],
  );

  const readProfile = useCallback(async () => {
    if (!userId || !storagePathKey) return null;
    return hydrateSavedataFromStorage<UserProfile>(
      storagePathKey,
      userId,
      "profile",
    );
  }, [storagePathKey, userId]);

  const readState = useCallback(async () => {
    if (!userId || !storagePathKey) return null;
    return hydrateSavedataFromStorage<UserState>(
      storagePathKey,
      userId,
      "state",
    );
  }, [storagePathKey, userId]);

  const upsertProfile = useCallback(
    async (profile: UserProfile) => {
      if (!userId || !storagePathKey) return;
      await upsertSavedataJson(storagePathKey, "profile", { ...profile, id: userId });
      applyServerProfile({ ...profile, id: userId });
      await storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    },
    [applyServerProfile, storagePathKey, userId],
  );

  const upsertState = useCallback(
    async (state: UserState) => {
      if (!userId || !storagePathKey) return;
      await upsertSavedataJson(storagePathKey, "state", { ...state, id: userId });
      applyServerUserState({ ...state, id: userId });
      await storage.setItem(STATE_STORAGE_KEY, JSON.stringify(state));
    },
    [applyServerUserState, storagePathKey, userId],
  );

  const refreshFromStorage = useCallback(async () => {
    if (!userId || !storagePathKey) return;

    const [remoteProfile, remoteState] = await Promise.all([
      fetchSavedataJson<UserProfile>(storagePathKey, "profile"),
      fetchSavedataJson<UserState>(storagePathKey, "state"),
    ]);

    if (remoteProfile) {
      const profile = { ...remoteProfile, id: userId };
      applyServerProfile(profile);
      await storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    }

    if (remoteState) {
      const userState = { ...remoteState, id: userId };
      applyServerUserState(userState);
      await storage.setItem(STATE_STORAGE_KEY, JSON.stringify(userState));
    }
  }, [applyServerProfile, applyServerUserState, storagePathKey, userId]);

  const pushLocalProfileToRemote =
    useCallback(async (): Promise<SavedataSyncActionResult> => {
      const path = storagePathKey
        ? getSavedataObjectPath(storagePathKey, "profile")
        : undefined;
      if (!userId || !storagePathKey || !profile) {
        return {
          ok: false,
          kind: "profile",
          path,
          message: "No signed-in user email or local profile loaded",
        };
      }
      try {
        await upsertSavedataJson(storagePathKey, "profile", {
          ...profile,
          id: userId,
        });
        return { ok: true, kind: "profile", path, message: "Profile uploaded" };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { ok: false, kind: "profile", path, message };
      }
    }, [profile, storagePathKey, userId]);

  const pushLocalStateToRemote =
    useCallback(async (): Promise<SavedataSyncActionResult> => {
      const path = storagePathKey
        ? getSavedataObjectPath(storagePathKey, "state")
        : undefined;
      if (!userId || !storagePathKey || !userState) {
        return {
          ok: false,
          kind: "state",
          path,
          message: "No signed-in user email or local state loaded",
        };
      }
      try {
        await upsertSavedataJson(storagePathKey, "state", {
          ...userState,
          id: userId,
        });
        return { ok: true, kind: "state", path, message: "State uploaded" };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { ok: false, kind: "state", path, message };
      }
    }, [storagePathKey, userId, userState]);

  const pullAllFromRemote = useCallback(async (): Promise<
    SavedataSyncActionResult[]
  > => {
    if (!userId || !storagePathKey) {
      return [
        {
          ok: false,
          kind: "all",
          message: "No signed-in user with email available",
        },
      ];
    }

    const results: SavedataSyncActionResult[] = [];

    try {
      const remoteProfile = await fetchSavedataJson<UserProfile>(
        storagePathKey,
        "profile",
      );
      if (remoteProfile) {
        const nextProfile = { ...remoteProfile, id: userId };
        applyServerProfile(nextProfile);
        await storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
        results.push({
          ok: true,
          kind: "profile",
          path: getSavedataObjectPath(storagePathKey, "profile"),
          message: "Profile downloaded and applied",
        });
      } else {
        results.push({
          ok: false,
          kind: "profile",
          path: getSavedataObjectPath(storagePathKey, "profile"),
          message: "No remote profile file found",
        });
      }
    } catch (err) {
      results.push({
        ok: false,
        kind: "profile",
        path: getSavedataObjectPath(storagePathKey, "profile"),
        message: err instanceof Error ? err.message : String(err),
      });
    }

    try {
      const remoteState = await fetchSavedataJson<UserState>(
        storagePathKey,
        "state",
      );
      if (remoteState) {
        const nextState = { ...remoteState, id: userId };
        applyServerUserState(nextState);
        await storage.setItem(STATE_STORAGE_KEY, JSON.stringify(nextState));
        results.push({
          ok: true,
          kind: "state",
          path: getSavedataObjectPath(storagePathKey, "state"),
          message: "State downloaded and applied",
        });
      } else {
        results.push({
          ok: false,
          kind: "state",
          path: getSavedataObjectPath(storagePathKey, "state"),
          message: "No remote state file found",
        });
      }
    } catch (err) {
      results.push({
        ok: false,
        kind: "state",
        path: getSavedataObjectPath(storagePathKey, "state"),
        message: err instanceof Error ? err.message : String(err),
      });
    }

    return results;
  }, [applyServerProfile, applyServerUserState, storagePathKey, userId]);

  useEffect(() => {
    if (!userId) {
      resetSavedataSync();
    }
  }, [userId]);

  const value = useMemo<SaveDataSyncContextValue>(
    () => ({
      userId,
      isEnabled,
      syncStatus,
      debugInfo,
      readProfile,
      readState,
      upsertProfile,
      upsertState,
      refreshFromStorage,
      pushLocalProfileToRemote,
      pushLocalStateToRemote,
      pullAllFromRemote,
    }),
    [
      debugInfo,
      isEnabled,
      pullAllFromRemote,
      pushLocalProfileToRemote,
      pushLocalStateToRemote,
      readProfile,
      readState,
      refreshFromStorage,
      syncStatus,
      upsertProfile,
      upsertState,
      userId,
    ],
  );

  return (
    <SaveDataSyncContext.Provider value={value}>
      {children}
    </SaveDataSyncContext.Provider>
  );
}

export function useSaveDataSyncInternal(): SaveDataSyncContextValue {
  const context = useContext(SaveDataSyncContext);
  if (!context) {
    throw new Error("useSaveDataSync must be used within SaveDataSyncProvider");
  }
  return context;
}
