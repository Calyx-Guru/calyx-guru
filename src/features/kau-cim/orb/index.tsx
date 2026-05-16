import { useCallback, useMemo, useRef, useState } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";

import {
  careerIcon,
  kaucimIcon,
  kaucimOrbVortex,
  loveIcon,
  wealthIcon,
} from "@/assets/images/kau-cim";
import * as subButtonSet from "@/assets/images/kau-cim/set-2";

import { orbButton } from "@/assets/images/ui";
import { KAUCIM_CONCERNS } from "@/types/UserState";
import { SubButton } from "../category";
import type * as Types from "./type";

const SUB_BUTTON_PROPERTIES = [
  // {
  //   image: subButtonSet.familyFriend,
  //   action: KAUCIM_CONCERNS.FAMILY,
  //   labelKey: "Family & Friends",
  // },
  {
    image: wealthIcon,
    action: KAUCIM_CONCERNS.WEALTH,
    labelKey: "Wealth",
  },
  {
    image: loveIcon,
    action: KAUCIM_CONCERNS.LOVE,
    labelKey: "Love",
  },
  {
    image: careerIcon,
    action: KAUCIM_CONCERNS.CAREER,
    labelKey: "Career",
  },
  // {
  //   image: subButtonSet.health,
  //   action: KAUCIM_CONCERNS.HEALTH,
  //   labelKey: "Health",
  // },
];

export function KaucimOrb(properties: Types.Properties) {
  const { style, onAction, onMenuOpenChange } = properties;

  const orbOpacity = useRef(new Animated.Value(1)).current;
  const closeButtonAnim = useRef(new Animated.Value(0)).current;
  const fanAnims = useRef<Animated.Value[]>(
    Array.from(
      { length: SUB_BUTTON_PROPERTIES.length },
      () => new Animated.Value(0),
    ),
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const fanAnimValues = fanAnims.current;

  const stopMenuAnimations = useCallback(() => {
    menuAnimationRef.current?.stop();
    menuAnimationRef.current = null;
    fanAnimValues.forEach((anim) => anim.stopAnimation());
    closeButtonAnim.stopAnimation();
    orbOpacity.stopAnimation();
  }, [closeButtonAnim, fanAnimValues, orbOpacity]);

  const SUB_BUTTON_TARGETS = useMemo(() => {
    const a = 160;

    return ([-0.8, 0, 0.8] as const).map((t) => {
      const x = t * a;
      const y = 40 + 120 * Math.sqrt(Math.max(0, 1 - t * t));

      return {
        x,
        y,
      };
    });
  }, []);

  const openMenu = useCallback(() => {
    setIsMenuOpen(true);
    onMenuOpenChange?.(true);
    closeButtonAnim.setValue(0);

    Animated.timing(orbOpacity, {
      toValue: 0.7,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      Animated.parallel([
        Animated.stagger(
          60,
          fanAnimValues.map((anim) =>
            Animated.spring(anim, {
              toValue: 1,
              friction: 6,
              tension: 80,
              // JS driver keeps Pressable hit regions in sync while translate animates (New Arch).
              useNativeDriver: false,
            }),
          ),
        ),
        Animated.spring(closeButtonAnim, {
          toValue: 1,
          friction: 7,
          tension: 90,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [closeButtonAnim, fanAnimValues, onMenuOpenChange, orbOpacity]);

  const closeMenu = useCallback(() => {
    stopMenuAnimations();

    menuAnimationRef.current = Animated.parallel([
      Animated.timing(closeButtonAnim, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.stagger(
        40,
        [...fanAnimValues].reverse().map((anim) =>
          Animated.timing(anim, {
            toValue: 0,
            duration: 180,
            useNativeDriver: false,
          }),
        ),
      ),
    ]);

    menuAnimationRef.current.start(() => {
      menuAnimationRef.current = null;
      Animated.timing(orbOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIsMenuOpen(false);
        onMenuOpenChange?.(false);
      });
    });
  }, [
    closeButtonAnim,
    fanAnimValues,
    onMenuOpenChange,
    orbOpacity,
    stopMenuAnimations,
  ]);

  const handleAction = useCallback(
    (action: KAUCIM_CONCERNS) => {
      stopMenuAnimations();
      setIsMenuOpen(false);
      onMenuOpenChange?.(false);
      onAction?.(action);
    },
    [onAction, onMenuOpenChange, stopMenuAnimations],
  );

  return (
    <View style={[styles.container, style]} collapsable={false}>
      <View
        style={styles.orbContainer}
        pointerEvents={isMenuOpen ? "box-none" : "auto"}
      >
        <Pressable
          onPress={isMenuOpen ? closeMenu : openMenu}
          style={styles.orbPressable}
        >
          <View style={styles.orbWrapper}>
            <Animated.View style={[styles.innerOrb, { opacity: orbOpacity }]}>
              <Image
                source={orbButton}
                style={{
                  width: "105%",
                  height: "105%",
                  position: "absolute",
                  top: "-2.5%",
                  left: "-2.5%",
                }}
                resizeMode="cover"
              />
            </Animated.View>
            {isMenuOpen && (
              <View style={styles.innerVortexContainer} pointerEvents="none">
                <Image
                  source={kaucimOrbVortex}
                  style={styles.innerVortex}
                  resizeMode="cover"
                />
              </View>
            )}
          </View>

          {!isMenuOpen && (
            <View style={styles.centerIconContainer} pointerEvents="none">
              <Image
                source={kaucimIcon}
                style={styles.centerIconGlow}
                resizeMode="contain"
                blurRadius={12}
              />
              <Image
                source={kaucimIcon}
                style={styles.centerIconImage}
                resizeMode="contain"
              />
              <Text style={styles.mainTagText}>KauCim</Text>
            </View>
          )}
        </Pressable>
      </View>

      {isMenuOpen && (
        <View style={styles.menuLayer} pointerEvents="box-none">
          {SUB_BUTTON_TARGETS.map((target, i) => {
            const anim = fanAnimValues[i];
            if (!anim) return null;

            const concern = SUB_BUTTON_PROPERTIES[i].action;

            return (
              <Animated.View
                key={i}
                collapsable={false}
                style={[
                  styles.subButtonContainer,
                  {
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
                <Animated.View
                  pointerEvents="none"
                  style={[styles.subButtonVisual, { opacity: anim }]}
                >
                  <SubButton
                    displayOnly
                    image={SUB_BUTTON_PROPERTIES[i].image}
                    tag={subButtonSet.tag}
                    glow={subButtonSet.glow}
                    action={concern}
                    labelKey={SUB_BUTTON_PROPERTIES[i].labelKey}
                  />
                </Animated.View>
                <Pressable
                  style={styles.subButtonHitTarget}
                  onPress={() => handleAction(concern)}
                  accessibilityRole="button"
                  accessibilityLabel={SUB_BUTTON_PROPERTIES[i].labelKey}
                />
              </Animated.View>
            );
          })}

          <Animated.View
            pointerEvents="box-none"
            style={[
              styles.closeWrapper,
              {
                opacity: closeButtonAnim,
                transform: [
                  {
                    scale: closeButtonAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.55, 1],
                    }),
                  },
                  {
                    translateY: closeButtonAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Pressable onPress={closeMenu} style={styles.closePressable}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

/** Fits fan targets (±160px) plus SubButton layout box — avoids touch clipping. */
const ORB_MENU_WIDTH = 400;
const ORB_MENU_HEIGHT = 300;

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: ORB_MENU_WIDTH,
    height: ORB_MENU_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  orbContainer: {
    position: "relative",
    zIndex: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  orbPressable: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  orbWrapper: {
    width: 120,
    aspectRatio: "1/1",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "100%",
    overflow: "hidden",
  },
  innerVortexContainer: {
    position: "absolute",
    width: 102,
    height: 102,
    borderRadius: "50%",
    overflow: "hidden",
    zIndex: 2,
    marginBottom: 14,
    marginLeft: 1,
    mixBlendMode: "screen",
  },
  innerVortex: {
    position: "relative",
    width: "100%",
    height: "100%",
    mixBlendMode: "multiply",
    zIndex: 2,
  },
  innerOrb: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 1,
  },
  subButtonContainer: {
    position: "absolute",
    width: 142,
    height: 208,
    top: "50%",
    left: "50%",
    marginLeft: -71,
    marginTop: -104,
  },
  subButtonVisual: {
    ...StyleSheet.absoluteFillObject,
  },
  subButtonHitTarget: {
    ...StyleSheet.absoluteFillObject,
  },
  closeWrapper: {
    position: "absolute",
    width: 48,
    height: 48,
    top: 330,
    left: "50%",
    marginLeft: -24,
    zIndex: 3,
  },
  closePressable: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  centerIconContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  centerIconImage: {
    width: 54,
    height: 54,
    marginBottom: 0,
  },
  centerIconGlow: {
    position: "absolute",
    width: 56,
    height: 56,
    tintColor: "#FFFFFF",
    opacity: 0.9,
    transform: [{ scale: 1.08 }],
    marginBottom: 30,
  },
  mainTagText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    marginBottom: 10,
  },
});
