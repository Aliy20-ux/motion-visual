'use client';
import { useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

const projects = [
  {
    name: 'Thomas J Walls',
    type: 'Coffee House · Edinburgh',
    url: 'https://thomas-j-walls-coffee.aliy20.workers.dev',
    screenshot: '/work/thomas-j-walls.jpg',
    year: '2025',
    tags: ['E-commerce', 'Branding', 'Animation'],
  },
  {
    name: 'Texture Lounge',
    type: 'Beauty & Hair · Edinburgh',
    url: 'https://texture-lounge-website.pages.dev',
    screenshot: '/work/texture-lounge.jpg',
    year: '2025',
    tags: ['Booking System', 'CMS', 'SEO'],
  },
  {
    name: 'CHE Edinburgh',
    type: 'Hospitality · Edinburgh',
    url: 'https://che-edinburgh.aliy20.workers.dev',
    screenshot: '/work/che-edinburgh.jpg',
    year: '2025',
    tags: ['Restaurant', 'Reservations', 'Animation'],
  },
  {
    name: 'S2 Studio Cuts',
    type: 'Barbershop · Edinburgh',
    url: 'https://s2-studio-cuts.aliy20.workers.dev',
    screenshot: '/work/s2-studio-cuts.jpg',
    year: '2025',
    tags: ['Booking', 'Gallery', 'Branding'],
  },
  {
    name: 'Lucky Chen',
    type: 'Restaurant · Edinburgh',
    url: 'https://lucky-chen-edinburgh.aliy20.workers.dev',
    screenshot: '/work/lucky-chen.jpg',
    year: '2025',
    tags: ['Menu System', 'Ordering', 'SEO'],
  },
  {
    name: 'The Mid Yoken',
    type: 'Community Pub · Edinburgh',
    url: 'https://mid-yoken.aliy20.workers.dev',
    screenshot: '/work/mid-yoken.jpg',
    year: '2025',
    tags: ['Events', 'Gallery', 'Local SEO'],
  },
];

export default function SelectedWork() {
  const trackRef = useRef<HTMLDivElement>(null);

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
      <div
        ref={trackRef}
        className="flex gap-5 overflow-x-auto no-scrollbar"
        style={{
          padding: '40px clamp(20px,5vw,80px)',
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
        {projects.map((project, i) => (
          <ProjectCard key={i} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ project, index }: { project: typeof projects[0]; index: number }) {
  return (
    <motion.a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex-shrink-0 overflow-hidden rounded-2xl cursor-pointer"
      style={{
        width: 'clamp(300px,38vw,480px)',
        height: 'clamp(360px,55vh,600px)',
        background: '#111',
        border: '1px solid rgba(244,241,236,0.08)',
        scrollSnapAlign: 'start',
      }}
      whileHover={{ scale: 1.02, y: -6 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Real screenshot — 1440×1920 portrait capture, shown from top */}
      <img
        src={project.screenshot}
        alt={project.name}
        draggable={false}
        className="absolute inset-0 w-full h-full select-none"
        style={{
          objectFit: 'cover',
          objectPosition: 'top center',
          transition: 'transform 7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          userSelect: 'none',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1) translateY(-8%)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1) translateY(0%)')}
      />

      {/* Gradient scrim — always present so text is readable */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(8,8,9,0.97) 0%, rgba(8,8,9,0.4) 48%, transparent 100%)' }}
      />

      {/* Hover accent glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 40% 60%, rgba(196,144,32,0.12) 0%, transparent 65%)' }}
      />

      {/* Index — top left */}
      <span className="absolute top-6 left-7 z-20 font-body text-[10px] tracking-[0.2em]"
        style={{ color: 'rgba(244,241,236,0.28)' }}>
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Year — top right */}
      <span className="absolute top-6 right-7 z-20 font-body text-[10px] tracking-[0.2em]"
        style={{ color: 'rgba(244,241,236,0.28)' }}>
        {project.year}
      </span>

      {/* Info — bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-7">
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
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0"
            style={{ border: '1px solid rgba(196,144,32,0.4)', background: 'rgba(196,144,32,0.08)' }}>
            <ArrowUpRight size={14} style={{ color: '#C49020' }} />
          </div>
        </div>
      </div>
    </motion.a>
  );
}
