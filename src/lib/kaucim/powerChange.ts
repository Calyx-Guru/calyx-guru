export const KAUCIM_POWER_CALCULATION_CONFIG_KEY = "kaucim_power_calculation";

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

const FORTUNE_LEVEL_TO_TIER: Record<number, KaucimFortuneTier> = {
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

/** Interpolate power change between [low, high] using roll in 0–100. */
export function computeKaucimPowerChange(
  fortuneLevel: number,
  roll: number,
  calculation: KaucimPowerCalculation,
): number {
  const tier = FORTUNE_LEVEL_TO_TIER[fortuneLevel];
  if (!tier) return 0;

  const range = calculation[tier];
  if (!range || range.length !== 2) return 0;

  const [low, high] = range;
  const result = low + Math.ceil((high - low) * (roll / 100));
  return result;
}
