import { useAppState } from "@/hooks/useAppState";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserState } from "@/hooks/useUserState";
import {
    createDate,
    getDebugTimeOffset,
    setDebugTimeOffset,
} from "@/lib/app/time";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
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
  const { resetAppState } = useAppState();
  const { profile, updateProfile } = useUserProfile();
  const { userState, updateUserState } = useUserState();
  const [offsetMs, setOffsetMs] = useState(getDebugTimeOffset);

  const bumpOffset = useCallback((delta: number) => {
    const next = offsetMs + delta;
    setDebugTimeOffset(next);
    setOffsetMs(next);
  }, [offsetMs]);

  const onResetUserStateAndRoot = useCallback(async () => {
    if (profile) {
      await updateProfile({
        element: undefined,
      });
    }
    if (userState) {      
      await updateUserState({
        petPower: 0,
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
        <Text style={styles.sectionLabel}>Simulated time</Text>
        <Text style={styles.mono}>
          Offset: {formatOffsetHuman(offsetMs)} ({offsetMs.toLocaleString()}{" "}
          ms)
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
