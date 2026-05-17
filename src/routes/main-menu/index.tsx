import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { kaucimCollection } from "@/assets/images/kau-cim";
import { blueSquareButton } from "@/assets/images/ui";

import { NormalVideo } from "@/components/video/NormalVideo";

import { ENV, MAX_PET_POWER } from "@/constants";
import { CalendarEastern } from "@/features/calendar/eastern";
import { CalendarWestern } from "@/features/calendar/western";
import { KaucimOrb } from "@/features/kau-cim/orb";
import { HealthBar } from "@/features/mascot/health-bar";
import { StatusMessage } from "@/features/mascot/status-message";
import { useAppState } from "@/hooks/useAppState";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserState } from "@/hooks/useUserState";
import { KAUCIM_CONCERNS } from "@/types/UserState";
import { router, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VIDEOS } from "./constants";

export function RouteMainMenu() {
  const insets = useSafeAreaInsets();
  const { profile } = useUserProfile();
  const { userState } = useUserState();
  const { lastPetPowerChange, setAppState } = useAppState();

  const [petPowerGainChange, setPetPowerGainChange] = useState<number | null>(
    null,
  );
  const [powerFlyerAmount, setPowerFlyerAmount] = useState<number | null>(null);

  const flyerTranslateY = useRef(new Animated.Value(0)).current;
  const flyerOpacity = useRef(new Animated.Value(1)).current;
  const chromeOpacity = useRef(new Animated.Value(1)).current;

  const [isKaucimMenuOpen, setIsKaucimMenuOpen] = useState(false);
  /** Must not cancel when lastPetPowerChange drops to 0 after consume — that re-runs this effect. */
  const powerFlyerDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useLayoutEffect(() => {
    if (lastPetPowerChange === 0) return;
    const amount = lastPetPowerChange;
    setAppState({ lastPetPowerChange: 0 });
    setPetPowerGainChange(amount);
    if (powerFlyerDelayTimerRef.current != null) {
      clearTimeout(powerFlyerDelayTimerRef.current);
    }
    powerFlyerDelayTimerRef.current = setTimeout(() => {
      powerFlyerDelayTimerRef.current = null;
      setPowerFlyerAmount(amount);
    }, 1000);
  }, [lastPetPowerChange, setAppState]);

  useEffect(() => {
    return () => {
      if (powerFlyerDelayTimerRef.current != null) {
        clearTimeout(powerFlyerDelayTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (powerFlyerAmount == null) return undefined;

    flyerTranslateY.setValue(0);
    flyerOpacity.setValue(1);

    const animation = Animated.parallel([
      Animated.timing(flyerTranslateY, {
        toValue: -180,
        duration: 1600,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(flyerOpacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start(({ finished }) => {
      if (finished) {
        setPowerFlyerAmount(null);
        setPetPowerGainChange(null);
      }
    });

    return () => {
      animation.stop();
    };
  }, [powerFlyerAmount, flyerTranslateY, flyerOpacity]);

  const onKaucimAction = useCallback(
    (concern: KAUCIM_CONCERNS) => {
      setAppState({ lastKaucimConcern: concern });
      router.push("/kau-cim");
    },
    [profile],
  );

  const onKaucimMenuOpenChange = useCallback(
    (open: boolean) => {
      setIsKaucimMenuOpen(open);
      Animated.timing(chromeOpacity, {
        toValue: open ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    },
    [chromeOpacity],
  );

  const petState = useMemo(() => {
    const petPower = userState?.petPower ?? 0;
    const petPowerPercentage = petPower / MAX_PET_POWER;
    let petVideo = VIDEOS.mascot.normal;
    if (petPowerPercentage >= 0.75) {
      petVideo = VIDEOS.mascot.very_good;
    } else if (petPowerPercentage >= 0.5) {
      petVideo = VIDEOS.mascot.good;
    } else if (petPowerPercentage >= 0.25) {
      petVideo = VIDEOS.mascot.bad;
    } else {
      petVideo = VIDEOS.mascot.very_bad;
    }

    return {
      petVideo,
      petPower,
      petPowerPercentage,
    };
  }, [userState, profile]);

  return (
    <View style={styles.root}>
      <NormalVideo url={petState.petVideo} />

      <View style={[styles.headerWrapper, { top: 16 }]}>
        <HealthBar
          totalValue={MAX_PET_POWER}
          value={petState.petPower}
          change={petPowerGainChange ?? lastPetPowerChange}
        />
        <StatusMessage />
      </View>

      {powerFlyerAmount != null && (
        <View style={styles.powerFlyerOverlay} pointerEvents="none">
          <Animated.Text
            accessibilityLiveRegion="polite"
            style={[
              styles.powerFlyerText,
              {
                color: powerFlyerAmount < 0 ? "#FF4D4D" : "#FFD700",
                opacity: flyerOpacity,
                transform: [{ translateY: flyerTranslateY }],
              },
            ]}
          >
            {`POWER ${powerFlyerAmount > 0 ? `+${powerFlyerAmount}` : powerFlyerAmount}`}
          </Animated.Text>
        </View>
      )}

      <Animated.View
        style={[styles.bottomWrapper, { opacity: chromeOpacity }]}
        pointerEvents={isKaucimMenuOpen ? "none" : "auto"}
      >
        <CalendarEastern date={new Date("2038-06-26")} />
        <CalendarWestern />
      </Animated.View>

      {ENV.DEBUG_MODE && (
        <Animated.View
          pointerEvents={isKaucimMenuOpen ? "none" : "box-none"}
          style={[
            styles.debugButton,
            {
              top: insets.top + 8,
              left: Math.max(insets.left, 10),
              opacity: chromeOpacity,
            },
          ]}
        >
          <Pressable
            onPress={() => router.push("/debug" as Href)}
            accessibilityRole="button"
            accessibilityLabel="Open debug screen"
          >
            <Text style={styles.debugButtonLabel}>Debug</Text>
          </Pressable>
        </Animated.View>
      )}

      <Animated.View
        pointerEvents={isKaucimMenuOpen ? "none" : "box-none"}
        style={[
          styles.collectionButton,
          {
            bottom: 80,
            right: Math.max(insets.right, 0) - 4,
            opacity: chromeOpacity,
          },
        ]}
      >
        <Pressable
          onPress={() => router.push("/kau-cim-collection" as Href)}
          style={styles.collectionButtonPressable}
          accessibilityRole="button"
          accessibilityLabel="Open kaucim collection screen"
        >
          <ImageBackground
            source={blueSquareButton}
            style={styles.collectionButtonBackground}
            resizeMode="contain"
          >
            <Image
              source={kaucimCollection}
              style={styles.collectionButtonIcon}
              resizeMode="contain"
            />
          </ImageBackground>
        </Pressable>
      </Animated.View>

      <View style={styles.bodyWrapper}>
        <KaucimOrb
          onAction={onKaucimAction}
          onMenuOpenChange={onKaucimMenuOpenChange}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },
  headerWrapper: {
    position: "absolute",
    left: 8,
    right: 8,
    rowGap: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "auto",
  },
  bodyWrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 100,
    zIndex: 50,
    overflow: "visible",
    pointerEvents: "box-none",
  },
  powerFlyerOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  powerFlyerText: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: "#FFD700",
    textShadowColor: "rgba(0,0,0,0.85)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  bottomWrapper: {
    position: "absolute",
    bottom: 16,
    right: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    zIndex: 40,
  },
  debugButton: {
    position: "absolute",
    zIndex: 40,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 40,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 8,
  },
  debugButtonLabel: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  collectionButton: {
    position: "absolute",
    zIndex: 60,
  },
  collectionButtonPressable: {
    width: 76,
    height: 76,
  },
  collectionButtonBackground: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  collectionButtonIcon: {
    width: 42,
    height: 42,
    marginRight: 12,
    marginBottom: 12,
  },
});
