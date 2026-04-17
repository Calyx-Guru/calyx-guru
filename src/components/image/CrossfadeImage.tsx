import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  ImageProps,
  ImageSourcePropType,
  StyleSheet,
  View,
} from "react-native";

interface CrossfadeImageProps extends Omit<ImageProps, "source"> {
  source: ImageSourcePropType;
  duration?: number;
  onTransitionEnd?: () => void;
}

export function CrossfadeImage({
  source,
  duration = 2000,
  onTransitionEnd,
  style,
  ...rest
}: CrossfadeImageProps) {
  const [sources, setSources] = useState([{ key: String(Date.now()), source }]);
  const currentSource = sources[sources.length - 1].source;

  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (source !== currentSource) {
      fadeAnim.setValue(0);
      setSources((prev) => {
        const newKey = String(Date.now() + Math.random());
        return [...prev, { key: newKey, source }].slice(-2);
      });

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setSources((prev) => [prev[prev.length - 1]]);
          onTransitionEnd?.();
        }
      });
    }
  }, [source, currentSource, duration, fadeAnim, onTransitionEnd]);

  const previousOpacity = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  return (
    <View style={[styles.container, style]}>
      {sources.map((item, index) => {
        const isLast = index === sources.length - 1;
        let opacity: any = 1;

        if (sources.length > 1) {
          opacity = isLast ? fadeAnim : previousOpacity;
        }

        return (
          <Animated.Image
            key={item.key}
            source={item.source}
            style={[StyleSheet.absoluteFill, styles.image, { opacity }]}
            {...rest}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
