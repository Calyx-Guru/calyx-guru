import { MAX_PET_POWER } from "@/constants";
import type { PetStatusTier } from "@/types/PushNotification";

/** Minimum pet power % (inclusive) for each tier; shared by UI, mascot video, and notifications. */
export const PET_STATUS_TIER_THRESHOLDS = {
  veryGood: 0.8,
  good: 0.6,
  normal: 0.4,
  bad: 0.2,
} as const;

export function getPetPowerPercentage(petPower: number): number {
  return Math.min(1, petPower / MAX_PET_POWER);
}

export function getPetStatusTier(petPower: number): PetStatusTier {
  const petPowerPercentage = getPetPowerPercentage(petPower);

  if (petPowerPercentage >= PET_STATUS_TIER_THRESHOLDS.veryGood) {
    return "veryGood";
  }
  if (petPowerPercentage >= PET_STATUS_TIER_THRESHOLDS.good) {
    return "good";
  }
  if (petPowerPercentage >= PET_STATUS_TIER_THRESHOLDS.normal) {
    return "normal";
  }
  if (petPowerPercentage >= PET_STATUS_TIER_THRESHOLDS.bad) {
    return "bad";
  }

  return "veryBad";
}

export function isLowPetStatusTier(tier: PetStatusTier): boolean {
  return tier === "normal" || tier === "bad" || tier === "veryBad";
}
