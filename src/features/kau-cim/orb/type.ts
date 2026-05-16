import { KAUCIM_CONCERNS } from "@/types/UserState";
import { StyleProp, ViewStyle } from "react-native";

export interface Properties {
  style?: StyleProp<ViewStyle>;
  onAction: (concern: KAUCIM_CONCERNS) => void;
  onMenuOpenChange?: (open: boolean) => void;
}
