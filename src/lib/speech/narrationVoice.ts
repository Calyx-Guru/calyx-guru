import * as Speech from "expo-speech";

import type { LanguageKey } from "@/types";

export async function pickNarrationVoiceIdentifier(
  locale: LanguageKey,
): Promise<string | undefined> {
  const preferredTag = locale.toLowerCase();
  const preferredLanguage = locale.split("-")[0]?.toLowerCase();

  const voices = await Speech.getAvailableVoicesAsync();
  if (!voices.length) {
    return undefined;
  }

  const byLanguage = voices.filter((voice) => {
    const voiceLanguage = voice.language?.toLowerCase() ?? "";
    if (preferredTag != null && voiceLanguage === preferredTag) {
      return true;
    }
    if (
      preferredLanguage != null &&
      voiceLanguage.startsWith(preferredLanguage)
    ) {
      return true;
    }
    return false;
  });

  const candidates = byLanguage.length > 0 ? byLanguage : voices;
  const scored = candidates
    .map((voice) => {
      const id = `${voice.identifier ?? ""} ${voice.name ?? ""}`.toLowerCase();
      let score = 0;

      if (id.includes("neural")) score += 5;
      if (id.includes("enhanced") || id.includes("premium")) score += 4;
      if (id.includes("natural") || id.includes("studio")) score += 3;
      if (id.includes("wavenet")) score += 3;
      if (id.includes("narrator")) score += 2;

      return { voice, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0]?.voice.identifier ?? undefined;
}
