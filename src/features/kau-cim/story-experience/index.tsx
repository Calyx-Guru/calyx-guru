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
} from "./constants";

import type * as Types from "./type";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental != null
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function KaucimStoryExperience(properties: Types.Properties) {
  const { video, slides, summary, onResultDismiss } = properties;

  const insets = useSafeAreaInsets();

  const [phase, setPhase] = useState<Types.Phase>("video");
  const [imagesReady, setImagesReady] = useState(false);

  const pendingAfterPreload = useRef(false);
  const startedFlash = useRef(false);
  const endFlashOpacity = useRef(new Animated.Value(0)).current;

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
    if (startedFlash.current) {
      return;
    }

    if (!(duration > 0)) {
      return;
    }

    const remaining = duration - currentTime;

    if (remaining > FLASH_BEFORE_END_SEC || remaining <= 0) {
      return;
    }

    startedFlash.current = true;
    endFlashOpacity.setValue(0);
    Animated.timing(endFlashOpacity, {
      toValue: 1,
      duration: Math.max(remaining * 1000, 80),
      useNativeDriver: true,
    }).start();
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
