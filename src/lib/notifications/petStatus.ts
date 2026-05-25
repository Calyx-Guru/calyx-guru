import { STATUS_MESSAGE_RNG_INDEX } from "@/constants";
import {
  getPetStatusTier,
  isLowPetStatusTier,
  PET_STATUS_TIER_THRESHOLDS,
} from "@/lib/app/petStatus";
import { getRandomInt } from "@/lib/app/rng";
import { createDate } from "@/lib/app/time";
import i18n from "@/lib/i18n/config";
import type { LanguageKey } from "@/types";

export {
  getPetPowerPercentage,
  getPetStatusTier,
  isLowPetStatusTier,
  PET_STATUS_TIER_THRESHOLDS,
} from "@/lib/app/petStatus";

/** Same message pool as {@link StatusMessage} on the main menu. */
export function getPetStatusMessage(
  petPower: number,
  deviceId: string,
  locale: LanguageKey,
): string {
  const tier = getPetStatusTier(petPower);
  const rndIndex = getRandomInt(
    deviceId,
    STATUS_MESSAGE_RNG_INDEX,
    createDate(),
    0,
    8,
  );

  return i18n.t(`petStatus.${tier}.${rndIndex}`, { lng: locale });
}
