import * as React from "react";
import { Dimensions, Text, View } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { Extrapolation, interpolate } from "react-native-reanimated";
import Carousel, { TAnimationStyle } from "react-native-reanimated-carousel";

const PAGE_WIDTH = Dimensions.get("window").width;

function Index() {
  const itemSize = PAGE_WIDTH / 2;
  const centerOffset = PAGE_WIDTH / 2 - itemSize / 2;

  const dataLength = 10;
  const dummyData = Array.from({ length: dataLength }, (_, i) => ({ id: i }));

  const sideItemCount = 3;
  const sideItemWidth = (PAGE_WIDTH - itemSize) / (2 * sideItemCount);

  const animationStyle: TAnimationStyle = React.useCallback(
    (value: number) => {
      "worklet";

      const itemOffsetInput = new Array(sideItemCount * 2 + 1)
        .fill(null)
        .map((_, index) => index - sideItemCount);

      const itemOffset = interpolate(
        value,
        // e.g. [0,1,2,3,4,5,6] -> [-3,-2,-1,0,1,2,3]
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
      };
    },
    [centerOffset, itemSize, sideItemWidth, sideItemCount],
  );

  return (
    <View
      style={{
        width: PAGE_WIDTH,
        height: PAGE_WIDTH / 2,
        backgroundColor: "black",
      }}
    >
      <Carousel
        loop
        width={PAGE_WIDTH}
        style={{
          width: PAGE_WIDTH,
          height: PAGE_WIDTH / 2,
          backgroundColor: "black",
        }}
        windowSize={Math.round(dataLength / 2)}
        scrollAnimationDuration={1500}
        autoPlayInterval={1200}
        data={dummyData}
        renderItem={({ item, index }) => <Item index={index} key={index} />}
        customAnimation={animationStyle}
        containerStyle={{
          width: PAGE_WIDTH,
          height: PAGE_WIDTH / 2,
        }}
      />
    </View>
  );
}

const Item: React.FC<{
  index: number;
}> = ({ index }) => {
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        console.log(index);
      }}
      containerStyle={{ flex: 1 }}
      style={{ flex: 1 }}
    >
      <View
        style={{
          backgroundColor: "white",
          flex: 1,
          justifyContent: "center",
          overflow: "hidden",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "101%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 18 }}>{`Item ${index}`}</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Index;
