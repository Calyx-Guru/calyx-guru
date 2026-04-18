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
  const { video, verdict, slides, summary, onResultDismiss } = properties;

  const insets = useSafeAreaInsets();

  const [phase, setPhase] = useState<Types.Phase>("video");
  const [imagesReady, setImagesReady] = useState(false);

  const pendingAfterPreload = useRef(false);
  const startedFlash = useRef(false);
  const endFlashOpacity = useRef(new Animated.Value(0)).current;

  const verdictOpacity = useRef(new Animated.Value(0)).current;
  const verdictFadeInStarted = useRef(false);
  const verdictFadeOutStarted = useRef(false);

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

  const onPlayToEnd = useCallback(() => {
    if (imagesReady) {
      setPhase("slideshow");
    } else {
      pendingAfterPreload.current = true;
    }
  }, [imagesReady]);

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

    if (remaining <= VERDICT_SUBTITLE_FADE_OUT_BEFORE_END_SEC) {
      if (!verdictFadeOutStarted.current) {
        verdictFadeOutStarted.current = true;
        verdictOpacity.stopAnimation();
        const fadeMs = Math.max(
          100,
          Math.min(
            VERDICT_SUBTITLE_FADE_DURATION_MS,
            Math.max(0, remaining) * 1000,
          ),
        );
        Animated.timing(verdictOpacity, {
          toValue: 0,
          duration: fadeMs,
          useNativeDriver: true,
        }).start();
      }
    } else if (currentTime >= VERDICT_SUBTITLE_FADE_IN_AFTER_SEC) {
      if (!verdictFadeInStarted.current && !verdictFadeOutStarted.current) {
        verdictFadeInStarted.current = true;
        verdictOpacity.stopAnimation();
        Animated.timing(verdictOpacity, {
          toValue: 1,
          duration: VERDICT_SUBTITLE_FADE_DURATION_MS,
          useNativeDriver: true,
        }).start();
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
      return;
    }

    verdictFadeInStarted.current = false;
    verdictFadeOutStarted.current = false;
    verdictOpacity.setValue(0);
  }, [phase, video, verdictOpacity]);

  return (
    <View style={styles.root}>
      {phase === "video" && (
        <View style={styles.videoShell}>
          <NormalVideo
            url={video}
            loop={false}
            muted={false}
            contentFit="contain"
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
        <StoryTeller slides={slides} onEnded={() => setPhase("result")} />
      )}
      {phase === "result" && imagesReady && lastSlide && (
        <StoryResult
          summary={{
            ...summary,
            ...lastSlide,
          }}
          onDismiss={onResultDismiss}
        />
      )}
      {phase !== "result" && (
        <Pressable
          style={[
            styles.skipButton,
            {
              top: insets.top + 8,
              right: Math.max(insets.right, 12),
            },
          ]}
          onPress={() => setPhase("result")}
          accessibilityRole="button"
          accessibilityLabel="Skip to result"
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
    backgroundColor: "#ffffff",
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
