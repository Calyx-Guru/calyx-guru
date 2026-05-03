import { getLocales } from "expo-localization";
import * as Speech from "expo-speech";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Animated, Easing, Pressable, StyleSheet, View } from "react-native";

import {
  expandPlaceholders,
  readingPauseMsForSentence,
  splitOnSentencePunctuation,
} from "@/features/kau-cim/story-experience/constants";

import { CrossfadeImage } from "@/components/image/CrossfadeImage";
import { CaptionText } from "../typography/CaptionText";

interface Properties {
  slides: Kaucim.Slide[];
  onEnded?: () => void;
}

export function StoryTeller(properties: Properties) {
  const { slides } = properties;

  const insets = useSafeAreaInsets();

  const [slideIndex, setSlideIndex] = useState(0);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [crossfading, setCrossfading] = useState(false);
  const captionOpacity = useRef(new Animated.Value(1)).current;
  const speechUnavailable = useRef(false);
  const narrationVoice = useRef<string | undefined>(undefined);

  const slidesData = useMemo(
    () =>
      slides.map((slide) => ({
        image: slide.image,
        sentences: splitOnSentencePunctuation(
          expandPlaceholders(slide.text, slide.textParams),
        ),
      })),
    [slides],
  );

  const currentSlide = slidesData[slideIndex];

  const resolveNarrationVoice = useCallback(async () => {
    if (narrationVoice.current !== undefined) {
      return narrationVoice.current;
    }

    const locales = getLocales();
    const preferredTag = locales[0]?.languageTag?.toLowerCase();
    const preferredLanguage = locales[0]?.languageCode?.toLowerCase();

    const voices = await Speech.getAvailableVoicesAsync();
    if (!voices.length) {
      narrationVoice.current = "";
      return undefined;
    }

    const byLanguage = voices.filter((voice) => {
      const voiceLanguage = voice.language?.toLowerCase() ?? "";
      if (preferredTag != null && voiceLanguage === preferredTag) {
        return true;
      }
      if (preferredLanguage != null && voiceLanguage.startsWith(preferredLanguage)) {
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

    narrationVoice.current = scored[0]?.voice.identifier ?? "";
    return narrationVoice.current || undefined;
  }, []);

  const advance = useCallback(() => {
    if (crossfading) {
      return;
    }

    const slide = slidesData[slideIndex];

    if (!slide) {
      return;
    }

    if (sentenceIndex < slide.sentences.length - 1) {
      setSentenceIndex((index) => index + 1);
      return;
    }

    if (slideIndex >= slidesData.length - 1) {
      const lastSentenceIndex = Math.max(0, slide.sentences.length - 1);
      if (sentenceIndex >= lastSentenceIndex) {
        properties.onEnded?.();
      }
      return;
    }

    const nextIndex = slideIndex + 1;
    if (!slidesData[nextIndex]?.image) {
      return;
    }

    setCrossfading(true);
    setSlideIndex(nextIndex);
    setSentenceIndex(0);
  }, [crossfading, slidesData, slideIndex, sentenceIndex]);

  useEffect(() => {
    if (crossfading || !currentSlide) {
      return;
    }

    const line = currentSlide.sentences[sentenceIndex] ?? "";
    const spokenLine = line.trim();
    const totalDelay = readingPauseMsForSentence(line);
    const fadeDurationMs = Math.min(
      460,
      Math.max(260, Math.round(totalDelay * 0.24)),
    );
    const holdDurationMs = Math.max(80, totalDelay - fadeDurationMs);

    captionOpacity.stopAnimation();
    captionOpacity.setValue(1);

    let disposed = false;
    let holdTimer: ReturnType<typeof setTimeout> | null = null;
    let fadeStarted = false;

    const startFade = (delayMs: number) => {
      if (disposed || fadeStarted) {
        return;
      }

      fadeStarted = true;
      holdTimer = setTimeout(() => {
        if (disposed) {
          return;
        }

        Animated.timing(captionOpacity, {
          toValue: 0,
          duration: fadeDurationMs,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) {
            advance();
          }
        });
      }, delayMs);
    };

    const runDefaultTiming = () => {
      startFade(holdDurationMs);
    };

    if (!spokenLine || speechUnavailable.current) {
      runDefaultTiming();
    } else {
      void (async () => {
        try {
          await Speech.stop();
          const voice = await resolveNarrationVoice();

          if (disposed) {
            return;
          }

          Speech.speak(spokenLine, {
            voice,
            rate: 0.93,
            pitch: 1.0,
            onDone: () => startFade(0),
            onStopped: () => startFade(0),
            onError: () => {
              speechUnavailable.current = true;
              runDefaultTiming();
            },
          });

          // Safety fallback in case the underlying TTS engine never calls completion callbacks.
          holdTimer = setTimeout(() => {
            startFade(0);
          }, Math.max(holdDurationMs, spokenLine.length * 60));
        } catch {
          speechUnavailable.current = true;
          runDefaultTiming();
        }
      })();
    }

    return () => {
      disposed = true;
      if (holdTimer != null) {
        clearTimeout(holdTimer);
      }
      captionOpacity.stopAnimation();
      if (!speechUnavailable.current) {
        void Speech.stop();
      }
    };
  }, [
    slideIndex,
    sentenceIndex,
    crossfading,
    advance,
    currentSlide,
    captionOpacity,
    resolveNarrationVoice,
  ]);

  return (
    <Pressable style={styles.slideshowPressable} onPress={advance}>
      <View style={styles.slideshowInner}>
        <CrossfadeImage
          source={currentSlide?.image ?? slidesData[0]?.image}
          onTransitionEnd={() => setCrossfading(false)}
          style={styles.imageStack}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      </View>

      <View
        style={[
          styles.textOverlay,
          {
            paddingBottom: 16 + insets.bottom,
            paddingLeft: 20 + insets.left,
            paddingRight: 20 + insets.right,
          },
        ]}
        pointerEvents="none"
      >
        <View style={styles.captionColumn}>
          <Animated.View style={{ opacity: captionOpacity }}>
            <CaptionText fontSize={20}>
              {currentSlide?.sentences[sentenceIndex] ?? ""}
            </CaptionText>
          </Animated.View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slideshowPressable: {
    flex: 1,
  },
  slideshowInner: {
    flex: 1,
    backgroundColor: "#000000",
  },
  imageStack: {
    flex: 1,
    backgroundColor: "#000000",
  },
  textOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    maxWidth: "100%",
    backgroundColor: "transparent",
  },
  captionColumn: {
    width: "100%",
    alignItems: "stretch",
    justifyContent: "flex-end",
  },
});
