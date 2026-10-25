'use client';
import { useEffect, useRef } from 'react';

// The services, on the far side of the journey: a total eclipse over a dark sea is drawn behind this section
// (journey/JourneyCanvas). Centred heading, then the six services in a grid that rises in left to right.

const services = [
  { num: '01', title: 'Bespoke Design', body: 'Every pixel handcrafted. No templates, no shortcuts. Pure, original design built around your brand DNA.' },
  { num: '02', title: 'Custom Development', body: 'Clean, performant code engineered from scratch. Every interaction, animation, and transition built by hand.' },
  { num: '03', title: 'Cinematic Animation', body: 'Scroll-driven narratives, micro-interactions, and transitions that make your brand feel alive.' },
  { num: '04', title: 'SEO & Performance', body: 'Built to Core Web Vitals standards. Lightning-fast load times. Structured data and local SEO that puts you on the map.' },
  { num: '05', title: 'Conversion Strategy', body: 'Every layout decision is engineered around psychology, user flow, and measurable outcomes.' },
  { num: '06', title: 'Security by Default', body: 'SSL, DDoS protection, secure form handling, and Cloudflare-backed global delivery on every site.' },
];

export default function WhyUs() {
  const list = useRef<HTMLOListElement>(null);

  // the cards rise in once, left to right and top row first, when the grid comes into view
  useEffect(() => {
    const el = list.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('in'); io.disconnect(); }
    }, { rootMargin: '0px 0px -18% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // a soft glow follows the cursor inside the card (set on the card itself, so nothing else restyles)
  const glow = (e: React.PointerEvent<HTMLLIElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <section id="why-us" aria-labelledby="why-us-heading" className="journey-services relative">
      <div className="journey-services-head">
        <p className="journey-eyebrow">Services</p>
        <h2 id="why-us-heading" className="font-display">
          The architecture behind every <span className="journey-red">build.</span>
        </h2>
        <p className="journey-intro">
          We don't compete on price. We compete on outcomes. Every project is a bespoke engineering effort — designed, built, and optimised to outperform.
        </p>
      </div>
      <ol ref={list} className="journey-cards">
        {services.map((svc, i) => (
          <li key={svc.num} style={{ '--i': i } as React.CSSProperties} onPointerMove={glow}>
            <span className="journey-num">{svc.num}</span>
            <h3 className="font-display">{svc.title}</h3>
            <p>{svc.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
