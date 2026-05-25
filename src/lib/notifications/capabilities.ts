import { Platform } from "react-native";

export function isPushNotificationAvailable(): boolean {
  return Platform.OS === "ios" || Platform.OS === "android";
}
