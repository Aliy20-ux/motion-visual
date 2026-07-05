'use client';
import { useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { useIsTouch } from '../../hooks/useIsTouch';

const ease = [0.16, 1, 0.3, 1] as const;

const projects = [
  {
    name: 'Thomas J Walls',
    type: 'Coffee House · Edinburgh',
    url: 'https://thomas-j-walls.pages.dev',
    screenshot: '/work/thomas-j-walls.jpg',
    bg: '#2D1B0E',
    year: '2025',
    tags: ['E-commerce', 'Branding', 'Animation'],
  },
  {
    name: 'Texture Lounge',
    type: 'Beauty & Hair · Edinburgh',
    url: 'https://texture-lounge-website.pages.dev',
    screenshot: '/work/texture-lounge.jpg',
    bg: '#1A0F14',
    year: '2025',
    tags: ['Booking System', 'CMS', 'SEO'],
  },
  {
    name: 'CHE Edinburgh',
    type: 'Hospitality · Edinburgh',
    url: 'https://che-website-best.pages.dev',
    screenshot: '/work/che-edinburgh.jpg',
    bg: '#0D1A0D',
    year: '2025',
    tags: ['Restaurant', 'Online Ordering', 'Branding'],
  },
  {
    name: 'S2 Studio Cuts',
    type: 'Barbershop · Edinburgh',
    url: 'https://s2-studio-cuts.aliy20.workers.dev',
    screenshot: '/work/s2-studio-cuts.jpg',
    bg: '#0A0A14',
    year: '2025',
    tags: ['Booking', 'Gallery', 'Branding'],
  },
  {
    name: 'Lucky Chen',
    type: 'Restaurant · Edinburgh',
    url: 'https://lucky-chen-edinburgh.aliy20.workers.dev',
    screenshot: '/work/lucky-chen.jpg',
    bg: '#1A0A00',
    year: '2025',
    tags: ['Menu System', 'Ordering', 'SEO'],
  },
  {
    name: 'Trim2Fresh',
    type: 'Barbershop · Edinburgh',
    url: 'https://trim2fresh-website.aliy20.workers.dev',
    screenshot: '/work/trim2fresh.jpg',
    bg: '#1A1400',
    year: '2025',
    tags: ['Booking System', 'Branding', 'Reviews'],
  },
];

export default function SelectedWork() {
  const trackRef = useRef<HTMLDivElement>(null);

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
  };

  return (
    <section id="work" className="relative" style={{ padding: 'clamp(80px,10vw,140px) 0' }}>
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
            <span className="font-body text-[10px] tracking-[0.3em] uppercase" style={{ color: 'rgba(244,241,236,0.35)' }}>
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
        <span className="font-body text-xs hidden md:block" style={{ color: 'rgba(244,241,236,0.25)' }}>
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
        className="flex gap-5 overflow-x-auto no-scrollbar"
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
          <ProjectCard key={i} project={project} index={i} />
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

function ProjectCard({ project, index }: { project: (typeof projects)[0]; index: number }) {
  const isTouch = useIsTouch();

  return (
    <motion.a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="view"
      className="group relative flex-shrink-0 overflow-hidden rounded-2xl cursor-pointer"
      style={{
        width: 'clamp(300px,38vw,480px)',
        height: 'clamp(360px,55vh,600px)',
        background: project.bg,
        border: '1px solid rgba(244,241,236,0.08)',
        scrollSnapAlign: 'start',
      }}
      whileHover={{ scale: 1.02, y: -6 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Real screenshot — 1440×1920 portrait, brightness-boosted */}
      <img
        src={project.screenshot}
        alt={project.name}
        draggable={false}
        loading={index === 0 ? 'eager' : 'lazy'}
        decoding="async"
        className="absolute inset-0 w-full h-full select-none"
        style={{
          objectFit: 'cover',
          objectPosition: 'top center',
          transition: 'transform 7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          userSelect: 'none',
          filter: 'brightness(1.35) contrast(1.05) saturate(1.15)',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1) translateY(-8%)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1) translateY(0%)')}
      />

      {/* Scrim — a light overall vignette only; the real legibility work happens on the
          info block below, sized to its own content instead of a fixed % of card height. */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(8,8,9,0.5) 0%, rgba(8,8,9,0.0) 35%)' }}
      />

      {/* Hover accent glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 40% 60%, rgba(196,30,30,0.12) 0%, transparent 65%)' }}
      />

      {/* Index — top left */}
      <span className="absolute top-6 left-7 z-20 font-body text-[10px] tracking-[0.2em]"
        style={{ color: 'rgba(244,241,236,0.28)' }}>
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Info — bottom. A gradient tied to a percentage of card height reads fine on a wide
          desktop card but leaves text sitting on the *lighter* part of the gradient once the
          card gets tall and narrow on mobile — exactly where it overlapped the screenshot's
          own baked-in text. A blurred, darkened panel guarantees legibility no matter what's
          behind it or how tall the card is; the mask just softens its top edge so it doesn't
          read as a hard box. */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-7 pb-7 pt-10"
        style={{
          background: 'rgba(8,8,9,0.72)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          maskImage: 'linear-gradient(to top, black 65%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 65%, transparent 100%)',
        }}>
        <div className="flex items-end justify-between">
          <div>
            <p className="font-body text-[10px] tracking-[0.25em] uppercase mb-2"
              style={{ color: 'rgba(244,241,236,0.42)' }}>
              {project.type}
            </p>
            <h3 className="font-display italic text-2xl md:text-3xl mb-3"
              style={{ color: '#F4F1EC', letterSpacing: '-0.02em' }}>
              {project.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span key={tag}
                  className="font-body text-[10px] tracking-[0.15em] uppercase px-2 py-1 rounded"
                  style={{ background: 'rgba(244,241,236,0.07)', color: 'rgba(244,241,236,0.45)' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ml-4 transition-[opacity,translate] duration-300 ${isTouch ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`}
            style={{ border: '1px solid rgba(196,30,30,0.4)', background: 'rgba(196,30,30,0.08)' }}>
            <ArrowUpRight size={14} style={{ color: '#C41E1E' }} />
          </div>
        </div>
      </div>
    </motion.a>
  );
}
