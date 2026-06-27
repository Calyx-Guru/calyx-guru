import { ENV, LANGUAGE_NATIVE_LABELS, SKIP_SIGN_IN_SCREEN, SUPPORTED_LANGUAGES } from "@/constants";
import { useAppAppearance } from "@/contexts/AppAppearanceContext";
import { useAppState } from "@/hooks/useAppState";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserState } from "@/hooks/useUserState";
import { deleteUserProgression } from "@/lib/account/deleteAccountAndData";
import { isGuestUserId } from "@/lib/app/guestMode";
import { getStoredSavedataPathKey } from "@/lib/auth/userEmailStorage";
import { useTranslation } from "@/hooks/useTranslation";
import { router, type Href } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

async function resolveDeleteTargets(
  supabaseUserId: string | null,
  profileId: string | undefined,
  userEmail: string | null,
) {
  const storedUserEmail = userEmail ?? (await getStoredSavedataPathKey());
  const guestUserId =
    profileId && isGuestUserId(profileId) ? profileId : null;

  return {
    supabaseUserId,
    guestUserId,
    userEmail: storedUserEmail,
  };
}

export function RouteSettings() {
  const { locale, setLocale } = useAppAppearance();
  const {
    logout,
    deleteAccountAndData,
    isSignedIn,
    user,
    userEmail,
  } = useSupabaseAuth();
  const { profile } = useUserProfile();
  const { resetProgression } = useUserState();
  const { resetAppState } = useAppState();
  const { t } = useTranslation();
  const [isBlocking, setIsBlocking] = useState(false);

  const showDeleteAccount =
    isSignedIn || isGuestUserId(profile?.id);

  const handleLogout = useCallback(async () => {
    if (isBlocking) return;

    setIsBlocking(true);
    try {
      await logout();
      router.replace((SKIP_SIGN_IN_SCREEN ? "/main-menu" : "/") as Href);
    } catch (error) {
      console.error("Logout failed:", error);
      Alert.alert(t("auth.logout"), t("auth.logoutFailed"));
      setIsBlocking(false);
    }
  }, [isBlocking, logout, t]);

  const handleDeleteAccount = useCallback(async () => {
    if (isBlocking) return;

    setIsBlocking(true);
    try {
      await deleteAccountAndData();
      resetAppState();
      router.replace((SKIP_SIGN_IN_SCREEN ? "/main-menu" : "/") as Href);
    } catch (error) {
      console.error("Delete account failed:", error);
      Alert.alert(t("auth.deleteAccountTitle"), t("auth.deleteAccountFailed"));
      setIsBlocking(false);
    }
  }, [deleteAccountAndData, isBlocking, resetAppState, t]);

  const handleDeleteProgressionOnly = useCallback(async () => {
    if (isBlocking) return;

    setIsBlocking(true);
    try {
      const target = await resolveDeleteTargets(
        user?.id ?? null,
        profile?.id,
        userEmail,
      );
      await deleteUserProgression(target, resetProgression);
      resetAppState();
    } catch (error) {
      console.error("Delete progression failed:", error);
      Alert.alert(
        t("auth.deleteAccountTitle"),
        t("auth.deleteProgressionFailed"),
      );
    } finally {
      setIsBlocking(false);
    }
  }, [
    isBlocking,
    profile?.id,
    resetAppState,
    resetProgression,
    t,
    user?.id,
    userEmail,
  ]);

  const confirmDeleteAccount = useCallback(() => {
    Alert.alert(
      t("auth.deleteAccountConfirm"),
      t("auth.deleteAccountFinalMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("auth.deleteFinalConfirm"),
          style: "destructive",
          onPress: () => {
            void handleDeleteAccount();
          },
        },
      ],
    );
  }, [handleDeleteAccount, t]);

  const confirmDeleteProgression = useCallback(() => {
    Alert.alert(
      t("auth.deleteProgressionConfirm"),
      t("auth.deleteProgressionFinalMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("auth.deleteFinalConfirm"),
          style: "destructive",
          onPress: () => {
            void handleDeleteProgressionOnly();
          },
        },
      ],
    );
  }, [handleDeleteProgressionOnly, t]);

  const handleDeleteAccountAndData = useCallback(() => {
    Alert.alert(t("auth.deleteAccountTitle"), t("auth.deleteAccountMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("auth.deleteProgressionConfirm"),
        onPress: confirmDeleteProgression,
      },
      {
        text: t("auth.deleteAccountConfirm"),
        style: "destructive",
        onPress: confirmDeleteAccount,
      },
    ]);
  }, [confirmDeleteAccount, confirmDeleteProgression, t]);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isBlocking}
      >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language</Text>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <Pressable
            key={lang}
            onPress={() => setLocale(lang)}
            style={[styles.option, locale === lang && styles.optionSelected]}
          >
            <Text style={styles.optionLabel}>
              {LANGUAGE_NATIVE_LABELS[lang]}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>
        <Pressable
          onPress={() => router.push("/settings/privacy-policy" as Href)}
          style={styles.option}
          accessibilityRole="button"
          accessibilityLabel="Open privacy policy"
        >
          <Text style={styles.optionLabel}>Privacy Policy</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/settings/terms-of-service" as Href)}
          style={styles.option}
          accessibilityRole="button"
          accessibilityLabel="Open terms of service"
        >
          <Text style={styles.optionLabel}>Terms of Service</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("auth.account")}</Text>
        <Pressable
          onPress={() => router.push("/account" as Href)}
          style={styles.option}
          accessibilityRole="button"
          accessibilityLabel={t("auth.accountInformation")}
        >
          <Text style={styles.optionLabel}>{t("auth.accountInformation")}</Text>
        </Pressable>
        <Pressable
          onPress={() => void handleLogout()}
          disabled={isBlocking}
          style={[styles.option, isBlocking && styles.optionDisabled]}
          accessibilityRole="button"
          accessibilityLabel={t("auth.logout")}
          accessibilityState={{ disabled: isBlocking, busy: isBlocking }}
        >
          <Text style={styles.logoutLabel}>{t("auth.logout")}</Text>
        </Pressable>
        {showDeleteAccount ? (
          <Pressable
            onPress={handleDeleteAccountAndData}
            disabled={isBlocking}
            style={[styles.option, isBlocking && styles.optionDisabled]}
            accessibilityRole="button"
            accessibilityLabel={t("auth.deleteAccountTitle")}
            accessibilityState={{ disabled: isBlocking }}
          >
            <Text style={styles.deleteAccountLabel}>
              {t("auth.deleteAccountTitle")}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {ENV.DEBUG_MODE && (
        <View style={[styles.section, styles.developerSection]}>
          <Text style={styles.sectionTitle}>Developer</Text>
          <Pressable
            onPress={() => router.push("/debug" as Href)}
            style={styles.option}
            accessibilityRole="button"
            accessibilityLabel="Open debug screen"
          >
            <Text style={styles.optionLabel}>Debug</Text>
          </Pressable>
        </View>
      )}
      </ScrollView>

      {isBlocking ? (
        <View style={styles.blockingOverlay} accessibilityLabel="Loading">
          <ActivityIndicator size="large" color="#0B3C49" />
        </View>
      ) : null}
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
    paddingTop: 12,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
    gap: 8,
  },
  developerSection: {
    marginTop: 300,
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
  optionDisabled: {
    opacity: 0.6,
  },
  optionSelected: {
    backgroundColor: "#d6a12d",
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0B3C49",
  },
  logoutLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#b42318",
  },
  deleteAccountLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7f1d1d",
  },
  blockingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: "rgba(244, 247, 248, 0.72)",
    justifyContent: "center",
  },
});
