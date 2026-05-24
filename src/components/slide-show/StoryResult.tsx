import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { bigGoldFrame, blueRectangle, ribbon } from "@/assets/images/ui";
import { formatPowerChangeLine } from "@/features/kau-cim/story-experience/constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const RIBBON_WIDTH = 400;
const RIBBON_SHINE_WIDTH = 72;
const RIBBON_SHINE_LOOP_MS = 1600;

interface Properties {
  summary: Kaucim.Summary;
  onDismiss: () => void;
}

export function StoryResult(properties: Properties) {
  const { summary } = properties;

  const insets = useSafeAreaInsets();
  const appearProgress = useRef(new Animated.Value(0)).current;
  const ribbonShineProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    appearProgress.setValue(0);
    Animated.spring(appearProgress, {
      toValue: 1,
      friction: 8,
      tension: 70,
      useNativeDriver: true,
    }).start();
  }, [appearProgress, summary.title, summary.description]);

  useEffect(() => {
    ribbonShineProgress.setValue(0.2);
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(ribbonShineProgress, {
          toValue: 0.8,
          duration: RIBBON_SHINE_LOOP_MS,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.delay(RIBBON_SHINE_LOOP_MS * 2),
      ]),
      { resetBeforeIteration: true },
    );
    animation.start();
    return () => animation.stop();
  }, [ribbonShineProgress]);

  const ribbonShineTranslateX = useMemo(
    () =>
      ribbonShineProgress.interpolate({
        inputRange: [0.2, 0.8],
        outputRange: [
          RIBBON_WIDTH * 0.2 - RIBBON_SHINE_WIDTH * 0.5,
          RIBBON_WIDTH * 0.8 - RIBBON_SHINE_WIDTH * 0.5,
        ],
        extrapolate: "clamp",
      }),
    [ribbonShineProgress],
  );

  const ribbonShineOpacity = useMemo(
    () =>
      ribbonShineProgress.interpolate({
        inputRange: [0.2, 0.5, 0.8],
        outputRange: [0, 1, 0],
        extrapolate: "clamp",
      }),
    [ribbonShineProgress],
  );

  const frameOpacity = appearProgress.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 0.7, 1],
    extrapolate: "clamp",
  });
  const frameScale = appearProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.88, 1],
    extrapolate: "clamp",
  });
  const frameTranslateY = appearProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [32, 0],
    extrapolate: "clamp",
  });
  const contentOpacity = appearProgress.interpolate({
    inputRange: [0.2, 0.55, 1],
    outputRange: [0, 0.25, 1],
    extrapolate: "clamp",
  });
  const hintPulse = appearProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
    extrapolate: "clamp",
  });

  return (
    <Pressable
      style={[styles.root]}
      onPress={properties.onDismiss}
      accessibilityRole="button"
      accessibilityLabel="Dismiss result and continue"
    >
      <Image
        source={summary.image}
        style={styles.slideImage}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />

      <View style={styles.resultOverlayRoot} />

      <View
        style={[styles.ribbonHeader, { paddingTop: 8 }]}
        pointerEvents="box-none"
      >
        <View style={styles.ribbonClip}>
          <ImageBackground
            source={ribbon}
            style={styles.ribbonBackground}
            resizeMode="stretch"
          >
            <Text style={styles.resultTitle} numberOfLines={3}>
              {summary.title}
            </Text>
          </ImageBackground>
          <View pointerEvents="none" style={styles.ribbonShineOverlay}>
            <Animated.View
              style={[
                styles.ribbonShine,
                {
                  opacity: ribbonShineOpacity,
                  transform: [
                    { translateX: ribbonShineTranslateX },
                    { rotate: "18deg" },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={[
                  "rgba(255,255,255,0)",
                  "rgba(255,248,210,0.35)",
                  "rgba(255,255,255,0.8)",
                  "rgba(255,248,210,0.35)",
                  "rgba(255,255,255,0)",
                ]}
                locations={[0, 0.38, 0.5, 0.62, 1]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.ribbonShineGradient}
              />
            </Animated.View>
          </View>
        </View>
      </View>

      <View style={[styles.resultFrameTouchable, { ...insets, top: "auto" }]}>
        <Animated.View
          style={{
            opacity: frameOpacity,
            transform: [{ translateY: frameTranslateY }, { scale: frameScale }],
          }}
        >
          <View style={[styles.resultFrame]}>
            <ImageBackground
              source={blueRectangle}
              style={[styles.resultFrameBackground]}
              resizeMode="stretch"
            />
            <ImageBackground
              source={bigGoldFrame}
              style={[styles.resultFrameBackground]}
              resizeMode="stretch"
            />
            <Animated.View
              style={[styles.resultFrameInner, { opacity: contentOpacity }]}
            >
              <View style={styles.resultLastSlideBody}>
                <Text style={styles.resultLastSlideText}>
                  {summary.description}
                </Text>
              </View>
            </Animated.View>

            {summary.powerChange > 0 && (
              <Text style={styles.resultPowerLine}>
                {formatPowerChangeLine(summary.powerChange)}
              </Text>
            )}
          </View>
        </Animated.View>
        <Text style={[styles.resultHint]}>Tap to continue</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  slideImage: {
    width: "100%",
    height: "100%",
  },
  resultOverlayRoot: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  ribbonHeader: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 2,
    alignItems: "center",
    paddingHorizontal: 16,
    display: "flex",
    justifyContent: "center",
  },
  ribbonClip: {
    alignSelf: "center",
    width: RIBBON_WIDTH,
    height: 60,
    overflow: "hidden",
  },
  ribbonBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
  },
  ribbonShineOverlay: {
    ...StyleSheet.absoluteFill,
    bottom: 10,
    overflow: "hidden",
  },
  ribbonShine: {
    position: "absolute",
    top: -8,
    left: 0,
    width: RIBBON_SHINE_WIDTH,
    height: 76,
  },
  ribbonShineGradient: {
    width: RIBBON_SHINE_WIDTH,
    height: "100%",
  },
  resultFrameTouchable: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
  },
  resultFrameBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.7,
  },
  resultFrame: {
    width: 400,
    height: 270,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
  },
  resultFrameInner: {
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 20,
    width: "100%",
  },
  resultLastSlideBody: {
    width: "100%",
    marginBottom: 10,
    paddingVertical: 4,
  },
  resultLastSlideText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "500",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 6,
  },
  resultTitle: {
    color: "#EAD38C",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
  },
  resultPowerLine: {
    color: "#f3f3f3",
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.38)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  resultHint: {
    marginTop: 10,
    color: "rgba(255,255,255,1)",
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.28)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
});
