import { pickRandom } from "@/lib/app/helper";
import {
  buildIllustrationCacheKey,
  type KaucimIllustrationPhase,
} from "@/lib/kaucim/illustrationCache";
import { ILLUSTRATIONS } from "@/routes/kau-cim/constants";
import type { KAUCIM_CONCERNS } from "@/types/UserState";

export type StoryIllustrationSet = {
  omen: ImageModule[][];
  action: ImageModule[][];
  conclude: ImageModule[][];
};

export type IllustrationPick = {
  phase: KaucimIllustrationPhase;
  variantIndex: number;
  loader: () => ImageModule;
  cacheKey: ReturnType<typeof buildIllustrationCacheKey>;
};

export type SelectedStoryIllustrations = {
  omen: IllustrationPick;
  action: IllustrationPick;
  conclude: IllustrationPick;
};

export function getConcernIllustrations(
  concern: KAUCIM_CONCERNS | undefined,
): StoryIllustrationSet | undefined {
  if (!concern) {
    return undefined;
  }
  return ILLUSTRATIONS[concern as keyof typeof ILLUSTRATIONS];
}

function pickLoader(
  pool: (() => ImageModule)[],
): { loader: () => ImageModule; variantIndex: number } {
  const variantIndex = Math.floor(Math.random() * pool.length);
  return { loader: pool[variantIndex]!, variantIndex };
}

function findLoaderIndex(
  pool: (() => ImageModule)[],
  loader: () => ImageModule,
): number {
  const index = pool.indexOf(loader);
  return index >= 0 ? index : 0;
}

function buildPick(
  concern: string,
  phase: KaucimIllustrationPhase,
  stickNumber: number,
  pool: (() => ImageModule)[],
  loader: () => ImageModule,
): IllustrationPick {
  const variantIndex = findLoaderIndex(pool, loader);
  return {
    phase,
    variantIndex,
    loader,
    cacheKey: buildIllustrationCacheKey(
      concern,
      phase,
      stickNumber,
      variantIndex,
    ),
  };
}

export function selectStoryIllustrations(
  concern: KAUCIM_CONCERNS,
  illustrations: StoryIllustrationSet,
  stickNumber: number,
): SelectedStoryIllustrations {
  const omenPool =
    illustrations.omen[stickNumber % illustrations.omen.length] ?? [];
  const actionPool =
    illustrations.action[stickNumber % illustrations.action.length] ?? [];
  const concludePool =
    illustrations.conclude[stickNumber % illustrations.conclude.length] ??
    [];

  const omenLoader = pickRandom(omenPool);
  const actionLoader =
    pickRandom(actionPool.length ? actionPool : omenPool) ?? omenLoader;
  const concludeLoader =
    pickRandom(
      concludePool.length
        ? concludePool
        : actionPool.length
          ? actionPool
          : omenPool,
    ) ?? actionLoader;

  return {
    omen: buildPick(concern, "omen", stickNumber, omenPool, omenLoader),
    action: buildPick(
      concern,
      "action",
      stickNumber,
      actionPool.length ? actionPool : omenPool,
      actionLoader,
    ),
    conclude: buildPick(
      concern,
      "conclude",
      stickNumber,
      concludePool.length
        ? concludePool
        : actionPool.length
          ? actionPool
          : omenPool,
      concludeLoader,
    ),
  };
}

export function selectOmenIllustration(
  concern: KAUCIM_CONCERNS,
  illustrations: StoryIllustrationSet,
  stickNumber: number,
  variantIndex = 0,
): IllustrationPick {
  const pool = illustrations.omen[stickNumber]?.length
    ? illustrations.omen[stickNumber]
    : illustrations.omen[stickNumber % illustrations.omen.length];

  const loader =
    pool?.[variantIndex] ??
    pool?.[0] ??
    (() => {
      throw new Error(`No omen illustration for stick ${stickNumber}`);
    });

  return {
    phase: "omen",
    variantIndex,
    loader,
    cacheKey: buildIllustrationCacheKey(
      concern,
      "omen",
      stickNumber,
      variantIndex,
    ),
  };
}
