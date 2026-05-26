export type {
  ActiveSubscription,
  Product,
  ProductSubscription,
  Purchase,
} from "expo-iap";

export type BillingConnectionStatus =
  | "unavailable"
  | "disconnected"
  | "connecting"
  | "connected";

export type BillingPurchaseHandlers = {
  onPurchaseSuccess?: (purchase: import("expo-iap").Purchase) => void;
  onPurchaseError?: (error: Error) => void;
};
