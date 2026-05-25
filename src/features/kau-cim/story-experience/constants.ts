export const FLASH_BEFORE_END_SEC = 0.38;

/** Verdict subtitle: fade in after playback passes this mark (seconds). */
export const VERDICT_SUBTITLE_FADE_IN_AFTER_SEC = 0.2;

/** Verdict subtitle: begin fading out when this many seconds remain. */
export const VERDICT_SUBTITLE_FADE_OUT_BEFORE_END_SEC = 0.2;

export const VERDICT_SUBTITLE_FADE_DURATION_MS = 480;

/** Pause before auto-advancing; scales with sentence length. */
const READ_DELAY_BASE_MS = 550;
const READ_MS_PER_CHAR = 38;
const READ_DELAY_MIN_MS = 1200;
const READ_DELAY_MAX_MS = 9500;

/** Small, light offsets so the stacked outline reads as a soft halo, not a hard stroke. */

/** ~avg glyph width for Latin at `fontSize` (600 weight); CJK tends wider — budget stays conservative. */
const CAPTION_FONT_SIZE = 20;
const CAPTION_HORIZONTAL_PADDING = 40;

/**
 * Expands `{name}` placeholders (e.g. `{bonus}`) before sentence splitting.
 * When `params` is null/undefined, returns `text` unchanged.
 * Skips keys whose value is null or undefined so placeholders stay in the string.
 */
export function expandPlaceholders(
  text: string,
  params: Record<string, string | number> | null | undefined,
): string {
  if (params == null) {
    return text;
  }
  return Object.entries(params).reduce((accumulator, [key, value]) => {
    if (value == null) {
      return accumulator;
    }
    return accumulator.replaceAll(`{${key}}`, String(value));
  }, text);
}

export function readingPauseMsForSentence(text: string): number {
  const length = text.length;

  return Math.round(
    Math.min(
      READ_DELAY_MAX_MS,
      Math.max(
        READ_DELAY_MIN_MS,
        READ_DELAY_BASE_MS + length * READ_MS_PER_CHAR,
      ),
    ),
  );
}

export function formatPowerChangeLine(change: number): string {
  if (change > 0) {
    return `Power +${change}`;
  }
  if (change < 0) {
    return `Power ${change}`;
  }
  return "Power unchanged";
}

export function estimateMaxCharsForTwoLines(
  windowWidth: number,
  insetLeft: number,
  insetRight: number,
): number {
  const usable = Math.max(
    100,
    windowWidth - CAPTION_HORIZONTAL_PADDING - insetLeft - insetRight,
  );
  const avgCharPx = CAPTION_FONT_SIZE * 0.52;
  const charsPerLine = Math.max(12, Math.floor(usable / avgCharPx));
  return Math.max(32, Math.min(charsPerLine * 2, 112));
}

export function findLengthSplitIndex(text: string, maxLen: number): number {
  const minBreak = Math.max(6, Math.floor(maxLen * 0.32));
  const end = Math.min(maxLen, text.length - 1);
  if (end < minBreak) {
    return Math.min(maxLen, text.length);
  }
  for (let index = end; index >= minBreak; index--) {
    const character = text[index];
    if (/[，。；：、]/.test(character)) {
      return index + 1;
    }
  }
  for (let index = end; index >= minBreak; index--) {
    if (text[index] === " ") {
      const previous = text[index - 1];
      if (previous && /[,.;:!?…]/.test(previous)) {
        return index + 1;
      }
    }
  }
  const lastSpace = text.lastIndexOf(" ", maxLen);
  if (lastSpace >= minBreak) {
    return lastSpace + 1;
  }
  return maxLen;
}

export function splitPhraseToMaxLength(text: string, maxLen: number): string[] {
  const trimmed = text.trim();
  if (!trimmed) {
    return [];
  }
  if (maxLen < 16) {
    return [trimmed];
  }
  if (trimmed.length <= maxLen) {
    return [trimmed];
  }
  const splitIndex = findLengthSplitIndex(trimmed, maxLen);
  const head = trimmed.slice(0, splitIndex).trim();
  const tail = trimmed.slice(splitIndex).trim();
  if (!tail) {
    return [head];
  }
  if (!head) {
    return splitPhraseToMaxLength(tail, maxLen);
  }
  return [head, ...splitPhraseToMaxLength(tail, maxLen)];
}

export function splitForReadableLines(
  body: string,
  maxChunkChars: number,
): string[] {
  return splitOnSentencePunctuation(body).flatMap((phrase) =>
    splitPhraseToMaxLength(phrase, maxChunkChars),
  );
}

export { prefetchImageUri as prefetchImageModule } from "@/lib/kaucim/illustrationCache";

export function splitOnSentencePunctuation(body: string): string[] {
  const normalized = body.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return [];
  }
  const endChars = new Set([".", "!", "?", "。", "！", "？"]);
  const sentences: string[] = [];
  let buffer = "";
  for (const character of normalized) {
    buffer += character;
    if (endChars.has(character)) {
      const sentence = buffer.trim();
      if (sentence) {
        sentences.push(sentence);
      }
      buffer = "";
    }
  }
  const rest = buffer.trim();
  if (rest) {
    sentences.push(rest);
  }
  return sentences.length > 0 ? sentences : [normalized];
}
