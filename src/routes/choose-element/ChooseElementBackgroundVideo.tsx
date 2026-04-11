import { NormalVideo } from "@/components/video/NormalVideo";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { VIDEOS } from "./constants";

/** When this much playback remains on the break clip, ramp the white flash up quickly. */
const BREAK_NEAR_END_SECONDS = 0.32;
const QUICK_FLASH_MS = 150;
const SLOW_FADE_OUT_MS = 1000;
const ELEMENT_END_FLASH_MS = 180;
const ELEMENT_END_FLASH_HOLD_MS = 120;

interface ChooseElementBackgroundVideoProps {
  isIdle: boolean;
  element: ElementName | null;
  onHatchingEnd: () => void;
}

export function ChooseElementBackgroundVideo(
  properties: ChooseElementBackgroundVideoProps,
) {
  const { isIdle, element, onHatchingEnd } = properties;
  const [isHatching, setIsHatching] = useState(true);

  const flashOpacity = useRef(new Animated.Value(0)).current;
  const breakNearEndDone = useRef(false);

  useEffect(() => {
    if (!isIdle && isHatching) {
      breakNearEndDone.current = false;
      flashOpacity.setValue(0);
    }
  }, [element, flashOpacity, isHatching, isIdle]);

  function handleBreakTimeUpdate(currentTime: number, duration: number) {
    if (breakNearEndDone.current) {
      return;
    }
    if (!Number.isFinite(duration) || duration <= 0) {
      return;
    }
    if (duration - currentTime > BREAK_NEAR_END_SECONDS) {
      return;
    }
    breakNearEndDone.current = true;
    Animated.timing(flashOpacity, {
      toValue: 1,
      duration: QUICK_FLASH_MS,
      useNativeDriver: true,
    }).start();
  }

  function handleBreakEnded() {
    if (!breakNearEndDone.current) {
      breakNearEndDone.current = true;
      flashOpacity.setValue(1);
    }
    setIsHatching(false);
    Animated.timing(flashOpacity, {
      toValue: 0,
      duration: SLOW_FADE_OUT_MS,
      useNativeDriver: true,
    }).start();
  }

  function handleElementalEnded() {
    Animated.sequence([
      Animated.timing(flashOpacity, {
        toValue: 1,
        duration: ELEMENT_END_FLASH_MS,
        useNativeDriver: true,
      }),
      Animated.delay(ELEMENT_END_FLASH_HOLD_MS),
    ]).start((state) => {
      if (state.finished) {
        onHatchingEnd();
      }
    });
  }

  return (
    <View style={styles.container}>
      {isIdle && <NormalVideo url={VIDEOS.hatching.idle} />}
      {!isIdle && isHatching && (
        <NormalVideo
          url={VIDEOS.hatching.break}
          loop={false}
          onTimeUpdate={handleBreakTimeUpdate}
          onPlayToEnd={handleBreakEnded}
        />
      )}
      {!isIdle && !isHatching && element && (
        <NormalVideo
          url={VIDEOS.hatching[element]}
          loop={false}
          onPlayToEnd={handleElementalEnded}
        />
      )}
      {!isIdle && (
        <Animated.View
          pointerEvents="none"
          style={[styles.flashOverlay, { opacity: flashOpacity }]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#ffffff",
  },
});
