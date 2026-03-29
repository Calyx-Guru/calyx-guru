import type { ImageSourcePropType } from "react-native";

export type ElementName = "water" | "fire" | "metal" | "earth" | "wood";

export type Element = {
  key: "water" | "fire" | "metal" | "earth" | "wood";
  label: string;
  source: ImageSourcePropType;
  positionStyleKey:
    | "elementTop"
    | "elementLeft"
    | "elementRight"
    | "elementBottomLeft"
    | "elementBottomRight";
};
