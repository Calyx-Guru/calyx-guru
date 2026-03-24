// ─── TexturePacker JSON Array ───────────────────────────────────────────────

export interface TPFrame {
  filename: string;
  frame: { x: number; y: number; w: number; h: number };
  rotated: boolean;
  trimmed: boolean;
  spriteSourceSize: { x: number; y: number; w: number; h: number };
  sourceSize: { w: number; h: number };
}

export interface TPAtlasJson {
  frames: TPFrame[];
  meta: {
    image: string;
    size: { w: number; h: number };
    scale: string;
  };
}

/** One atlas page: TexturePacker JSON + GPU assets (KTX2 + PNG fallback). */
export interface AtlasPage {
  json: TPAtlasJson;
  /** Bundled KTX2 (Basis) atlas — used on iOS/Android with native transcoder. */
  ktx2: number;
  /** PNG atlas for web and as a fallback if KTX2 upload fails. */
  pngFallback: number;
}

/** Central catalog of sprite atlases (pass entries to `SpriteAnimation` as `source`). */
export const ATLAS_REGISTRY = {
  meditating: [
    {
      json: require('@/assets/animations/meditating-0.json'),
      ktx2: require('@/assets/animations/meditating-0.ktx2'),
      pngFallback: require('@/assets/animations/meditating-0.png'),
    },
    {
      json: require('@/assets/animations/meditating-1.json'),
      ktx2: require('@/assets/animations/meditating-1.ktx2'),
      pngFallback: require('@/assets/animations/meditating-1.png'),
    },
    {
      json: require('@/assets/animations/meditating-2.json'),
      ktx2: require('@/assets/animations/meditating-2.ktx2'),
      pngFallback: require('@/assets/animations/meditating-2.png'),
    },
  ],
} satisfies Record<string, AtlasPage[]>;

export type AtlasAnimationSource = keyof typeof ATLAS_REGISTRY;
