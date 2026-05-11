import { getLocales } from "expo-localization";
import * as Speech from "expo-speech";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";

import { StoryResult } from "@/components/slide-show/StoryResult";
import { StoryTeller } from "@/components/slide-show/StoryTeller";
import { NormalVideo } from "@/components/video/NormalVideo";

import {
  expandPlaceholders,
  FLASH_BEFORE_END_SEC,
  prefetchImageModule,
  VERDICT_SUBTITLE_FADE_DURATION_MS,
  VERDICT_SUBTITLE_FADE_IN_AFTER_SEC,
  VERDICT_SUBTITLE_FADE_OUT_BEFORE_END_SEC,
} from "./constants";

import { CaptionText } from "@/components/typography/CaptionText";
import type * as Types from "./type";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental != null
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function KaucimStoryExperience(properties: Types.Properties) {
  const {
    video,
    verdict,
    slides,
    summary,
    showIntroVideo = true,
    showResultPopup = true,
    onResultDismiss,
  } = properties;

  const insets = useSafeAreaInsets();

  const [phase, setPhase] = useState<Types.Phase>(
    showIntroVideo ? "video" : "slideshow",
  );
  const showSkipButton =
    phase !== "result" &&
    (phase === "slideshow" || (showIntroVideo && phase === "video"));
  const [imagesReady, setImagesReady] = useState(false);

  const pendingAfterPreload = useRef(false);
  const startedFlash = useRef(false);
  const endFlashOpacity = useRef(new Animated.Value(0)).current;

  const verdictOpacity = useRef(new Animated.Value(0)).current;
  const verdictFadeInStarted = useRef(false);
  const verdictHidden = useRef(false);
  const verdictSpoken = useRef(false);
  const verdictSpeechDone = useRef(false);
  const videoEnded = useRef(false);
  const speechUnavailable = useRef(false);
  const narrationVoice = useRef<string | undefined>(undefined);

  const lastSlide = useMemo(() => {
    if (slides.length === 0) {
      return null;
    }

    const last = slides[slides.length - 1]!;

    return {
      image: last.image,
      description: expandPlaceholders(last.text, last.textParams ?? null),
    };
  }, [slides]);

  const proceedToSlideshowWhenReady = useCallback(() => {
    if (!videoEnded.current) {
      return;
    }

    // Wait for verdict speech only if it actually started.
    if (verdictSpoken.current && !verdictSpeechDone.current) {
      return;
    }

    if (imagesReady) {
      setPhase("slideshow");
    } else {
      pendingAfterPreload.current = true;
    }
  }, [imagesReady]);

  const onPlayToEnd = useCallback(() => {
    videoEnded.current = true;
    proceedToSlideshowWhenReady();
  }, [proceedToSlideshowWhenReady]);

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

    narrationVoice.current = scored[0]?.voice.identifier ?? "";
    return narrationVoice.current || undefined;
  }, []);

  const speakVerdict = useCallback(async () => {
    const spokenVerdict = verdict.trim();
    if (!spokenVerdict || verdictSpoken.current) {
      return;
    }

    if (speechUnavailable.current) {
      verdictSpeechDone.current = true;
      verdictHidden.current = true;
      verdictOpacity.stopAnimation();
      verdictOpacity.setValue(0);
      proceedToSlideshowWhenReady();
      return;
    }

    try {
      await Speech.stop();
      const voice = await resolveNarrationVoice();
      Speech.speak(spokenVerdict, {
        voice,
        rate: 0.93,
        pitch: 1.0,
        onDone: () => {
          verdictSpeechDone.current = true;
          verdictHidden.current = true;
          verdictOpacity.stopAnimation();
          Animated.timing(verdictOpacity, {
            toValue: 0,
            duration: VERDICT_SUBTITLE_FADE_DURATION_MS,
            useNativeDriver: true,
          }).start();
          proceedToSlideshowWhenReady();
        },
        onStopped: () => {
          verdictSpeechDone.current = true;
          verdictHidden.current = true;
          verdictOpacity.stopAnimation();
          Animated.timing(verdictOpacity, {
            toValue: 0,
            duration: VERDICT_SUBTITLE_FADE_DURATION_MS,
            useNativeDriver: true,
          }).start();
          proceedToSlideshowWhenReady();
        },
        onError: () => {
          speechUnavailable.current = true;
          verdictSpeechDone.current = true;
          verdictHidden.current = true;
          verdictOpacity.stopAnimation();
          verdictOpacity.setValue(0);
          proceedToSlideshowWhenReady();
        },
      });
      verdictSpoken.current = true;
    } catch {
      speechUnavailable.current = true;
      verdictSpeechDone.current = true;
      verdictHidden.current = true;
      verdictOpacity.stopAnimation();
      verdictOpacity.setValue(0);
      proceedToSlideshowWhenReady();
    }
  }, [proceedToSlideshowWhenReady, resolveNarrationVoice, verdict]);

  function onTimeUpdate(currentTime: number, duration: number) {
    if (!(duration > 0)) {
      return;
    }

    const remaining = duration - currentTime;

    if (
      !startedFlash.current &&
      remaining <= FLASH_BEFORE_END_SEC &&
      remaining > 0
    ) {
      startedFlash.current = true;
      endFlashOpacity.setValue(0);
      Animated.timing(endFlashOpacity, {
        toValue: 1,
        duration: Math.max(remaining * 1000, 80),
        useNativeDriver: true,
      }).start();
    }

    if (currentTime >= VERDICT_SUBTITLE_FADE_IN_AFTER_SEC) {
      if (!verdictFadeInStarted.current && !verdictHidden.current) {
        verdictFadeInStarted.current = true;
        verdictOpacity.stopAnimation();
        Animated.timing(verdictOpacity, {
          toValue: 1,
          duration: VERDICT_SUBTITLE_FADE_DURATION_MS,
          useNativeDriver: true,
        }).start();
        void speakVerdict();
      }
    }
  }

  useEffect(() => {
    let cancelled = false;
    const uniqueSources = [...new Set(slides.map((slide) => slide.image))];

    Promise.all(uniqueSources.map((source) => prefetchImageModule(source)))
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) {
          setImagesReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slides]);

  useEffect(() => {
    if (!imagesReady || !pendingAfterPreload.current) {
      return;
    }

    pendingAfterPreload.current = false;
    setPhase("slideshow");
  }, [imagesReady]);

  useEffect(() => {
    if (phase !== "video") {
      if (!speechUnavailable.current) {
        void Speech.stop();
      }
      return;
    }

    verdictFadeInStarted.current = false;
    verdictHidden.current = false;
    verdictSpoken.current = false;
    verdictSpeechDone.current = true;
    videoEnded.current = false;
    verdictOpacity.setValue(0);

    if (verdict.trim()) {
      verdictSpeechDone.current = false;
    }
  }, [phase, video, verdictOpacity]);

  useEffect(() => {
    return () => {
      if (!speechUnavailable.current) {
        void Speech.stop();
      }
    };
  }, []);

  return (
    <View style={styles.root}>
      {phase === "video" && (
        <View style={styles.videoShell}>
          <NormalVideo
            url={video}
            loop={false}
            muted={false}
            contentFit="cover"
            timeUpdateEventIntervalSec={0.08}
            onTimeUpdate={onTimeUpdate}
            onPlayToEnd={onPlayToEnd}
          />
          <Animated.View
            pointerEvents="none"
            style={[styles.flashOverlay, { opacity: endFlashOpacity }]}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.verdictSubtitleWrap,
              {
                opacity: verdictOpacity,
                paddingBottom: Math.max(insets.bottom, 12) + 12,
              },
            ]}
          >
            <CaptionText fontSize={16}>{verdict}</CaptionText>
          </Animated.View>
        </View>
      )}
      {phase === "slideshow" && imagesReady && (
        <StoryTeller
          slides={slides}
          onEnded={() => {
            if (showResultPopup) {
              setPhase("result");
              return;
            }
            onResultDismiss();
          }}
        />
      )}
      {showResultPopup && phase === "result" && imagesReady && lastSlide && (
        <StoryResult
          summary={{
            ...summary,
            ...lastSlide,
          }}
          onDismiss={onResultDismiss}
        />
      )}
      {showSkipButton && (
        <Pressable
          style={[
            styles.skipButton,
            {
              top: insets.top + 8,
              right: Math.max(insets.right, 12),
            },
          ]}
          onPress={() => {
            if (showResultPopup) {
              setPhase("result");
              return;
            }
            onResultDismiss();
          }}
          accessibilityRole="button"
          accessibilityLabel={
            showResultPopup ? "Skip to result" : "Back to collection"
          }
        >
          <Text style={styles.skipButtonLabel}>Skip</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },
  videoShell: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  flashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#000000",
  },
  verdictSubtitleWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  verdictSubtitlePill: {
    maxWidth: "100%",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.62)",
  },
  verdictSubtitleText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 22,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  skipButton: {
    position: "absolute",
    zIndex: 40,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 10,
  },
  skipButtonLabel: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
});
