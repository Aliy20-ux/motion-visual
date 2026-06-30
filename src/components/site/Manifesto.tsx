'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const copy = 'We don\'t do generic. We don\'t do templates. We don\'t do "good enough." Every pixel, every transition, every word is intentional. We build the websites that make your competitors nervous — the ones clients screenshot and send to their teams. Edinburgh-born. Internet-renowned.';

export default function Manifesto() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!sectionRef.current || !wordsRef.current || prefersReduced) return;

    const ctx = gsap.context(() => {
      const words = wordsRef.current!.querySelectorAll('.word');

      gsap.set(words, { opacity: 0.15, color: 'rgba(244,241,236,0.15)' });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          start: 'top top',
          end: '+=280%',
          scrub: 0.9,
        },
      });

      words.forEach((word, i) => {
        tl.to(word, { opacity: 1, color: '#F4F1EC', duration: 0.6, ease: 'none' }, i * 0.12);
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const words = copy.split(' ');

  return (
    <section
      ref={sectionRef}
      id="manifesto"
      className="relative flex items-center justify-center"
      style={{ minHeight: '100vh', padding: 'clamp(60px,10vw,120px) clamp(20px,6vw,80px)' }}
    >
      {/* Accent line */}
      <div className="absolute top-16 left-[clamp(20px,6vw,80px)] flex items-center gap-4">
        <div className="w-8 h-px gradient-bg opacity-80" />
        <span className="font-body text-[10px] tracking-[0.3em] uppercase" style={{ color: 'rgba(244,241,236,0.3)' }}>Our Manifesto</span>
      </div>

      <div className="max-w-5xl mx-auto w-full">
        <div ref={wordsRef} className="font-display italic leading-tight" style={{ fontSize: 'clamp(2rem,5vw,4.5rem)', letterSpacing: '-0.02em' }}>
          {words.map((word, i) => (
            <span key={i} className="word inline" style={{ marginRight: '0.28em' }}>
              {word}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
