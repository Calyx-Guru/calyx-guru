import { StyleSheet, View } from "react-native";

import { NormalVideo } from "@/components/video/NormalVideo";
import { TransparentVideo } from "@/components/video/TransparentVideo";

import { VIDEOS } from "./constants";

export function RouteMainMenu() {
  return (
    <View style={styles.root}>
      <NormalVideo url={VIDEOS.background.metal} />

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
    backgroundColor: "#000",
  },
});
