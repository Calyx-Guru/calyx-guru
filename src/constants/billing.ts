/**
 * Store product identifiers — add SKUs here when products exist in App Store Connect
 * and Google Play Console. Must match the store exactly.
 */
export const BILLING_IN_APP_PRODUCT_IDS = [] as const;

export const BILLING_SUBSCRIPTION_PRODUCT_IDS = [] as const;

export type BillingInAppProductId =
  (typeof BILLING_IN_APP_PRODUCT_IDS)[number];

export type BillingSubscriptionProductId =
  (typeof BILLING_SUBSCRIPTION_PRODUCT_IDS)[number];

export type BillingProductId =
  | BillingInAppProductId
  | BillingSubscriptionProductId;

export const BILLING_ALL_PRODUCT_IDS: readonly string[] = [
  ...BILLING_IN_APP_PRODUCT_IDS,
  ...BILLING_SUBSCRIPTION_PRODUCT_IDS,
];

export function isBillingSubscriptionProductId(
  productId: string,
): productId is BillingSubscriptionProductId {
  return (BILLING_SUBSCRIPTION_PRODUCT_IDS as readonly string[]).includes(
    productId,
  );
}

export function getBillingProductType(
  productId: string,
): "in-app" | "subs" | null {
  if (
    (BILLING_IN_APP_PRODUCT_IDS as readonly string[]).includes(productId)
  ) {
    return "in-app";
  }
  if (
    (BILLING_SUBSCRIPTION_PRODUCT_IDS as readonly string[]).includes(productId)
  ) {
    return "subs";
  }
  return null;
}
