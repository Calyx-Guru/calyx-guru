import { Pressable, StyleSheet, Text, View } from "react-native";

import { NormalVideo } from "@/components/video/NormalVideo";
import { TransparentVideo } from "@/components/video/TransparentVideo";

import { ENV, MAX_PET_POWER } from "@/constants";
import { CalendarEastern } from "@/features/calendar/eastern";
import { CalendarWestern } from "@/features/calendar/western";
import { KaucimOrb } from "@/features/kau-cim/orb";
import { HealthBar } from "@/features/mascot/health-bar";
import { StatusMessage } from "@/features/mascot/status-message";
import { useKaucim } from "@/hooks/useKaucim";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserState } from "@/hooks/useUserState";
import { FIVE_ELEMENTS, KAUCIM_CONCERNS } from "@/types/UserState";
import { router, type Href } from "expo-router";
import { useCallback, useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VIDEOS } from "./constants";

export function RouteMainMenu() {
  const insets = useSafeAreaInsets();
  const { profile } = useUserProfile();
  const { userState } = useUserState();
  const { rollKaucimResult } = useKaucim();

  const element = profile?.element as FIVE_ELEMENTS;

  const onKaucimAction = useCallback(
    (concern: KAUCIM_CONCERNS) => {
      rollKaucimResult(concern);
      router.replace("/kau-cim");
    },
    [rollKaucimResult, profile],
  );

  const petState = useMemo(() => {
    const petPower = userState?.petPower ?? 0;
    const petPowerPercentage = petPower / MAX_PET_POWER;
    let petVideo = VIDEOS.mascot.normal;
    if (petPowerPercentage >= 0.75) {
      petVideo = VIDEOS.mascot.very_good;
    } else if (petPowerPercentage >= 0.5) {
      petVideo = VIDEOS.mascot.good;
    } else if (petPowerPercentage >= 0.25) {
      petVideo = VIDEOS.mascot.bad;
    } else {
      petVideo = VIDEOS.mascot.very_bad;
    }
    const backgroundVideo =
      VIDEOS.background[profile?.element as FIVE_ELEMENTS];
    return {
      backgroundVideo,
      petVideo,
      petPower,
      petPowerPercentage,
    };
  }, [userState, profile]);

  return (
    <View style={styles.root}>
      <NormalVideo url={petState.backgroundVideo} />

      <View style={styles.headerWrapper}>
        <HealthBar totalValue={MAX_PET_POWER} value={petState.petPower} />
        <StatusMessage />
      </View>

      <TransparentVideo
        source={petState.petVideo}
        style={StyleSheet.absoluteFill}
        loop={true}
      />

      <View style={styles.bodyWrapper}>
        <KaucimOrb onAction={onKaucimAction} />
      </View>

      <View style={styles.bottomWrapper}>
        <CalendarEastern date={new Date("2038-06-26")} />
        <CalendarWestern />
      </View>

      {ENV.DEBUG_MODE && (
        <Pressable
          style={[
            styles.debugButton,
            {
              top: insets.top + 8,
              left: Math.max(insets.left, 10),
            },
          ]}
          onPress={() => router.push("/debug" as Href)}
          accessibilityRole="button"
          accessibilityLabel="Open debug screen"
        >
          <Text style={styles.debugButtonLabel}>Debug</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },
  headerWrapper: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    rowGap: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "auto",
  },
  bodyWrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "34.5%",
  },
  bottomWrapper: {
    position: "absolute",
    bottom: 10,
    right: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  debugButton: {
    position: "absolute",
    zIndex: 50,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 40,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 8,
  },
  debugButtonLabel: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
});
