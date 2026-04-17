import { useCallback, useEffect, useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";

import {
  estimateMaxCharsForTwoLines,
  expandPlaceholders,
  readingPauseMsForSentence,
  splitForReadableLines,
} from "@/features/kau-cim/story-experience/constants";

import { CrossfadeImage } from "@/components/image/CrossfadeImage";
import { ScrollText } from "../typography/ScrollText";

interface Properties {
  slides: Kaucim.Slide[];
  onEnded?: () => void;
}

export function StoryTeller(properties: Properties) {
  const { slides } = properties;

  const insets = useSafeAreaInsets();
  const windows = useWindowDimensions();

  const [slideIndex, setSlideIndex] = useState(0);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [crossfading, setCrossfading] = useState(false);

  const maxChunkChars = useMemo(
    () => estimateMaxCharsForTwoLines(windows.width, insets.left, insets.right),
    [windows.width, insets.left, insets.right],
  );

  const slidesData = useMemo(
    () =>
      slides.map((slide) => ({
        image: slide.image,
        sentences: splitForReadableLines(
          expandPlaceholders(slide.text, slide.textParams),
          maxChunkChars,
        ),
      })),
    [slides, maxChunkChars],
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
    const delay = readingPauseMsForSentence(line);
    const handle = setTimeout(advance, delay);

    return () => clearTimeout(handle);
  }, [slideIndex, sentenceIndex, crossfading, advance, currentSlide]);

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
          <ScrollText
            key={slideIndex}
            texts={currentSlide?.sentences ?? []}
            scrollIndex={sentenceIndex}
          />
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
