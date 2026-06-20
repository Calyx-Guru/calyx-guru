import splashIcon from "@/assets/images/splash-icon.png";
import { ButtonPrimary } from "@/components/typography/ButtonPrimary";
import { HeadingPrimary } from "@/components/typography/HeadingPrimary";
import { AppAppearanceContext } from "@/contexts/AppAppearanceContext";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserState } from "@/hooks/useUserState";
import {
  GoogleSignInCancelledError,
  isGooglePlaySignInAvailable,
} from "@/lib/auth/googlePlaySignIn";
import { enableGuestMode } from "@/lib/app/guestMode";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

const SPLASH_BACKGROUND = "#030a1e";

export default function Index() {
  const { colors } = useContext(AppAppearanceContext);
  const { t } = useTranslation();
  const { isGooglePlaySignedIn, isLoading: isAuthLoading, signInWithGooglePlay } =
    useSupabaseAuth();
  const { isLoading: isLoadingProfile, initializeProfileForUser } =
    useUserProfile();
  const { isLoading: isLoadingUserState, initializeUserStateForUser } =
    useUserState();
  const [isStartingGuest, setIsStartingGuest] = useState(false);
  const [isSigningInWithGoogle, setIsSigningInWithGoogle] = useState(false);
  const showGooglePlaySignIn = isGooglePlaySignInAvailable();
  const hasAutoNavigatedRef = useRef(false);

  const isInitialDataLoading =
    isAuthLoading || isLoadingProfile || isLoadingUserState;

  useEffect(() => {
    if (!isGooglePlaySignedIn) {
      hasAutoNavigatedRef.current = false;
      return;
    }
    if (isInitialDataLoading || hasAutoNavigatedRef.current) return;

    hasAutoNavigatedRef.current = true;
    router.replace("/main-menu");
  }, [isInitialDataLoading, isGooglePlaySignedIn]);

  const handleGooglePlayLogin = useCallback(async () => {
    if (isSigningInWithGoogle) return;

    setIsSigningInWithGoogle(true);
    try {
      await signInWithGooglePlay();
    } catch (error) {
      if (error instanceof GoogleSignInCancelledError) {
        return;
      }
      console.error("Google Play sign-in failed:", error);
      Alert.alert(t("auth.signInGooglePlay"), t("auth.googlePlaySignInFailed"));
    } finally {
      setIsSigningInWithGoogle(false);
    }
  }, [isSigningInWithGoogle, signInWithGooglePlay, t]);

  const handlePlayAsGuest = useCallback(async () => {
    if (isStartingGuest) return;

    setIsStartingGuest(true);
    try {
      const guestId = await enableGuestMode();
      await Promise.all([
        initializeProfileForUser(guestId),
        initializeUserStateForUser(guestId),
      ]);
      router.replace("/main-menu");
    } catch (error) {
      console.error("Failed to start guest session:", error);
      Alert.alert(t("auth.playAsGuest"), t("auth.guestStartFailed"));
    } finally {
      setIsStartingGuest(false);
    }
  }, [
    initializeProfileForUser,
    initializeUserStateForUser,
    isStartingGuest,
    t,
  ]);

  if (isInitialDataLoading || isGooglePlaySignedIn) {
    return (
      <View style={[styles.splash, { backgroundColor: SPLASH_BACKGROUND }]}>
        <Image
          source={splashIcon}
          style={styles.splashIcon}
          contentFit="contain"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Image source={splashIcon} style={styles.logo} contentFit="contain" />
        <HeadingPrimary>{t("auth.welcome")}</HeadingPrimary>
      </View>

      <View style={styles.actions}>
        {showGooglePlaySignIn ? (
          <View style={styles.buttonSlot}>
            <ButtonPrimary
              onPress={handleGooglePlayLogin}
              disabled={isSigningInWithGoogle || isStartingGuest}
            >
              {t("auth.signInGooglePlay")}
            </ButtonPrimary>
          </View>
        ) : null}
        <View style={styles.buttonSlot}>
          <ButtonPrimary onPress={handlePlayAsGuest} disabled={isStartingGuest || isSigningInWithGoogle}>
            {t("auth.playAsGuest")}
          </ButtonPrimary>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  splashIcon: {
    width: 200,
    height: 200,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 24,
  },
  actions: {
    gap: 16,
  },
  buttonSlot: {
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
    aspectRatio: 3,
  },
});
