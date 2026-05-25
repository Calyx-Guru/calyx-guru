import { isRunningInExpoGo } from "expo";
import { Platform } from "react-native";

export function isPushNotificationAvailable(): boolean {
  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    return false;
  }

  // Remote and local notifications are unavailable in Expo Go on Android (SDK 53+).
  if (Platform.OS === "android" && isRunningInExpoGo()) {
    return false;
  }

  return true;
}
