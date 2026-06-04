import { describe, expect, it } from "vitest";

import {
  applyDefenseToEnergyLoss,
  getDefenseValue,
  type KaucimDefenseCalculation,
} from "./powerChange";

const defenseConfig: KaucimDefenseCalculation = {
  very_good: [20, 30],
  good: [10, 20],
  normal: 0,
  bad: [-15, -30],
  very_bad: [-30, -50],
};

describe("getDefenseValue", () => {
  it("returns 0 at normal tier power", () => {
    expect(getDefenseValue(80, defenseConfig)).toBe(0);
  });

  it("returns positive mitigation at very good power", () => {
    const value = getDefenseValue(180, defenseConfig);
    expect(value).toBeGreaterThan(0);
  });

  it("returns negative amplification at very bad power", () => {
    const value = getDefenseValue(10, defenseConfig);
    expect(value).toBeLessThan(0);
  });
});

describe("applyDefenseToEnergyLoss", () => {
  it("mitigates loss when defense is positive", () => {
    expect(applyDefenseToEnergyLoss(-10, 20)).toBe(-8);
  });

  it("amplifies loss when defense is negative", () => {
    expect(applyDefenseToEnergyLoss(-10, -15)).toBe(-11);
  });

  it("leaves gain unchanged", () => {
    expect(applyDefenseToEnergyLoss(5, 20)).toBe(5);
  });
});
