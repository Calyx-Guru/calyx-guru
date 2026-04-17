import { StyleSheet, View } from "react-native";

import { NormalVideo } from "@/components/video/NormalVideo";
import { TransparentVideo } from "@/components/video/TransparentVideo";

import { CalendarEastern } from "@/features/calendar/eastern";
import { CalendarWestern } from "@/features/calendar/western";
import { KaucimOrb } from "@/features/kau-cim/orb";
import { HealthBar } from "@/features/mascot/health-bar";
import { StatusMessage } from "@/features/mascot/status-message";
import { useKaucim } from "@/hooks/useKaucim";
import { useUserProfile } from "@/hooks/useUserProfile";
import { FIVE_ELEMENTS, KAUCIM_CONCERNS } from "@/types/UserState";
import { router } from "expo-router";
import { useCallback } from "react";
import { VIDEOS } from "./constants";

export function RouteMainMenu() {
  const { profile } = useUserProfile();
  const { rollKaucimResult } = useKaucim();

  const element = profile?.element as FIVE_ELEMENTS;

  const onKaucimAction = useCallback(
    (concern: KAUCIM_CONCERNS) => {
      rollKaucimResult(concern);
      router.replace("/kau-cim");
    },
    [rollKaucimResult, profile],
  );

  return (
    <View style={styles.root}>
      <NormalVideo url={VIDEOS.background[element]} />

      <View style={styles.headerWrapper}>
        <HealthBar totalValue={100} value={100} />
        <StatusMessage />
      </View>

      <TransparentVideo
        source={VIDEOS.mascot.normal}
        style={StyleSheet.absoluteFill}
        loop={true}
      />

      <View style={styles.bodyWrapper}>
        <KaucimOrb onAction={onKaucimAction} />
      </View>

      <View style={styles.bottomWrapper}>
        <CalendarEastern />
        <CalendarWestern />
      </View>
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
    bottom: "20%",
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
});
