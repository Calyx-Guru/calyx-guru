import { Animated, ImageBackground, StyleSheet } from "react-native";

import {
  energyBorder1,
  energyEmpty1,
  energyValue1,
} from "@/assets/images/mascot";
import { useEffect, useMemo, useRef } from "react";
import type * as Types from "./type";

export const HealthBar = (properties: Types.Properties) => {
  const { totalValue = 100, value = 100, colors = ["red"], style } = properties;
  const animatedValue = useRef(new Animated.Value(100)).current;

  const bars = useMemo(() => {
    const currentValue = Math.max(0, Math.min(value, totalValue));

    const valuePerBar = totalValue / colors.length;
    const index = Math.floor(currentValue / valuePerBar);

    const color = colors[Math.max(0, Math.min(index, colors.length - 1))];

    return {
      color,
      value: (currentValue / totalValue) * 100,
    };
  }, [totalValue, value, colors]);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: bars.value,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [bars.value, animatedValue]);

  return (
    <ImageBackground
      source={energyEmpty1}
      style={[styles.empty, style]}
      resizeMode="cover"
    >
      <Animated.Image
        source={energyValue1}
        style={[
          styles.value,
          {
            width: animatedValue.interpolate({
              inputRange: [0, 100],
              outputRange: ["0%", "100%"],
            }),
          },
        ]}
        resizeMode="stretch"
      />
      <ImageBackground
        source={energyBorder1}
        style={styles.border}
        resizeMode="cover"
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  empty: {
    width: "100%",
    aspectRatio: "12/1",
    overflow: "hidden",
  },
  value: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    height: "100%",
  },
  border: {
    width: "100%",
    aspectRatio: "12/1",
  },
});
