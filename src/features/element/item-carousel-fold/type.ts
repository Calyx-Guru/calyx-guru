import type { StyleProp, ViewStyle } from "react-native";
export type { Element } from "../type";

export interface Properties {
  style?: StyleProp<ViewStyle>;
  onSelectElement?: (element: ElementName) => void;
}
