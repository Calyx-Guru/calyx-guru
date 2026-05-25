import { Image } from "react-native";

export type KaucimIllustrationPhase = "omen" | "action" | "conclude";

export type KaucimIllustrationCacheKey = `${string}:${KaucimIllustrationPhase}:${number}:${number}`;

export type CachedIllustration = {
  cacheKey: KaucimIllustrationCacheKey;
  module: ImageModule;
};

type CacheEntry = {
  module: ImageModule | null;
  uri: string | null;
  lastAccessedAt: number;
  loadPromise: Promise<ImageModule> | null;
};

/** Max decoded story images kept in memory at once. */
const MAX_CACHE_ENTRIES = 48;
/** Drop entries not requested within this window. */
const IDLE_TTL_MS = 8 * 60 * 1000;

export function buildIllustrationCacheKey(
  concern: string,
  phase: KaucimIllustrationPhase,
  stickNumber: number,
  variantIndex: number,
): KaucimIllustrationCacheKey {
  return `${concern}:${phase}:${stickNumber}:${variantIndex}`;
}

export function resolveImageModule(module: ImageModule): {
  uri: string | null;
  width?: number;
  height?: number;
} {
  const resolved = Image.resolveAssetSource(module);
  return {
    uri: resolved?.uri ?? null,
    width: resolved?.width,
    height: resolved?.height,
  };
}

export function toCachedIllustration(
  cacheKey: KaucimIllustrationCacheKey,
  module: ImageModule,
): CachedIllustration {
  return { cacheKey, module };
}

export async function prefetchImageUri(uri: string): Promise<boolean> {
  try {
    return await Image.prefetch(uri);
  } catch {
    return false;
  }
}

export class KaucimIllustrationCache {
  private entries = new Map<KaucimIllustrationCacheKey, CacheEntry>();
  private keyListeners = new Map<
    KaucimIllustrationCacheKey,
    Set<() => void>
  >();

  subscribeKey(
    key: KaucimIllustrationCacheKey,
    listener: () => void,
  ): () => void {
    let listeners = this.keyListeners.get(key);
    if (!listeners) {
      listeners = new Set();
      this.keyListeners.set(key, listeners);
    }
    listeners.add(listener);
    return () => {
      listeners?.delete(listener);
      if (listeners?.size === 0) {
        this.keyListeners.delete(key);
      }
    };
  }

  private notifyKey(key: KaucimIllustrationCacheKey): void {
    for (const listener of this.keyListeners.get(key) ?? []) {
      listener();
    }
  }

  touch(key: KaucimIllustrationCacheKey): CacheEntry | undefined {
    const entry = this.entries.get(key);
    if (entry) {
      entry.lastAccessedAt = Date.now();
    }
    return entry;
  }

  getModule(key: KaucimIllustrationCacheKey): ImageModule | null {
    const entry = this.touch(key);
    return entry?.module ?? null;
  }

  getCached(key: KaucimIllustrationCacheKey): CachedIllustration | null {
    const entry = this.touch(key);
    if (!entry?.module) {
      return null;
    }
    return toCachedIllustration(key, entry.module);
  }

  async ensureModule(
    key: KaucimIllustrationCacheKey,
    loader: () => ImageModule,
  ): Promise<ImageModule> {
    const existing = this.entries.get(key);
    if (existing?.loadPromise) {
      existing.lastAccessedAt = Date.now();
      return existing.loadPromise;
    }
    if (existing?.module) {
      existing.lastAccessedAt = Date.now();
      return existing.module;
    }

    const loadPromise = (async () => {
      const module = loader();
      const { uri } = resolveImageModule(module);
      if (uri) {
        await prefetchImageUri(uri);
      }

      const now = Date.now();
      this.entries.set(key, {
        module,
        uri,
        lastAccessedAt: now,
        loadPromise: null,
      });
      this.enforceLimits(now);
      this.notifyKey(key);
      return module;
    })();

    this.entries.set(key, {
      module: null,
      uri: null,
      lastAccessedAt: Date.now(),
      loadPromise,
    });

    try {
      return await loadPromise;
    } catch (error) {
      this.entries.delete(key);
      this.notifyKey(key);
      throw error;
    }
  }

  async ensureMany(
    requests: { key: KaucimIllustrationCacheKey; loader: () => ImageModule }[],
  ): Promise<ImageModule[]> {
    return Promise.all(
      requests.map(({ key, loader }) => this.ensureModule(key, loader)),
    );
  }

  evictStale(now = Date.now()): void {
    for (const [key, entry] of this.entries) {
      if (now - entry.lastAccessedAt > IDLE_TTL_MS) {
        this.entries.delete(key);
      }
    }
    this.enforceLimits(now);
  }

  private enforceLimits(now = Date.now()): void {
    if (this.entries.size <= MAX_CACHE_ENTRIES) {
      return;
    }

    const sorted = [...this.entries.entries()].sort(
      (a, b) => a[1].lastAccessedAt - b[1].lastAccessedAt,
    );

    for (const [key, entry] of sorted) {
      if (this.entries.size <= MAX_CACHE_ENTRIES) {
        break;
      }
      if (entry.loadPromise) {
        continue;
      }
      this.entries.delete(key);
    }

    // Fallback: still over limit — drop oldest regardless of in-flight state.
    while (this.entries.size > MAX_CACHE_ENTRIES) {
      const oldest = sorted.find(([key]) => this.entries.has(key));
      if (!oldest) {
        break;
      }
      this.entries.delete(oldest[0]);
    }

    void now;
  }
}
