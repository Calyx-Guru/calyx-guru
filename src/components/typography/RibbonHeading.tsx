import { ribbon } from "@/assets/images/ui";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ImageBackground,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

const RIBBON_SHINE_WIDTH = 72;
const RIBBON_SHINE_LOOP_MS = 1600;

const SHINE_GRADIENT_COLORS = [
  "rgba(255,255,255,0)",
  "rgba(255,248,210,0.35)",
  "rgba(255,255,255,0.8)",
  "rgba(255,248,210,0.35)",
  "rgba(255,255,255,0)",
] as const;

interface RibbonHeadingProps {
  children: string;
  style?: StyleProp<ViewStyle>;
  backgroundStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

export function RibbonHeading({
  children,
  style,
  backgroundStyle,
  textStyle,
  numberOfLines,
}: RibbonHeadingProps) {
  const [ribbonSize, setRibbonSize] = useState({ width: 0, height: 0 });
  const shineProgress = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    shineProgress.setValue(0.2);
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shineProgress, {
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
  }, [shineProgress]);

  const { width: ribbonWidth, height: ribbonHeight } = ribbonSize;

  const shineTranslateX = useMemo(() => {
    if (ribbonWidth <= 0) {
      return shineProgress.interpolate({
        inputRange: [0.2, 0.8],
        outputRange: [0, 0],
      });
    }
    return shineProgress.interpolate({
      inputRange: [0.2, 0.8],
      outputRange: [
        ribbonWidth * 0.2 - RIBBON_SHINE_WIDTH * 0.5,
        ribbonWidth * 0.8 - RIBBON_SHINE_WIDTH * 0.5,
      ],
      extrapolate: "clamp",
    });
  }, [ribbonWidth, shineProgress]);

  const shineOpacity = useMemo(
    () =>
      shineProgress.interpolate({
        inputRange: [0.2, 0.5, 0.8],
        outputRange: [0, 1, 0],
        extrapolate: "clamp",
      }),
    [shineProgress],
  );

  const shineBandHeight = Math.max(ribbonHeight + 16, 48);

  return (
    <View
      style={[styles.clip, style]}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setRibbonSize((current) =>
          current.width === width && current.height === height
            ? current
            : { width, height },
        );
      }}
    >
      <ImageBackground
        source={ribbon}
        style={[styles.background, backgroundStyle]}
        resizeMode="stretch"
      >
        <Text style={[styles.text, textStyle]} numberOfLines={numberOfLines}>
          {children}
        </Text>
      </ImageBackground>
      {ribbonWidth > 0 ? (
        <View pointerEvents="none" style={styles.shineOverlay}>
          <Animated.View
            style={[
              styles.shine,
              {
                height: shineBandHeight,
                top: (ribbonHeight - shineBandHeight) / 2,
                opacity: shineOpacity,
                transform: [
                  { translateX: shineTranslateX },
                  { rotate: "18deg" },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={[...SHINE_GRADIENT_COLORS]}
              locations={[0, 0.38, 0.5, 0.62, 1]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.shineGradient}
            />
          </Animated.View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: "hidden",
  },
  background: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
  },
  text: {
    textAlign: "center",
  },
  shineOverlay: {
    ...StyleSheet.absoluteFillObject,
    bottom: 10,
    overflow: "hidden",
  },
  shine: {
    position: "absolute",
    left: 0,
    width: RIBBON_SHINE_WIDTH,
  },
  shineGradient: {
    width: RIBBON_SHINE_WIDTH,
    height: "100%",
  },
});
