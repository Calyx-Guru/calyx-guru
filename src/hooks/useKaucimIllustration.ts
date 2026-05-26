import { useKaucimIllustrationContext } from "@/contexts/KaucimIllustrationContext";
import type { CachedIllustration } from "@/lib/kaucim/illustrationCache";
import {
  getConcernIllustrations,
  selectOmenIllustration,
  selectStoryIllustrations,
  type SelectedStoryIllustrations,
  type StoryIllustrationSet,
} from "@/lib/kaucim/illustrations";
import type { KAUCIM_CONCERNS } from "@/types/UserState";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { toCachedIllustration } from "@/lib/kaucim/illustrationCache";

export type PreloadedStoryImages = {
  omen: ImageModule;
  action: ImageModule;
  conclude: ImageModule;
};

function setIllustrationIfChanged(
  setter: Dispatch<SetStateAction<CachedIllustration | null>>,
  next: CachedIllustration | null,
): void {
  setter((prev) => {
    if (
      prev?.cacheKey === next?.cacheKey &&
      prev?.module === next?.module &&
      prev?.expoSource.uri === next?.expoSource.uri
    ) {
      return prev;
    }
    return next;
  });
}

function moduleToIllustration(
  cacheKey: CachedIllustration["cacheKey"],
  module: ImageModule,
): CachedIllustration | null {
  return toCachedIllustration(cacheKey, module);
}

export function useKaucimOmenImageSource({
  concern,
  stickNumber,
  variantIndex = 0,
  enabled = true,
}: {
  concern: KAUCIM_CONCERNS;
  stickNumber: number;
  variantIndex?: number;
  enabled?: boolean;
}): {
  illustration: CachedIllustration | null;
  cacheKey: CachedIllustration["cacheKey"] | null;
  isReady: boolean;
} {
  const { ensureModule, getModule, subscribeKey } =
    useKaucimIllustrationContext();
  const activeCacheKeyRef = useRef<CachedIllustration["cacheKey"] | null>(null);
  const illustrations = getConcernIllustrations(concern);
  const pick = useMemo(() => {
    if (!illustrations || !enabled) {
      return null;
    }
    return selectOmenIllustration(
      concern,
      illustrations,
      stickNumber,
      variantIndex,
    );
  }, [concern, enabled, illustrations, stickNumber, variantIndex]);

  const [illustration, setIllustration] = useState<CachedIllustration | null>(
    null,
  );

  const syncFromCache = useCallback(
    (cacheKey: CachedIllustration["cacheKey"]) => {
      if (activeCacheKeyRef.current !== cacheKey) {
        return;
      }
      const module = getModule(cacheKey);
      if (!module) {
        return;
      }
      const cached = moduleToIllustration(cacheKey, module);
      if (cached) {
        setIllustrationIfChanged(setIllustration, cached);
      }
    },
    [getModule],
  );

  useLayoutEffect(() => {
    activeCacheKeyRef.current = pick?.cacheKey ?? null;

    if (!pick || !enabled) {
      setIllustrationIfChanged(setIllustration, null);
      return;
    }

    const module = getModule(pick.cacheKey);
    if (module) {
      const cached = moduleToIllustration(pick.cacheKey, module);
      setIllustrationIfChanged(setIllustration, cached);
      return;
    }

    setIllustrationIfChanged(setIllustration, null);
  }, [enabled, getModule, pick?.cacheKey]);

  useEffect(() => {
    if (!pick || !enabled) {
      return;
    }

    const cacheKey = pick.cacheKey;
    let cancelled = false;

    const module = getModule(cacheKey);
    if (!module) {
      void ensureModule(cacheKey, pick.loader)
        .then((loaded) => {
          if (!cancelled && activeCacheKeyRef.current === cacheKey) {
            const cached = moduleToIllustration(cacheKey, loaded);
            if (cached) {
              setIllustrationIfChanged(setIllustration, cached);
            }
          }
        })
        .catch(() => {
          if (!cancelled && activeCacheKeyRef.current === cacheKey) {
            setIllustrationIfChanged(setIllustration, null);
          }
        });
    }

    const unsubscribe = subscribeKey(cacheKey, () => {
      if (!cancelled) {
        syncFromCache(cacheKey);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [enabled, ensureModule, getModule, pick, subscribeKey, syncFromCache]);

  const illustrationMatches =
    illustration != null && illustration.cacheKey === pick?.cacheKey;

  return {
    illustration: illustrationMatches ? illustration : null,
    cacheKey: pick?.cacheKey ?? null,
    isReady: illustrationMatches,
  };
}

export function useKaucimStoryImages({
  concern,
  stickNumber,
  illustrations,
  enabled = true,
}: {
  concern: KAUCIM_CONCERNS | undefined;
  stickNumber: number;
  illustrations: StoryIllustrationSet | undefined;
  enabled?: boolean;
}): {
  images: PreloadedStoryImages | null;
  isReady: boolean;
  selection: SelectedStoryIllustrations | null;
} {
  const { ensureModule } = useKaucimIllustrationContext();

  const selection = useMemo(() => {
    if (!concern || !illustrations || !enabled) {
      return null;
    }
    return selectStoryIllustrations(concern, illustrations, stickNumber);
  }, [concern, enabled, illustrations, stickNumber]);

  const [images, setImages] = useState<PreloadedStoryImages | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!selection || !enabled) {
      setImages(null);
      setIsReady(false);
      return;
    }

    let cancelled = false;
    setIsReady(false);

    void (async () => {
      const [omen, action, conclude] = await Promise.all([
        ensureModule(selection.omen.cacheKey, selection.omen.loader),
        ensureModule(selection.action.cacheKey, selection.action.loader),
        ensureModule(selection.conclude.cacheKey, selection.conclude.loader),
      ]);

      if (!cancelled) {
        setImages({ omen, action, conclude });
        setIsReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, ensureModule, selection]);

  return { images, isReady, selection };
}

export function usePrefetchKaucimOmenImages({
  concern,
  stickNumbers,
  enabled = true,
}: {
  concern: KAUCIM_CONCERNS;
  stickNumbers: number[];
  enabled?: boolean;
}): void {
  const { prefetchModule } = useKaucimIllustrationContext();
  const illustrations = getConcernIllustrations(concern);
  const stickKey = stickNumbers.join(",");

  useEffect(() => {
    if (!enabled || !illustrations || stickNumbers.length === 0) {
      return;
    }

    for (const stickNumber of stickNumbers) {
      const pick = selectOmenIllustration(
        concern,
        illustrations,
        stickNumber,
        0,
      );
      prefetchModule(pick.cacheKey, pick.loader);
    }
  }, [concern, enabled, illustrations, prefetchModule, stickKey, stickNumbers]);
}
