import { useEffect, useRef } from 'react';
import { FRAGMENT_SHADER, VERTEX_SHADER } from './shader';

// One fixed canvas behind the hero, the fall and the services section (it sits at z-index -1, so every section with a
// background covers it). The page scrolls normally: where you are on the page only decides what the shader draws.
// It fades out and stops drawing entirely once the services section has gone, so the rest of the site costs nothing.
//
// Elements it reads by id: #home (hero), #fall, #why-us (services).
// No WebGL2, software rendering, a GPU error or a lost context: it renders nothing and sets data-journey="off" on <html>,
// and the hero shows a recorded loop of the same scene (Hero.tsx FallbackVideo) over a still poster (index.css).

type Uniforms = Record<string, WebGLUniformLocation | null>;
const UNIFORMS = ['uRes', 'uTime', 'uMouse', 'uWell', 'uIntro', 'uTravel', 'uShock', 'uShockPos', 'uJourney', 'uDrift'];
const SCALE_LIMITS: [number, number] = [0.45, 0.8]; // share of the screen's pixels drawn; lowered automatically on slow devices

export default function JourneyCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Start after the first paint, when the browser is idle: the page (and the main content Google measures) appears
    // first, and the background fades in under the site's own 0.7s entrance fade.
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      try { cleanup = init(); } catch (err) {
        console.warn('Journey background failed to start; showing the recorded loop.', err);
        document.documentElement.setAttribute('data-journey', 'off');
        document.documentElement.setAttribute('data-journey-why', 'error');
      }
    };
    const hasIdle = 'requestIdleCallback' in window;
    const handle = hasIdle ? window.requestIdleCallback(run, { timeout: 700 }) : window.setTimeout(run, 250);
    return () => {
      cancelled = true;
      if (hasIdle) window.cancelIdleCallback(handle); else window.clearTimeout(handle);
      cleanup?.();
    };
  }, []);

  // Builds the GL program and runs the scene. Returns its clean-up.
  function init(): (() => void) | undefined {
    const cv = ref.current;
    const hero = document.getElementById('home');
    const fall = document.getElementById('fall');
    const services = document.getElementById('why-us');
    if (!cv || !hero || !fall || !services) return undefined;

    const off = (why: string) => {
      document.documentElement.setAttribute('data-journey', 'off');
      document.documentElement.setAttribute('data-journey-why', why); // for diagnosing a device that shows the loop instead
    };
    const gl = cv.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance' });
    if (!gl) { off('no-webgl2'); return undefined; }
    // Software rendering (hardware acceleration off, or no usable GPU) runs this scene far too slowly: use the recorded loop.
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
    if (/swiftshader|llvmpipe|softpipe|software|microsoft basic render/i.test(renderer)) { off('software-renderer'); return undefined; }
    // If the GPU resets mid-visit (it happens on laptops), the canvas goes blank: switch to the loop instead of a dead background.
    cv.addEventListener('webglcontextlost', (e) => { e.preventDefault(); stopDrawing(); off('context-lost'); });

    const u: Uniforms = {};
    const program = gl.createProgram()!;
    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(vs, VERTEX_SHADER);
    gl.shaderSource(fs, FRAGMENT_SHADER);
    gl.compileShader(vs);
    gl.compileShader(fs);
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    // Where supported, the GPU compiles in the background: poll instead of blocking the main thread on the result.
    const parallel = gl.getExtension('KHR_parallel_shader_compile') as { COMPLETION_STATUS_KHR: number } | null;
    const ready = () => !parallel || gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR);
    const fail = (why: unknown, tag = 'gpu-error') => { console.warn('Journey background unavailable; showing the recorded loop.', why); stopDrawing(); off(tag); };
    const finishSetup = (): boolean => {
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        fail(gl.getShaderInfoLog(fs) || gl.getShaderInfoLog(vs) || gl.getProgramInfoLog(program));
        return false;
      }
      gl.useProgram(program);
      gl.bindVertexArray(gl.createVertexArray());
      for (const n of UNIFORMS) u[n] = gl.getUniformLocation(program, n);
      document.documentElement.setAttribute('data-journey', 'on');
      return true;
    };

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let scale = 0.75;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * scale;
      const w = Math.max(2, Math.round(cv.clientWidth * dpr));
      const h = Math.max(2, Math.round(cv.clientHeight * dpr));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
    };
    resize();

    // ---- state
    let t0 = performance.now();
    const well = { x: 0.64, y: 0.52, tx: 0.64, ty: 0.52 };
    const mouse = { x: 0.5, tx: 0.5 };
    let pointerKind = '';
    let pointerInside = false;
    let lastPointer = -1e9;
    let shockStart = -1e9;
    let shockPos: [number, number] = [0.5, 0.5];
    let travel = 0;
    let lastFrame = 0;
    let journey = 0;
    let live = true;
    let raf = 0;
    const frames: number[] = [];
    let lastAdapt = 0;
    let slowChecks = 0;
    const stopDrawing = () => { live = false; cancelAnimationFrame(raf); raf = 0; };

    const draw = (now: number) => {
      const fdt = Math.min(64, now - (lastFrame || now)) / 1000;
      if (lastFrame) { frames.push(now - lastFrame); if (frames.length > 40) frames.shift(); }
      lastFrame = now;
      const secs = (now - t0) / 1000;
      // the well follows the pointer; with no pointer (phones, or before the mouse moves) it drifts on its own
      const idle = lastPointer < 0 || !pointerInside || (pointerKind !== 'mouse' && now - lastPointer > 3000);
      if (idle) {
        const narrow = cv.clientWidth < 760; // on phones keep it in the empty space above the headline
        well.tx = narrow ? 0.55 + 0.25 * Math.sin(secs * 0.21) : 0.64 + 0.17 * Math.sin(secs * 0.21);
        well.ty = narrow ? 0.76 + 0.08 * Math.sin(secs * 0.33 + 1.3) : 0.52 + 0.15 * Math.sin(secs * 0.33 + 1.3);
      }
      const k = reduced ? 1 : 1 - Math.exp(-fdt * 3.2);
      well.x += (well.tx - well.x) * k;
      well.y += (well.ty - well.y) * k;
      mouse.x += (mouse.tx - mouse.x) * (reduced ? 1 : 0.06);
      travel += fdt * (1 + Math.min(1, journey * 2.4) * 9);
      const intro = reduced ? 1 : Math.min(1, secs / 2.6);

      gl.uniform2f(u.uRes, cv.width, cv.height);
      gl.uniform1f(u.uTime, reduced ? 4 : secs);
      gl.uniform2f(u.uMouse, mouse.x, 0.5);
      gl.uniform2f(u.uWell, well.x, well.y);
      gl.uniform1f(u.uIntro, 1 - Math.pow(1 - intro, 3));
      gl.uniform1f(u.uTravel, reduced ? 4 : travel);
      gl.uniform1f(u.uShock, reduced ? 9 : ((now - shockStart) / 1000) * 0.9);
      gl.uniform2f(u.uShockPos, shockPos[0], shockPos[1]);
      gl.uniform1f(u.uJourney, journey);
      gl.uniform1f(u.uDrift, (reduced ? 0 : secs * 0.12) + window.scrollY / window.innerHeight * 0.9);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // adaptive quality: if frames run slow, draw fewer pixels so scrolling stays smooth
      if (!reduced && frames.length >= 30 && now - lastAdapt > 1200) {
        const avg = frames.reduce((a, b) => a + b, 0) / frames.length;
        lastAdapt = now;
        // already at the lowest quality and still under ~14 fps, twice running: the recorded loop is smoother than this
        slowChecks = avg > 70 && scale <= SCALE_LIMITS[0] ? slowChecks + 1 : 0;
        if (slowChecks >= 2) { fail(`${Math.round(1000 / avg)} fps at lowest quality`, 'too-slow'); return; }
        if (avg > 24 && scale > SCALE_LIMITS[0]) { scale = Math.max(SCALE_LIMITS[0], scale - 0.1); resize(); frames.length = 0; }
        else if (avg < 14 && scale < SCALE_LIMITS[1]) { scale = Math.min(SCALE_LIMITS[1], scale + 0.05); resize(); frames.length = 0; }
      }
    };

    const loop = (now: number) => {
      raf = 0;
      if (!live || document.hidden) return;
      draw(now);
      if (!reduced) raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf && live && !document.hidden) {
        lastFrame = 0;
        raf = requestAnimationFrame(loop);
      }
    };

    // ---- where we are on the page drives the scene (no scroll hijacking)
    const onScroll = () => {
      const vh = window.innerHeight;
      journey = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight + fall.offsetHeight * 0.9)));
      // fade out over the last part of the services section, then stop drawing completely
      const bottom = services.getBoundingClientRect().bottom;
      const fade = Math.min(1, Math.max(0, bottom / (vh * 0.6)));
      cv.style.opacity = fade.toFixed(3);
      const wasLive = live;
      live = fade > 0;
      cv.style.visibility = live ? 'visible' : 'hidden';
      if (live && reduced) requestAnimationFrame(draw); // reduced motion: one still frame per scroll position
      else if (live && !wasLive) start();
    };

    const onPointerMove = (e: PointerEvent) => {
      lastPointer = performance.now();
      pointerKind = e.pointerType;
      pointerInside = true;
      well.tx = e.clientX / window.innerWidth;
      well.ty = 1 - e.clientY / window.innerHeight;
      mouse.tx = e.clientX / window.innerWidth;
    };
    const onPointerDown = (e: PointerEvent) => {
      pointerKind = e.pointerType;
      pointerInside = true;
      const target = e.target as Element | null;
      if (!live || target?.closest('a,button,input,textarea,select,label,summary,[role="button"],li')) return;
      if (services.getBoundingClientRect().bottom < 0) return;
      shockPos = [e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight];
      shockStart = performance.now();
      lastPointer = shockStart;
      well.tx = shockPos[0];
      well.ty = shockPos[1];
    };
    const onLeave = () => { pointerInside = false; };
    const onVisibility = () => { if (!document.hidden) start(); };
    const onResize = () => { resize(); onScroll(); if (reduced) requestAnimationFrame(draw); };

    let poll = 0;
    let running = false;
    const begin = () => {
      if (!finishSetup()) return;
      running = true;
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerdown', onPointerDown, { passive: true });
      document.documentElement.addEventListener('pointerleave', onLeave);
      document.addEventListener('visibilitychange', onVisibility);
      window.addEventListener('resize', onResize);
      t0 = performance.now(); // the ignition plays from when the scene first appears
      onScroll();
      if (reduced) requestAnimationFrame(draw);
      else start();
    };
    // A driver that never finishes compiling this shader (some Windows graphics drivers) must not leave the hero empty.
    const giveUp = window.setTimeout(() => { if (!running) { cancelAnimationFrame(poll); fail('shader still compiling after 6s', 'compile-timeout'); } }, 6000);
    const waitForCompile = () => { poll = 0; if (ready()) { clearTimeout(giveUp); begin(); } else poll = requestAnimationFrame(waitForCompile); };
    waitForCompile();

    return () => {
      clearTimeout(giveUp);
      cancelAnimationFrame(poll);
      cancelAnimationFrame(raf);
      if (!running) { gl.getExtension('WEBGL_lose_context')?.loseContext(); return; }
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }

  return <canvas ref={ref} className="journey-canvas" aria-hidden="true" />;
}
