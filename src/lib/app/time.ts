let debugTimeOffset = 0;

export function timeHash(): string {
  return String(Date.now());
}

export function timeHashRandom(): string {
  return String(Date.now() + Math.random());
}

export function now(): number {
  return Date.now() + debugTimeOffset;
}

export function setDebugTimeOffset(offset: number) {
  debugTimeOffset = offset;
}

export function getDebugTimeOffset(): number {
  return debugTimeOffset;
}

export function createDate(date: number = Date.now()): Date {
  return new Date(date + debugTimeOffset);
}

/** Local calendar day start (00:00:00.000 in the device timezone). */
export function getLocalDayStartMs(time: Date | number = Date.now()): number {
  const d = createDate(typeof time === "number" ? time : time.getTime());
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    0,
    0,
    0,
    0,
  ).getTime();
}

export function getTodayFirstTimestamp(): number {
  return getLocalDayStartMs();
}
