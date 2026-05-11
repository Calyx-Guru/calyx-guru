import { useEffect, useRef, useState } from "react";
import { Animated, ImageBackground, StyleSheet, View } from "react-native";

import { energyIcon, powerBarBase, powerBarFill } from "@/assets/images/ui";

import type * as Types from "./type";

const fillPercent = (amount: number, total: number) =>
  (Math.max(0, Math.min(amount, total)) / total) * 100;

export const HealthBar = (properties: Types.Properties) => {
  const {
    totalValue = 100,
    value = 100,
    colors = ["red"],
    change = 0,
    style,
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
    <View
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
      }}
    >
      <ImageBackground
        source={powerBarBase}
        style={[styles.empty, style]}
        resizeMode="stretch"
      >
        <View
          style={styles.valueTrack}
          onLayout={(event) => {
            setFillTrackWidth(event.nativeEvent.layout.width);
          }}
        >
          <Animated.View style={[styles.valueClip, { width: clipWidth }]}>
            {fillTrackWidth != null ? (
              <ImageBackground
                source={powerBarFill}
                style={[styles.valueFill, { width: fillTrackWidth }]}
                resizeMode="stretch"
              />
            ) : null}
          </Animated.View>
        </View>
        <ImageBackground
          source={energyIcon}
          style={[styles.icon]}
          resizeMode="cover"
        />
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  empty: {
    width: 400,
    borderRadius: 16,
    aspectRatio: 6,
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
  },
  valueTrack: {
    position: "absolute",
    top: 2,
    left: 4,
    right: 4,
    bottom: 4,
    opacity: 0.8,
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
    width: 54,
    height: 108,
    aspectRatio: "5/7",
    marginLeft: 24,
    marginTop: 24,
  },
});
