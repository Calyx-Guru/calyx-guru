import { BillingContext } from "@/contexts/BillingContext";
import { getBillingProductType } from "@/constants/billing";
import type { Product, ProductSubscription } from "@/types/Billing";
import { useContext, useMemo } from "react";

export function useBilling() {
  return useContext(BillingContext);
}

export function useBillingProduct(
  productId: string | undefined,
): Product | ProductSubscription | null {
  const { products, subscriptions } = useBilling();

  return useMemo(() => {
    if (!productId) {
      return null;
    }

    return (
      products.find((product) => product.id === productId) ??
      subscriptions.find((subscription) => subscription.id === productId) ??
      null
    );
  }, [productId, products, subscriptions]);
}

export function useIsProductOwned(productId: string | undefined): boolean {
  const { availablePurchases, activeSubscriptions, isConnected } = useBilling();

  return useMemo(() => {
    if (!productId || !isConnected) {
      return false;
    }

    const type = getBillingProductType(productId);
    if (type === "subs") {
      return activeSubscriptions.some(
        (subscription) => subscription.productId === productId,
      );
    }

    return availablePurchases.some(
      (purchase) => purchase.productId === productId,
    );
  }, [activeSubscriptions, availablePurchases, isConnected, productId]);
}

export function useBillingActions() {
  const {
    purchaseProduct,
    finishPurchase,
    restorePurchases,
    refreshCatalog,
    reconnect,
    isPurchasing,
    isRestoring,
    isConnected,
    isReady,
    lastError,
  } = useBilling();

  return {
    purchaseProduct,
    finishPurchase,
    restorePurchases,
    refreshCatalog,
    reconnect,
    isPurchasing,
    isRestoring,
    isConnected,
    isReady,
    lastError,
  };
}
