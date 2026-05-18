import { FramePrimary3 } from "@/components/typography/FramePrimary3";
import { MAX_PET_POWER, STATUS_MESSAGE_RNG_INDEX } from "@/constants";
import { useAppState } from "@/hooks/useAppState";
import { useTranslation } from "@/hooks/useTranslation";
import { useUserState } from "@/hooks/useUserState";
import { getRandomInt } from "@/lib/app/rng";
import { createDate } from "@/lib/app/time";
import { useMemo } from "react";
import { StyleSheet, Text } from "react-native";
import type * as Types from "./type";

export const StatusMessage = (properties: Types.Properties) => {
  const { t, i18n } = useTranslation();
  const { deviceId } = useAppState();
  const { userState } = useUserState();
  const petPower = userState?.petPower ?? 0;
  const petPowerPercentage = Math.min(1, petPower / MAX_PET_POWER);

  const message = useMemo(() => {
    const rngIndex = STATUS_MESSAGE_RNG_INDEX;
    const rndIndex = getRandomInt(deviceId, rngIndex, createDate(), 0, 8);

    if (petPowerPercentage >= 0.75) {
      return t(`petStatus.veryGood.${rndIndex}`);
    } else if (petPowerPercentage >= 0.5) {
      return t(`petStatus.good.${rndIndex}`);
    } else if (petPowerPercentage >= 0.25) {
      return t(`petStatus.normal.${rndIndex}`);
    } else {
      return t(`petStatus.veryBad.${rndIndex}`);
    }
  }, [petPowerPercentage, deviceId, i18n.language]);

  return (
    <FramePrimary3 style={styles.frameWrapper}>
      <Text style={styles.text}>{message}</Text>
    </FramePrimary3>
  );
};

const styles = StyleSheet.create({
  frameWrapper: {
    width: 400,
    height: 180,
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
