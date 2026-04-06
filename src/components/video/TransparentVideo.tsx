import { useAssets } from "expo-asset";
import { useMemo } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { WebView } from "react-native-webview";

// ─── Types ─────────────────────────────────────────────────────────────────

/**
 * Controls how the video loops.
 *
 * - `false` — play once (no loop).
 * - `true` — loop the entire clip forever.
 * - A positive integer — play the **full** video that many times total (e.g. `3` = three complete plays).
 * - An object — optional `times`, `start`, and `end` (seconds on the media timeline; for frame-based edits use `frame / fps`):
 *   - Omit `start` / `end` for whole-clip behavior with the given repeat count.
 *   - Set `start` and/or `end` to loop only between those times (playback jumps back to `start` near `end`).
 *   - `times`: omit or `Infinity` = repeat forever; a finite number = that many passes over the range.
 */
export type TransparentVideoLoop =
  | boolean
  | number
  | {
      /** How many times to play the range. `Infinity` = forever. Default: `Infinity` when looping. */
      times?: number;
      /** Start time in seconds (default `0`). */
      start?: number;
      /** End time in seconds. Omit to use the file duration (full video). */
      end?: number;
    };

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
  loop?: TransparentVideoLoop;

  /** @default true */
  muted?: boolean;

  /** @default 'contain' */
  contentFit?: "contain" | "cover" | "fill";

  style?: StyleProp<ViewStyle>;
};

type LoopRuntimeConfig =
  | { kind: "native" }
  | { kind: "none" }
  | {
      kind: "js";
      times: number;
      start: number | null;
      end: number | null;
    };

function resolveLoop(
  loop: TransparentVideoLoop | undefined,
): LoopRuntimeConfig {
  if (loop === undefined || loop === true) {
    return { kind: "native" };
  }
  if (loop === false) {
    return { kind: "none" };
  }
  if (typeof loop === "number") {
    if (!Number.isFinite(loop) || loop < 0) {
      return { kind: "native" };
    }
    if (loop <= 1) {
      return { kind: "none" };
    }
    return { kind: "js", times: Math.floor(loop), start: null, end: null };
  }

  const times = loop.times ?? Infinity;
  const hasSegment = loop.start !== undefined || loop.end !== undefined;

  if (!hasSegment) {
    if (times === Infinity) return { kind: "native" };
    if (times <= 1) return { kind: "none" };
    return { kind: "js", times: Math.floor(times), start: null, end: null };
  }

  const t = Number.isFinite(times) ? Math.max(1, Math.floor(times)) : Infinity;
  return {
    kind: "js",
    times: t,
    start: loop.start ?? null,
    end: loop.end ?? null,
  };
}

function buildLoopScript(
  cfg: Extract<LoopRuntimeConfig, { kind: "js" }>,
): string {
  // JSON.stringify drops Infinity; use a flag so infinite repeats work in the WebView.
  const payload = JSON.stringify({
    times: Number.isFinite(cfg.times) ? cfg.times : 0,
    infiniteRepeat: !Number.isFinite(cfg.times),
    start: cfg.start,
    end: cfg.end,
  });
  return `(function(){
var cfg=${payload};
var v=document.querySelector('video');
if(!v)return;
v.loop=false;
var segment=cfg.start!=null||cfg.end!=null;
var passes=0;
var max=cfg.infiniteRepeat?Infinity:cfg.times;
function atEnd(t,dur){
var e=cfg.end!=null?cfg.end:dur;
return t>=e-0.04;
}
function seekStart(){
var s=cfg.start!=null?cfg.start:0;
try{v.currentTime=s}catch(e){}
}
function finish(){
v.pause();
try{v.removeEventListener('timeupdate',onTU)}catch(e){}
try{v.removeEventListener('ended',onEnd)}catch(e){}
}
function onTU(){
var d=v.duration;
if(!isFinite(d)||d<=0)return;
if(atEnd(v.currentTime,d)){
passes++;
if(max!==Infinity&&passes>=max){finish();return}
seekStart();
if(v.paused)try{v.play()}catch(e){}
}
}
function onEnd(){
if(segment)return;
passes++;
if(max!==Infinity&&passes>=max){finish();return}
try{v.currentTime=0}catch(e){}
try{v.play()}catch(e){}
}
v.addEventListener('loadedmetadata',function(){
var d=v.duration;
if(segment){
seekStart();
if(cfg.end!=null&&cfg.start!=null&&cfg.end<=cfg.start){finish();return}
try{v.play()}catch(e){}
}else if(cfg.start!=null){
seekStart();
}
});
if(segment){
v.addEventListener('timeupdate',onTU);
}else{
v.addEventListener('ended',onEnd);
}
})();`;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Resolves the source prop to a URI the WebView can load.
 *
 * For bundled assets (`require()`), uses `expo-asset` to download the
 * file and produce a `file://` URI.  For strings and `{ uri }` objects
 * the value is returned directly.
 */
function useResolvedUri(source: TransparentVideoProps["source"]): string {
  const isAssetId = typeof source === "number";
  const [assets] = useAssets(isAssetId ? [source] : []);

  return useMemo(() => {
    if (isAssetId) {
      return assets?.[0]?.localUri ?? assets?.[0]?.uri ?? "";
    }
    if (typeof source === "string") return source;
    if (typeof source === "object" && "uri" in source) return source.uri ?? "";
    return "";
  }, [isAssetId, assets, source]);
}

function escapeHtmlAttrUri(uri: string): string {
  return uri.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
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
  contentFit = "contain",
  style,
}: TransparentVideoProps) {
  const uri = useResolvedUri(source);
  const resolved = useMemo(() => resolveLoop(loop), [loop]);

  const html = useMemo(() => {
    const nativeLoop = resolved.kind === "native";
    const loopAttr = nativeLoop ? " loop" : "";

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
          <style>
            *{margin:0;padding:0}
            html,body{width:100%;height:100%;background:transparent;overflow:hidden}
            video{width:100%;height:100%;object-fit:${contentFit};pointer-events:none;user-select:none}
          </style>
        </head>
        <body>
          <video autoplay${loopAttr}${muted ? " muted" : ""} playsinline src="${escapeHtmlAttrUri(uri)}"></video>
          ${resolved.kind === "js" ? `<script>${buildLoopScript(resolved)}</script>` : ""}
        </body>
      </html>`;
  }, [uri, resolved, muted, contentFit]);

  if (!uri) return null;

  return (
    <WebView
      source={{ html }}
      style={[{ backgroundColor: "transparent" }, style]}
      containerStyle={{ backgroundColor: "transparent" }}
      androidLayerType="hardware"
      originWhitelist={["*"]}
      allowFileAccess
      mediaPlaybackRequiresUserAction={false}
      javaScriptEnabled={resolved.kind === "js"}
      scrollEnabled={false}
      overScrollMode="never"
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
    />
  );
}
