import type { LanguageKey } from "@/types";

/** Brief hold after estimated speech ends so the last syllables are not clipped. */
export const SPEECH_TRAILING_PAUSE_MS = 400;

/** Extra headroom on the safety fallback beyond the duration estimate. */
export const SPEECH_SAFETY_BUFFER_MS = 900;

/** expo-speech rate used for story narration playback. */
export const NARRATION_SPEECH_RATE = 0.93;

const SPEECH_BASE_MS = 450;
const SPEECH_MS_PER_CJK_CHAR = 300;
const SPEECH_MS_PER_LATIN_CHAR = 85;
const SPEECH_MIN_MS = 1400;
const SPEECH_MAX_MS = 28_000;

const CJK_CHAR =
  /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/;

/**
 * Scales minimum-wait / safety timing per locale without changing TTS playback rate.
 * Values above 1 lengthen the estimate (e.g. ja/ko engines often sound faster than the
 * generic CJK per-character model predicts).
 */
const LOCALE_DURATION_ESTIMATE_MULTIPLIERS: Record<LanguageKey, number> = {
  en: 0.7,
  "zh-CN": 0.8,
  "zh-TW": 0.8,
  vi: 0.7,
  ko: 0.6,
  ja: 0.6,
};

export function getSpeechDurationEstimateMultiplier(
  locale: LanguageKey,
): number {
  return LOCALE_DURATION_ESTIMATE_MULTIPLIERS[locale] ?? 1;
}

/**
 * Rough lower-bound for TTS playback before advancing captions.
 * Playback uses {@link NARRATION_SPEECH_RATE}; locale only adjusts the wait estimate.
 */
export function estimateSpeechDurationMs(
  text: string,
  locale: LanguageKey,
): number {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }

  let cjkCount = 0;
  for (const character of trimmed) {
    if (CJK_CHAR.test(character)) {
      cjkCount += 1;
    }
  }

  const latinCount = trimmed.length - cjkCount;
  const blended =
    SPEECH_BASE_MS +
    cjkCount * SPEECH_MS_PER_CJK_CHAR +
    latinCount * SPEECH_MS_PER_LATIN_CHAR;
  const scaled = Math.round(
    (blended / Math.max(NARRATION_SPEECH_RATE, 0.1)) *
      getSpeechDurationEstimateMultiplier(locale),
  );

  return Math.min(SPEECH_MAX_MS, Math.max(SPEECH_MIN_MS, scaled));
}

export function delayUntilMinSpeechElapsed(
  text: string,
  locale: LanguageKey,
  startedAt: number,
): Promise<void> {
  const minMs = estimateSpeechDurationMs(text, locale);
  const elapsed = Date.now() - startedAt;
  const waitMs = Math.max(0, minMs - elapsed) + SPEECH_TRAILING_PAUSE_MS;

  return new Promise((resolve) => {
    setTimeout(resolve, waitMs);
  });
}
