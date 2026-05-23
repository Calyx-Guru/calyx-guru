import { useMemo } from "react";
import {
  Image,
  ImageProps,
  ImageSourcePropType,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

interface ThreePartSliceImageProps extends Omit<
  ImageProps,
  "source" | "style"
> {
  leftSource: ImageSourcePropType;
  centerSource: ImageSourcePropType;
  rightSource: ImageSourcePropType;
  leftStretchSource: ImageSourcePropType;
  rightStretchSource: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
}

function resolveAspectRatio(source: ImageSourcePropType): number {
  if (
    typeof source === "object" &&
    source !== null &&
    "width" in source &&
    "height" in source &&
    typeof source.width === "number" &&
    typeof source.height === "number" &&
    source.height > 0
  ) {
    return source.width / source.height;
  }

  const resolved = Image.resolveAssetSource(source);
  if (resolved?.width && resolved?.height) {
    return resolved.width / resolved.height;
  }

  return 1;
}

export function ThreePartSliceImage({
  leftSource,
  centerSource,
  rightSource,
  leftStretchSource,
  rightStretchSource,
  style,
  ...imageProps
}: ThreePartSliceImageProps) {
  const leftAspect = useMemo(
    () => resolveAspectRatio(leftSource),
    [leftSource],
  );
  const centerAspect = useMemo(
    () => resolveAspectRatio(centerSource),
    [centerSource],
  );
  const rightAspect = useMemo(
    () => resolveAspectRatio(rightSource),
    [rightSource],
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        <View style={[styles.capSlot, { aspectRatio: leftAspect }]}>
          <Image
            source={leftSource}
            style={styles.capImage}
            resizeMode="stretch"
            {...imageProps}
          />
        </View>
        <Image
          source={leftStretchSource}
          style={styles.stretch}
          resizeMode="stretch"
          {...imageProps}
        />
        <View style={[styles.capSlot, { aspectRatio: centerAspect }]}>
          <Image
            source={centerSource}
            style={styles.capImage}
            resizeMode="stretch"
            {...imageProps}
          />
        </View>
        <Image
          source={rightStretchSource}
          style={styles.stretch}
          resizeMode="stretch"
          {...imageProps}
        />
        <View style={[styles.capSlot, { aspectRatio: rightAspect }]}>
          <Image
            source={rightSource}
            style={styles.capImage}
            resizeMode="contain"
            {...imageProps}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    width: "100%",
    height: "100%",
  },
  capSlot: {
    height: "100%",
    flexShrink: 0,
  },
  capImage: {
    width: "100%",
    height: "100%",
  },
  stretch: {
    flex: 1,
    height: "100%",
    minWidth: 0,
  },
});
