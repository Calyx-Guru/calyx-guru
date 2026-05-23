import { StyleProp, ViewStyle } from "react-native";

export interface Properties {
  barHeight?: number;
  totalValue?: number;
  value?: number;
  change?: number;
  colors?: string[];
  style?: StyleProp<ViewStyle>;
}
