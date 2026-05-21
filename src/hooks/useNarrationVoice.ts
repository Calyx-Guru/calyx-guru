import { useCallback, useEffect, useRef } from "react";

import { pickNarrationVoiceIdentifier } from "@/lib/speech/narrationVoice";
import type { LanguageKey } from "@/types";

export type ResolveNarrationVoice = () => Promise<string | undefined>;

export function useNarrationVoice(locale: LanguageKey): ResolveNarrationVoice {
  const cachedVoice = useRef<string | undefined>(undefined);

  useEffect(() => {
    cachedVoice.current = undefined;
  }, [locale]);

  return useCallback(async () => {
    if (cachedVoice.current !== undefined) {
      return cachedVoice.current || undefined;
    }

    const voice = await pickNarrationVoiceIdentifier(locale);
    cachedVoice.current = voice ?? "";
    return voice;
  }, [locale]);
}
