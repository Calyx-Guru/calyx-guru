import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
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
  View,
} from "react-native";

import { kaucimCollection } from "@/assets/images/kau-cim";
import { blueSquareButton, circleBlueButton } from "@/assets/images/ui";

import { NormalVideo } from "@/components/video/NormalVideo";

import { MAX_PET_POWER } from "@/constants";
import { getPetStatusTier } from "@/lib/app/petStatus";
import { VIDEOS } from "./constants";
import { CalendarEastern } from "@/features/calendar/eastern";
import { CalendarWestern } from "@/features/calendar/western";
import { KaucimOrb } from "@/features/kau-cim/orb";
import { HealthBar } from "@/features/mascot/health-bar";
import { StatusMessage } from "@/features/mascot/status-message";
import { useAppState } from "@/hooks/useAppState";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserState } from "@/hooks/useUserState";
import { KAUCIM_CONCERNS } from "@/types/UserState";
import { router, useFocusEffect, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function RouteMainMenu() {
  const [ioniconsReady] = useFonts(Ionicons.font);
  const insets = useSafeAreaInsets();
  const { profile } = useUserProfile();
  const { userState } = useUserState();
  const { lastPetPowerChange, setAppState } = useAppState();
  const { rescheduleFromCurrentState } = usePushNotifications();

  useFocusEffect(
    useCallback(() => {
      void rescheduleFromCurrentState({ force: true });
    }, [rescheduleFromCurrentState]),
  );

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

  const handleSettingsPress = useCallback(() => {
    router.push("/settings" as Href);
  }, []);

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
    const tier = getPetStatusTier(petPower);
    const petVideo =
      tier === "veryGood"
        ? VIDEOS.mascot.very_good
        : tier === "good"
          ? VIDEOS.mascot.good
          : tier === "normal"
            ? VIDEOS.mascot.normal
            : tier === "bad"
              ? VIDEOS.mascot.bad
              : VIDEOS.mascot.very_bad;

    return {
      petVideo,
      petPower,
      petPowerPercentage,
    };
  }, [userState?.petPower]);

  return (
    <View style={styles.root}>
      <NormalVideo url={petState.petVideo} topCropPx={8} bottomCropPx={36} />

      <View style={[styles.headerWrapper, { top: 8 }]}>
        <View style={styles.headerBarRow}>
          <HealthBar
            style={styles.healthBar}
            totalValue={MAX_PET_POWER}
            value={petState.petPower}
            change={petPowerGainChange ?? lastPetPowerChange}
            barHeight={42}
          />
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
              {ioniconsReady ? (
                <Ionicons
                  name="settings-sharp"
                  size={22}
                  color="#ffffff"
                  style={styles.settingsIcon}
                />
              ) : null}
            </ImageBackground>
          </Pressable>
        </View>
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
        <CalendarEastern />
        <CalendarWestern />
      </Animated.View>

      <Animated.View
        pointerEvents={isKaucimMenuOpen ? "none" : "box-none"}
        style={[
          styles.collectionButton,
          {
            bottom: 100,
            right: 2,
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
    top: 0,
    left: 8,
    right: 8,
    rowGap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBarRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  healthBar: {
    flex: 1,
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
    ...StyleSheet.absoluteFill,
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
  collectionButton: {
    position: "absolute",
    zIndex: 60,
  },
  collectionButtonPressable: {
    width: 84,
    height: 84,
  },
  collectionButtonBackground: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  collectionButtonIcon: {
    width: 50,
    height: 50,
  },
});
