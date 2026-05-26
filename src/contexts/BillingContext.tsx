import {
  BILLING_ALL_PRODUCT_IDS,
  BILLING_IN_APP_PRODUCT_IDS,
  BILLING_SUBSCRIPTION_PRODUCT_IDS,
} from "@/constants/billing";
import { buildPurchaseRequest } from "@/lib/billing/purchase";
import { isBillingAvailable } from "@/lib/billing/capabilities";
import type {
  ActiveSubscription,
  BillingConnectionStatus,
  BillingPurchaseHandlers,
  Product,
  ProductSubscription,
  Purchase,
} from "@/types/Billing";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type BillingContextValue = {
  isAvailable: boolean;
  connectionStatus: BillingConnectionStatus;
  isConnected: boolean;
  isReady: boolean;
  hasCatalog: boolean;
  products: Product[];
  subscriptions: ProductSubscription[];
  activeSubscriptions: ActiveSubscription[];
  availablePurchases: Purchase[];
  isPurchasing: boolean;
  isRestoring: boolean;
  lastError: string | null;
  refreshCatalog: () => Promise<void>;
  restorePurchases: () => Promise<void>;
  purchaseProduct: (productId: string) => Promise<void>;
  finishPurchase: (
    purchase: Purchase,
    options?: { isConsumable?: boolean },
  ) => Promise<void>;
  reconnect: () => Promise<boolean>;
};

const noopAsync = async () => {};

const disabledValue: BillingContextValue = {
  isAvailable: false,
  connectionStatus: "unavailable",
  isConnected: false,
  isReady: false,
  hasCatalog: false,
  products: [],
  subscriptions: [],
  activeSubscriptions: [],
  availablePurchases: [],
  isPurchasing: false,
  isRestoring: false,
  lastError: null,
  refreshCatalog: noopAsync,
  restorePurchases: noopAsync,
  purchaseProduct: async () => {
    throw new Error("In-app billing is not available on this platform.");
  },
  finishPurchase: noopAsync,
  reconnect: async () => false,
};

export const BillingContext =
  createContext<BillingContextValue>(disabledValue);

type BillingProviderProps = BillingPurchaseHandlers & {
  children: ReactNode;
};

export function BillingProvider({
  children,
  onPurchaseSuccess,
  onPurchaseError,
}: BillingProviderProps) {
  const isAvailable = isBillingAvailable();

  if (!isAvailable) {
    return (
      <BillingContext.Provider value={disabledValue}>
        {children}
      </BillingContext.Provider>
    );
  }

  return (
    <BillingProviderNative
      onPurchaseSuccess={onPurchaseSuccess}
      onPurchaseError={onPurchaseError}
    >
      {children}
    </BillingProviderNative>
  );
}

function BillingProviderNative({
  children,
  onPurchaseSuccess,
  onPurchaseError,
}: BillingProviderProps) {
  const { useIAP } =
    require("expo-iap") as typeof import("expo-iap");

  const purchaseHandlersRef = useRef<BillingPurchaseHandlers>({
    onPurchaseSuccess,
    onPurchaseError,
  });

  useEffect(() => {
    purchaseHandlersRef.current = { onPurchaseSuccess, onPurchaseError };
  }, [onPurchaseError, onPurchaseSuccess]);

  const [lastError, setLastError] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [catalogLoaded, setCatalogLoaded] = useState(false);

  const hasCatalog = BILLING_ALL_PRODUCT_IDS.length > 0;

  const {
    connected,
    products,
    subscriptions,
    activeSubscriptions,
    availablePurchases,
    fetchProducts,
    requestPurchase,
    finishTransaction,
    restorePurchases: iapRestorePurchases,
    getAvailablePurchases,
    getActiveSubscriptions,
    reconnect,
  } = useIAP({
    onPurchaseSuccess: (purchase) => {
      setIsPurchasing(false);
      setLastError(null);
      purchaseHandlersRef.current.onPurchaseSuccess?.(purchase);
    },
    onPurchaseError: (error) => {
      setIsPurchasing(false);
      const message = error.message ?? "Purchase failed";
      setLastError(message);
      purchaseHandlersRef.current.onPurchaseError?.(error);
    },
    onError: (error) => {
      setLastError(error.message);
    },
  });

  const connectionStatus: BillingConnectionStatus = connected
    ? "connected"
    : catalogLoaded
      ? "disconnected"
      : "connecting";

  const refreshCatalog = useCallback(async () => {
    if (!connected || !hasCatalog) {
      setCatalogLoaded(true);
      return;
    }

    try {
      setLastError(null);
      if (BILLING_IN_APP_PRODUCT_IDS.length > 0) {
        await fetchProducts({
          skus: [...BILLING_IN_APP_PRODUCT_IDS],
          type: "in-app",
        });
      }
      if (BILLING_SUBSCRIPTION_PRODUCT_IDS.length > 0) {
        await fetchProducts({
          skus: [...BILLING_SUBSCRIPTION_PRODUCT_IDS],
          type: "subs",
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load products";
      setLastError(message);
    } finally {
      setCatalogLoaded(true);
    }
  }, [connected, fetchProducts, hasCatalog]);

  useEffect(() => {
    if (!connected) {
      return;
    }

    void refreshCatalog();

    if (BILLING_SUBSCRIPTION_PRODUCT_IDS.length > 0) {
      void getActiveSubscriptions([...BILLING_SUBSCRIPTION_PRODUCT_IDS]);
    }
  }, [connected, getActiveSubscriptions, refreshCatalog]);

  const purchaseProduct = useCallback(
    async (productId: string) => {
      if (!connected) {
        throw new Error("Billing store is not connected.");
      }

      if (!hasCatalog) {
        throw new Error(
          "No billing products are configured yet. Add product IDs in src/constants/billing.ts.",
        );
      }

      setIsPurchasing(true);
      setLastError(null);

      try {
        await requestPurchase(buildPurchaseRequest(productId));
      } catch (error) {
        setIsPurchasing(false);
        const message =
          error instanceof Error ? error.message : "Purchase failed";
        setLastError(message);
        throw error;
      }
    },
    [connected, hasCatalog, requestPurchase],
  );

  const finishPurchase = useCallback(
    async (purchase: Purchase, options?: { isConsumable?: boolean }) => {
      await finishTransaction({
        purchase,
        isConsumable: options?.isConsumable ?? false,
      });
    },
    [finishTransaction],
  );

  const restorePurchases = useCallback(async () => {
    if (!connected) {
      throw new Error("Billing store is not connected.");
    }

    setIsRestoring(true);
    setLastError(null);

    try {
      await iapRestorePurchases();
      await getAvailablePurchases();
      if (BILLING_SUBSCRIPTION_PRODUCT_IDS.length > 0) {
        await getActiveSubscriptions([...BILLING_SUBSCRIPTION_PRODUCT_IDS]);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Restore failed";
      setLastError(message);
      throw error;
    } finally {
      setIsRestoring(false);
    }
  }, [
    connected,
    getActiveSubscriptions,
    getAvailablePurchases,
    iapRestorePurchases,
  ]);

  const isReady = connected && (!hasCatalog || catalogLoaded);

  const value = useMemo<BillingContextValue>(
    () => ({
      isAvailable: true,
      connectionStatus,
      isConnected: connected,
      isReady,
      hasCatalog,
      products,
      subscriptions,
      activeSubscriptions,
      availablePurchases,
      isPurchasing,
      isRestoring,
      lastError,
      refreshCatalog,
      restorePurchases,
      purchaseProduct,
      finishPurchase,
      reconnect,
    }),
    [
      activeSubscriptions,
      availablePurchases,
      catalogLoaded,
      connected,
      connectionStatus,
      finishPurchase,
      hasCatalog,
      isPurchasing,
      isReady,
      isRestoring,
      lastError,
      products,
      purchaseProduct,
      reconnect,
      refreshCatalog,
      restorePurchases,
      subscriptions,
    ],
  );

  return (
    <BillingContext.Provider value={value}>{children}</BillingContext.Provider>
  );
}
