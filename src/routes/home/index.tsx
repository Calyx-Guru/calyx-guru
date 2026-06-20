import splashIcon from "@/assets/images/splash-icon.png";
import { ButtonPrimary } from "@/components/typography/ButtonPrimary";
import { HeadingPrimary } from "@/components/typography/HeadingPrimary";
import { TextInput } from "@/components/typography/TextInput";
import { AppAppearanceContext } from "@/contexts/AppAppearanceContext";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserState } from "@/hooks/useUserState";
import { enableGuestMode } from "@/lib/app/guestMode";
import {
  GoogleSignInCancelledError,
  isGooglePlaySignInAvailable,
} from "@/lib/auth/googlePlaySignIn";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SPLASH_BACKGROUND = "#030a1e";

export function RouteHome() {
  const insets = useSafeAreaInsets();
  const { colors } = useContext(AppAppearanceContext);
  const { t } = useTranslation();
  const {
    isGooglePlaySignedIn,
    isSignedIn,
    isLoading: isAuthLoading,
    signInWithGooglePlay,
    signInWithEmailPassword,
  } = useSupabaseAuth();
  const { isLoading: isLoadingProfile, initializeProfileForUser } =
    useUserProfile();
  const { isLoading: isLoadingUserState, initializeUserStateForUser } =
    useUserState();
  const [isStartingGuest, setIsStartingGuest] = useState(false);
  const [isSigningInWithGoogle, setIsSigningInWithGoogle] = useState(false);
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningInWithEmail, setIsSigningInWithEmail] = useState(false);
  const showGooglePlaySignIn = isGooglePlaySignInAvailable();
  const hasAutoNavigatedRef = useRef(false);

  const isAuthenticated = isGooglePlaySignedIn || isSignedIn;
  const isInitialDataLoading =
    isAuthLoading || isLoadingProfile || isLoadingUserState;

  useEffect(() => {
    if (!isAuthenticated) {
      hasAutoNavigatedRef.current = false;
      return;
    }
    if (isInitialDataLoading || hasAutoNavigatedRef.current) return;

    hasAutoNavigatedRef.current = true;
    router.replace("/main-menu");
  }, [isAuthenticated, isInitialDataLoading]);

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

  const closeEmailModal = useCallback(() => {
    if (isSigningInWithEmail) return;
    setIsEmailModalVisible(false);
    setEmail("");
    setPassword("");
  }, [isSigningInWithEmail]);

  const handleEmailSignIn = useCallback(async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert(t("auth.signIn"), t("auth.emailSignInMissingFields"));
      return;
    }

    setIsSigningInWithEmail(true);
    try {
      await signInWithEmailPassword(trimmedEmail, password);
      setIsEmailModalVisible(false);
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Email sign-in failed:", error);
      Alert.alert(t("auth.signIn"), t("auth.emailSignInFailed"));
    } finally {
      setIsSigningInWithEmail(false);
    }
  }, [email, password, signInWithEmailPassword, t]);

  if (isInitialDataLoading || isAuthenticated) {
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
          <ButtonPrimary
            onPress={handlePlayAsGuest}
            disabled={isStartingGuest || isSigningInWithGoogle}
          >
            {t("auth.playAsGuest")}
          </ButtonPrimary>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.emailSignInButton,
          {
            right: Math.max(insets.right, 16),
            bottom: Math.max(insets.bottom, 16),
          },
          pressed && styles.emailSignInButtonPressed,
        ]}
        onPress={() => setIsEmailModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={t("auth.signInWithEmail")}
      >
        <Text style={styles.emailSignInLabel}>{t("auth.signInWithEmail")}</Text>
      </Pressable>

      <Modal
        visible={isEmailModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeEmailModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable style={styles.modalBackdrop} onPress={closeEmailModal} />
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.surface ?? "#ffffff" },
            ]}
          >
            <Text style={styles.modalTitle}>{t("auth.signIn")}</Text>
            <TextInput
              label={t("forms.labels.email")}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              editable={!isSigningInWithEmail}
            />
            <TextInput
              label={t("forms.labels.password")}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="password"
              editable={!isSigningInWithEmail}
            />
            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalSecondaryButton,
                  pressed && styles.modalButtonPressed,
                ]}
                onPress={closeEmailModal}
                disabled={isSigningInWithEmail}
              >
                <Text style={styles.modalSecondaryLabel}>
                  {t("common.cancel")}
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalPrimaryButton,
                  pressed && styles.modalButtonPressed,
                  isSigningInWithEmail && styles.modalButtonDisabled,
                ]}
                onPress={() => void handleEmailSignIn()}
                disabled={isSigningInWithEmail}
              >
                <Text style={styles.modalPrimaryLabel}>
                  {isSigningInWithEmail ? t("auth.signingIn") : t("auth.signIn")}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  emailSignInButton: {
    position: "absolute",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "rgba(11, 60, 73, 0.92)",
  },
  emailSignInButtonPressed: {
    opacity: 0.85,
  },
  emailSignInLabel: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  modalCard: {
    borderRadius: 16,
    padding: 20,
    gap: 12,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0B3C49",
    marginBottom: 4,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },
  modalSecondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  modalPrimaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#0B3C49",
  },
  modalButtonPressed: {
    opacity: 0.85,
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
  modalSecondaryLabel: {
    color: "#0B3C49",
    fontSize: 15,
    fontWeight: "600",
  },
  modalPrimaryLabel: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
});
