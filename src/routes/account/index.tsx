import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { isGuestUserId } from "@/lib/app/guestMode";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text selectable style={styles.rowValue}>
        {value}
      </Text>
    </View>
  );
}

export function RouteAccount() {
  const { profile } = useUserProfile();
  const {
    user,
    googlePlayUserId,
    userEmail,
    isGooglePlaySignedIn,
    isSignedIn,
  } = useSupabaseAuth();
  const { t } = useTranslation();

  const notAvailable = t("auth.accountInfoNotAvailable");

  const accountType = useMemo(() => {
    if (isGooglePlaySignedIn) {
      return t("auth.accountTypeGooglePlay");
    }
    if (isSignedIn) {
      return t("auth.accountTypeEmail");
    }
    if (isGuestUserId(profile?.id)) {
      return t("auth.accountTypeGuest");
    }
    return notAvailable;
  }, [
    isGooglePlaySignedIn,
    isSignedIn,
    notAvailable,
    profile?.id,
    t,
  ]);

  const email =
    userEmail?.trim() ||
    profile?.email?.trim() ||
    user?.email?.trim() ||
    notAvailable;

  const rows = [
    { label: t("auth.accountType"), value: accountType },
    { label: t("auth.profileId"), value: profile?.id ?? notAvailable },
    {
      label: t("auth.googlePlayUserId"),
      value: googlePlayUserId ?? notAvailable,
    },
    {
      label: t("auth.supabaseUserId"),
      value: user?.id ?? notAvailable,
    },
    { label: t("forms.labels.email"), value: email },
    {
      label: t("auth.username"),
      value: profile?.username?.trim() || notAvailable,
    },
  ];

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.description}>{t("auth.accountInfoDescription")}</Text>

      <View style={styles.card}>
        {rows.map((row) => (
          <InfoRow key={row.label} label={row.label} value={row.value} />
        ))}
      </View>

      <Text style={styles.hint}>{t("auth.accountInfoSupportHint")}</Text>
      <Text selectable style={styles.email}>
        support@calyx.guru
      </Text>
    </ScrollView>
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
    gap: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#334155",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    gap: 0,
  },
  row: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e2e8f0",
    gap: 4,
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  rowValue: {
    fontSize: 15,
    lineHeight: 21,
    color: "#0B3C49",
    fontWeight: "600",
  },
  hint: {
    fontSize: 14,
    lineHeight: 21,
    color: "#475569",
  },
  email: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0B3C49",
  },
});
