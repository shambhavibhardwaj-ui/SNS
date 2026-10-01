import { useEffect, useRef, type CSSProperties } from 'react';

/**
 * A drifting cloud sky, drawn on the GPU.
 *
 * Adapted from the Originkit component. Five things changed to make it belong
 * here rather than on a design canvas:
 *
 *  - The 1200×800 minimum size is gone. It is a canvas-tool artefact, and it
 *    would have forced the login page's grid column open on every phone.
 *  - Colours arrive as props with this project's palette as the defaults, so
 *    a sky cannot be dropped in that is not teal.
 *  - It stops for `prefers-reduced-motion`, painting one still frame instead
 *    of a loop, and pauses in a hidden tab rather than animating to nobody.
 *  - It is `aria-hidden` and pointer-transparent to everything except its own
 *    tracking, because it is scenery.
 *  - WebGL failure is not an error state: the wrapper keeps the background
 *    colour, so a machine without it sees a plain teal panel.
 *
 * The clouds are a signed-distance field of ellipse "puffs" on a hash grid,
 * eroded by fBm and shaded by how far up each puff you are — which is why they
 * are lit on top and heavy underneath without a light source being computed.
 */

const MAX_DPR = 2;

const PUFF_UP = 0.34;
const PUFF_DOWN = 0.19;
const ERODE = 0.7;
const SHADOW_STEP = 0.085;
const NEAR_CELL = 1.05;
const FAR_CELL = 2.15;
const FAR_MIX = 0.55;
const NEAR_DRIFT = 0.055;
const FAR_DRIFT = 0.026;
const CIRRUS_DRIFT = 0.014;
const PUFF_WMAX = 2.15;
const SHADE_BLEND = 12.0;

const VERT_SRC = `
attribute vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG_SRC = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uRes;
uniform float uNearX, uFarX, uCirrusX;
uniform float uCoverage, uSize, uSoftness, uShadow, uCirrus;
uniform vec3 uZenith, uHorizon, uCloud;
uniform vec4 uGlow;
uniform vec2 uSun;
uniform vec2 uParallax;

vec2 hash22(vec2 p){
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  q += dot(q, q.yzx + 33.33);
  return fract((q.xx + q.yz) * q.zy);
}

float hash12(vec2 p){
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float vnoise(vec2 x){
  vec2 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), f.x),
             mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), f.x), f.y);
}

float fbm(vec2 p){
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 4; i++){
    s += a * vnoise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return s;
}

vec2 blobs(vec2 uv, float seed){
  vec2 id = floor(uv), f = fract(uv);

  float best = -1e4;
  float wsum = 0.0, ysum = 0.0;
  float wMax = min(${PUFF_WMAX.toFixed(3)}, 0.72 * uSize);
  float reach = min(2.0, ceil(wMax + 0.85) - 1.0);
  for (int j = -2; j <= 2; j++){
    for (int i = -2; i <= 2; i++){
      vec2 o = vec2(float(i), float(j));
      if (max(abs(o.x), abs(o.y)) > reach) continue;
      vec2 h = hash22(id + o + seed);

      if (fract(h.x * 37.1) > uCoverage) continue;
      vec2 c = o + 0.15 + h * 0.7;
      float w = min(${PUFF_WMAX.toFixed(3)}, (0.30 + 0.42 * fract(h.y * 19.7)) * uSize);
      vec2 d = f - c;

      float ry = (d.y > 0.0 ? ${PUFF_UP.toFixed(3)} : ${PUFF_DOWN.toFixed(3)}) * uSize * (0.8 + 0.5 * fract(h.y * 7.3));
      float e = length(vec2(d.x / max(w, 1e-3), d.y / max(ry, 1e-3)));
      float val = 1.0 - e;
      float yN = d.y / max(ry, 1e-3);
      if (val > best){
        float k = exp(${SHADE_BLEND.toFixed(1)} * (best - val));
        wsum = wsum * k + 1.0;
        ysum = ysum * k + yN;
        best = val;
      } else {
        float g = exp(${SHADE_BLEND.toFixed(1)} * (val - best));
        wsum += g;
        ysum += g * yN;
      }
    }
  }
  return vec2(best, ysum / max(wsum, 1e-4));
}

vec2 cloudField(vec2 uv, float seed, float detailScale){
  vec2 b = blobs(uv, seed);

  float n = fbm(uv * detailScale + seed * 3.1) * 0.72
          + fbm(uv * detailScale * 3.3 + seed * 7.7) * 0.28;
  return vec2(b.x - (1.0 - n) * ${ERODE.toFixed(3)}, b.y);
}

vec3 shadeCloud(float dyNorm, vec3 sky){
  float t = smoothstep(-0.95, 0.25, dyNorm);
  vec3 base = mix(uCloud * 0.52, sky, 0.34);
  return mix(mix(uCloud, base, uShadow), uCloud, t);
}

void main(){
  vec2 frag = gl_FragCoord.xy / max(uRes.y, 1.0);
  float aspect = uRes.x / max(uRes.y, 1.0);
  vec2 p = vec2(frag.x, frag.y);

  vec3 sky = mix(uHorizon, uZenith, smoothstep(-0.15, 1.05, p.y));
  vec2 sunP = vec2(uSun.x * aspect, uSun.y);
  float sd = length(p - sunP);

  sky += uGlow.rgb * uGlow.a * exp(-sd * 3.4) * 0.30;

  vec3 col = sky;

  if (uCirrus > 0.0) {
    vec2 cuv = vec2(p.x * 1.4 + uCirrusX, p.y * 5.5);
    float veil = fbm(cuv) * fbm(cuv * 2.3 + 9.0);
    veil = smoothstep(0.24, 0.55, veil) * smoothstep(0.15, 0.7, p.y);
    col = mix(col, uCloud, veil * uCirrus * 0.5);
  }

  vec2 fuv = vec2(p.x + uFarX, p.y) * ${FAR_CELL.toFixed(3)} + uParallax * 0.4;
  vec2 fd = cloudField(fuv, 17.0, 11.0);
  float fa = clamp(fd.x * uSoftness, 0.0, 1.0);
  if (fa > 0.0) {
    vec3 lit = shadeCloud(fd.y, sky);

    col = mix(col, mix(lit, sky, ${FAR_MIX.toFixed(3)}), fa);
  }

  vec2 nuv = vec2(p.x + uNearX, p.y) * ${NEAR_CELL.toFixed(3)} + uParallax;
  vec2 nd = cloudField(nuv, 3.0, 8.5);
  float na = clamp(nd.x * uSoftness, 0.0, 1.0);
  if (na > 0.0) {
    vec3 lit = shadeCloud(nd.y, sky);

    float above = clamp(cloudField(nuv + vec2(0.0, ${SHADOW_STEP.toFixed(3)}), 3.0, 8.5).x * uSoftness, 0.0, 1.0);
    lit *= 1.0 - 0.18 * uShadow * above;

    lit += uGlow.rgb * uGlow.a * 0.22 * exp(-length(p - sunP) * 1.6);
    col = mix(col, lit, na);
  }

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('CloudSky shader:', gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

type RGBA = [number, number, number, number];

/** Hex or rgb()/rgba() to normalised floats, falling back rather than throwing. */
function parseColor(input: string | undefined, fb: RGBA): RGBA {
  if (!input) return fb;
  const str = String(input).trim();
  if (str.charAt(0) === '#') {
    let hex = str.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      hex =
        hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + (hex.length === 4 ? hex[3] + hex[3] : '');
    }
    if (hex.length >= 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const a = hex.length >= 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return [r / 255, g / 255, b / 255, a];
    }
    return fb;
  }
  const m = str.match(/[\d.]+/g);
  if (m && m.length >= 3) {
    return [
      Math.min(255, parseFloat(m[0])) / 255,
      Math.min(255, parseFloat(m[1])) / 255,
      Math.min(255, parseFloat(m[2])) / 255,
      m.length >= 4 ? Math.min(1, parseFloat(m[3])) : 1,
    ];
  }
  return fb;
}

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

export interface CloudSkyProps {
  className?: string;
  style?: CSSProperties;
  /** Top of the sky. */
  background?: string;
  /** Bottom of the sky, where it meets the horizon. */
  baseColor?: string;
  /** The clouds themselves. */
  accentColor?: string;
  /** How much of the grid grows a puff, 0–100. */
  density?: number;
  /** Drift rate, 0–100. */
  speed?: number;
  /** Puff size, 20–300. */
  size?: number;
  clouds?: { softness?: number; shadow?: number; cirrus?: number };
  sun?: { x?: number; y?: number; glow?: string };
  pointer?: { parallax?: number; wind?: number; damping?: number };
}

/* House defaults: deep teal sky, butter-warmed cloud, sun low and to the
   right so the light falls across the panel the way the city's does. */
const CLOUD_DEFAULTS = { softness: 170, shadow: 80, cirrus: 70 };
const SUN_DEFAULTS = { x: 84, y: 16, glow: 'rgba(255, 248, 181, 0.85)' };
const POINTER_DEFAULTS = { parallax: 140, wind: 120, damping: 24 };

type Settings = {
  zenith: string; horizon: string; cloud: string; glow: string;
  coverage: number; speed: number; size: number; softness: number;
  shadow: number; cirrus: number; sunX: number; sunY: number;
  parallax: number; wind: number; damping: number;
};

export function CloudSky({
  className,
  style,
  background = '#04302F',
  baseColor = '#0E8480',
  accentColor = '#FFFDF4',
  density = 62,
  speed = 46,
  size = 128,
  clouds,
  sun,
  pointer,
}: CloudSkyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /*
   * Live settings go through a ref, not the effect's dependency list. The
   * render loop reads them every frame, so a changed colour takes effect on
   * the next frame — without tearing down the GL context, recompiling both
   * shaders and losing the clouds' drift position to do it.
   */
  const v = useRef<Settings | null>(null);

  const c = { ...CLOUD_DEFAULTS, ...clouds };
  const sn = { ...SUN_DEFAULTS, ...sun };
  const pt = { ...POINTER_DEFAULTS, ...pointer };

  const settings = {
    zenith: background,
    horizon: baseColor,
    cloud: accentColor,
    glow: sn.glow,
    coverage: clamp(density, 0, 100) / 100,
    speed: clamp(speed, 0, 100) / 50,
    size: clamp(size, 20, 300) / 100,
    /* Inverted: a *softer* cloud needs a smaller multiplier on the field, so
       the edge takes longer to reach full opacity. */
    softness: 4.5 / Math.max(0.15, clamp(c.softness, 20, 300) / 100),
    shadow: clamp(c.shadow, 0, 200) / 100,
    cirrus: clamp(c.cirrus, 0, 100) / 100,
    sunX: clamp(sn.x, 0, 100) / 100,
    sunY: clamp(sn.y, 0, 100) / 100,
    parallax: clamp(pt.parallax, 0, 300) / 100,
    wind: clamp(pt.wind, 0, 300) / 100,
    damping: clamp(pt.damping, 1, 100),
  };

  /* Written in an effect rather than during render: the loop reads this one
     frame later, which for a drifting sky is not a difference anyone can see,
     and a ref assigned mid-render is a render with a side effect. */
  useEffect(() => {
    v.current = settings;
  });

  const ptr = useRef({ x: 0, y: 0, inside: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false });
    /* Not an error worth shouting about: the wrapper is already the sky
       colour, so no WebGL means a plain teal panel. */
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT_SRC);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('CloudSky link:', gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    /* One oversized triangle rather than two: it covers the clip volume with
       no seam down the diagonal. */
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const locs: Record<string, WebGLUniformLocation | null> = {};
    const u = (name: string) => {
      if (!(name in locs)) locs[name] = gl.getUniformLocation(prog, name);
      return locs[name];
    };

    const calm = window.matchMedia('(prefers-reduced-motion: reduce)');

    let raf = 0;
    let last = performance.now();
    let nearX = 0;
    let farX = 0;
    let cirrusX = 0;
    let leanX = 0;
    let leanY = 0;

    /* `loop` false paints a single frame and schedules nothing — see `start`. */
    const draw = (now: number, loop = true) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = v.current;
      const p = ptr.current;
      /* The first frame can land before the settings effect has run. */
      if (!s) {
        if (loop) raf = requestAnimationFrame(draw);
        return;
      }

      /* Still for anyone who asked for less motion: the sky is painted once
         and the pointer stops moving it. A drifting background is exactly the
         kind of thing that setting is for. */
      if (!calm.matches) {
        const k = 1 - Math.exp(-s.damping * 0.12 * dt);
        leanX += ((p.inside ? p.x : 0) - leanX) * k;
        leanY += ((p.inside ? p.y : 0) - leanY) * k;

        const gust = 1 + leanX * s.wind;
        const rate = s.speed * gust;
        nearX = (nearX - NEAR_DRIFT * rate * dt) % 1000;
        farX = (farX - FAR_DRIFT * rate * dt) % 1000;
        cirrusX = (cirrusX - CIRRUS_DRIFT * rate * dt) % 1000;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const cw = canvas.clientWidth || 1;
      const ch = canvas.clientHeight || 1;
      const bw = Math.max(1, Math.round(cw * dpr));
      const bh = Math.max(1, Math.round(ch * dpr));
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
      }
      gl.viewport(0, 0, bw, bh);

      const zen = parseColor(s.zenith, [0.016, 0.188, 0.184, 1]);
      const hor = parseColor(s.horizon, [0.055, 0.518, 0.502, 1]);
      const cld = parseColor(s.cloud, [1, 1, 1, 1]);
      const glow = parseColor(s.glow, [1, 0.973, 0.71, 0.85]);

      gl.uniform2f(u('uRes'), bw, bh);
      gl.uniform1f(u('uNearX'), nearX);
      gl.uniform1f(u('uFarX'), farX);
      gl.uniform1f(u('uCirrusX'), cirrusX);
      gl.uniform1f(u('uCoverage'), s.coverage);
      gl.uniform1f(u('uSize'), s.size);
      gl.uniform1f(u('uSoftness'), s.softness);
      gl.uniform1f(u('uShadow'), s.shadow);
      gl.uniform1f(u('uCirrus'), s.cirrus);
      gl.uniform2f(u('uSun'), s.sunX, s.sunY);
      gl.uniform2f(u('uParallax'), -leanX * s.parallax * 0.07, -leanY * s.parallax * 0.05);
      gl.uniform3f(u('uZenith'), zen[0], zen[1], zen[2]);
      gl.uniform3f(u('uHorizon'), hor[0], hor[1], hor[2]);
      gl.uniform3f(u('uCloud'), cld[0], cld[1], cld[2]);
      gl.uniform4f(u('uGlow'), glow[0], glow[1], glow[2], glow[3]);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (loop) raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (raf) return;
      last = performance.now();
      /*
       * Paint once even when we are about to stay paused.
       *
       * Mounting into a hidden tab used to leave the canvas at its default
       * 300×150 and never draw, so switching to the tab showed a blank panel
       * until something else woke the loop. One frame costs nothing and means
       * there is always a sky there.
       */
      if (document.hidden) {
        draw(last, false);
        return;
      }
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    /* A hidden tab gets no frames after that first one. Browsers throttle rAF
       there anyway, but not reliably to zero, and this is a fragment shader
       run per pixel. */
    const onVisibility = () => (document.hidden ? stop() : start());

    const track = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      ptr.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ptr.current.y = 1 - ((e.clientY - r.top) / r.height) * 2;
      ptr.current.inside = true;
    };
    const onLeave = () => {
      ptr.current.inside = false;
    };

    canvas.addEventListener('pointermove', track);
    canvas.addEventListener('pointerenter', track);
    canvas.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);
    start();

    return () => {
      stop();
      canvas.removeEventListener('pointermove', track);
      canvas.removeEventListener('pointerenter', track);
      canvas.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      /*
       * Deliberately NOT calling `WEBGL_lose_context.loseContext()` here.
       *
       * It looks like good hygiene, and it cost an afternoon: StrictMode runs
       * effects twice in development, `getContext` hands back the *same*
       * context object for a canvas, and this cleanup therefore killed the
       * context the second run was about to draw into — a permanently blank
       * panel, with a broken-image glyph where the sky should be.
       *
       * There is nothing to release by hand. The canvas element unmounts with
       * the component, and the context goes with it.
       */
    };
  }, []);

  return (
    <div
      className={className}
      aria-hidden="true"
      style={{ position: 'relative', overflow: 'hidden', background, isolation: 'isolate', ...style }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
