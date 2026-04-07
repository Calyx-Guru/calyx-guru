import { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { caucimOrb } from "@/assets/images/caucim";
import type * as Types from "./type";

const SUB_BUTTON_LABELS = [
  "Family &\nFriends",
  "Money",
  "Love",
  "Career",
  "Health",
];

export function CaucimOrb(properties: Types.Properties) {
  const { style } = properties;

  const orbOpacity = useRef(new Animated.Value(1)).current;
  const fanAnims = useRef<Animated.Value[]>(
    Array.from(
      { length: SUB_BUTTON_LABELS.length },
      () => new Animated.Value(0),
    ),
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fanAnimValues = fanAnims.current;

  const SUB_BUTTON_TARGETS = useMemo(() => {
    const a = 140;

    return ([-1.1, -0.6, 0, 0.6, 1.1] as const).map((t) => {
      const x = t * a;
      const y = 60 + 60 * Math.sqrt(Math.max(0, 1 - t * t));

      return {
        x,
        y,
      };
    });
  }, []);

  const openMenu = useCallback(() => {
    setIsMenuOpen(true);

    Animated.timing(orbOpacity, {
      toValue: 0.7,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      Animated.stagger(
        60,
        fanAnimValues.map((anim) =>
          Animated.spring(anim, {
            toValue: 1,
            friction: 6,
            tension: 80,
            useNativeDriver: true,
          }),
        ),
      ).start();
    });
  }, [orbOpacity, fanAnimValues]);

  const closeMenu = useCallback(() => {
    Animated.stagger(
      40,
      [...fanAnimValues].reverse().map((anim) =>
        Animated.timing(anim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ),
    ).start(() => {
      Animated.timing(orbOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setIsMenuOpen(false));
    });
  }, [orbOpacity, fanAnimValues]);

  const handleSubButtonPress = useCallback(
    (index: number) => {
      closeMenu();
    },
    [closeMenu],
  );

  return (
    <View style={[styles.container, style]}>
      {isMenuOpen &&
        SUB_BUTTON_TARGETS.map((target, i) => {
          const anim = fanAnimValues[i];
          if (!anim) return null;

          return (
            <Animated.View
              key={i}
              style={[
                styles.subButtonContainer,
                {
                  opacity: anim,
                  transform: [
                    {
                      translateX: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, target.x],
                      }),
                    },
                    {
                      translateY: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, target.y],
                      }),
                    },
                    {
                      scale: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Pressable
                onPress={() => handleSubButtonPress(i)}
                style={styles.subButton}
              >
                <Text style={styles.subButtonText}>{SUB_BUTTON_LABELS[i]}</Text>
              </Pressable>
            </Animated.View>
          );
        })}

      <Animated.View style={{ opacity: orbOpacity }}>
        <Pressable
          onPress={isMenuOpen ? closeMenu : openMenu}
          style={styles.orbContainer}
        >
          <ImageBackground
            source={caucimOrb}
            style={styles.orbWrapper}
            resizeMode="cover"
          />
        </Pressable>
      </Animated.View>

      {isMenuOpen && (
        <Pressable onPress={closeMenu} style={styles.closeWrapper}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  orbContainer: {
    position: "relative",
  },
  orbWrapper: {
    width: 100,
    aspectRatio: "1/1",
  },
  subButtonContainer: {
    position: "absolute",
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    top: "20%",
    left: "50%",
    marginLeft: -28,
    marginTop: -28,
  },
  subButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#6C5CE7",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  subButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  closeWrapper: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    bottom: -150,
  },
  closeText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
});
