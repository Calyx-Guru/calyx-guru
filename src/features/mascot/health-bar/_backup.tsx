import { ImageBackground, StyleSheet } from "react-native";

import { healthBar, healthBarGold } from "@/assets/images/mascot";
import { useMemo } from "react";
import type * as Types from "./type";

export const HealthBar = (properties: Types.Properties) => {
  const { totalValue = 100, value = 100, colors = ["red"], style } = properties;

  const bars = useMemo(() => {
    const currentValue = Math.max(0, Math.min(value, totalValue));

    const valuePerBar = totalValue / colors.length;
    const index = Math.floor(currentValue / valuePerBar);

    const color = colors[Math.max(0, Math.min(index, colors.length - 1))];
    let barValue = currentValue % valuePerBar;

    if (barValue === 0 && currentValue !== 0) {
      barValue = valuePerBar;
    }

    return {
      color,
      value: (barValue / valuePerBar) * 100,
    };
  }, [totalValue]);

  return (
    <ImageBackground
      source={healthBar}
      style={[styles.root, style]}
      resizeMode="cover"
    >
      <ImageBackground
        source={healthBarGold}
        style={[
          {
            width: `${bars.value}%`,
            height: "100%",
            aspectRatio: "60/5",
          },
        ]}
        resizeMode="cover"
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  root: {
    width: "100%",
    aspectRatio: "60/5",
    // backgroundColor: "#rgba(0, 0, 0, 0.25)",
    // borderStyle: "solid",
    // borderWidth: 1,
    // borderColor: "rgba(255, 255, 255, 1)",
    overflow: "hidden",
  },
});
