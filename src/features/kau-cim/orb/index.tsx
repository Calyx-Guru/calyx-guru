import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";
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
import { useTranslation } from "@/hooks/useTranslation";
import { KAUCIM_CONCERNS } from "@/types/UserState";
import { SUB_BUTTON_HIT_BOUNDS, SubButton } from "../category";
import type * as Types from "./type";

const GLOW_BLUR_MIN = 6;
const GLOW_BLUR_MAX = 20;
const GLOW_BLUR_LOOP_MS = 2800;

const SUB_BUTTON_PROPERTIES = [
  // {
  //   image: subButtonSet.familyFriend,
  //   action: KAUCIM_CONCERNS.FAMILY,
  //   labelKey: "kau_cim.category.family",
  // },
  {
    image: wealthIcon,
    action: KAUCIM_CONCERNS.WEALTH,
    labelKey: "kau_cim.category.wealth",
  },
  {
    image: loveIcon,
    action: KAUCIM_CONCERNS.LOVE,
    labelKey: "kau_cim.category.love",
  },
  {
    image: careerIcon,
    action: KAUCIM_CONCERNS.CAREER,
    labelKey: "kau_cim.category.career",
  },
  // {
  //   image: subButtonSet.health,
  //   action: KAUCIM_CONCERNS.HEALTH,
  //   labelKey: "kau_cim.category.health",
  // },
];

export function KaucimOrb(properties: Types.Properties) {
  const { style, onAction, onMenuOpenChange } = properties;
  const { t } = useTranslation();
  const orbOpacity = useRef(new Animated.Value(1)).current;
  /** 0 = menu closed, 1 = menu open — drives vortex / circle / center icon fades. */
  const menuBlend = useRef(new Animated.Value(0)).current;
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
    menuBlend.stopAnimation();
  }, [closeButtonAnim, fanAnimValues, menuBlend, orbOpacity]);

  const innerOrbCircleOpacity = menuBlend.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0],
  });
  const innerVortexOpacity = menuBlend;
  const centerIconOpacity = menuBlend.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const glowBlurAnim = useRef(new Animated.Value(0)).current;
  const [glowBlurRadius, setGlowBlurRadius] = useState(GLOW_BLUR_MIN);

  useEffect(() => {
    const listenerId = glowBlurAnim.addListener(({ value }) => {
      setGlowBlurRadius(
        Math.round(GLOW_BLUR_MIN + value * (GLOW_BLUR_MAX - GLOW_BLUR_MIN)),
      );
    });

    glowBlurAnim.setValue(0);
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowBlurAnim, {
          toValue: 1,
          duration: GLOW_BLUR_LOOP_MS / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(glowBlurAnim, {
          toValue: 0,
          duration: GLOW_BLUR_LOOP_MS / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    );
    animation.start();

    return () => {
      glowBlurAnim.removeListener(listenerId);
      animation.stop();
    };
  }, [glowBlurAnim]);

  const SUB_BUTTON_TARGETS = useMemo(() => {
    const a = 160;

    return ([-0.85, 0, 0.85] as const).map((t) => {
      const x = t * a;
      const y = 40 + 70 * Math.sqrt(Math.max(0, 1 - t * t));

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

    Animated.parallel([
      Animated.timing(orbOpacity, {
        toValue: 0.7,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(menuBlend, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
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
  }, [closeButtonAnim, fanAnimValues, menuBlend, onMenuOpenChange, orbOpacity]);

  const closeMenu = useCallback(() => {
    stopMenuAnimations();

    menuAnimationRef.current = Animated.parallel([
      Animated.timing(menuBlend, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
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
    menuBlend,
    onMenuOpenChange,
    orbOpacity,
    stopMenuAnimations,
  ]);

  const handleAction = useCallback(
    (action: KAUCIM_CONCERNS) => {
      stopMenuAnimations();
      menuBlend.setValue(0);
      orbOpacity.setValue(1);
      closeButtonAnim.setValue(0);
      fanAnimValues.forEach((anim) => anim.setValue(0));
      setIsMenuOpen(false);
      onMenuOpenChange?.(false);
      onAction?.(action);
    },
    [
      closeButtonAnim,
      fanAnimValues,
      menuBlend,
      onAction,
      onMenuOpenChange,
      orbOpacity,
      stopMenuAnimations,
    ],
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
              <Animated.View
                style={[
                  styles.innerOrbCircle,
                  { opacity: innerOrbCircleOpacity },
                ]}
                pointerEvents="none"
              />
              <Image
                source={orbButton}
                style={{
                  width: "105%",
                  height: "105%",
                }}
                resizeMode="cover"
              />
            </Animated.View>
            <Animated.View
              style={[
                styles.innerVortexContainer,
                { opacity: innerVortexOpacity },
              ]}
              pointerEvents="none"
            >
              <Image
                source={kaucimOrbVortex}
                style={styles.innerVortex}
                resizeMode="cover"
              />
            </Animated.View>
          </View>

          <Animated.View
            style={[styles.centerIconContainer, { opacity: centerIconOpacity }]}
            pointerEvents="none"
          >
            <Image
              source={kaucimIcon}
              style={styles.centerIconGlow}
              resizeMode="contain"
              blurRadius={glowBlurRadius}
            />
            <Image
              source={kaucimIcon}
              style={styles.centerIconImage}
              resizeMode="contain"
            />
            <Text style={styles.mainTagText}>
              {t("mainMenu.button.kaucim")}
            </Text>
          </Animated.View>
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
                  hitSlop={8}
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
    width: 104,
    height: 104,
    borderRadius: "50%",
    overflow: "hidden",
    zIndex: 2,
    marginBottom: 10,
    marginLeft: 8,
    mixBlendMode: "screen",
  },
  innerOrbCircle: {
    position: "absolute",
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#000000",
    zIndex: 2,
    marginTop: 5,
    marginLeft: 12,
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
  },
  subButtonVisual: {
    ...StyleSheet.absoluteFill,
  },
  subButtonHitTarget: {
    position: "absolute",
    top: SUB_BUTTON_HIT_BOUNDS.top,
    left: SUB_BUTTON_HIT_BOUNDS.left,
    width: SUB_BUTTON_HIT_BOUNDS.width,
    height: SUB_BUTTON_HIT_BOUNDS.height,
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
    width: 64,
    height: 64,
    marginLeft: 10,
    marginBottom: 0,
  },
  centerIconGlow: {
    position: "absolute",
    width: 56,
    height: 56,
    tintColor: "#FFFFFF",
    opacity: 0.9,
    transform: [{ scale: 1.08 }],
    marginLeft: 8,
    marginBottom: 32,
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
