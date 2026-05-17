import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  ImageBackground,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  circleBlueButton,
  energyIcon,
  powerBarBase,
  powerBarFill,
} from "@/assets/images/ui";

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
    onSettingsPress,
  } = properties;

  const handleSettingsPress = useCallback(() => {
    if (onSettingsPress) {
      onSettingsPress();
      return;
    }
    router.push("/settings" as Href);
  }, [onSettingsPress]);

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
    <View style={styles.row}>
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

      <Pressable
        onPress={handleSettingsPress}
        style={styles.settingsPressable}
        accessibilityRole="button"
        accessibilityLabel="Open settings"
      >
        <ImageBackground
          source={circleBlueButton}
          style={styles.settingsButton}
          resizeMode="contain"
        >
          <Ionicons
            name="settings-sharp"
            size={22}
            color="#ffffff"
            style={styles.settingsIcon}
          />
        </ImageBackground>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    width: "100%",
    maxWidth: 456,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  empty: {
    flex: 1,
    maxWidth: 400,
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
    width: 48,
    height: 72,
    aspectRatio: "5/7",
    marginLeft: 12,
    marginTop: -8,
  },
  settingsPressable: {
    flexShrink: 0,
  },
  settingsButton: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsIcon: {
    width: 22,
    height: 22,
    marginBottom: 4,
  },
});
