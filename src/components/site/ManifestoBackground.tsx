'use client';
import { useEffect, useRef } from 'react';

// Hand-tuned to echo the composition of the original manifesto-texture.jpg — sweeping
// diagonal light-trails, alternating crimson and grey, plus a couple of tighter accent
// curves on the right — rather than a literal trace of the source photo (canvas can't
// extract vector paths from a raster image; this recreates the same visual language).
type Curve = {
  points: [number, number][]; // control points as fractions of width/height
  color: 'crimson' | 'grey';
  width: number;
  glow: number;
  speed: number; // full draw-and-fade cycles per ms
  offset: number; // phase offset so curves don't all pulse in sync
};

const CURVES: Curve[] = [
  { points: [[0.02, 0.05], [0.35, 0.25], [0.55, 0.02], [0.95, 0.15]], color: 'crimson', width: 1.6, glow: 8, speed: 1 / 7000, offset: 0 },
  { points: [[0.0, 0.15], [0.2, 0.05], [0.3, 0.3], [0.55, 0.35]], color: 'grey', width: 1.2, glow: 5, speed: 1 / 8200, offset: 0.3 },
  { points: [[0.0, 0.45], [0.3, 0.35], [0.6, 0.55], [1.0, 0.4]], color: 'crimson', width: 2, glow: 10, speed: 1 / 9000, offset: 0.55 },
  { points: [[0.0, 0.65], [0.25, 0.55], [0.5, 0.75], [0.85, 0.6]], color: 'grey', width: 1.4, glow: 6, speed: 1 / 7600, offset: 0.15 },
  { points: [[0.05, 0.95], [0.35, 0.7], [0.65, 0.95], [1.0, 0.75]], color: 'crimson', width: 1.8, glow: 9, speed: 1 / 8600, offset: 0.7 },
  { points: [[0.85, 0.3], [0.9, 0.5], [0.92, 0.7], [0.9, 0.95]], color: 'crimson', width: 1.3, glow: 7, speed: 1 / 6800, offset: 0.4 },
  { points: [[0.9, 0.05], [0.95, 0.3], [1.0, 0.6], [0.95, 0.9]], color: 'grey', width: 1.1, glow: 5, speed: 1 / 7400, offset: 0.85 },
  { points: [[0.1, 0.02], [0.4, 0.15], [0.5, 0.4], [0.75, 0.5]], color: 'grey', width: 1.5, glow: 6, speed: 1 / 8900, offset: 0.6 },
  { points: [[0.15, 0.55], [0.4, 0.42], [0.55, 0.65], [0.8, 0.85]], color: 'crimson', width: 1.4, glow: 7, speed: 1 / 7800, offset: 0.1 },
  { points: [[0.3, 0.85], [0.5, 0.6], [0.7, 0.5], [0.98, 0.35]], color: 'grey', width: 1, glow: 4, speed: 1 / 9400, offset: 0.45 },
  { points: [[0.0, 0.3], [0.15, 0.4], [0.35, 0.15], [0.6, 0.08]], color: 'crimson', width: 1.2, glow: 6, speed: 1 / 8000, offset: 0.9 },
];

const COLORS = {
  crimson: { core: '231,60,60', glow: '196,30,30' },
  grey: { core: '200,200,200', glow: '160,160,160' },
};

function bezierPoint(pts: [number, number][], t: number): [number, number] {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = pts;
  const u = 1 - t;
  const x = u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3;
  const y = u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3;
  return [x, y];
}

// Ease so the "spreading" reads as a deliberate sweep rather than linear motion
function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

export default function ManifestoBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context2d = canvas.getContext('2d');
    if (!context2d) return;
    const ctx = context2d; // rebind so the null-check narrowing survives into closures below

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Touch devices skew toward weaker GPUs, and shadowBlur (used for the glow pass below)
    // is one of the most expensive things you can ask a <canvas> to do per frame — halving
    // particle count, capping DPR lower, and dropping the glow pass entirely keeps this at
    // a real 60fps on mid-range phones instead of quietly dropping frames.
    const isMobile = window.matchMedia('(pointer: coarse)').matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Fewer simultaneous curves on mobile — direct reduction in per-frame draw calls,
    // and a narrower viewport has less area for ten overlapping sweeps to read clearly anyway.
    const activeCurves = isMobile ? CURVES.slice(0, 6) : CURVES;

    const particleCount = isMobile ? 70 : 160;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.4 + 0.3,
      isRed: Math.random() < 0.35,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.0012 + 0.0006,
      baseAlpha: Math.random() * 0.5 + 0.15,
    }));

    function drawCurve(ctx: CanvasRenderingContext2D, curve: Curve, time: number, isMobile: boolean) {
      const cyclePos = ((time * curve.speed + curve.offset) % 1 + 1) % 1;
      // Draw phase (0 -> 0.6 of the cycle): the line sweeps in. Hold briefly, then
      // fade phase (0.8 -> 1): it dissolves before the next sweep begins.
      const drawT = Math.min(1, cyclePos / 0.6);
      const progress = easeInOutSine(drawT);
      if (progress <= 0.002) return;

      const fadeStart = 0.8;
      const opacity = cyclePos < fadeStart ? 1 : 1 - (cyclePos - fadeStart) / (1 - fadeStart);
      if (opacity <= 0.01) return;

      const steps = 60;
      const upTo = Math.max(1, Math.floor(steps * progress));
      const pts = curve.points.map(([x, y]) => [x * width, y * height] as [number, number]);
      const c = COLORS[curve.color];

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Soft outer glow pass — shadowBlur is one of the priciest things a canvas can do
      // per frame, so mobile trades it for a plain wider translucent stroke instead of
      // skipping the glow look entirely.
      ctx.beginPath();
      for (let i = 0; i <= upTo; i++) {
        const [x, y] = bezierPoint(pts, i / steps);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(${c.glow},${opacity * 0.35})`;
      ctx.lineWidth = curve.width + curve.glow;
      if (!isMobile) {
        ctx.shadowColor = `rgba(${c.glow},${opacity * 0.6})`;
        ctx.shadowBlur = curve.glow * 2;
      }
      ctx.stroke();

      // Bright core pass
      ctx.beginPath();
      for (let i = 0; i <= upTo; i++) {
        const [x, y] = bezierPoint(pts, i / steps);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(${c.core},${opacity * 0.85})`;
      ctx.lineWidth = curve.width;
      ctx.stroke();
      ctx.restore();
    }

    function drawParticles(ctx: CanvasRenderingContext2D, time: number) {
      for (const p of particles) {
        const twinkle = 0.5 + 0.5 * Math.sin(time * p.speed + p.phase);
        const alpha = p.baseAlpha * twinkle;
        const rgb = p.isRed ? '231,80,80' : '210,210,210';
        ctx.beginPath();
        ctx.fillStyle = `rgba(${rgb},${alpha})`;
        ctx.arc(p.x * width, p.y * height, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    let raf: number;
    function render(time: number) {
      ctx!.clearRect(0, 0, width, height);
      drawParticles(ctx, time);
      for (const curve of activeCurves) drawCurve(ctx, curve, time, isMobile);
      raf = requestAnimationFrame(render);
    }

    if (prefersReducedMotion) {
      // Single still frame — every curve fully drawn, no motion, particles at rest.
      ctx.clearRect(0, 0, width, height);
      drawParticles(ctx, 0);
      for (const curve of activeCurves) drawCurve(ctx, { ...curve, offset: 0.3 }, 4000, isMobile);
    } else {
      raf = requestAnimationFrame(render);
    }

    return () => {
      window.removeEventListener('resize', resize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}
