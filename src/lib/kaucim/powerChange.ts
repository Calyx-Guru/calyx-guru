import {
  getPetPowerPercentage,
  PET_STATUS_TIER_THRESHOLDS,
} from "../app/petStatus";

export const KAUCIM_POWER_CALCULATION_CONFIG_KEY = "kaucim_power_calculation";
export const KAUCIM_ENERGY_CALCULATION_CONFIG_KEY = "kaucim_energy_calculation";
export const KAUCIM_DEFENSE_CALCULATION_CONFIG_KEY = "kaucim_power_defense";

export type KaucimFortuneTier =
  | "very_good"
  | "good"
  | "normal"
  | "bad"
  | "very_bad";

export type KaucimPowerCalculation = Record<
  KaucimFortuneTier,
  [number, number]
>;

/** Power-defense config: ranges for tiers, or a single % (e.g. `"normal": 0`). */
export type KaucimTierModifier = number | [number, number];

export type KaucimDefenseCalculation = Partial<
  Record<KaucimFortuneTier, KaucimTierModifier>
>;

export const FORTUNE_LEVEL_TO_TIER: Record<number, KaucimFortuneTier> = {
  1: "very_bad",
  2: "bad",
  3: "normal",
  4: "good",
  5: "very_good",
};

export function parseKaucimPowerCalculation(
  raw: string | undefined,
): KaucimPowerCalculation | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as KaucimPowerCalculation;
    return parsed;
  } catch {
    return null;
  }
}

export function parseKaucimDefenseCalculation(
  raw: string | undefined,
): KaucimDefenseCalculation | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as KaucimDefenseCalculation;
  } catch {
    return null;
  }
}

export function getFortuneSatusTier(petPower: number): KaucimFortuneTier {
  const petPowerPercentage = getPetPowerPercentage(petPower);

  if (petPowerPercentage >= PET_STATUS_TIER_THRESHOLDS.veryGood) {
    return "very_good";
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

  return "very_bad";
}

function resolveTierModifier(
  value: KaucimTierModifier | undefined,
  factor: number,
): number {
  if (value === undefined || value === null) {
    return 0;
  }
  if (typeof value === "number") {
    return value;
  }
  if (!Array.isArray(value)) {
    return 0;
  }

  const [low, high] = value;
  if (high === undefined) {
    return low;
  }
  return low + Math.ceil((high - low) * factor);
}

/**
 * Defense % from current pet power tier (`kaucim_power_defense` config).
 * Positive = mitigate energy loss; negative = amplify loss; normal = 0.
 */
export function getDefenseValue(
  currentPower: number,
  calculation: KaucimDefenseCalculation,
): number {
  const tier = getFortuneSatusTier(currentPower);
  const petPowerPct = getPetPowerPercentage(currentPower);
  return resolveTierModifier(calculation[tier], petPowerPct);
}

/**
 * Apply power-tier defense to a negative elemental energy change.
 * Positive defense moves the change toward zero; negative defense makes it worse.
 */
export function applyDefenseToEnergyLoss(
  energyChange: number,
  defensePercent: number,
): number {
  if (energyChange >= 0 || defensePercent === 0) {
    return energyChange;
  }

  const adjustment = Math.ceil((Math.abs(energyChange) * defensePercent) / 100);

  // Make sure defensePercent and adjustment have the same sign
  if (defensePercent < 0 && adjustment > 0) {
    return energyChange - adjustment;
  }
  if (defensePercent > 0 && adjustment < 0) {
    return energyChange - adjustment;
  }

  return energyChange + adjustment;
}

/** Interpolate power change between [low, high] using roll in 0–100. */
export function computeKaucimPowerChange(
  fortuneLevel: number,
  roll: number,
  calculation: KaucimPowerCalculation,
): number {
  const tier = FORTUNE_LEVEL_TO_TIER[fortuneLevel];
  if (!tier) return 0;

  const range = calculation[tier];
  if (!range) return 0;
  if (range.length < 2) return range[0];

  const [low, high] = range;
  const result = low + Math.ceil((high - low) * (roll / 100));
  return result;
}
