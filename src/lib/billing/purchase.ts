import { getBillingProductType } from "@/constants/billing";
import type { MutationRequestPurchaseArgs } from "expo-iap";

export function buildPurchaseRequest(
  productId: string,
): MutationRequestPurchaseArgs {
  const type = getBillingProductType(productId);
  if (!type) {
    throw new Error(
      `Unknown billing product "${productId}". Add it to BILLING_IN_APP_PRODUCT_IDS or BILLING_SUBSCRIPTION_PRODUCT_IDS.`,
    );
  }

  return {
    type,
    request: {
      apple: { sku: productId },
      google: { skus: [productId] },
    },
  };
}
