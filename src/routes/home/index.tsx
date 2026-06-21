import splashIcon from "@/assets/images/splash-icon.png";
import { TextInput } from "@/components/typography/TextInput";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserState } from "@/hooks/useUserState";
import { enableGuestMode } from "@/lib/app/guestMode";
import {
  GooglePlaySignInUnavailableError,
  GoogleSignInCancelledError,
  isGooglePlaySignInAvailable,
} from "@/lib/auth/googlePlaySignIn";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT_COLOR = "#01875f";

export function RouteHome() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const {
    isGooglePlaySignedIn,
    isSignedIn,
    isLoading: isAuthLoading,
    signInWithGooglePlay,
    signInWithEmailPassword,
  } = useSupabaseAuth();
  const {
    isLoading: isLoadingProfile,
    profile,
    initializeProfileForUser,
  } = useUserProfile();
  const {
    isLoading: isLoadingUserState,
    userState,
    initializeUserStateForUser,
  } = useUserState();
  const [isStartingGuest, setIsStartingGuest] = useState(false);
  const [isSigningInWithGoogle, setIsSigningInWithGoogle] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningInWithEmail, setIsSigningInWithEmail] = useState(false);
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
  const showGooglePlaySignIn = isGooglePlaySignInAvailable();
  const hasAutoNavigatedRef = useRef(false);

  const isAuthenticated = isGooglePlaySignedIn || isSignedIn;
  const isInitialDataLoading =
    isAuthLoading || isLoadingProfile || isLoadingUserState;
  const isSessionDataReady =
    !isInitialDataLoading && profile != null && userState != null;
  const isBusy =
    isStartingGuest || isSigningInWithGoogle || isSigningInWithEmail;

  useEffect(() => {
    if (!isAuthenticated) {
      hasAutoNavigatedRef.current = false;
      return;
    }
    if (!isSessionDataReady || hasAutoNavigatedRef.current) return;

    hasAutoNavigatedRef.current = true;
    router.replace("/main-menu");
  }, [isAuthenticated, isSessionDataReady]);

  const handleGooglePlayLogin = useCallback(async () => {
    if (isSigningInWithGoogle) return;

    setIsSigningInWithGoogle(true);
    try {
      await signInWithGooglePlay();
    } catch (error) {
      if (error instanceof GoogleSignInCancelledError) {
        return;
      }
      if (error instanceof GooglePlaySignInUnavailableError) {
        console.warn("Google Play sign-in unavailable:", error.message);
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

  if (isInitialDataLoading || (isAuthenticated && !isSessionDataReady)) {
    return (
      <View style={styles.loading}>
        <Image
          source={splashIcon}
          style={styles.loadingIcon}
          contentFit="contain"
        />
        <Text style={styles.loadingLabel}>{t("auth.welcome")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image source={splashIcon} style={styles.logo} contentFit="contain" />
          <Text style={styles.title}>{t("auth.welcome")}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("auth.signIn")}</Text>
          {showGooglePlaySignIn ? (
            <Pressable
              onPress={() => void handleGooglePlayLogin()}
              disabled={isBusy}
              style={({ pressed }) => [
                styles.option,
                styles.optionAccent,
                (pressed || isSigningInWithGoogle) && styles.optionPressed,
                isBusy && styles.optionDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel={t("auth.signInGooglePlay")}
            >
              <View style={styles.optionContent}>
                <Ionicons
                  name="logo-google-playstore"
                  size={20}
                  color="#ffffff"
                />
                <Text style={styles.optionLabelAccent}>
                  {isSigningInWithGoogle
                    ? t("auth.signingIn")
                    : t("auth.signInGooglePlay")}
                </Text>
              </View>
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => void handlePlayAsGuest()}
            disabled={isBusy}
            style={({ pressed }) => [
              styles.option,
              (pressed || isStartingGuest) && styles.optionPressed,
              isBusy && styles.optionDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t("auth.playAsGuest")}
          >
            <View style={styles.optionContent}>
              <Ionicons name="person-outline" size={20} color="#0B3C49" />
              <Text style={styles.optionLabel}>
                {isStartingGuest ? t("auth.signingIn") : t("auth.playAsGuest")}
              </Text>
            </View>
          </Pressable>
          <Text style={styles.hint}>{t("auth.guestDataLossHint")}</Text>
        </View>
      </ScrollView>

      <Pressable
        style={({ pressed }) => [
          styles.emailSignInButton,
          {
            right: Math.max(insets.right, 16),
            bottom: Math.max(insets.bottom, 16),
          },
          pressed && styles.optionPressed,
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
          <View style={styles.modalCard}>
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
                  pressed && styles.optionPressed,
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
                  pressed && styles.optionPressed,
                  isSigningInWithEmail && styles.optionDisabled,
                ]}
                onPress={() => void handleEmailSignIn()}
                disabled={isSigningInWithEmail}
              >
                <Text style={styles.modalPrimaryLabel}>
                  {isSigningInWithEmail
                    ? t("auth.signingIn")
                    : t("auth.signIn")}
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
  root: {
    flex: 1,
    backgroundColor: "#f4f7f8",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 88,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f7f8",
    gap: 16,
  },
  loadingIcon: {
    width: 120,
    height: 120,
  },
  loadingLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0B3C49",
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
    gap: 12,
  },
  logo: {
    width: 96,
    height: 96,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0B3C49",
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
    gap: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0B3C49",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },
  optionAccent: {
    backgroundColor: ACCENT_COLOR,
  },
  optionContent: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  optionPressed: {
    opacity: 0.85,
  },
  optionDisabled: {
    opacity: 0.6,
  },
  optionLabel: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#0B3C49",
  },
  optionLabelAccent: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
    color: "#64748b",
    marginTop: 4,
    paddingHorizontal: 2,
  },
  emailSignInButton: {
    position: "absolute",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#0B3C49",
  },
  emailSignInLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
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
    backgroundColor: "#ffffff",
    borderRadius: 10,
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
