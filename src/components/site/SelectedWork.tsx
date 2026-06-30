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
  },
  {
    name: 'Texture Lounge',
    type: 'Beauty & Hair · Edinburgh',
    url: 'https://texture-lounge-website.pages.dev',
    color: '#1A0F14',
    accent: '#D4A5C0',
    year: '2025',
    tags: ['Booking System', 'CMS', 'SEO'],
  },
  {
    name: 'CHE Edinburgh',
    type: 'Hospitality · Edinburgh',
    url: 'https://che-edinburgh.aliy20.workers.dev',
    color: '#0D1A0D',
    accent: '#6BAF6B',
    year: '2025',
    tags: ['Restaurant', 'Reservations', 'Animation'],
  },
  {
    name: 'S2 Studio Cuts',
    type: 'Barbershop · Edinburgh',
    url: 'https://s2-studio-cuts.aliy20.workers.dev',
    color: '#0A0A14',
    accent: '#7C3AED',
    year: '2025',
    tags: ['Booking', 'Gallery', 'Branding'],
  },
  {
    name: 'Lucky Chen',
    type: 'Restaurant · Edinburgh',
    url: 'https://lucky-chen-edinburgh.aliy20.workers.dev',
    color: '#1A0A00',
    accent: '#F59E0B',
    year: '2025',
    tags: ['Menu System', 'Ordering', 'SEO'],
  },
  {
    name: 'The Mid Yoken',
    type: 'Community Pub · Edinburgh',
    url: 'https://mid-yoken.aliy20.workers.dev',
    color: '#100A06',
    accent: '#92400E',
    year: '2025',
    tags: ['Events', 'Gallery', 'Local SEO'],
  },
];

export default function SelectedWork() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    if (!sectionRef.current || !trackRef.current || prefersReduced || isMobile) return;

    const track = trackRef.current;
    const totalWidth = track.scrollWidth - window.innerWidth;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        pin: true,
        start: 'top top',
        end: () => `+=${totalWidth + 200}`,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    tl.to(track, { x: -totalWidth, ease: 'none' });

    return () => {
      ScrollTrigger.getAll().forEach(t => {
        if (t.vars.trigger === sectionRef.current) t.kill();
      });
    };
  }, []);

  return (
    <section id="work" ref={sectionRef} className="relative overflow-hidden" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-end justify-between px-[clamp(20px,5vw,80px)] pt-20 pb-8" style={{ borderBottom: '1px solid rgba(244,241,236,0.06)' }}>
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
        style={{ top: '50%', transform: 'translateY(-50%)', padding: '0 clamp(20px,5vw,80px)', willChange: 'transform' }}
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
      className="group relative flex-shrink-0 overflow-hidden rounded-2xl"
      style={{
        width: 'clamp(300px,38vw,480px)',
        height: 'clamp(360px,55vh,600px)',
        background: project.color,
        border: '1px solid rgba(244,241,236,0.08)',
      }}
      whileHover={{ scale: 1.02, y: -6 }}
      transition={{ duration: 0.4, ease: [0.16,1,0.3,1] }}
    >
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(ellipse at 30% 40%, ${project.accent}18 0%, transparent 70%)` }}
      />

      {/* Iframe preview */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 z-10" /> {/* click interceptor — parent anchor handles nav */}
        <iframe
          src={project.url}
          title={project.name}
          className="w-full h-full border-0 pointer-events-none"
          style={{ transform: 'scale(0.5) translateX(-50%) translateY(-50%)', transformOrigin: 'top left', width: '200%', height: '200%' }}
          loading="lazy"
        />
        {/* Overlay scrim */}
        <div className="absolute inset-0 z-20 opacity-60 group-hover:opacity-40 transition-opacity duration-500" style={{ background: `linear-gradient(to top, ${project.color} 0%, transparent 60%)` }} />
      </div>

      {/* Info */}
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
              {project.tags.map(tag => (
                <span key={tag} className="font-body text-[10px] tracking-[0.15em] uppercase px-2 py-1 rounded" style={{ background: 'rgba(244,241,236,0.07)', color: 'rgba(244,241,236,0.45)' }}>
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
      <span className="absolute top-6 left-7 font-body text-[10px] tracking-[0.2em]" style={{ color: 'rgba(244,241,236,0.2)' }}>
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Year */}
      <span className="absolute top-6 right-7 font-body text-[10px] tracking-[0.2em]" style={{ color: 'rgba(244,241,236,0.2)' }}>
        {project.year}
      </span>
    </motion.a>
  );
}
