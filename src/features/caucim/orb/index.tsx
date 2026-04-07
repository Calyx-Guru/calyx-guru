import { ImageBackground, StyleSheet } from "react-native";

import { caucimOrb } from "@/assets/images/caucim";
import type * as Types from "./type";

export function CaucimOrb(properties: Types.Properties) {
  const {} = properties;

  return (
    <ImageBackground
      source={caucimOrb}
      style={[styles.orbWrapper]}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  orbWrapper: {
    width: 100,
    aspectRatio: "1/1",
  },
});
