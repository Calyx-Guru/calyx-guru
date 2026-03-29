import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import type { ImageSourcePropType } from "react-native";

export type DateEvent = DateTimePickerEvent;

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

export interface Properties {
  dateLabel: string;
}
