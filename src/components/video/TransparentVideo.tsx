import { useAssets } from 'expo-asset';
import { useMemo } from 'react';
import { Image as RNImage, StyleProp, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';

// ─── Types ─────────────────────────────────────────────────────────────────

export type TransparentVideoProps = {
   /**
    * The video asset to play with alpha-channel transparency.
    *
    * - Local bundle: `require('./mascot/test.webm')`
    * - Remote URL:   `'https://example.com/video.webm'`
    * - Source object: `{ uri: '...' }`
    *
    * The video must be a WebM with VP9 alpha. Transparency is rendered
    * via a WebView whose Chromium engine natively decodes the alpha
    * channel — something Android's ExoPlayer cannot do.
    */
   source: number | string | { uri: string };

   /** @default true */
   loop?: boolean;

   /** @default true */
   muted?: boolean;

   /** @default 'contain' */
   contentFit?: 'contain' | 'cover' | 'fill';

   style?: StyleProp<ViewStyle>;
};

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Resolves the source prop to a URI the WebView can load.
 *
 * For bundled assets (`require()`), uses `expo-asset` to download the
 * file and produce a `file://` URI.  For strings and `{ uri }` objects
 * the value is returned directly.
 */
function useResolvedUri(source: TransparentVideoProps['source']): string {
   const isAssetId = typeof source === 'number';
   const [assets] = useAssets(isAssetId ? [source] : []);

   return useMemo(() => {
      if (isAssetId) {
         return assets?.[0]?.localUri ?? assets?.[0]?.uri ?? '';
      }
      if (typeof source === 'string') return source;
      if (typeof source === 'object' && 'uri' in source) return source.uri ?? '';
      return '';
   }, [isAssetId, assets, source]);
}

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * Renders a WebM video (VP9 + alpha) with real transparency.
 *
 * Uses a WebView under the hood so the Chromium engine decodes the
 * alpha channel that Android's native video stack ignores.
 */
export function TransparentVideo({
   source,
   loop = true,
   muted = true,
   contentFit = 'contain',
   style,
}: TransparentVideoProps) {
   const uri = useResolvedUri(source);

   const html = useMemo(
      () => `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<style>
*{margin:0;padding:0}
html,body{width:100%;height:100%;background:transparent;overflow:hidden}
video{width:100%;height:100%;object-fit:${contentFit}}
</style>
</head><body>
<video autoplay${loop ? ' loop' : ''}${muted ? ' muted' : ''} playsinline src="${uri}"></video>
</body></html>`,
      [uri, loop, muted, contentFit],
   );

   if (!uri) return null;

   return (
      <WebView
         source={{ html }}
         style={[{ backgroundColor: 'transparent' }, style]}
         containerStyle={{ backgroundColor: 'transparent' }}
         androidLayerType="hardware"
         originWhitelist={['*']}
         allowFileAccess
         mediaPlaybackRequiresUserAction={false}
         javaScriptEnabled={false}
         scrollEnabled={false}
         overScrollMode="never"
         showsHorizontalScrollIndicator={false}
         showsVerticalScrollIndicator={false}
      />
   );
}
