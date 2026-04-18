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

export function createDate(date: number = Date.now()): Date {
  return new Date(date + debugTimeOffset);
}
