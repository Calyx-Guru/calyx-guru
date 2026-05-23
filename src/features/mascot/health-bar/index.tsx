import { useEffect, useRef, useState } from "react";
import {
  Animated,
  ImageBackground,
  StyleSheet,
  View
} from "react-native";

import {
  powerBarBaseCenter,
  powerBarBaseLeft,
  powerBarBaseLeftStretch,
  powerBarBaseRight,
  powerBarBaseRightStretch,
  powerBarFill
} from "@/assets/images/ui";
import { ThreePartSliceImage } from "@/components/image/ThreePartSliceImage";

import type * as Types from "./type";

const fillPercent = (amount: number, total: number) =>
  (Math.max(0, Math.min(amount, total)) / total) * 100;

export const HealthBar = (properties: Types.Properties) => {
  const {
    totalValue = 100,
    value = 100,
    colors = ["white"],
    change = 0,
    style,
    barHeight = 42,
  } = properties;

  const animatedValue = useRef(
    new Animated.Value(
      change > 0
        ? fillPercent(value - change, totalValue)
        : fillPercent(value, totalValue),
    ),
  ).current;
  const [fillTrackWidth, setFillTrackWidth] = useState<number | null>(null);

  const clipWidth = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  useEffect(() => {
    const toPercent = fillPercent(value, totalValue);

    if (change > 0) {
      const fromPercent = fillPercent(value - change, totalValue);
      animatedValue.setValue(fromPercent);
      const animation = Animated.sequence([
        Animated.delay(1000),
        Animated.timing(animatedValue, {
          toValue: toPercent,
          duration: 650,
          useNativeDriver: false,
        }),
      ]);
      animation.start();
      return () => animation.stop();
    }

    const animation = Animated.timing(animatedValue, {
      toValue: toPercent,
      duration: 300,
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [value, change, totalValue]);

  return (
    <View style={[styles.empty, style, { height: barHeight }]}>
        <View style={styles.barBackground} />
        <View
          style={[styles.valueTrack]}
          onLayout={(event) => {
            setFillTrackWidth(event.nativeEvent.layout.width);
          }}
        >
          <Animated.View style={[styles.valueClip, { width: clipWidth }]}>
            {fillTrackWidth != null ? (
              <ImageBackground
                source={powerBarFill}
                style={[
                  styles.valueFill,
                  {
                    width: fillTrackWidth,
                    height: barHeight,
                  },
                ]}
                resizeMode="stretch"
              />
            ) : null}
          </Animated.View>
        </View>
        <ThreePartSliceImage
          style={[styles.barBase, { height: "100%" }]}
          leftSource={powerBarBaseLeft}
          leftStretchSource={powerBarBaseLeftStretch}
          centerSource={powerBarBaseCenter}
          rightStretchSource={powerBarBaseRightStretch}
          rightSource={powerBarBaseRight}
        />
    </View>
  );
};

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    maxWidth: "100%",
    borderRadius: 16,
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  barBackground: {
    ...StyleSheet.absoluteFill,
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    backgroundColor: "#000000",
    opacity: 0.6,
    borderRadius: 16,
    zIndex: 0,
  },
  barBase: {
    width: "100%",
    height: "100%",
    zIndex: 2,
  },
  valueTrack: {
    position: "absolute",
    top: 2,
    left: 4,
    right: 4,
    bottom: 4,
    opacity: 1,
    zIndex: 1,
  },
  valueClip: {
    height: "100%",
    overflow: "hidden",
  },
  valueFill: {
    height: "100%",
  },
  emptyOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    height: "100%",
  },
  border: {
    width: "100%",
    aspectRatio: "12/1",
  },
  icon: {
    width: 48,
    height: 72,
    aspectRatio: "5/7",
    marginLeft: 12,
    marginTop: -8,
  },
});
