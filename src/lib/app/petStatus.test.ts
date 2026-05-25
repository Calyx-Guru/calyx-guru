import { MAX_PET_POWER } from "@/constants";
import { describe, expect, it } from "vitest";

import {
  getPetStatusTier,
  isLowPetStatusTier,
  PET_STATUS_TIER_THRESHOLDS,
} from "./petStatus";

function powerAt(ratio: number): number {
  return Math.floor(MAX_PET_POWER * ratio);
}

describe("getPetStatusTier", () => {
  it("maps five tiers at shared thresholds", () => {
    expect(getPetStatusTier(powerAt(1))).toBe("veryGood");
    expect(getPetStatusTier(powerAt(PET_STATUS_TIER_THRESHOLDS.veryGood))).toBe(
      "veryGood",
    );
    expect(getPetStatusTier(powerAt(PET_STATUS_TIER_THRESHOLDS.good))).toBe(
      "good",
    );
    expect(getPetStatusTier(powerAt(PET_STATUS_TIER_THRESHOLDS.normal))).toBe(
      "normal",
    );
    expect(getPetStatusTier(powerAt(PET_STATUS_TIER_THRESHOLDS.bad))).toBe(
      "bad",
    );
    expect(getPetStatusTier(0)).toBe("veryBad");
  });

  it("classifies low tiers for notification nudges", () => {
    expect(isLowPetStatusTier("normal")).toBe(true);
    expect(isLowPetStatusTier("bad")).toBe(true);
    expect(isLowPetStatusTier("veryBad")).toBe(true);
    expect(isLowPetStatusTier("good")).toBe(false);
    expect(isLowPetStatusTier("veryGood")).toBe(false);
  });
});
