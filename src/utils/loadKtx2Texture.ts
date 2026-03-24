import { Asset } from 'expo-asset';
import Constants, { AppOwnership } from 'expo-constants';
import { ExpoWebGLRenderingContext } from 'expo-gl';
import { Platform } from 'react-native';
import {
  RGBAFormat,
  RGBA_ASTC_4x4_Format,
  RGB_ETC2_Format,
  RGBA_ETC2_EAC_Format,
  RGBA_S3TC_DXT5_Format,
  RGBA_S3TC_DXT1_Format,
  RGBA_BPTC_Format,
  RGB_ETC1_Format,
  RGBA_PVRTC_4BPPV1_Format,
  RGB_PVRTC_4BPPV1_Format,
} from 'three';

// ─── Bundled asset loading (Metro dev URLs often fail in native ExpoAsset.downloadAsync on Android)

function base64ToArrayBuffer(b64: string): ArrayBuffer {
  const atobFn = globalThis.atob;
  if (!atobFn) {
    throw new Error('base64ToArrayBuffer: atob is not available');
  }
  const binary = atobFn(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function arrayBufferToBase64(ab: ArrayBuffer): string {
  const bytes = new Uint8Array(ab);
  let binary = '';
  const chunk = 8192;
  for (let i = 0; i < bytes.length; i += chunk) {
    const end = Math.min(i + chunk, bytes.length);
    for (let j = i; j < end; j++) {
      binary += String.fromCharCode(bytes[j]!);
    }
  }
  const btoaFn = globalThis.btoa;
  if (!btoaFn) {
    throw new Error('arrayBufferToBase64: btoa is not available');
  }
  return btoaFn(binary);
}

/**
 * Ensures a Metro-bundled asset exists on disk with `localUri` set.
 * Falls back when native `ExpoAsset.downloadAsync` fails (common on Android with `unstable_path` URLs).
 */
async function ensureBundledAssetOnDisk(asset: Asset): Promise<void> {
  if (asset.downloaded && asset.localUri) return;

  if (Platform.OS === 'web') {
    await asset.downloadAsync();
    return;
  }

  try {
    await asset.downloadAsync();
  } catch {
    /* fall through */
  }
  if (asset.downloaded && asset.localUri) return;

  const FileSystem = await import('expo-file-system/legacy');
  const cache = FileSystem.cacheDirectory;
  if (!cache) {
    throw new Error('ensureBundledAssetOnDisk: cacheDirectory is null');
  }
  const fileName = `gl-asset-${asset.hash ?? 'nohash'}-${asset.name}.${asset.type}`;
  const destUri = `${cache}${fileName}`;

  try {
    const { uri } = await FileSystem.downloadAsync(asset.uri, destUri);
    asset.localUri = uri;
    asset.downloaded = true;
    return;
  } catch {
    /* fall through */
  }

  const res = await fetch(asset.uri);
  if (!res.ok) {
    throw new Error(
      `ensureBundledAssetOnDisk: fetch failed ${res.status} for ${asset.uri}`,
    );
  }
  const ab = await res.arrayBuffer();
  await FileSystem.writeAsStringAsync(destUri, arrayBufferToBase64(ab), {
    encoding: FileSystem.EncodingType.Base64,
  });
  asset.localUri = destUri;
  asset.downloaded = true;
}

async function readUriAsArrayBuffer(uri: string): Promise<ArrayBuffer> {
  if (Platform.OS === 'web') {
    const res = await fetch(uri);
    if (!res.ok) {
      throw new Error(`readUriAsArrayBuffer: fetch failed ${res.status}`);
    }
    return res.arrayBuffer();
  }

  if (uri.startsWith('file:')) {
    try {
      const res = await fetch(uri);
      if (res.ok) return await res.arrayBuffer();
    } catch {
      /* fall through */
    }
    const FileSystem = await import('expo-file-system/legacy');
    const b64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64ToArrayBuffer(b64);
  }

  const res = await fetch(uri);
  if (!res.ok) {
    throw new Error(`readUriAsArrayBuffer: fetch failed ${res.status}`);
  }
  return res.arrayBuffer();
}

/** Matches Basis `basist::transcoder_texture_format` / THREE.KTX2Loader.TranscoderFormat */
const TranscoderFormat = {
  ETC1: 0,
  ETC2: 1,
  BC1: 2,
  BC3: 3,
  BC4: 4,
  BC5: 5,
  BC7_M6_OPAQUE_ONLY: 6,
  BC7_M5: 7,
  PVRTC1_4_RGB: 8,
  PVRTC1_4_RGBA: 9,
  ASTC_4x4: 10,
  ATC_RGB: 11,
  ATC_RGBA_INTERPOLATED_ALPHA: 12,
  RGBA32: 13,
  RGB565: 14,
  BGR565: 15,
  RGBA4444: 16,
} as const;

const BasisFormat = {
  ETC1S: 0,
  UASTC_4x4: 1,
} as const;

const EngineFormat = {
  RGBAFormat,
  RGBA_ASTC_4x4_Format,
  RGBA_BPTC_Format,
  RGBA_S3TC_DXT5_Format,
  RGBA_S3TC_DXT1_Format,
  RGBA_ETC2_EAC_Format,
  RGB_ETC2_Format,
  RGB_ETC1_Format,
  RGBA_PVRTC_4BPPV1_Format,
  RGB_PVRTC_4BPPV1_Format,
} as const;

/** True only in the Expo Go app — native modules from your project are not available. */
export function isRunningInExpoGo(): boolean {
  return Constants.appOwnership === AppOwnership.Expo;
}

type SupportConfig = {
  astcSupported: boolean;
  etc1Supported: boolean;
  etc2Supported: boolean;
  dxtSupported: boolean;
  bptcSupported: boolean;
  pvrtcSupported: boolean;
};

function detectCompressedSupport(gl: ExpoWebGLRenderingContext): SupportConfig {
  return {
    astcSupported: !!gl.getExtension('WEBGL_compressed_texture_astc'),
    etc1Supported: !!gl.getExtension('WEBGL_compressed_texture_etc1'),
    etc2Supported: !!gl.getExtension('WEBGL_compressed_texture_etc'),
    dxtSupported: !!gl.getExtension('WEBGL_compressed_texture_s3tc'),
    bptcSupported: !!gl.getExtension('EXT_texture_compression_bptc'),
    pvrtcSupported: !!(
      gl.getExtension('WEBGL_compressed_texture_pvrtc') ||
      gl.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc')
    ),
  };
}

function isPowerOfTwo(value: number): boolean {
  if (value <= 2) return true;
  return (value & (value - 1)) === 0 && value !== 0;
}

/** Same ordering as THREE.KTX2Loader.FORMAT_OPTIONS (ETC1S / UASTC priorities). */
const FORMAT_OPTIONS = [
  {
    if: 'astcSupported' as const,
    basisFormat: [BasisFormat.UASTC_4x4],
    transcoderFormat: [TranscoderFormat.ASTC_4x4, TranscoderFormat.ASTC_4x4],
    engineFormat: [EngineFormat.RGBA_ASTC_4x4_Format, EngineFormat.RGBA_ASTC_4x4_Format],
    priorityETC1S: Infinity,
    priorityUASTC: 1,
    needsPowerOfTwo: false,
  },
  {
    if: 'bptcSupported' as const,
    basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC_4x4],
    transcoderFormat: [TranscoderFormat.BC7_M5, TranscoderFormat.BC7_M5],
    engineFormat: [EngineFormat.RGBA_BPTC_Format, EngineFormat.RGBA_BPTC_Format],
    priorityETC1S: 3,
    priorityUASTC: 2,
    needsPowerOfTwo: false,
  },
  {
    if: 'dxtSupported' as const,
    basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC_4x4],
    transcoderFormat: [TranscoderFormat.BC1, TranscoderFormat.BC3],
    engineFormat: [EngineFormat.RGBA_S3TC_DXT1_Format, EngineFormat.RGBA_S3TC_DXT5_Format],
    priorityETC1S: 4,
    priorityUASTC: 5,
    needsPowerOfTwo: false,
  },
  {
    if: 'etc2Supported' as const,
    basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC_4x4],
    transcoderFormat: [TranscoderFormat.ETC1, TranscoderFormat.ETC2],
    engineFormat: [EngineFormat.RGB_ETC2_Format, EngineFormat.RGBA_ETC2_EAC_Format],
    priorityETC1S: 1,
    priorityUASTC: 3,
    needsPowerOfTwo: false,
  },
  {
    if: 'etc1Supported' as const,
    basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC_4x4],
    transcoderFormat: [TranscoderFormat.ETC1],
    engineFormat: [EngineFormat.RGB_ETC1_Format],
    priorityETC1S: 2,
    priorityUASTC: 4,
    needsPowerOfTwo: false,
  },
  {
    if: 'pvrtcSupported' as const,
    basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC_4x4],
    transcoderFormat: [TranscoderFormat.PVRTC1_4_RGB, TranscoderFormat.PVRTC1_4_RGBA],
    engineFormat: [EngineFormat.RGB_PVRTC_4BPPV1_Format, EngineFormat.RGBA_PVRTC_4BPPV1_Format],
    priorityETC1S: 5,
    priorityUASTC: 6,
    needsPowerOfTwo: true,
  },
];

const ETC1S_OPTIONS = [...FORMAT_OPTIONS].sort(
  (a, b) => a.priorityETC1S - b.priorityETC1S,
);
const UASTC_OPTIONS = [...FORMAT_OPTIONS].sort(
  (a, b) => a.priorityUASTC - b.priorityUASTC,
);

function getTranscoderFormat(
  basisFormat: number,
  width: number,
  height: number,
  hasAlpha: boolean,
  config: SupportConfig,
): { transcoderFormat: number; engineFormat: number } {
  const options =
    basisFormat === BasisFormat.ETC1S ? ETC1S_OPTIONS : UASTC_OPTIONS;

  for (let i = 0; i < options.length; i++) {
    const opt = options[i];
    if (!config[opt.if]) continue;
    if (!opt.basisFormat.some((f) => f === basisFormat)) continue;
    if (hasAlpha && opt.transcoderFormat.length < 2) continue;
    if (
      opt.needsPowerOfTwo &&
      !(isPowerOfTwo(width) && isPowerOfTwo(height))
    ) {
      continue;
    }
    const tf = opt.transcoderFormat[hasAlpha ? 1 : 0];
    const ef = opt.engineFormat[hasAlpha ? 1 : 0];
    return { transcoderFormat: tf, engineFormat: ef };
  }

  return {
    transcoderFormat: TranscoderFormat.RGBA32,
    engineFormat: EngineFormat.RGBAFormat,
  };
}

function concat(arrays: Uint8Array[]): Uint8Array {
  if (arrays.length === 1) return arrays[0];
  let total = 0;
  for (const a of arrays) total += a.byteLength;
  const out = new Uint8Array(total);
  let o = 0;
  for (const a of arrays) {
    out.set(a, o);
    o += a.byteLength;
  }
  return out;
}

function getCompressedInternalFormat(
  gl: ExpoWebGLRenderingContext,
  threeFormat: number,
): number | null {
  const astc = gl.getExtension('WEBGL_compressed_texture_astc');
  const etc = gl.getExtension('WEBGL_compressed_texture_etc');
  const etc1 = gl.getExtension('WEBGL_compressed_texture_etc1');
  const dxt = gl.getExtension('WEBGL_compressed_texture_s3tc');
  const bptc = gl.getExtension('EXT_texture_compression_bptc');
  const pvrtc =
    gl.getExtension('WEBGL_compressed_texture_pvrtc') ||
    gl.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc');

  if (threeFormat === RGBA_ASTC_4x4_Format && astc) {
    return astc.COMPRESSED_RGBA_ASTC_4x4_KHR;
  }
  if (threeFormat === RGBA_BPTC_Format && bptc) {
    return bptc.COMPRESSED_RGBA_BPTC_UNORM_EXT;
  }
  if (threeFormat === RGBA_S3TC_DXT5_Format && dxt) {
    return dxt.COMPRESSED_RGBA_S3TC_DXT5_EXT;
  }
  if (threeFormat === RGBA_S3TC_DXT1_Format && dxt) {
    return dxt.COMPRESSED_RGBA_S3TC_DXT1_EXT;
  }
  if (threeFormat === RGBA_ETC2_EAC_Format && etc) {
    return etc.COMPRESSED_RGBA8_ETC2_EAC;
  }
  if (threeFormat === RGB_ETC2_Format && etc) {
    return etc.COMPRESSED_RGB8_ETC2;
  }
  if (threeFormat === RGB_ETC1_Format && etc1) {
    return etc1.COMPRESSED_RGB_ETC1_WEBGL;
  }
  if (threeFormat === RGBA_PVRTC_4BPPV1_Format && pvrtc) {
    return pvrtc.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
  }
  if (threeFormat === RGB_PVRTC_4BPPV1_Format && pvrtc) {
    return pvrtc.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
  }
  return null;
}

let basisInitialized = false;

/**
 * Loads a GPU texture from a KTX2 (Basis) file using the native Basis transcoder.
 * Falls back to uncompressed RGBA when no compressed target matches.
 */
export async function loadKtx2Texture(
  gl: ExpoWebGLRenderingContext,
  moduleId: number,
): Promise<WebGLTexture> {
  if (Platform.OS === 'web') {
    throw new Error(
      'loadKtx2Texture: native KTX2 is not available on web; use pngFallback.',
    );
  }

  if (isRunningInExpoGo()) {
    throw new Error(
      'loadKtx2Texture: BasisUniversal native module is not in Expo Go; use pngFallback.',
    );
  }

  const { initializeBasis, KTX2File } = await import(
    '@callstack/react-native-basis-universal'
  );

  if (!basisInitialized) {
    initializeBasis();
    basisInitialized = true;
  }

  const asset = Asset.fromModule(moduleId);
  await ensureBundledAssetOnDisk(asset);
  const buffer = await readUriAsArrayBuffer(asset.localUri ?? asset.uri);
  const support = detectCompressedSupport(gl);

  const ktx2 = new KTX2File(new Uint8Array(buffer));
  if (!ktx2.isValid()) {
    ktx2.close();
    throw new Error('loadKtx2Texture: invalid KTX2');
  }

  try {
    const basisFormat = ktx2.isUASTC()
      ? BasisFormat.UASTC_4x4
      : BasisFormat.ETC1S;
    const width = ktx2.getWidth();
    const height = ktx2.getHeight();
    const layerCount = ktx2.getLayers() || 1;
    const levelCount = ktx2.getLevels();
    const faceCount = ktx2.getFaces();
    if (faceCount !== 1) {
      throw new Error(
        'loadKtx2Texture: only 2D textures (faceCount === 1) are supported',
      );
    }
    const hasAlpha = ktx2.getHasAlpha();

    const { transcoderFormat, engineFormat } = getTranscoderFormat(
      basisFormat,
      width,
      height,
      hasAlpha,
      support,
    );

    if (!width || !height || !levelCount) {
      throw new Error('loadKtx2Texture: invalid texture dimensions');
    }

    if (!ktx2.startTranscoding()) {
      throw new Error('loadKtx2Texture: startTranscoding failed');
    }

    // Same nesting as THREE.KTX2Loader (single face for 2D atlases).
    const mipmaps: { data: Uint8Array; width: number; height: number }[] = [];
    const face = 0;

    for (let mip = 0; mip < levelCount; mip++) {
      const layerMips: Uint8Array[] = [];
      let mipWidth = 0;
      let mipHeight = 0;

      for (let layer = 0; layer < layerCount; layer++) {
        const levelInfo = ktx2.getImageLevelInfo(mip, layer, face);
        if (!levelInfo) continue;

        if (levelCount > 1) {
          mipWidth = levelInfo.origWidth;
          mipHeight = levelInfo.origHeight;
        } else {
          mipWidth = levelInfo.width;
          mipHeight = levelInfo.height;
        }

        const size = ktx2.getImageTranscodedSizeInBytes(
          mip,
          layer,
          face,
          transcoderFormat,
        );
        const dst = new Uint8Array(size);
        const status = ktx2.transcodeImage(
          dst,
          mip,
          layer,
          face,
          transcoderFormat,
          0,
          -1,
          -1,
        );
        if (!status) {
          throw new Error('loadKtx2Texture: transcodeImage failed');
        }
        layerMips.push(dst);
      }

      mipmaps.push({
        data: concat(layerMips),
        width: mipWidth,
        height: mipHeight,
      });
    }

    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);

    if (engineFormat === RGBAFormat) {
      for (let i = 0; i < mipmaps.length; i++) {
        const m = mipmaps[i];
        gl.texImage2D(
          gl.TEXTURE_2D,
          i,
          gl.RGBA,
          m.width,
          m.height,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          m.data,
        );
      }
    } else {
      const internal = getCompressedInternalFormat(gl, engineFormat);
      if (internal === null) {
        throw new Error(
          'loadKtx2Texture: GPU missing extension for transcoded format',
        );
      }
      for (let i = 0; i < mipmaps.length; i++) {
        const m = mipmaps[i];
        gl.compressedTexImage2D(
          gl.TEXTURE_2D,
          i,
          internal,
          m.width,
          m.height,
          0,
          m.data,
        );
      }
    }

    const minFilter =
      mipmaps.length > 1 ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    return tex;
  } finally {
    ktx2.close();
  }
}

/** Uncompressed PNG/RGBA upload (expo-asset image). */
export async function loadUncompressedTextureFromModule(
  gl: ExpoWebGLRenderingContext,
  moduleId: number,
): Promise<WebGLTexture> {
  const asset = Asset.fromModule(moduleId);
  await ensureBundledAssetOnDisk(asset);
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    asset as unknown as TexImageSource,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return tex;
}

export async function loadAtlasPageTexture(
  gl: ExpoWebGLRenderingContext,
  ktx2ModuleId: number,
  pngFallbackModuleId: number,
): Promise<WebGLTexture> {
  if (Platform.OS === 'web' || isRunningInExpoGo()) {
    return loadUncompressedTextureFromModule(gl, pngFallbackModuleId);
  }
  try {
    return await loadKtx2Texture(gl, ktx2ModuleId);
  } catch (e) {
    console.warn(
      'loadAtlasPageTexture: KTX2 failed, falling back to PNG',
      e,
    );
    return loadUncompressedTextureFromModule(gl, pngFallbackModuleId);
  }
}
