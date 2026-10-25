'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { ArrowUpRight, Lock } from 'lucide-react';
import { useIsTouch } from '../../hooks/useIsTouch';

const ease = [0.16, 1, 0.3, 1] as const;

// Each project plays a recording of its real site scrolling top to bottom and back (public/work/<slug>.mp4, 1200x750),
// with the first frame as its poster (public/work/<slug>.webp). Re-record them when a site changes noticeably.
const projects = [
  {
    name: 'Texture Lounge',
    type: 'Beauty & Hair · Edinburgh',
    url: 'https://texturelounge.co.uk',
    slug: 'texture-lounge',
    bg: '#1A0F14',
    glow: '232,98,40',
    year: '2026',
    tags: ['Booking System', 'CMS', 'SEO'],
  },
  {
    name: 'Trim2Fresh',
    type: 'Barbershop · Edinburgh',
    url: 'https://trim2fresh.co.uk',
    slug: 'trim2fresh',
    bg: '#0B0B0B',
    glow: '245,205,30',
    year: '2026',
    tags: ['Booking System', 'Branding', 'Reviews'],
  },
  {
    name: 'Kell Executive',
    type: 'Executive Chauffeur · Edinburgh',
    url: 'https://kellexecutive.com',
    slug: 'kell-executive',
    bg: '#0B0F14',
    glow: '86,140,70',
    year: '2026',
    tags: ['Branding', 'Tour Pages', 'Gallery'],
  },
  {
    name: 'S2 Studio Cuts',
    type: 'Barbershop · Edinburgh',
    url: 'https://s2-studio-cuts.aliy20.workers.dev',
    slug: 's2-studio-cuts',
    bg: '#0A0A14',
    glow: '255,150,40',
    year: '2026',
    tags: ['Booking', 'Gallery', 'Branding'],
  },
];

export default function SelectedWork() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const reduceMotion = useReducedMotion();

  // Only one site plays at a time (two playing videos halve Chrome's frame rate): the card under the pointer, otherwise the
  // card nearest the middle of the track. Nothing plays while the section is off screen or for reduced-motion visitors.
  const [hovered, setHovered] = useState<number | null>(null);
  const [centred, setCentred] = useState(0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Horizontal position indicator for the track. A motion value so scroll updates
  // write straight to the compositor without re-rendering React. Seeded slightly
  // above zero so the crimson bar reads as an affordance before the first drag.
  const trackProgress = useMotionValue(0);
  const railScaleX = useTransform(trackProgress, [0, 1], [0.04, 1]);
  const onTrackScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    trackProgress.set(max > 0 ? el.scrollLeft / max : 0);
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDistance = Infinity;
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - mid);
      if (distance < bestDistance) { bestDistance = distance; best = i; }
    });
    setCentred(best);
  };

  const playingIndex = reduceMotion || !inView ? null : hovered ?? centred;

  return (
    <section id="work" ref={sectionRef} className="relative" style={{ padding: 'clamp(64px,8vw,112px) 0' }}>
      {/* Header */}
      <div
        className="flex items-end justify-between px-[clamp(20px,5vw,80px)] pb-12"
        style={{ borderBottom: '1px solid rgba(244,241,236,0.06)' }}
      >
        <div>
          <motion.div className="flex items-center gap-4 mb-4"
            initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="w-8 h-px gradient-bg" />
            <span className="font-body text-[11px] tracking-[0.3em] uppercase" style={{ color: 'rgba(244,241,236,0.6)' }}>
              Selected Work
            </span>
          </motion.div>
          <motion.div className="overflow-hidden"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
            <motion.h2 className="font-display italic"
              style={{ fontSize: 'clamp(2rem,5vw,5rem)', lineHeight: 0.92, letterSpacing: '-0.02em', color: '#F4F1EC' }}
              variants={{ hidden: { y: '110%' }, visible: { y: 0, transition: { duration: 0.9, ease } } }}>
              Projects we're <span className="gradient-text">proud of.</span>
            </motion.h2>
          </motion.div>
        </div>
        <span className="font-body text-xs hidden md:block" style={{ color: 'rgba(244,241,236,0.55)' }}>
          drag to explore →
        </span>
      </div>

      {/* Horizontal drag-scroll track */}
      {/* Leading padding on a horizontal scroll container is unreliable across browsers at
          scrollLeft:0 (it gets collapsed) — use explicit spacer flex items instead so the
          first/last card always sit with real breathing room, not flush against the edge. */}
      <div
        ref={trackRef}
        data-cursor="drag"
        className="relative flex gap-5 overflow-x-auto no-scrollbar"
        onScroll={onTrackScroll}
        style={{
          padding: '40px 0',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          cursor: 'grab',
        }}
        onMouseDown={(e) => {
          const el = trackRef.current;
          if (!el) return;
          el.style.cursor = 'grabbing';
          const startX = e.pageX - el.offsetLeft;
          const scrollLeft = el.scrollLeft;
          const onMove = (ev: MouseEvent) => {
            const x = ev.pageX - el.offsetLeft;
            el.scrollLeft = scrollLeft - (x - startX);
          };
          const onUp = () => {
            el.style.cursor = 'grab';
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
          };
          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', onUp);
        }}
      >
        {/* scroll-snap-align:start is required here — without it, scroll-snap-type:mandatory
            on the track has no valid snap point at scrollLeft:0 (only the cards below have
            scroll-snap-align), so the browser snaps straight past this spacer to the first
            card on load, silently defeating the whole point of it. */}
        <div aria-hidden className="flex-shrink-0" style={{ width: 'clamp(20px,5vw,80px)', scrollSnapAlign: 'start' }} />
        {projects.map((project, i) => (
          <ProjectCard
            key={project.slug}
            project={project}
            index={i}
            playing={playingIndex === i}
            onHover={(on) => setHovered(on ? i : null)}
            cardRef={(el) => { cardRefs.current[i] = el; }}
          />
        ))}
        <div aria-hidden className="flex-shrink-0" style={{ width: 'clamp(20px,5vw,80px)', scrollSnapAlign: 'end' }} />
      </div>

      {/* Track position indicator — scrubbed by the user's own drag/scroll */}
      <div aria-hidden className="mx-[clamp(20px,5vw,80px)] h-px overflow-hidden"
        style={{ background: 'rgba(244,241,236,0.07)' }}>
        <motion.div className="h-full origin-left"
          style={{ scaleX: railScaleX, background: 'linear-gradient(to right, #8B1010, #C41E1E)' }} />
      </div>
    </section>
  );
}

type ProjectCardProps = {
  project: (typeof projects)[0];
  index: number;
  playing: boolean;
  onHover: (on: boolean) => void;
  cardRef: (el: HTMLElement | null) => void;
};

function ProjectCard({ project, index, playing, onHover, cardRef }: ProjectCardProps) {
  const isTouch = useIsTouch();
  const reduceMotion = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [armed, setArmed] = useState(false); // the video file is only requested once this card first plays
  const [ready, setReady] = useState(false); // and only shown once it is really playing, so the poster never flashes
  const host = project.url.replace(/^https?:\/\//, '');

  useEffect(() => { if (playing) setArmed(true); }, [playing]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !armed) return;
    if (playing) video.play().catch(() => {}); // blocked autoplay just leaves the poster showing
    else video.pause();
  }, [playing, armed]);

  // Playback progress as a thin line under the page, read each frame while playing (compositor-only: scaleX).
  const progress = useMotionValue(0);
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      const v = videoRef.current;
      if (v && v.duration) progress.set(v.currentTime / v.duration);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, progress]);

  // Desktop only: the browser window tips towards the pointer on a spring, and a soft sheen slides across it.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 140, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 140, damping: 18, mass: 0.6 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-7, 7]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [5, -5]);
  const sheenX = useTransform(sx, [-0.5, 0.5], [-160, 160]);

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || reduceMotion) return;
    const r = frameRef.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <motion.a
      ref={cardRef}
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="view"
      aria-label={`${project.name} — open the live website`}
      className="group relative flex-shrink-0 cursor-pointer"
      style={{ width: 'clamp(300px,78vw,820px)', scrollSnapAlign: 'start' }}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') onHover(true); }}
      onPointerLeave={() => { onHover(false); mx.set(0); my.set(0); }}
      onPointerMove={onPointerMove}
    >
      <div className="relative" style={{ perspective: 1400 }}>
        {/* the site's own colour, glowing behind the window while it plays */}
        <div
          aria-hidden
          className="absolute -inset-6 pointer-events-none"
          style={{
            background: `radial-gradient(60% 55% at 50% 50%, rgba(${project.glow},0.34), transparent 70%)`,
            opacity: playing ? 1 : 0,
            transition: 'opacity 300ms cubic-bezier(0.23, 1, 0.32, 1)',
            filter: 'blur(28px)',
          }}
        />

        <motion.div
          ref={frameRef}
          className="relative overflow-hidden rounded-xl"
          style={{
            rotateX: isTouch || reduceMotion ? 0 : rotateX,
            rotateY: isTouch || reduceMotion ? 0 : rotateY,
            transformStyle: 'preserve-3d',
            background: project.bg,
            border: '1px solid rgba(244,241,236,0.12)',
            boxShadow: '0 40px 80px -30px rgba(0,0,0,0.85), 0 0 0 1px rgba(0,0,0,0.4)',
          }}
        >
          {/* browser chrome */}
          <div className="relative z-20 flex items-center gap-3 px-4" style={{ height: 36, background: '#141416', borderBottom: '1px solid rgba(244,241,236,0.08)' }}>
            <div className="flex gap-1.5" aria-hidden>
              <span className="block h-2.5 w-2.5 rounded-full" style={{ background: 'rgba(244,241,236,0.2)' }} />
              <span className="block h-2.5 w-2.5 rounded-full" style={{ background: 'rgba(244,241,236,0.2)' }} />
              <span className="block h-2.5 w-2.5 rounded-full" style={{ background: 'rgba(244,241,236,0.2)' }} />
            </div>
            <div className="mx-auto flex min-w-0 items-center gap-1.5 rounded-md px-3" style={{ height: 22, background: 'rgba(244,241,236,0.07)', maxWidth: '70%' }}>
              <Lock size={10} aria-hidden style={{ color: 'rgba(244,241,236,0.6)', flexShrink: 0 }} />
              <span className="font-body truncate text-[12px]" style={{ color: 'rgba(244,241,236,0.72)' }}>{host}</span>
            </div>
            <div className="w-[42px]" aria-hidden />
          </div>

          {/* the real site: its first frame until it plays, then the recorded scroll-through */}
          <div className="relative" style={{ aspectRatio: '16 / 10', background: project.bg }}>
            <img
              src={`/work/${project.slug}.webp`}
              alt={`${project.name} website`}
              width={1200}
              height={750}
              draggable={false}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className="absolute inset-0 h-full w-full select-none"
              style={{ objectFit: 'cover', objectPosition: 'top center', userSelect: 'none' }}
            />
            <video
              ref={videoRef}
              src={armed ? `/work/${project.slug}.mp4` : undefined}
              muted
              loop
              playsInline
              preload="none"
              disablePictureInPicture
              disableRemotePlayback
              aria-hidden="true"
              tabIndex={-1}
              onPlaying={() => setReady(true)}
              className="absolute inset-0 h-full w-full"
              style={{ objectFit: 'cover', opacity: ready ? 1 : 0, transition: 'opacity 300ms cubic-bezier(0.23, 1, 0.32, 1)' }}
            />

            {/* a soft sheen that slides with the pointer */}
            {!isTouch && !reduceMotion && (
              <motion.div
                aria-hidden
                className="absolute inset-y-0 -inset-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100"
                style={{
                  x: sheenX,
                  background: 'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.07) 48%, rgba(255,255,255,0.0) 58%)',
                  transition: 'opacity 300ms cubic-bezier(0.23, 1, 0.32, 1)',
                }}
              />
            )}

            {/* playback progress */}
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-[2px]" style={{ background: 'rgba(244,241,236,0.08)', opacity: playing ? 1 : 0, transition: 'opacity 300ms ease-out' }}>
              <motion.div className="h-full origin-left" style={{ scaleX: progress, background: '#C41E1E' }} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Info */}
      <div className="mt-6 flex items-start justify-between gap-4 px-1">
        <div className="min-w-0">
          <p className="font-body mb-2 text-[12px] uppercase tracking-[0.22em]" style={{ color: 'rgba(244,241,236,0.62)' }}>
            <span style={{ color: 'rgba(244,241,236,0.5)' }}>{String(index + 1).padStart(2, '0')}</span>
            <span aria-hidden className="mx-3 inline-block h-px w-5 align-middle" style={{ background: 'rgba(244,241,236,0.25)' }} />
            {project.type}
          </p>
          <h3 className="font-display italic mb-3 text-2xl md:text-4xl" style={{ color: '#F4F1EC', letterSpacing: '-0.02em' }}>
            {project.name}
          </h3>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span key={tag}
                className="font-body rounded px-2 py-1 text-[12px] uppercase tracking-[0.14em]"
                style={{ background: 'rgba(244,241,236,0.08)', color: 'rgba(244,241,236,0.7)' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div
          className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-[background-color,border-color] duration-300 group-hover:bg-[rgba(196,30,30,0.22)]"
          style={{ border: '1px solid rgba(196,30,30,0.5)', background: 'rgba(196,30,30,0.1)' }}>
          <ArrowUpRight size={16} aria-hidden style={{ color: '#E5484D' }} />
        </div>
      </div>
    </motion.a>
  );
}
