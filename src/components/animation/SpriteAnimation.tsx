import { ExpoWebGLRenderingContext, GLView } from 'expo-gl';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import type { AtlasPage, TPFrame } from '@/constants/registries';
import { loadAtlasPageTexture } from '@/utils/loadKtx2Texture';

// ─── Public Types ───────────────────────────────────────────────────────────

export interface LoopConfig {
  from?: number;
  to?: number;
  count?: number;
}

export interface SpriteAnimationProps {
  /** Multi-page atlas definition (e.g. `ATLAS_REGISTRY.meditating` from your registry module). */
  source: readonly AtlasPage[];
  fps?: number;
  loop?: boolean | LoopConfig;
  style?: StyleProp<ViewStyle>;
}

// ─── Internals ──────────────────────────────────────────────────────────────

interface ResolvedFrame {
  tp: TPFrame;
  pageIndex: number;
}

function resolveFrames(pages: readonly AtlasPage[]): ResolvedFrame[] {
  const out: ResolvedFrame[] = [];
  for (let p = 0; p < pages.length; p++) {
    for (const tp of pages[p].json.frames) {
      out.push({ tp, pageIndex: p });
    }
  }
  out.sort((a, b) => a.tp.filename.localeCompare(b.tp.filename));
  return out;
}

// ─── GL Helpers ─────────────────────────────────────────────────────────────

const VERT = `
precision highp float;
attribute vec2 a_pos;
uniform vec4 u_dest;
uniform vec2 u_res;
varying vec2 v_uv;

void main() {
  v_uv = a_pos;
  vec2 px = u_dest.xy + a_pos * u_dest.zw;
  vec2 ndc = (px / u_res) * 2.0 - 1.0;
  ndc.y = -ndc.y;
  gl_Position = vec4(ndc, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_tex;
uniform vec4 u_src;
uniform int u_rot;

void main() {
  vec2 uv;
  if (u_rot == 1) {
    uv = vec2(
      mix(u_src.z, u_src.x, v_uv.y),
      mix(u_src.y, u_src.w, v_uv.x)
    );
  } else {
    uv = vec2(
      mix(u_src.x, u_src.z, v_uv.x),
      mix(u_src.y, u_src.w, v_uv.y)
    );
  }
  gl_FragColor = texture2D(u_tex, uv);
}
`;

function compileShader(
  gl: ExpoWebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, source);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error(`Shader compile failed: ${log}`);
  }
  return s;
}

function linkProgram(gl: ExpoWebGLRenderingContext): WebGLProgram {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(prog);
    gl.deleteProgram(prog);
    throw new Error(`Program link failed: ${log}`);
  }
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return prog;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function SpriteAnimation({
  source,
  fps = 24,
  loop = true,
  style,
}: SpriteAnimationProps) {
  if (!source.length) {
    throw new Error('SpriteAnimation: `source` must be a non-empty atlas page array');
  }

  const pages = source;
  const frames = useMemo(() => resolveFrames(pages), [pages]);
  const sourceSize = frames[0].tp.sourceSize;
  const totalFrames = frames.length;

  const loopFrom = typeof loop === 'object' ? (loop.from ?? 0) : 0;
  const loopTo =
    typeof loop === 'object' ? (loop.to ?? totalFrames - 1) : totalFrames - 1;
  const loopCount =
    loop === false
      ? 1
      : typeof loop === 'object'
        ? (loop.count ?? Infinity)
        : Infinity;

  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  const onContextCreate = useCallback(
    async (gl: ExpoWebGLRenderingContext) => {
      const prog = linkProgram(gl);
      gl.useProgram(prog);

      const aPos = gl.getAttribLocation(prog, 'a_pos');
      const uDest = gl.getUniformLocation(prog, 'u_dest');
      const uRes = gl.getUniformLocation(prog, 'u_res');
      const uSrc = gl.getUniformLocation(prog, 'u_src');
      const uTex = gl.getUniformLocation(prog, 'u_tex');
      const uRot = gl.getUniformLocation(prog, 'u_rot');

      // Unit-quad (two triangles, 6 vertices)
      const buf = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]),
        gl.STATIC_DRAW,
      );
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      // Pre-load every atlas page into its own GPU texture
      const textures: WebGLTexture[] = [];
      for (const page of pages) {
        textures.push(
          await loadAtlasPageTexture(gl, page.ktx2, page.pngFallback),
        );
      }

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.disable(gl.DEPTH_TEST);
      gl.activeTexture(gl.TEXTURE0);
      gl.uniform1i(uTex, 0);

      // ── render loop (no React state, pure GL) ───────────────────────
      let idx = loopFrom;
      let iters = 0;
      let running = true;
      let prev = 0;
      const ms = 1000 / fps;

      const tick = (now: number) => {
        if (!aliveRef.current || !running) return;
        requestAnimationFrame(tick);

        if (prev === 0) {
          prev = now;
        } else if (now - prev >= ms) {
          prev += ms * Math.floor((now - prev) / ms);
          idx++;
          if (idx > loopTo) {
            iters++;
            if (iters >= loopCount) {
              running = false;
              idx = loopTo;
            } else {
              idx = loopFrom;
            }
          }
        }

        const { tp, pageIndex } = frames[idx] ?? frames[0];
        const { frame: fr, rotated, spriteSourceSize: ss } = tp;
        const as = pages[pageIndex].json.meta.size;

        const bw = gl.drawingBufferWidth;
        const bh = gl.drawingBufferHeight;
        const sc = Math.min(bw / sourceSize.w, bh / sourceSize.h);
        const ox = (bw - sourceSize.w * sc) / 2;
        const oy = (bh - sourceSize.h * sc) / 2;

        gl.viewport(0, 0, bw, bh);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.bindTexture(gl.TEXTURE_2D, textures[pageIndex]);

        gl.uniform2f(uRes, bw, bh);
        gl.uniform4f(
          uDest,
          ox + ss.x * sc,
          oy + ss.y * sc,
          ss.w * sc,
          ss.h * sc,
        );

        const aw = as.w;
        const ah = as.h;
        if (rotated) {
          gl.uniform4f(
            uSrc,
            fr.x / aw,
            fr.y / ah,
            (fr.x + fr.h) / aw,
            (fr.y + fr.w) / ah,
          );
          gl.uniform1i(uRot, 1);
        } else {
          gl.uniform4f(
            uSrc,
            fr.x / aw,
            fr.y / ah,
            (fr.x + fr.w) / aw,
            (fr.y + fr.h) / ah,
          );
          gl.uniform1i(uRot, 0);
        }

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.endFrameEXP();
      };

      requestAnimationFrame(tick);
    },
    // These deps are stable (derived from the registry at mount time)
    [pages, frames, sourceSize, fps, loopFrom, loopTo, loopCount],
  );

  return (
    <GLView
      style={[{ backgroundColor: 'transparent' }, style]}
      onContextCreate={onContextCreate}
    />
  );
}
