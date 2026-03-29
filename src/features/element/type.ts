import type { ImageSourcePropType } from "react-native";

export interface Element {
  key: "water" | "fire" | "metal" | "earth" | "wood";
  label: string;
  source: ImageSourcePropType;
  chinese: string;
  color: string;
  description: string;
  positionStyleKey:
    | "elementTop"
    | "elementLeft"
    | "elementRight"
    | "elementBottomLeft"
    | "elementBottomRight";
}
