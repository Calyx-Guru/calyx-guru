import type { ImageSourcePropType } from "react-native";

export interface Element {
  key: "water" | "fire" | "metal" | "earth" | "wood";
  label: string;
  source: ImageSourcePropType;
  positionStyleKey:
    | "elementTop"
    | "elementLeft"
    | "elementRight"
    | "elementBottomLeft"
    | "elementBottomRight";
}
