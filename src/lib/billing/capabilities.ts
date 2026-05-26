import { isRunningInExpoGo } from "expo";
import { Platform } from "react-native";

/** IAP requires a dev build or standalone app — not Expo Go or web. */
export function isBillingAvailable(): boolean {
  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    return false;
  }

  if (isRunningInExpoGo()) {
    return false;
  }

  return true;
}
