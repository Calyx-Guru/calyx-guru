import { getDeviceIdAsync } from '@/lib/app/helper';
import { getLocalDayStartMs } from '@/lib/app/time';

/**
 * Milliseconds since Unix epoch at 00:00:00.000 UTC for the calendar day of `utcTime`.
 */
export function getUtcDayStartMs(utcTime: Date | number): number {
  const d = typeof utcTime === 'number' ? new Date(utcTime) : utcTime;
  return Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    0,
    0,
    0,
    0,
  );
}

function assertNonNegativeInteger(index: number, name: string): number {
  if (!Number.isFinite(index) || index < 0 || Math.floor(index) !== index) {
    throw new RangeError(`${name} must be a non-negative integer`);
  }
  return index;
}

/**
 * MurmurHash3 (x86_32). Deterministic, good avalanche for small keys.
 */
function murmur3_x86_32(key: string, seed: number): number {
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;
  let h1 = seed >>> 0;
  const len = key.length;
  let i = 0;

  while (i + 4 <= len) {
    let k1 =
      key.charCodeAt(i) |
      (key.charCodeAt(i + 1) << 8) |
      (key.charCodeAt(i + 2) << 16) |
      (key.charCodeAt(i + 3) << 24);
    i += 4;
    k1 = Math.imul(k1, c1);
    k1 = ((k1 << 15) | (k1 >>> 17)) >>> 0;
    k1 = Math.imul(k1, c2);
    h1 ^= k1;
    h1 = ((h1 << 13) | (h1 >>> 19)) >>> 0;
    h1 = (Math.imul(h1, 5) + 0xe6546b64) >>> 0;
  }

  let k1 = 0;
  switch (len - i) {
    case 3:
      k1 ^= key.charCodeAt(i + 2) << 16;
    // fallthrough
    case 2:
      k1 ^= key.charCodeAt(i + 1) << 8;
    // fallthrough
    case 1:
      k1 ^= key.charCodeAt(i);
      k1 = Math.imul(k1 >>> 0, c1);
      k1 = ((k1 << 15) | (k1 >>> 17)) >>> 0;
      k1 = Math.imul(k1, c2);
      h1 ^= k1;
  }

  h1 ^= len;
  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 0x85ebca6b);
  h1 ^= h1 >>> 13;
  h1 = Math.imul(h1, 0xc2b2ae35);
  h1 ^= h1 >>> 16;

  return h1 >>> 0;
}

const RNG_KEY_SEED = 0x9e3779b9;

function dailyRngKey(
  deviceId: string,
  dayStartMs: number,
  index: number,
): string {
  // Delimiters avoid ambiguous concatenation; day is numeric ms at local midnight.
  return `${deviceId}\u0000${dayStartMs}\u0000${index}`;
}

/**
 * Deterministic uniform float in [0, 1), same for the same device, local calendar day, and index.
 * Uses a daily sub-key (local midnight of the day containing `time`) and MurmurHash3.
 */
export function getDailyRandom01Sync(
  deviceId: string,
  index: number,
  time: Date | number,
): number {
  assertNonNegativeInteger(index, 'index');
  const dayStart = getLocalDayStartMs(time);
  const h = murmur3_x86_32(dailyRngKey(deviceId, dayStart, index), RNG_KEY_SEED);
  return h / 4294967296;
}

/**
 * Same as {@link getDailyRandom01Sync} but resolves the device id from {@link getDeviceIdAsync}.
 */
export async function getRandom(
  index: number,
  time: Date | number,
): Promise<number> {
  const deviceId = await getDeviceIdAsync();
  return getDailyRandom01Sync(deviceId, index, time);
}

function dailyRngKeySalted(
  deviceId: string,
  dayStartMs: number,
  index: number,
  salt: number,
): string {
  return `${deviceId}\u0000${dayStartMs}\u0000${index}\u0001${salt}`;
}

/**
 * Inclusive integer in [min, max], uniform over integers (rejection avoids modulo bias).
 */
export function getDailyRandomIntSync(
  deviceId: string,
  index: number,
  time: Date | number,
  min: number,
  max: number,
): number {
  assertNonNegativeInteger(index, 'index');
  if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) {
    throw new RangeError('min and max must be finite and min <= max');
  }
  const lo = Math.ceil(min);
  const hi = Math.floor(max);
  if (lo > hi) {
    throw new RangeError('no integers in [min, max]');
  }
  const span = hi - lo + 1;
  const dayStart = getLocalDayStartMs(time);
  const space = 4294967296;
  const limit = space - (space % span);

  for (let salt = 0; salt < 24; salt++) {
    const h = murmur3_x86_32(
      dailyRngKeySalted(deviceId, dayStart, index, salt),
      RNG_KEY_SEED,
    );
    if (h < limit) {
      return lo + (h % span);
    }
  }

  const h = murmur3_x86_32(
    dailyRngKeySalted(deviceId, dayStart, index, 24),
    RNG_KEY_SEED,
  );
  return lo + (h % span);
}

export function getRandomInt(
  deviceId: string,
  index: number,
  time: Date | number,
  min: number,
  max: number,
): number {
  return getDailyRandomIntSync(deviceId, index, time, min, max);
}
