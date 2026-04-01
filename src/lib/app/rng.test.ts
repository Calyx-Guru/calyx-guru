import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/app/helper', () => ({
  getDeviceIdAsync: vi.fn(async () => 'mock-device-for-async-api'),
}));

import {
  getDailyRandom01Sync,
  getDailyRandomIntSync,
  getRandom,
  getUtcDayStartMs,
} from '@/lib/app/rng';

/** Fixed device id so the grid is reproducible and independent of native modules. */
const DEVICE = 'unit-test-device-7f3a9c2e';

const DAY_MS = 86_400_000;
const NUM_DAYS = 1000;
const VALUES_PER_DAY = 100;
const TOTAL = NUM_DAYS * VALUES_PER_DAY;

const GRID_EPOCH_UTC = Date.UTC(2020, 0, 1, 12, 0, 0, 0);

function collectGridSamples(): number[] {
  const out: number[] = [];
  for (let d = 0; d < NUM_DAYS; d++) {
    const utcTime = GRID_EPOCH_UTC + d * DAY_MS;
    for (let i = 0; i < VALUES_PER_DAY; i++) {
      out.push(getDailyRandom01Sync(DEVICE, i, utcTime));
    }
  }
  return out;
}

/** Pearson chi-square statistic for uniform counts over `bins` equal-width cells in [0, 1). */
function chiSquareUniformity(samples: number[], bins: number): number {
  const counts = new Array<number>(bins).fill(0);
  for (const u of samples) {
    const idx = Math.min(bins - 1, Math.floor(u * bins));
    counts[idx]++;
  }
  const expected = samples.length / bins;
  let q = 0;
  for (const c of counts) {
    const diff = c - expected;
    q += (diff * diff) / expected;
  }
  return q;
}

/** Serial correlation lag-1; for iid uniform draws, asymptotically mean 0, var ~ 1/n. */
function serialCorrelationLag1(samples: number[]): number {
  const n = samples.length;
  if (n < 2) return 0;
  const mean = samples.reduce((s, u) => s + u, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    const d = samples[i] - mean;
    den += d * d;
  }
  for (let i = 1; i < n; i++) {
    num += (samples[i] - mean) * (samples[i - 1] - mean);
  }
  return num / den;
}

describe('getDailyRandom01Sync — 1000 days × 100 indices', () => {
  const samples = collectGridSamples();

  it('produces the expected number of values', () => {
    expect(samples.length).toBe(TOTAL);
  });

  it('keeps every value in [0, 1)', () => {
    const bad = samples.find((u) => u < 0 || u >= 1);
    expect(bad).toBeUndefined();
  });

  it('matches the same draw when utcTime falls anywhere on that UTC calendar day', () => {
    const t = Date.UTC(2024, 5, 15, 8, 30, 0, 0);
    const a = getDailyRandom01Sync(DEVICE, 42, t);
    const b = getDailyRandom01Sync(DEVICE, 42, getUtcDayStartMs(t));
    expect(a).toBe(b);
  });

  it('is deterministic for the same triple (deviceId, index, utcTime)', () => {
    const t = GRID_EPOCH_UTC + 333 * DAY_MS;
    const first = getDailyRandom01Sync(DEVICE, 77, t);
    expect(getDailyRandom01Sync(DEVICE, 77, t)).toBe(first);
  });

  it('exposes fine granularity (almost all 100k outputs are distinct floats)', () => {
    const distinct = new Set(samples);
    expect(distinct.size).toBeGreaterThanOrEqual(99_900);
  });

  it('behaves like a uniform source on [0,1): mean and variance', () => {
    const n = samples.length;
    const mean = samples.reduce((s, u) => s + u, 0) / n;
    const variance =
      samples.reduce((s, u) => s + (u - mean) ** 2, 0) / n;
    expect(Math.abs(mean - 0.5)).toBeLessThan(0.012);
    const expectedVar = 1 / 12;
    expect(Math.abs(variance - expectedVar)).toBeLessThan(0.012);
  });

  it('passes a chi-square uniformity test (50 bins, df = 49)', () => {
    const q = chiSquareUniformity(samples, 50);
    expect(q).toBeLessThan(130);
  });

  it('has low serial correlation across the flattened day-major order', () => {
    const rho = Math.abs(serialCorrelationLag1(samples));
    expect(rho).toBeLessThan(0.02);
  });

  it('varies across days for the same index (not constant streaks)', () => {
    const index = 0;
    const values: number[] = [];
    for (let d = 0; d < NUM_DAYS; d++) {
      values.push(
        getDailyRandom01Sync(DEVICE, index, GRID_EPOCH_UTC + d * DAY_MS),
      );
    }
    const distinctDays = new Set(values);
    expect(distinctDays.size).toBe(NUM_DAYS);
  });

  it('varies across indices within a day', () => {
    const day = GRID_EPOCH_UTC + 500 * DAY_MS;
    const values: number[] = [];
    for (let i = 0; i < VALUES_PER_DAY; i++) {
      values.push(getDailyRandom01Sync(DEVICE, i, day));
    }
    expect(new Set(values).size).toBe(VALUES_PER_DAY);
  });
});

describe('getDailyRandomIntSync — same grid', () => {
  it('covers the full integer range often enough (0..99 inclusive)', () => {
    const seen = new Set<number>();
    for (let d = 0; d < NUM_DAYS; d++) {
      const utcTime = GRID_EPOCH_UTC + d * DAY_MS;
      for (let i = 0; i < VALUES_PER_DAY; i++) {
        seen.add(getDailyRandomIntSync(DEVICE, i, utcTime, 0, 99));
      }
    }
    expect(seen.size).toBe(100);
  });
});

describe('getRandom (async)', () => {
  it('delegates to device id from helper', async () => {
    const u = await getRandom(0, GRID_EPOCH_UTC);
    const v = getDailyRandom01Sync('mock-device-for-async-api', 0, GRID_EPOCH_UTC);
    expect(u).toBe(v);
  });
});
