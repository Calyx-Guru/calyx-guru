import { framePrimary } from "@/assets/images/typography";
import { NormalVideo } from "@/components/video/NormalVideo";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental != null
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FLASH_BEFORE_END_SEC = 0.38;
const CROSSFADE_MS = 480;
const TEXT_FADE_IN_MS = 420;
const CAPTION_LINE_PUSH_IN_MS = 320;
/** Previous line exits while current flies up and crossfades to muted (same window). */
const SENTENCE_LINE_PROMOTE_MS = 440;
const FLY_UP_PX = 28;

/** Pause before auto-advancing; scales with sentence length. */
const READ_DELAY_BASE_MS = 550;
const READ_MS_PER_CHAR = 38;
const READ_DELAY_MIN_MS = 1200;
const READ_DELAY_MAX_MS = 9500;

function readingPauseMsForSentence(text: string): number {
  const length = text.length;
  return Math.round(
    Math.min(
      READ_DELAY_MAX_MS,
      Math.max(READ_DELAY_MIN_MS, READ_DELAY_BASE_MS + length * READ_MS_PER_CHAR),
    ),
  );
}

/** Small, light offsets so the stacked outline reads as a soft halo, not a hard stroke. */
const OUTLINE_OFFSET_PX = 1;
const OUTLINE_DIRECTIONS: [number, number][] = [
  [0, OUTLINE_OFFSET_PX],
  [0, -OUTLINE_OFFSET_PX],
  [OUTLINE_OFFSET_PX, 0],
  [-OUTLINE_OFFSET_PX, 0],
  [OUTLINE_OFFSET_PX, OUTLINE_OFFSET_PX],
  [-OUTLINE_OFFSET_PX, OUTLINE_OFFSET_PX],
  [OUTLINE_OFFSET_PX, -OUTLINE_OFFSET_PX],
  [-OUTLINE_OFFSET_PX, -OUTLINE_OFFSET_PX],
];

export type KaucimStorySlide = {
  image: ImageModule;
  text: string;
  textParams?: Record<string, string | number> | null;
};

export type KaucimResultSummary = {
  storyTitle: string;
  powerChange: number;
  /** Last slide body copy with placeholders (e.g. `{bonus}`) already expanded. */
  lastSlideFullText: string;
};

function formatPowerChangeLine(change: number): string {
  if (change > 0) {
    return `Power +${change}`;
  }
  if (change < 0) {
    return `Power ${change}`;
  }
  return "Power unchanged";
}

function KaucimResultPopupOverlay(properties: {
  summary: KaucimResultSummary;
  onDismiss: () => void;
  safeBottom: number;
  frameMaxWidth: number;
}) {
  const { summary, onDismiss, safeBottom, frameMaxWidth } = properties;
  return (
    <Pressable
      style={[styles.resultOverlayRoot, { paddingBottom: 12 + safeBottom }]}
      onPress={onDismiss}
      accessibilityRole="button"
      accessibilityLabel="Dismiss result and continue"
    >
      <Pressable onPress={onDismiss} style={styles.resultFrameTouchable}>
        <ImageBackground
          source={framePrimary}
          style={[styles.resultFrame, { width: frameMaxWidth }]}
          resizeMode="stretch"
        >
          <View style={styles.resultFrameInner}>
            <Text style={styles.resultTitle} numberOfLines={3}>
              {summary.storyTitle}
            </Text>
            <View style={styles.resultLastSlideBody}>
              <Text style={styles.resultLastSlideText}>
                {summary.lastSlideFullText}
              </Text>
            </View>
            <Text style={styles.resultPowerLine}>
              {formatPowerChangeLine(summary.powerChange)}
            </Text>
            <Text style={styles.resultHint}>Tap to continue</Text>
          </View>
        </ImageBackground>
      </Pressable>
    </Pressable>
  );
}

/**
 * Expands `{name}` placeholders (e.g. `{bonus}`) before sentence splitting.
 * When `params` is null/undefined, returns `text` unchanged.
 * Skips keys whose value is null or undefined so placeholders stay in the string.
 */
export function expandPlaceholdersBeforeSplit(
  text: string,
  params: Record<string, string | number> | null | undefined,
): string {
  if (params == null) {
    return text;
  }
  return Object.entries(params).reduce((accumulator, [key, value]) => {
    if (value == null) {
      return accumulator;
    }
    return accumulator.replaceAll(`{${key}}`, String(value));
  }, text);
}

function splitOnSentencePunctuation(body: string): string[] {
  const normalized = body.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return [];
  }
  const endChars = new Set([".", "!", "?", "。", "！", "？"]);
  const sentences: string[] = [];
  let buffer = "";
  for (const character of normalized) {
    buffer += character;
    if (endChars.has(character)) {
      const sentence = buffer.trim();
      if (sentence) {
        sentences.push(sentence);
      }
      buffer = "";
    }
  }
  const rest = buffer.trim();
  if (rest) {
    sentences.push(rest);
  }
  return sentences.length > 0 ? sentences : [normalized];
}

/** ~avg glyph width for Latin at `fontSize` (600 weight); CJK tends wider — budget stays conservative. */
const CAPTION_FONT_SIZE = 20;
const CAPTION_HORIZONTAL_PADDING = 40;

function estimateMaxCharsForTwoLines(
  windowWidth: number,
  insetLeft: number,
  insetRight: number,
): number {
  const usable = Math.max(
    100,
    windowWidth - CAPTION_HORIZONTAL_PADDING - insetLeft - insetRight,
  );
  const avgCharPx = CAPTION_FONT_SIZE * 0.52;
  const charsPerLine = Math.max(12, Math.floor(usable / avgCharPx));
  return Math.max(32, Math.min(charsPerLine * 2, 112));
}

function findLengthSplitIndex(text: string, maxLen: number): number {
  const minBreak = Math.max(6, Math.floor(maxLen * 0.32));
  const end = Math.min(maxLen, text.length - 1);
  if (end < minBreak) {
    return Math.min(maxLen, text.length);
  }
  for (let index = end; index >= minBreak; index--) {
    const character = text[index];
    if (/[，。；：、]/.test(character)) {
      return index + 1;
    }
  }
  for (let index = end; index >= minBreak; index--) {
    if (text[index] === " ") {
      const previous = text[index - 1];
      if (previous && /[,.;:!?…]/.test(previous)) {
        return index + 1;
      }
    }
  }
  const lastSpace = text.lastIndexOf(" ", maxLen);
  if (lastSpace >= minBreak) {
    return lastSpace + 1;
  }
  return maxLen;
}

function splitPhraseToMaxLength(text: string, maxLen: number): string[] {
  const trimmed = text.trim();
  if (!trimmed) {
    return [];
  }
  if (maxLen < 16) {
    return [trimmed];
  }
  if (trimmed.length <= maxLen) {
    return [trimmed];
  }
  const splitIndex = findLengthSplitIndex(trimmed, maxLen);
  const head = trimmed.slice(0, splitIndex).trim();
  const tail = trimmed.slice(splitIndex).trim();
  if (!tail) {
    return [head];
  }
  if (!head) {
    return splitPhraseToMaxLength(tail, maxLen);
  }
  return [head, ...splitPhraseToMaxLength(tail, maxLen)];
}

function splitForReadableLines(body: string, maxChunkChars: number): string[] {
  return splitOnSentencePunctuation(body).flatMap((phrase) =>
    splitPhraseToMaxLength(phrase, maxChunkChars),
  );
}

function prefetchImageModule(source: ImageModule): Promise<boolean> {
  const resolved = Image.resolveAssetSource(source);
  const uri = resolved?.uri;
  if (!uri) {
    return Promise.resolve(true);
  }
  return Image.prefetch(uri);
}

function CaptionText(properties: { children: string }) {
  const { children } = properties;
  return (
    <View style={styles.captionStack}>
      <View style={styles.captionOutlineHost} pointerEvents="none">
        {OUTLINE_DIRECTIONS.map(([translateX, translateY], index) => (
          <Text
            key={index}
            style={[
              styles.captionOutline,
              {
                transform: [{ translateX }, { translateY }],
              },
            ]}
          >
            {children}
          </Text>
        ))}
      </View>
      <Text style={styles.captionFill} accessibilityRole="text">
        {children}
      </Text>
    </View>
  );
}

type Phase = "video" | "slideshow";

type SentenceLineTransition = {
  oldPrevious: string | null;
  promoting: string;
};

type Properties = {
  video: string | number;
  slides: KaucimStorySlide[];
  resultSummary: KaucimResultSummary;
  onResultDismiss: () => void;
};

export function KaucimStoryExperience(properties: Properties) {
  const { video, slides: slideInputs, resultSummary, onResultDismiss } =
    properties;
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  const maxChunkChars = useMemo(
    () => estimateMaxCharsForTwoLines(windowWidth, insets.left, insets.right),
    [windowWidth, insets.left, insets.right],
  );

  const slidesData = useMemo(
    () =>
      slideInputs.map((slide) => ({
        image: slide.image,
        sentences: splitForReadableLines(
          expandPlaceholdersBeforeSplit(slide.text, slide.textParams),
          maxChunkChars,
        ),
      })),
    [slideInputs, maxChunkChars],
  );

  const [phase, setPhase] = useState<Phase>("video");
  const [slideIndex, setSlideIndex] = useState(0);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [crossfading, setCrossfading] = useState(false);
  const [imagesReady, setImagesReady] = useState(false);
  const [resultPopupVisible, setResultPopupVisible] = useState(false);
  const [sentenceLineTransition, setSentenceLineTransition] =
    useState<SentenceLineTransition | null>(null);

  const [displayedSource, setDisplayedSource] = useState<ImageModule>(
    () => slideInputs[0]!.image,
  );
  const [incomingSource, setIncomingSource] = useState<ImageModule | null>(
    null,
  );

  const endFlashOpacity = useRef(new Animated.Value(0)).current;
  const flashStartedReference = useRef(false);
  const incomingOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const captionEnterTranslate = useRef(new Animated.Value(0)).current;
  const pendingSlideshowAfterPreloadReference = useRef(false);
  const lineOutgoingY = useRef(new Animated.Value(0)).current;
  const lineOutgoingOpacity = useRef(new Animated.Value(1)).current;
  const linePromoteY = useRef(new Animated.Value(0)).current;
  const linePromoteWhiteOpacity = useRef(new Animated.Value(1)).current;
  const linePromoteMutedOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;
    const uniqueSources = [...new Set(slideInputs.map((slide) => slide.image))];
    void Promise.all(uniqueSources.map((source) => prefetchImageModule(source)))
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) {
          setImagesReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slideInputs]);

  useEffect(() => {
    if (!imagesReady || !pendingSlideshowAfterPreloadReference.current) {
      return;
    }
    pendingSlideshowAfterPreloadReference.current = false;
    setPhase("slideshow");
  }, [imagesReady]);

  const advance = useCallback(() => {
    if (
      phase !== "slideshow" ||
      crossfading ||
      resultPopupVisible ||
      sentenceLineTransition != null
    ) {
      return;
    }
    const slide = slidesData[slideIndex];
    if (!slide) {
      return;
    }
    if (sentenceIndex < slide.sentences.length - 1) {
      const promoting = slide.sentences[sentenceIndex] ?? "";
      const oldPreviousRaw =
        sentenceIndex > 0 ? slide.sentences[sentenceIndex - 1] ?? "" : "";
      const oldPrevious =
        oldPreviousRaw.length > 0 ? oldPreviousRaw : null;
      setSentenceLineTransition({ oldPrevious, promoting });
      return;
    }
    if (slideIndex >= slidesData.length - 1) {
      const lastSentenceIndex = Math.max(0, slide.sentences.length - 1);
      if (sentenceIndex >= lastSentenceIndex) {
        setResultPopupVisible(true);
      }
      return;
    }
    const nextIndex = slideIndex + 1;
    const nextImage = slidesData[nextIndex]?.image;
    if (!nextImage) {
      return;
    }
    setCrossfading(true);
    setIncomingSource(nextImage);
    incomingOpacity.setValue(0);
    Animated.timing(incomingOpacity, {
      toValue: 1,
      duration: CROSSFADE_MS,
      useNativeDriver: true,
    }).start(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setDisplayedSource(nextImage);
      setIncomingSource(null);
      incomingOpacity.setValue(0);
      setSlideIndex(nextIndex);
      setSentenceIndex(0);
      setCrossfading(false);
    });
  }, [
    phase,
    crossfading,
    slidesData,
    slideIndex,
    sentenceIndex,
    incomingOpacity,
    resultPopupVisible,
    sentenceLineTransition,
  ]);

  useEffect(() => {
    setSentenceLineTransition(null);
    lineOutgoingY.setValue(0);
    lineOutgoingOpacity.setValue(1);
    linePromoteY.setValue(0);
    linePromoteWhiteOpacity.setValue(1);
    linePromoteMutedOpacity.setValue(0);
  }, [slideIndex]);

  useEffect(() => {
    if (!sentenceLineTransition) {
      return;
    }
    const { oldPrevious } = sentenceLineTransition;
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
    } as const;

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
      setSentenceLineTransition(null);
      setSentenceIndex((index) => index + 1);
    });

    return () => {
      cancelled = true;
      parallel.stop();
    };
  }, [
    sentenceLineTransition,
    lineOutgoingY,
    lineOutgoingOpacity,
    linePromoteY,
    linePromoteWhiteOpacity,
    linePromoteMutedOpacity,
  ]);

  const currentSlide = slidesData[slideIndex];
  const currentSentence =
    currentSlide && !crossfading ? currentSlide.sentences[sentenceIndex] ?? "" : "";
  const previousSentence =
    currentSlide && !crossfading && sentenceIndex > 0
      ? (currentSlide.sentences[sentenceIndex - 1] ?? "")
      : "";

  useEffect(() => {
    if (
      phase !== "slideshow" ||
      crossfading ||
      !currentSlide ||
      resultPopupVisible ||
      sentenceLineTransition != null
    ) {
      return;
    }
    const line = currentSlide.sentences[sentenceIndex] ?? "";
    const delay = readingPauseMsForSentence(line);
    const handle = setTimeout(advance, delay);
    return () => clearTimeout(handle);
  }, [
    phase,
    slideIndex,
    sentenceIndex,
    crossfading,
    advance,
    currentSlide,
    resultPopupVisible,
    sentenceLineTransition,
  ]);

  useEffect(() => {
    if (
      phase !== "slideshow" ||
      crossfading ||
      resultPopupVisible ||
      sentenceLineTransition != null
    ) {
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
    phase,
    slideIndex,
    sentenceIndex,
    crossfading,
    textOpacity,
    captionEnterTranslate,
    resultPopupVisible,
    sentenceLineTransition,
  ]);

  const resultFrameMaxWidth = Math.min(windowWidth * 0.88, 380);

  const finishVideoAndMaybeShowSlideshow = useCallback(() => {
    if (imagesReady) {
      setPhase("slideshow");
    } else {
      pendingSlideshowAfterPreloadReference.current = true;
    }
  }, [imagesReady]);

  const skipToResult = useCallback(() => {
    if (resultPopupVisible) {
      return;
    }
    const lastIdx = slidesData.length - 1;
    if (lastIdx < 0) {
      return;
    }
    const lastSlide = slidesData[lastIdx];
    if (!lastSlide) {
      return;
    }
    setSentenceLineTransition(null);
    setPhase("slideshow");
    setSlideIndex(lastIdx);
    setSentenceIndex(Math.max(0, lastSlide.sentences.length - 1));
    setDisplayedSource(lastSlide.image);
    setCrossfading(false);
    setIncomingSource(null);
    incomingOpacity.setValue(0);
    setResultPopupVisible(true);
  }, [resultPopupVisible, slidesData, incomingOpacity]);

  const showSlideshowLayer =
    phase === "slideshow" && (imagesReady || resultPopupVisible);
  const showSkipControl =
    !resultPopupVisible && (phase === "video" || phase === "slideshow");

  return (
    <View style={styles.root}>
      {phase === "video" ? (
        <View style={styles.videoShell}>
          <NormalVideo
            url={video}
            loop={false}
            muted={false}
            contentFit="contain"
            timeUpdateEventIntervalSec={0.08}
            onTimeUpdate={(currentTime, duration) => {
              if (flashStartedReference.current) {
                return;
              }
              if (!(duration > 0)) {
                return;
              }
              const remaining = duration - currentTime;
              if (remaining > FLASH_BEFORE_END_SEC || remaining <= 0) {
                return;
              }
              flashStartedReference.current = true;
              endFlashOpacity.setValue(0);
              Animated.timing(endFlashOpacity, {
                toValue: 1,
                duration: Math.max(remaining * 1000, 80),
                useNativeDriver: true,
              }).start();
            }}
            onPlayToEnd={finishVideoAndMaybeShowSlideshow}
          />
          <Animated.View
            pointerEvents="none"
            style={[styles.flashOverlay, { opacity: endFlashOpacity }]}
          />
        </View>
      ) : null}

      {showSlideshowLayer ? (
        <View style={styles.slideshowWrap}>
          <Pressable
            style={styles.slideshowPressable}
            onPress={advance}
            disabled={resultPopupVisible || sentenceLineTransition != null}
          >
            <View style={styles.slideshowInner}>
              <View style={styles.imageStack}>
                <Image
                  source={displayedSource}
                  style={styles.slideImage}
                  resizeMode="cover"
                  accessibilityIgnoresInvertColors
                />
                {incomingSource ? (
                  <Animated.View
                    style={[styles.incomingImageWrap, { opacity: incomingOpacity }]}
                  >
                    <Image
                      source={incomingSource}
                      style={styles.slideImage}
                      resizeMode="cover"
                      accessibilityIgnoresInvertColors
                    />
                  </Animated.View>
                ) : null}
              </View>

              {!resultPopupVisible ? (
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
                    {sentenceLineTransition ? (
                      <View style={styles.sentenceTransitionBlock}>
                        {sentenceLineTransition.oldPrevious ? (
                          <Animated.View
                            style={{
                              marginBottom: 10,
                              opacity: lineOutgoingOpacity,
                              transform: [{ translateY: lineOutgoingY }],
                            }}
                          >
                            <Text style={styles.historyCaptionMuted}>
                              {sentenceLineTransition.oldPrevious}
                            </Text>
                          </Animated.View>
                        ) : null}
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
                              {sentenceLineTransition.promoting}
                            </Animated.Text>
                            <Animated.View
                              style={[
                                styles.promotingWhiteLayer,
                                { opacity: linePromoteWhiteOpacity },
                              ]}
                              pointerEvents="none"
                            >
                              <CaptionText>
                                {sentenceLineTransition.promoting}
                              </CaptionText>
                            </Animated.View>
                          </View>
                        </Animated.View>
                      </View>
                    ) : (
                      <>
                        {sentenceIndex > 0 ? (
                          <View style={styles.previousLineSlot}>
                            <Text style={styles.historyCaptionMuted}>
                              {previousSentence}
                            </Text>
                          </View>
                        ) : null}
                        <Animated.View
                          style={{
                            opacity: textOpacity,
                            transform: [{ translateY: captionEnterTranslate }],
                          }}
                        >
                          <CaptionText>{currentSentence}</CaptionText>
                        </Animated.View>
                      </>
                    )}
                  </View>
                </View>
              ) : null}
            </View>
          </Pressable>
          {resultPopupVisible ? (
            <KaucimResultPopupOverlay
              summary={resultSummary}
              onDismiss={onResultDismiss}
              safeBottom={insets.bottom}
              frameMaxWidth={resultFrameMaxWidth}
            />
          ) : null}
        </View>
      ) : null}

      {showSkipControl ? (
        <Pressable
          style={[
            styles.skipButton,
            {
              top: insets.top + 8,
              right: Math.max(insets.right, 12),
            },
          ]}
          onPress={skipToResult}
          accessibilityRole="button"
          accessibilityLabel="Skip to result"
        >
          <Text style={styles.skipButtonLabel}>Skip</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
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
  videoShell: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#ffffff",
  },
  slideshowWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  slideshowPressable: {
    flex: 1,
  },
  resultOverlayRoot: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 20,
  },
  resultFrameTouchable: {
    maxWidth: "100%",
    alignItems: "center",
  },
  resultFrame: {
    maxWidth: "100%",
    overflow: "hidden",
  },
  resultFrameInner: {
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 20,
    width: "100%",
  },
  resultLastSlideBody: {
    width: "100%",
    marginBottom: 10,
    paddingVertical: 4,
  },
  resultLastSlideText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  resultTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
    textShadowColor: "rgba(0,0,0,0.42)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 11,
  },
  resultPowerLine: {
    color: "#f3f3f3",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 14,
    textShadowColor: "rgba(0,0,0,0.38)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  resultHint: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.28)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  slideshowInner: {
    flex: 1,
    backgroundColor: "#000000",
  },
  imageStack: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
  },
  slideImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  incomingImageWrap: {
    ...StyleSheet.absoluteFillObject,
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
    ...StyleSheet.absoluteFillObject,
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
  captionStack: {
    position: "relative",
    alignSelf: "stretch",
    width: "100%",
  },
  captionOutlineHost: {
    ...StyleSheet.absoluteFillObject,
  },
  captionOutline: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    color: "rgba(0,0,0,0.4)",
    fontSize: CAPTION_FONT_SIZE,
    lineHeight: 30,
    fontWeight: "600",
    textAlign: "center",
  },
  captionFill: {
    color: "#ffffff",
    fontSize: CAPTION_FONT_SIZE,
    lineHeight: 30,
    fontWeight: "600",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.38)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 12,
  },
});
