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
    const totalDelay = readingPauseMsForSentence(line);
    const fadeDurationMs = Math.min(460, Math.max(260, Math.round(totalDelay * 0.24)));
    const holdDurationMs = Math.max(80, totalDelay - fadeDurationMs);

    captionOpacity.stopAnimation();
    captionOpacity.setValue(1);

    const holdTimer = setTimeout(() => {
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
    }, holdDurationMs);

    return () => {
      clearTimeout(holdTimer);
      captionOpacity.stopAnimation();
    };
  }, [slideIndex, sentenceIndex, crossfading, advance, currentSlide, captionOpacity]);

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
