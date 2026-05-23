import { useNavigation } from "expo-router";
import * as Speech from "expo-speech";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type * as Types from "./type";

import {
  Animated,
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";

import { StoryResult } from "@/components/slide-show/StoryResult";
import { StoryTeller } from "@/components/slide-show/StoryTeller";
import { CaptionText } from "@/components/typography/CaptionText";
import { NormalVideo } from "@/components/video/NormalVideo";
import { useAppAppearance } from "@/contexts/AppAppearanceContext";
import { useNarrationVoice } from "@/hooks/useNarrationVoice";
import {
  delayUntilMinSpeechElapsed,
  estimateSpeechDurationMs,
  NARRATION_SPEECH_RATE,
  SPEECH_SAFETY_BUFFER_MS,
} from "@/lib/speech/speechTiming";

import {
  expandPlaceholders,
  FLASH_BEFORE_END_SEC,
  prefetchImageModule,
  VERDICT_SUBTITLE_FADE_DURATION_MS,
  VERDICT_SUBTITLE_FADE_IN_AFTER_SEC,
} from "./constants";

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
  const navigation = useNavigation();
  const allowNavigationExitRef = useRef(false);
  const { locale } = useAppAppearance();

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
  const resolveNarrationVoice = useNarrationVoice(locale);

  const dismissAndExit = useCallback(() => {
    allowNavigationExitRef.current = true;
    onResultDismiss();
  }, [onResultDismiss]);

  const handleSkip = useCallback(() => {
    if (showResultPopup) {
      setPhase("result");
      return;
    }
    dismissAndExit();
  }, [dismissAndExit, showResultPopup]);

  const handleBackExit = useCallback(() => {
    dismissAndExit();
  }, [dismissAndExit]);

  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: phase === "result",
    });
  }, [navigation, phase]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (phase === "result") {
          handleBackExit();
        } else {
          handleSkip();
        }
        return true;
      },
    );

    return () => subscription.remove();
  }, [handleBackExit, handleSkip, phase]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (event) => {
      if (allowNavigationExitRef.current) {
        return;
      }

      event.preventDefault();

      if (phase === "result") {
        handleBackExit();
      } else {
        handleSkip();
      }
    });

    return unsubscribe;
  }, [handleBackExit, handleSkip, navigation, phase]);

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
      const minSpeechMs = estimateSpeechDurationMs(spokenVerdict, locale);
      const speechStartedAt = Date.now();
      let verdictCompletionScheduled = false;
      let verdictSafetyTimer: ReturnType<typeof setTimeout> | null = null;

      const clearVerdictSafetyTimer = () => {
        if (verdictSafetyTimer != null) {
          clearTimeout(verdictSafetyTimer);
          verdictSafetyTimer = null;
        }
      };

      const finishVerdictSpeech = () => {
        if (verdictCompletionScheduled) {
          return;
        }

        verdictCompletionScheduled = true;
        clearVerdictSafetyTimer();
        void (async () => {
          await delayUntilMinSpeechElapsed(
            spokenVerdict,
            locale,
            speechStartedAt,
          );
          verdictSpeechDone.current = true;
          verdictHidden.current = true;
          verdictOpacity.stopAnimation();
          Animated.timing(verdictOpacity, {
            toValue: 0,
            duration: VERDICT_SUBTITLE_FADE_DURATION_MS,
            useNativeDriver: true,
          }).start();
          proceedToSlideshowWhenReady();
        })();
      };

      Speech.speak(spokenVerdict, {
        voice,
        rate: NARRATION_SPEECH_RATE,
        pitch: 1.0,
        onDone: finishVerdictSpeech,
        onError: () => {
          clearVerdictSafetyTimer();
          speechUnavailable.current = true;
          verdictSpeechDone.current = true;
          verdictHidden.current = true;
          verdictOpacity.stopAnimation();
          verdictOpacity.setValue(0);
          proceedToSlideshowWhenReady();
        },
      });

      verdictSafetyTimer = setTimeout(
        finishVerdictSpeech,
        minSpeechMs + SPEECH_SAFETY_BUFFER_MS,
      );
      verdictSpoken.current = true;
    } catch {
      speechUnavailable.current = true;
      verdictSpeechDone.current = true;
      verdictHidden.current = true;
      verdictOpacity.stopAnimation();
      verdictOpacity.setValue(0);
      proceedToSlideshowWhenReady();
    }
  }, [locale, proceedToSlideshowWhenReady, resolveNarrationVoice, verdict]);

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
          resolveNarrationVoice={resolveNarrationVoice}
          onEnded={() => {
            if (showResultPopup) {
              setPhase("result");
              return;
            }
            dismissAndExit();
          }}
        />
      )}
      {showResultPopup && phase === "result" && imagesReady && lastSlide && (
        <StoryResult
          summary={{
            ...summary,
            ...lastSlide,
          }}
          onDismiss={dismissAndExit}
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
          onPress={handleSkip}
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
