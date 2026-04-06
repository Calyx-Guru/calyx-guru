import { StyleSheet, View } from "react-native";

import { NormalVideo } from "@/components/video/NormalVideo";
import { TransparentVideo } from "@/components/video/TransparentVideo";

import { HealthBar } from "@/features/mascot/health-bar";
import { VIDEOS } from "./constants";

export function RouteMainMenu() {
  return (
    <View style={styles.root}>
      <NormalVideo url={VIDEOS.background.water} />

      <HealthBar totalValue={100} value={100} style={styles.healbarWrapper} />
      <TransparentVideo
        source={VIDEOS.mascot.normal}
        style={StyleSheet.absoluteFill}
        loop={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },
  healbarWrapper: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    width: "auto",
  },
});
