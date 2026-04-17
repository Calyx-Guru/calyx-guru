import { CaptionText } from "@/components/typography/CaptionText";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

interface Properties {
  texts: string[];
  scrollIndex: number;
}

const ANIMATION_DURATION = 400;
const DISPLAY_ZONE_HEIGHT = 125;

export function ScrollText(properties: Properties) {
  const { texts, scrollIndex } = properties;

  const animatedIndex = useRef(new Animated.Value(scrollIndex)).current;
  const mountOpacity = useRef(new Animated.Value(0)).current;
  const mountTranslate = useRef(new Animated.Value(14)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const [heights, setHeights] = useState<number[]>([]);
  const initialized = useRef(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(mountOpacity, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(mountTranslate, {
        toValue: 0,
        duration: ANIMATION_DURATION - 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [mountOpacity, mountTranslate]);

  useEffect(() => {
    Animated.timing(animatedIndex, {
      toValue: scrollIndex,
      duration: ANIMATION_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    if (!heights[scrollIndex]) return;

    let yOff = 0;
    for (let i = 0; i < scrollIndex; i++) {
      yOff += heights[i] || 0;
    }

    const currentHeight = heights[scrollIndex] || 0;
    const targetScrollY = yOff + currentHeight - DISPLAY_ZONE_HEIGHT;

    if (!initialized.current && scrollIndex === 0) {
      scrollY.setValue(-targetScrollY);
      initialized.current = true;
    } else {
      Animated.timing(scrollY, {
        toValue: -targetScrollY,
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [scrollIndex, animatedIndex, scrollY, heights]);

  const handleLayout = (index: number, height: number) => {
    setHeights((prev) => {
      const newHeights = [...prev];
      newHeights[index] = height;
      return newHeights;
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: mountOpacity, transform: [{ translateY: mountTranslate }] },
      ]}
    >
      <View style={styles.mask}>
        <Animated.View
          style={[
            styles.scrollContent,
            { transform: [{ translateY: scrollY }] },
          ]}
        >
          {texts.map((text, i) => {
            const diff = Animated.subtract(animatedIndex, i);

            const activeOpacity = diff.interpolate({
              inputRange: [-1, -0.2, 0, 0.4, 1],
              outputRange: [0, 0, 1, 0, 0],
              extrapolate: "clamp",
            });

            // Keep all older sentences visible and fully drawn (1) as they scroll up naturally
            const mutedOpacity = diff.interpolate({
              inputRange: [-1, 0, 0.6, 1, 10],
              outputRange: [0, 0, 0, 1, 1],
              extrapolate: "clamp",
            });

            return (
              <View
                key={i}
                style={styles.lineWrapper}
                onLayout={(e) => handleLayout(i, e.nativeEvent.layout.height)}
              >
                <View style={{ opacity: 0 }} pointerEvents="none">
                  <CaptionText fontSize={20}>{text}</CaptionText>
                </View>

                <Animated.View
                  style={[styles.layer, { opacity: mutedOpacity }]}
                  pointerEvents="none"
                >
                  <Text style={styles.historyCaptionMuted}>{text}</Text>
                </Animated.View>

                <Animated.View
                  style={[styles.layer, { opacity: activeOpacity }]}
                  pointerEvents="none"
                >
                  <CaptionText fontSize={20}>{text}</CaptionText>
                </Animated.View>
              </View>
            );
          })}
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  mask: {
    width: "100%",
    height: DISPLAY_ZONE_HEIGHT,
    overflow: "hidden",
  },
  scrollContent: {
    width: "100%",
  },
  lineWrapper: {
    width: "100%",
    position: "relative",
    paddingBottom: 16,
  },
  layer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  historyCaptionMuted: {
    color: "rgba(118, 118, 125, 0.95)",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "500",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 9,
  },
});
