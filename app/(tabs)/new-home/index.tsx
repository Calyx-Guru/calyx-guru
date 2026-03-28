import * as elements from "@/assets/images/elements";
import STAGE_IDLE from "@/assets/videos/hatching/idle.mp4";

import { useVideoPlayer, VideoView } from "expo-video";
import { Image, StyleSheet, View } from "react-native";

function TabNewHome() {
  const stageIdle = useVideoPlayer(STAGE_IDLE, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  const renderBackground = () => (
    <VideoView
      player={stageIdle}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      nativeControls={false}
    />
  );

  const renderElements = () => (
    <View style={styles.elementsWrapper}>
      <Image
        source={elements.wood}
        style={[styles.elementItem, styles.elementTop]}
      />
      <Image
        source={elements.fire}
        style={[styles.elementItem, styles.elementRight]}
      />
      <Image
        source={elements.metal}
        style={[styles.elementItem, styles.elementBottomRight]}
      />
      <Image
        source={elements.earth}
        style={[styles.elementItem, styles.elementBottomLeft]}
      />
      <Image
        source={elements.water}
        style={[styles.elementItem, styles.elementLeft]}
      />
    </View>
  );

  return (
    <View style={styles.root}>
      {renderBackground()}
      {renderElements()}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },
  elementsWrapper: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 300,
    height: 300,
    marginLeft: -150,
    marginTop: -160,
  },
  elementItem: {
    position: "absolute",
    width: 100,
    height: 100,
  },
  elementTop: {
    top: -50,
    left: "50%",
    marginLeft: -50,
  },
  elementLeft: {
    top: 50,
    left: -25,
  },
  elementRight: {
    top: 50,
    right: -25,
  },
  elementBottomRight: {
    bottom: -50,
    right: 0,
  },
  elementBottomLeft: {
    bottom: -50,
    left: 0,
  },
});

export default TabNewHome;
