import { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { kaucimOrb } from "@/assets/images/kau-cim";
import * as subButtonSet from "@/assets/images/kau-cim/set-2";

import { KAUCIM_CONCERNS } from "@/types/UserState";
import { SubButton } from "../category";
import type * as Types from "./type";

const SUB_BUTTON_PROPERTIES = [
  {
    image: subButtonSet.familyFriend,
    action: KAUCIM_CONCERNS.FAMILY,
    labelKey: "Family & Friends",
  },
  {
    image: subButtonSet.wealth,
    action: KAUCIM_CONCERNS.WEALTH,
    labelKey: "Wealth",
  },
  {
    image: subButtonSet.love,
    action: KAUCIM_CONCERNS.LOVE,
    labelKey: "Love",
  },
  {
    image: subButtonSet.career,
    action: KAUCIM_CONCERNS.CAREER,
    labelKey: "Career",
  },
  {
    image: subButtonSet.health,
    action: KAUCIM_CONCERNS.HEALTH,
    labelKey: "Health",
  },
];

export function KaucimOrb(properties: Types.Properties) {
  const { style, onAction } = properties;

  const orbOpacity = useRef(new Animated.Value(1)).current;
  const fanAnims = useRef<Animated.Value[]>(
    Array.from(
      { length: SUB_BUTTON_PROPERTIES.length },
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
              <SubButton
                image={SUB_BUTTON_PROPERTIES[i].image}
                tag={subButtonSet.tag}
                glow={subButtonSet.glow}
                action={SUB_BUTTON_PROPERTIES[i].action}
                labelKey={SUB_BUTTON_PROPERTIES[i].labelKey}
                onPress={() => onAction?.(SUB_BUTTON_PROPERTIES[i].action)}
              />
            </Animated.View>
          );
        })}

      <Animated.View style={{ opacity: orbOpacity }}>
        <Pressable
          onPress={isMenuOpen ? closeMenu : openMenu}
          style={styles.orbContainer}
        >
          <ImageBackground
            source={kaucimOrb}
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
    marginTop: -20,
  },
  subButton: {
    width: 80,
    height: 80,
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
