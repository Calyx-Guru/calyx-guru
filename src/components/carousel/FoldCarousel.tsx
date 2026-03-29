import { Image, StyleSheet, View } from "react-native";
import { Extrapolation, interpolate } from "react-native-reanimated";

import CarouselComponent from "react-native-reanimated-carousel";

import type { ImageSourcePropType, StyleProp, ViewStyle } from "react-native";
import type { TAnimationStyle } from "react-native-reanimated-carousel";

import { PAGE_WIDTH } from "./constants";

interface AnimationProperties {
  sideItemCount?: number;
}

const createFoldAnimation = (properties: AnimationProperties) => {
  const { sideItemCount = 3 } = properties;

  const itemSize = PAGE_WIDTH / 2;
  const centerOffset = PAGE_WIDTH / 2 - itemSize / 2;
  const sideItemWidth = (PAGE_WIDTH - itemSize) / (2 * sideItemCount);

  return (value: number) => {
    "worklet";

    const itemOffsetInput = new Array(sideItemCount * 2 + 1)
      .fill(null)
      .map((_, index) => index - sideItemCount);

    const itemOffset = interpolate(
      value,
      itemOffsetInput,
      itemOffsetInput.map((item) => {
        if (item < 0) {
          return (-itemSize + sideItemWidth) * Math.abs(item);
        }
        if (item > 0) {
          return (itemSize - sideItemWidth) * (Math.abs(item) - 1);
        }
        return 0;
      }) as number[],
    );

    const translate =
      interpolate(value, [-1, 0, 1], [-itemSize, 0, itemSize]) +
      centerOffset -
      itemOffset;

    const width = interpolate(
      value,
      [-1, 0, 1],
      [sideItemWidth, itemSize, sideItemWidth],
      Extrapolation.CLAMP,
    );

    return {
      transform: [
        {
          translateX: translate,
        },
      ],
      width,
      overflow: "hidden",
    } as TAnimationStyle;
  };
};

interface Slide {
  source: ImageSourcePropType;
}

interface Properties extends AnimationProperties {
  slides: Slide[];
  style?: StyleProp<ViewStyle>;
  onSnapToItem?: (index: number) => void;
  onScrollStart?: () => void;
  onScrollEnd?: (index: number) => void;
  renderItem?: (slide: Slide, index: number) => React.ReactElement;
}

interface Item {
  index: number;
}

export function CarouselFold(properties: Properties) {
  const { slides, sideItemCount, style } = properties;

  const animationStyle = createFoldAnimation({
    sideItemCount,
  });

  const renderItem = (slide: Item) => {
    if (properties.renderItem) {
      return properties.renderItem(slides[slide.index], slide.index);
    }

    return (
      <View style={styles.imageWrapper}>
        <Image
          source={slides[slide.index].source}
          style={{ width: "100%", height: "100%" }}
        />
      </View>
    );
  };

  return (
    <View
      style={[
        {
          width: PAGE_WIDTH,
          height: PAGE_WIDTH / 2,
        },
        style,
      ]}
    >
      <CarouselComponent
        loop
        width={PAGE_WIDTH}
        height={PAGE_WIDTH / 2}
        data={slides}
        scrollAnimationDuration={1500}
        autoPlayInterval={1200}
        renderItem={renderItem}
        customAnimation={animationStyle}
        onSnapToItem={properties.onSnapToItem}
        onScrollStart={properties.onScrollStart}
        onScrollEnd={properties.onScrollEnd}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  imageWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    overflow: "hidden",
  },
});
