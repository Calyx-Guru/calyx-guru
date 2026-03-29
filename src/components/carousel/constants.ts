import type { ScaledSize } from "react-native";
import { Dimensions, Platform } from "react-native";

export const HEADER_HEIGHT = 100;
export const MAX_WIDTH = 430;

export const ElementsText = {
  AUTOPLAY: "AutoPlay",
};

export const window: ScaledSize =
  Platform.OS === "web"
    ? {
        width: MAX_WIDTH,
        height: 800,
        scale: 1,
        fontScale: 1,
      }
    : Dimensions.get("screen");

export const PAGE_WIDTH = window.width;
