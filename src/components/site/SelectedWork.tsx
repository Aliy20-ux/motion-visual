'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    name: 'Thomas J Walls',
    type: 'Coffee House · Edinburgh',
    url: 'https://thomas-j-walls-coffee.aliy20.workers.dev',
    color: '#2D1B0E',
    accent: '#C8924A',
    year: '2025',
    tags: ['E-commerce', 'Branding', 'Animation'],
    nav: ['Menu', 'Our Story', 'Order'],
    hero: "Edinburgh's\nfinest coffee",
    sub: 'Speciality coffee & pastries, Old Town',
    cta: 'Order Online',
    blocks: [0.9, 0.6, 0.75],
  },
  {
    name: 'Texture Lounge',
    type: 'Beauty & Hair · Edinburgh',
    url: 'https://texture-lounge-website.pages.dev',
    color: '#1A0F14',
    accent: '#D4A5C0',
    year: '2025',
    tags: ['Booking System', 'CMS', 'SEO'],
    nav: ['Services', 'Gallery', 'Book'],
    hero: 'Beauty\nthat lasts.',
    sub: 'Premium hair & beauty, Edinburgh',
    cta: 'Book Now',
    blocks: [0.7, 1, 0.55],
  },
  {
    name: 'CHE Edinburgh',
    type: 'Hospitality · Edinburgh',
    url: 'https://che-edinburgh.aliy20.workers.dev',
    color: '#0D1A0D',
    accent: '#6BAF6B',
    year: '2025',
    tags: ['Restaurant', 'Reservations', 'Animation'],
    nav: ['Menus', 'Reservations', 'Private'],
    hero: 'Modern\nEuropean\ndining.',
    sub: 'CHE Edinburgh — New Town',
    cta: 'Reserve a Table',
    blocks: [1, 0.65, 0.8],
  },
  {
    name: 'S2 Studio Cuts',
    type: 'Barbershop · Edinburgh',
    url: 'https://s2-studio-cuts.aliy20.workers.dev',
    color: '#0A0A14',
    accent: '#7C3AED',
    year: '2025',
    tags: ['Booking', 'Gallery', 'Branding'],
    nav: ['Services', 'Gallery', 'Book'],
    hero: 'Premium\ncuts.\nSharp looks.',
    sub: 'S2 Studio Cuts — Leith',
    cta: 'Book a Cut',
    blocks: [0.6, 1, 0.7],
  },
  {
    name: 'Lucky Chen',
    type: 'Restaurant · Edinburgh',
    url: 'https://lucky-chen-edinburgh.aliy20.workers.dev',
    color: '#1A0A00',
    accent: '#F59E0B',
    year: '2025',
    tags: ['Menu System', 'Ordering', 'SEO'],
    nav: ['Menu', 'Reservations', 'Order'],
    hero: 'Pan-Asian\ndining in\nEdinburgh.',
    sub: 'Lucky Chen — Grassmarket',
    cta: 'View Menu',
    blocks: [0.8, 0.5, 0.9],
  },
  {
    name: 'The Mid Yoken',
    type: 'Community Pub · Edinburgh',
    url: 'https://mid-yoken.aliy20.workers.dev',
    color: '#100A06',
    accent: '#D97706',
    year: '2025',
    tags: ['Events', 'Gallery', 'Local SEO'],
    nav: ['Food', 'Events', 'Find Us'],
    hero: 'Your local\nEdinburgh\npub.',
    sub: 'The Mid Yoken — Morningside',
    cta: 'See What\'s On',
    blocks: [0.75, 1, 0.6],
  },
];

function SiteMockup({ project }: { project: typeof projects[0] }) {
  return (
    <div className="absolute inset-0 overflow-hidden select-none">
      {/* Browser chrome */}
      <div
        className="flex items-center gap-1.5 px-3 shrink-0"
        style={{ height: 26, background: 'rgba(0,0,0,0.5)', borderBottom: `1px solid ${project.accent}15` }}
      >
        <div className="w-2 h-2 rounded-full" style={{ background: '#FF5F57' }} />
        <div className="w-2 h-2 rounded-full" style={{ background: '#FFBD2E' }} />
        <div className="w-2 h-2 rounded-full" style={{ background: '#28C840' }} />
        <div
          className="ml-2 flex-1 rounded flex items-center px-2"
          style={{ height: 14, background: 'rgba(255,255,255,0.06)', maxWidth: 150 }}
        >
          <span className="font-body truncate" style={{ fontSize: 7, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.03em' }}>
            {project.url.replace('https://', '')}
          </span>
        </div>
      </div>

      {/* Site body */}
      <div
        className="flex flex-col overflow-hidden"
        style={{ background: project.color, height: 'calc(100% - 26px)' }}
      >
        {/* Nav */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{
            padding: '8px 14px',
            borderBottom: `1px solid ${project.accent}18`,
            background: `${project.color}e0`,
          }}
        >
          <span
            className="font-body font-semibold tracking-[0.18em] uppercase"
            style={{ fontSize: 8, color: project.accent }}
          >
            {project.name}
          </span>
          <div className="flex items-center gap-3">
            {project.nav.map((item) => (
              <span key={item} className="font-body uppercase tracking-[0.1em]" style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Hero */}
        <div className="flex-1 flex flex-col justify-center relative overflow-hidden" style={{ padding: '12px 14px 10px' }}>
          {/* Accent glow */}
          <div
            className="absolute -top-8 -right-8 rounded-full pointer-events-none"
            style={{
              width: 120,
              height: 120,
              background: `radial-gradient(circle, ${project.accent}30 0%, transparent 70%)`,
            }}
          />
          {/* Subtle diagonal lines texture */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, ${project.accent} 0px, ${project.accent} 1px, transparent 1px, transparent 12px)`,
            }}
          />

          <div
            className="font-body uppercase tracking-[0.22em] mb-2 relative"
            style={{ fontSize: 7, color: project.accent }}
          >
            {project.type}
          </div>

          <div
            className="font-display italic relative"
            style={{
              fontSize: 'clamp(1rem, 3vw, 1.8rem)',
              lineHeight: 1.0,
              letterSpacing: '-0.02em',
              color: '#F4F1EC',
              whiteSpace: 'pre-line',
              marginBottom: 10,
            }}
          >
            {project.hero}
          </div>

          <div
            className="font-body mb-5 relative"
            style={{ fontSize: 8, color: 'rgba(255,255,255,0.38)', lineHeight: 1.4 }}
          >
            {project.sub}
          </div>

          <div
            className="inline-flex items-center gap-1.5 rounded-full font-body font-semibold self-start relative"
            style={{
              fontSize: 7.5,
              padding: '5px 11px',
              background: project.accent,
              color: project.color,
              letterSpacing: '0.08em',
            }}
          >
            {project.cta}
            <ArrowUpRight size={8} />
          </div>
        </div>

        {/* Bottom content blocks */}
        <div
          className="shrink-0 flex gap-1.5"
          style={{ padding: '0 14px 12px' }}
        >
          {project.blocks.map((w, i) => (
            <div
              key={i}
              className="rounded"
              style={{
                flex: w,
                height: 22,
                background: i === 0 ? `${project.accent}22` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${project.accent}${i === 0 ? '30' : '10'}`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SelectedWork() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    if (!sectionRef.current || !trackRef.current || prefersReduced || isMobile) return;

    const track = trackRef.current;

    const ctx = gsap.context(() => {
      const totalWidth = track.scrollWidth - window.innerWidth;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          start: 'top top',
          end: () => `+=${totalWidth + 200}`,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      tl.to(track, { x: -totalWidth, ease: 'none' });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="work" ref={sectionRef} className="relative overflow-hidden" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div
        className="absolute top-0 left-0 right-0 z-10 flex items-end justify-between px-[clamp(20px,5vw,80px)] pt-20 pb-8"
        style={{ borderBottom: '1px solid rgba(244,241,236,0.06)' }}
      >
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-px gradient-bg" />
            <span className="font-body text-[10px] tracking-[0.3em] uppercase" style={{ color: 'rgba(244,241,236,0.35)' }}>Selected Work</span>
          </div>
          <h2 className="font-display italic" style={{ fontSize: 'clamp(2rem,5vw,5rem)', lineHeight: 0.92, letterSpacing: '-0.02em', color: '#F4F1EC' }}>
            Projects we're <span className="gradient-text">proud of.</span>
          </h2>
        </div>
        <span className="font-body text-xs hidden md:block" style={{ color: 'rgba(244,241,236,0.25)' }}>
          ← scroll to explore →
        </span>
      </div>

      {/* Horizontal track — desktop */}
      <div
        ref={trackRef}
        className="hidden md:flex items-center gap-6 absolute left-0"
        style={{
          top: '50%',
          transform: 'translateY(-50%)',
          padding: '0 clamp(20px,5vw,80px)',
          willChange: 'transform',
        }}
      >
        {projects.map((project, i) => (
          <ProjectCard key={i} project={project} index={i} />
        ))}
      </div>

      {/* Vertical stack — mobile */}
      <div className="md:hidden flex flex-col gap-6 px-5 pt-48 pb-20">
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
        background: project.color,
        border: '1px solid rgba(244,241,236,0.08)',
      }}
      whileHover={{ scale: 1.02, y: -6 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Static site mockup */}
      <SiteMockup project={project} />

      {/* Hover gradient overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 30% 40%, ${project.accent}14 0%, transparent 70%)` }}
      />

      {/* Bottom scrim always present */}
      <div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{ background: `linear-gradient(to top, ${project.color} 0%, transparent 55%)` }}
      />

      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-7">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-body text-[10px] tracking-[0.25em] uppercase mb-2" style={{ color: 'rgba(244,241,236,0.4)' }}>
              {project.type}
            </p>
            <h3 className="font-display italic text-2xl md:text-3xl" style={{ color: '#F4F1EC', letterSpacing: '-0.02em' }}>
              {project.name}
            </h3>
            <div className="flex flex-wrap gap-2 mt-3">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-body text-[10px] tracking-[0.15em] uppercase px-2 py-1 rounded"
                  style={{ background: 'rgba(244,241,236,0.07)', color: 'rgba(244,241,236,0.45)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <ArrowUpRight size={14} style={{ color: '#F4F1EC' }} />
          </div>
        </div>
      </div>

      {/* Index */}
      <span className="absolute top-6 left-7 z-30 font-body text-[10px] tracking-[0.2em]" style={{ color: 'rgba(244,241,236,0.2)' }}>
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Year */}
      <span className="absolute top-6 right-7 z-30 font-body text-[10px] tracking-[0.2em]" style={{ color: 'rgba(244,241,236,0.2)' }}>
        {project.year}
      </span>
    </motion.a>
  );
}
