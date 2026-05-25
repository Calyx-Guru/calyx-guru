import {
  KaucimIllustrationCache,
  prefetchImageUri,
  resolveImageModule,
  type KaucimIllustrationCacheKey,
} from "@/lib/kaucim/illustrationCache";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

const EVICTION_INTERVAL_MS = 60_000;

export type KaucimIllustrationContextValue = {
  cache: KaucimIllustrationCache;
  ensureModule: (
    key: KaucimIllustrationCacheKey,
    loader: () => ImageModule,
  ) => Promise<ImageModule>;
  prefetchModule: (
    key: KaucimIllustrationCacheKey,
    loader: () => ImageModule,
  ) => void;
  getModule: (key: KaucimIllustrationCacheKey) => ImageModule | null;
  subscribeKey: (
    key: KaucimIllustrationCacheKey,
    listener: () => void,
  ) => () => void;
  prefetchImageModule: (source: ImageModule) => Promise<boolean>;
};

const KaucimIllustrationContext =
  createContext<KaucimIllustrationContextValue | null>(null);

export function KaucimIllustrationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const cacheRef = useRef(new KaucimIllustrationCache());
  const cache = cacheRef.current;

  useEffect(() => {
    const timer = setInterval(() => {
      cache.evictStale();
    }, EVICTION_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [cache]);

  const ensureModule = useCallback(
    (key: KaucimIllustrationCacheKey, loader: () => ImageModule) =>
      cache.ensureModule(key, loader),
    [cache],
  );

  const prefetchModule = useCallback(
    (key: KaucimIllustrationCacheKey, loader: () => ImageModule) => {
      void cache.ensureModule(key, loader);
    },
    [cache],
  );

  const getModule = useCallback(
    (key: KaucimIllustrationCacheKey) => cache.getModule(key),
    [cache],
  );

  const subscribeKey = useCallback(
    (key: KaucimIllustrationCacheKey, listener: () => void) =>
      cache.subscribeKey(key, listener),
    [cache],
  );

  const prefetchImageModule = useCallback(async (source: ImageModule) => {
    const { uri } = resolveImageModule(source);
    if (!uri) {
      return true;
    }
    return prefetchImageUri(uri);
  }, []);

  const value = useMemo<KaucimIllustrationContextValue>(
    () => ({
      cache,
      ensureModule,
      prefetchModule,
      getModule,
      subscribeKey,
      prefetchImageModule,
    }),
    [
      cache,
      ensureModule,
      getModule,
      prefetchImageModule,
      prefetchModule,
      subscribeKey,
    ],
  );

  return (
    <KaucimIllustrationContext.Provider value={value}>
      {children}
    </KaucimIllustrationContext.Provider>
  );
}

export function useKaucimIllustrationContext(): KaucimIllustrationContextValue {
  const context = useContext(KaucimIllustrationContext);
  if (!context) {
    throw new Error(
      "useKaucimIllustrationContext must be used within KaucimIllustrationProvider",
    );
  }
  return context;
}
