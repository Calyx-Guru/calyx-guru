import { INITIAL_PET_POWER } from "@/constants";
import type { SavedataSyncActionResult } from "@/contexts/SaveDataSyncContext";
import { useAppState } from "@/hooks/useAppState";
import { useSaveDataSync } from "@/hooks/useSaveDataSync";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserState } from "@/hooks/useUserState";
import {
  createDate,
  getDebugTimeOffset,
  setDebugTimeOffset,
} from "@/lib/app/time";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

function formatOffsetHuman(ms: number): string {
  if (ms === 0) {
    return "none";
  }

  const sign = ms > 0 ? "+" : "-";
  let rest = Math.abs(ms);
  const days = Math.floor(rest / DAY_MS);
  rest -= days * DAY_MS;
  const hours = Math.floor(rest / HOUR_MS);
  rest -= hours * HOUR_MS;
  const minutes = Math.floor(rest / 60_000);

  const parts: string[] = [];
  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0 || parts.length === 0) {
    parts.push(`${minutes}m`);
  }

  return `${sign}${parts.join(" ")}`;
}

export function RouteDebug() {
  const insets = useSafeAreaInsets();
  const { isGooglePlaySignedIn, googlePlayUserId } = useSupabaseAuth();
  const {
    isEnabled: isSavedataEnabled,
    syncStatus,
    debugInfo,
    pushLocalProfileToRemote,
    pushLocalStateToRemote,
    pullAllFromRemote,
  } = useSaveDataSync();
  const { resetAppState } = useAppState();
  const { profile, updateProfile } = useUserProfile();
  const { userState, updateUserState } = useUserState();
  const [offsetMs, setOffsetMs] = useState(getDebugTimeOffset);
  const [savedataLog, setSavedataLog] = useState<string | null>(null);
  const [savedataBusy, setSavedataBusy] = useState(false);

  const formatSyncResults = (results: SavedataSyncActionResult[]) =>
    results
      .map(
        (r) =>
          `${r.ok ? "OK" : "ERR"} [${r.kind}] ${r.path ?? "—"}: ${r.message}`,
      )
      .join("\n");

  const runSavedataAction = useCallback(
    async (
      action: () => Promise<
        SavedataSyncActionResult | SavedataSyncActionResult[]
      >,
    ) => {
      setSavedataBusy(true);
      setSavedataLog("Running…");
      try {
        const result = await action();
        setSavedataLog(
          Array.isArray(result)
            ? formatSyncResults(result)
            : formatSyncResults([result]),
        );
      } catch (error) {
        setSavedataLog(error instanceof Error ? error.message : String(error));
      } finally {
        setSavedataBusy(false);
      }
    },
    [],
  );

  const bumpOffset = useCallback(
    (delta: number) => {
      const next = offsetMs + delta;
      setDebugTimeOffset(next);
      setOffsetMs(next);
    },
    [offsetMs],
  );

  const bumpPetPower = useCallback(
    (delta: number) => {
      if (!userState) return;
      void updateUserState({
        petPower: userState.petPower + delta,
      });
    },
    [updateUserState, userState],
  );

  const onResetUserStateAndRoot = useCallback(async () => {
    if (profile) {
      await updateProfile({
        element: undefined,
      });
    }
    if (userState) {
      await updateUserState({
        petPower: INITIAL_PET_POWER,
        kaucimHistory: [],
      });
    }
    resetAppState();

    router.replace("/");
  }, [profile, resetAppState, updateProfile, updateUserState, userState]);

  const sampleNow = createDate();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
          paddingLeft: Math.max(insets.left, 16),
          paddingRight: Math.max(insets.right, 16),
        },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Debug</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Google Play</Text>
        <Text style={styles.mono}>
          Signed in: {isGooglePlaySignedIn ? "yes" : "no"}
        </Text>
        <Text style={styles.monoMuted}>UUID: {googlePlayUserId ?? "—"}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Savedata storage</Text>
        <Text style={styles.mono}>
          Enabled: {isSavedataEnabled ? "yes" : "no"}
        </Text>
        <Text style={styles.monoMuted}>
          Bucket: {debugInfo.bucket} / {debugInfo.prefix}
        </Text>
        <Text style={styles.monoMuted}>
          Client: {debugInfo.storageClientReady ? "ready" : "missing"}
        </Text>
        <Text style={styles.monoMuted}>
          URL: {debugInfo.supabaseUrl ?? "—"}
        </Text>
        <Text style={styles.monoMuted}>
          Profile: {debugInfo.profilePath ?? "—"}
        </Text>
        <Text style={styles.monoMuted}>
          State: {debugInfo.statePath ?? "—"}
        </Text>
        <Text style={styles.monoMuted}>
          Local profile id: {profile?.id ?? "—"}
        </Text>
        <Text style={styles.monoMuted}>
          Local state id: {userState?.id ?? "—"}
        </Text>
        <Text style={styles.monoMuted}>
          Uploading: profile={syncStatus.isUploadingProfile ? "yes" : "no"},{" "}
          state={syncStatus.isUploadingState ? "yes" : "no"}
        </Text>
        {syncStatus.lastError ? (
          <Text style={styles.errorText}>
            Last error: {syncStatus.lastError}
          </Text>
        ) : null}
        <View style={styles.row}>
          <Pressable
            disabled={savedataBusy}
            style={({ pressed }) => [
              styles.stepButton,
              savedataBusy && styles.stepButtonDisabled,
              !savedataBusy && pressed && styles.stepButtonPressed,
            ]}
            onPress={() => void runSavedataAction(pushLocalProfileToRemote)}
          >
            <Text style={styles.stepButtonLabel}>Push profile</Text>
          </Pressable>
          <Pressable
            disabled={savedataBusy}
            style={({ pressed }) => [
              styles.stepButton,
              savedataBusy && styles.stepButtonDisabled,
              !savedataBusy && pressed && styles.stepButtonPressed,
            ]}
            onPress={() => void runSavedataAction(pushLocalStateToRemote)}
          >
            <Text style={styles.stepButtonLabel}>Push state</Text>
          </Pressable>
        </View>
        <Pressable
          disabled={savedataBusy}
          style={({ pressed }) => [
            styles.secondaryButton,
            savedataBusy && styles.stepButtonDisabled,
            !savedataBusy && pressed && styles.secondaryButtonPressed,
          ]}
          onPress={() => void runSavedataAction(pullAllFromRemote)}
        >
          <Text style={styles.secondaryButtonLabel}>Pull all from storage</Text>
        </Pressable>
        {savedataLog ? (
          <Text style={styles.monoMuted}>{savedataLog}</Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Simulated time</Text>
        <Text style={styles.mono}>
          Offset: {formatOffsetHuman(offsetMs)} ({offsetMs.toLocaleString()} ms)
        </Text>
        <Text style={styles.monoMuted}>
          createDate(): {sampleNow.toISOString()}
        </Text>
        <View style={styles.row}>
          <Pressable
            style={({ pressed }) => [
              styles.stepButton,
              pressed && styles.stepButtonPressed,
            ]}
            onPress={() => bumpOffset(-DAY_MS)}
          >
            <Text style={styles.stepButtonLabel}>−1 day</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.stepButton,
              pressed && styles.stepButtonPressed,
            ]}
            onPress={() => bumpOffset(DAY_MS)}
          >
            <Text style={styles.stepButtonLabel}>+1 day</Text>
          </Pressable>
        </View>
        <View style={styles.row}>
          <Pressable
            style={({ pressed }) => [
              styles.stepButton,
              pressed && styles.stepButtonPressed,
            ]}
            onPress={() => bumpOffset(-HOUR_MS)}
          >
            <Text style={styles.stepButtonLabel}>−1 hour</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.stepButton,
              pressed && styles.stepButtonPressed,
            ]}
            onPress={() => bumpOffset(HOUR_MS)}
          >
            <Text style={styles.stepButtonLabel}>+1 hour</Text>
          </Pressable>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.textButton,
            pressed && styles.textButtonPressed,
          ]}
          onPress={() => {
            setDebugTimeOffset(0);
            setOffsetMs(0);
          }}
        >
          <Text style={styles.textButtonLabel}>Clear time offset</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Pet power</Text>
        <Text style={styles.mono}>
          Current:{" "}
          {userState ? userState.petPower.toLocaleString() : "— (no state)"}
        </Text>
        <View style={styles.row}>
          <Pressable
            disabled={!userState}
            style={({ pressed }) => [
              styles.stepButton,
              !userState && styles.stepButtonDisabled,
              userState && pressed && styles.stepButtonPressed,
            ]}
            onPress={() => bumpPetPower(-10)}
          >
            <Text style={styles.stepButtonLabel}>−10</Text>
          </Pressable>
          <Pressable
            disabled={!userState}
            style={({ pressed }) => [
              styles.stepButton,
              !userState && styles.stepButtonDisabled,
              userState && pressed && styles.stepButtonPressed,
            ]}
            onPress={() => bumpPetPower(10)}
          >
            <Text style={styles.stepButtonLabel}>+10</Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          userState && pressed && styles.primaryButtonPressed,
        ]}
        onPress={onResetUserStateAndRoot}
      >
        <Text style={styles.primaryButtonLabel}>
          Reset user state to default & go to root
        </Text>
      </Pressable>
      {!userState && (
        <Text style={styles.hint}>
          No loaded user state; still returns to root.
        </Text>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.secondaryButton,
          pressed && styles.secondaryButtonPressed,
        ]}
        onPress={() => router.replace("/main-menu")}
      >
        <Text style={styles.secondaryButtonLabel}>Main menu</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#0d0d0d",
  },
  scrollContent: {
    flexGrow: 1,
    rowGap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f5f5f5",
  },
  section: {
    rowGap: 10,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#a3a3a3",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  mono: {
    fontSize: 15,
    color: "#e5e5e5",
    lineHeight: 22,
  },
  monoMuted: {
    fontSize: 13,
    color: "#737373",
    lineHeight: 20,
  },
  errorText: {
    fontSize: 13,
    color: "#fca5a5",
    lineHeight: 20,
  },
  row: {
    flexDirection: "row",
    columnGap: 12,
  },
  stepButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
  },
  stepButtonPressed: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  stepButtonDisabled: {
    opacity: 0.45,
  },
  stepButtonLabel: {
    color: "#fafafa",
    fontSize: 15,
    fontWeight: "600",
  },
  textButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
  },
  textButtonPressed: {
    opacity: 0.7,
  },
  textButtonLabel: {
    color: "#93c5fd",
    fontSize: 15,
    fontWeight: "600",
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#b45309",
  },
  primaryButtonPressed: {
    opacity: 0.88,
  },
  primaryButtonLabel: {
    color: "#fffbeb",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 22,
  },
  hint: {
    fontSize: 13,
    color: "#a3a3a3",
    marginTop: -12,
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
  },
  secondaryButtonPressed: {
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  secondaryButtonLabel: {
    color: "#fafafa",
    fontSize: 16,
    fontWeight: "600",
  },
});
