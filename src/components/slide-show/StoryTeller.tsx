import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import {
  estimateMaxCharsForTwoLines,
  expandPlaceholders,
  readingPauseMsForSentence,
  splitForReadableLines,
} from "@/features/kau-cim/story-experience/constants";

import { CrossfadeImage } from "@/components/image/CrossfadeImage";
import { CaptionText } from "@/components/typography/CaptionText";

const SENTENCE_LINE_PROMOTE_MS = 440;
const FLY_UP_PX = 28;

const TEXT_FADE_IN_MS = 420;
const CAPTION_LINE_PUSH_IN_MS = 320;

interface Properties {
  slides: Kaucim.Slide[];
  onEnded?: () => void;
}

type Sentence = {
  oldPrevious: string | null;
  promoting: string;
};

export function StoryTeller(properties: Properties) {
  const { slides } = properties;

  const insets = useSafeAreaInsets();
  const windows = useWindowDimensions();

  const lineOutgoingOpacity = useRef(new Animated.Value(1)).current;
  const lineOutgoingY = useRef(new Animated.Value(0)).current;
  const linePromoteY = useRef(new Animated.Value(0)).current;
  const linePromoteWhiteOpacity = useRef(new Animated.Value(1)).current;
  const linePromoteMutedOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const captionEnterTranslate = useRef(new Animated.Value(0)).current;

  const [sentence, setSentence] = useState<Sentence | null>(null);
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
  const currentSentence =
    currentSlide && !crossfading
      ? (currentSlide.sentences[sentenceIndex] ?? "")
      : "";
  const previousSentence =
    currentSlide && !crossfading && sentenceIndex > 0
      ? (currentSlide.sentences[sentenceIndex - 1] ?? "")
      : "";

  const advance = useCallback(() => {
    if (crossfading || sentence != null) {
      return;
    }

    const slide = slidesData[slideIndex];

    if (!slide) {
      return;
    }

    if (sentenceIndex < slide.sentences.length - 1) {
      const promoting = slide.sentences[sentenceIndex] ?? "";
      const oldPreviousRaw =
        sentenceIndex > 0 ? (slide.sentences[sentenceIndex - 1] ?? "") : "";
      const oldPrevious = oldPreviousRaw.length > 0 ? oldPreviousRaw : null;

      setSentence({
        oldPrevious,
        promoting,
      });
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
  }, [crossfading, slidesData, slideIndex, sentenceIndex, sentence]);

  useEffect(() => {
    setSentence(null);

    lineOutgoingY.setValue(0);
    lineOutgoingOpacity.setValue(1);
    linePromoteY.setValue(0);
    linePromoteWhiteOpacity.setValue(1);
    linePromoteMutedOpacity.setValue(0);
  }, [slideIndex]);

  useEffect(() => {
    if (!sentence) {
      return;
    }

    const { oldPrevious } = sentence;
    const hasOutgoing = oldPrevious != null && oldPrevious.length > 0;

    lineOutgoingY.setValue(0);
    lineOutgoingOpacity.setValue(1);
    linePromoteY.setValue(0);
    linePromoteWhiteOpacity.setValue(1);
    linePromoteMutedOpacity.setValue(0);

    let cancelled = false;
    const timingConfig = {
      duration: SENTENCE_LINE_PROMOTE_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    };

    const animations: Animated.CompositeAnimation[] = [
      Animated.timing(linePromoteY, {
        ...timingConfig,
        toValue: -FLY_UP_PX,
      }),
      Animated.timing(linePromoteWhiteOpacity, {
        ...timingConfig,
        toValue: 0,
      }),
      Animated.timing(linePromoteMutedOpacity, {
        ...timingConfig,
        toValue: 1,
      }),
    ];

    if (hasOutgoing) {
      animations.push(
        Animated.timing(lineOutgoingY, {
          ...timingConfig,
          toValue: -FLY_UP_PX,
        }),
        Animated.timing(lineOutgoingOpacity, {
          ...timingConfig,
          toValue: 0,
        }),
      );
    }

    const parallel = Animated.parallel(animations);
    parallel.start(({ finished }) => {
      if (!finished || cancelled) {
        return;
      }
      setSentence(null);
      setSentenceIndex((index) => index + 1);
    });

    return () => {
      cancelled = true;
      parallel.stop();
    };
  }, [
    sentence,
    lineOutgoingY,
    lineOutgoingOpacity,
    linePromoteY,
    linePromoteWhiteOpacity,
    linePromoteMutedOpacity,
  ]);

  useEffect(() => {
    if (crossfading || !currentSlide || sentence != null) {
      return;
    }

    const line = currentSlide.sentences[sentenceIndex] ?? "";
    const delay = readingPauseMsForSentence(line);
    const handle = setTimeout(advance, delay);

    return () => clearTimeout(handle);
  }, [slideIndex, sentenceIndex, crossfading, advance, currentSlide, sentence]);

  useEffect(() => {
    if (crossfading || sentence != null) {
      return;
    }

    textOpacity.setValue(0);
    captionEnterTranslate.setValue(14);

    const animation = Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: TEXT_FADE_IN_MS,
        useNativeDriver: true,
      }),
      Animated.timing(captionEnterTranslate, {
        toValue: 0,
        duration: CAPTION_LINE_PUSH_IN_MS,
        useNativeDriver: true,
      }),
    ]);

    animation.start();
    return () => animation.stop();
  }, [
    slideIndex,
    sentenceIndex,
    crossfading,
    textOpacity,
    captionEnterTranslate,
    sentence,
  ]);

  return (
    <Pressable
      style={styles.slideshowPressable}
      onPress={advance}
      disabled={sentence != null}
    >
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
          {sentence ? (
            <View style={styles.sentenceTransitionBlock}>
              {sentence.oldPrevious && (
                <Animated.View
                  style={{
                    marginBottom: 10,
                    opacity: lineOutgoingOpacity,
                    transform: [{ translateY: lineOutgoingY }],
                  }}
                >
                  <Text style={styles.historyCaptionMuted}>
                    {sentence.oldPrevious}
                  </Text>
                </Animated.View>
              )}
              <Animated.View
                style={{
                  transform: [{ translateY: linePromoteY }],
                }}
              >
                <View style={styles.promotingLineSlot}>
                  <Animated.Text
                    style={[
                      styles.historyCaptionMuted,
                      { opacity: linePromoteMutedOpacity },
                    ]}
                  >
                    {sentence.promoting}
                  </Animated.Text>
                  <Animated.View
                    style={[
                      styles.promotingWhiteLayer,
                      { opacity: linePromoteWhiteOpacity },
                    ]}
                    pointerEvents="none"
                  >
                    <CaptionText fontSize={20}>
                      {sentence.promoting}
                    </CaptionText>
                  </Animated.View>
                </View>
              </Animated.View>
            </View>
          ) : (
            <>
              {sentenceIndex > 0 && (
                <View style={styles.previousLineSlot}>
                  <Text style={styles.historyCaptionMuted}>
                    {previousSentence}
                  </Text>
                </View>
              )}
              <Animated.View
                style={{
                  opacity: textOpacity,
                  transform: [{ translateY: captionEnterTranslate }],
                }}
              >
                <CaptionText fontSize={20}>{currentSentence}</CaptionText>
              </Animated.View>
            </>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slideshowWrap: {
    //
  },
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
  sentenceTransitionBlock: {
    width: "100%",
  },
  previousLineSlot: {
    position: "relative",
    width: "100%",
    marginBottom: 10,
  },
  promotingLineSlot: {
    position: "relative",
    width: "100%",
  },
  promotingWhiteLayer: {
    //
  },
  historyCaptionMuted: {
    color: "rgba(118, 118, 125, 0.95)",
    fontSize: 17,
    lineHeight: 26,
    fontWeight: "500",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 9,
  },
});
