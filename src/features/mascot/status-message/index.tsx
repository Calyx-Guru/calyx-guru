import { FramePrimary3 } from "@/components/typography/FramePrimary3";
import { useAppState } from "@/hooks/useAppState";
import { useTranslation } from "@/hooks/useTranslation";
import { useUserState } from "@/hooks/useUserState";
import { useTodayFirstTimestamp } from "@/hooks/useTodayFirstTimestamp";
import { getPetStatusMessage } from "@/lib/notifications/petStatus";
import type { LanguageKey } from "@/types";
import { useMemo } from "react";
import { StyleSheet, Text } from "react-native";
import type * as Types from "./type";

export const StatusMessage = (properties: Types.Properties) => {
  const { i18n } = useTranslation();
  const { deviceId } = useAppState();
  const { userState } = useUserState();
  const petPower = userState?.petPower ?? 0;
  const todayFirstTimestamp = useTodayFirstTimestamp();

  const message = useMemo(
    () =>
      getPetStatusMessage(petPower, deviceId, i18n.language as LanguageKey),
    [petPower, deviceId, i18n.language, todayFirstTimestamp],
  );

  return (
    <FramePrimary3 style={styles.frameWrapper}>
      <Text style={styles.text}>{message}</Text>
    </FramePrimary3>
  );
};

const styles = StyleSheet.create({
  frameWrapper: {
    width: "100%",
    aspectRatio: 2,
  },
  text: {
    margin: 24,
    color: "#ffffff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "500",
    textShadowColor: "#000000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
});
