'use client';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';

// Deliberately not reusing the marketing Nav/Footer here — those link to in-page anchors
// (#work, #pricing, etc.) that don't exist on a standalone route, so they'd silently do
// nothing if clicked from here. This is a lightweight, on-brand header/footer built for
// pages that aren't the scrolling homepage.
export default function LegalLayout({ title, description, updated, children }: { title: string; description: string; updated: string; children: React.ReactNode }) {
  const location = useLocation();

  // index.html's title/description/canonical are baked in at build time for a single SPA
  // shell, so every route ships the homepage's values unless overridden here — including a
  // canonical tag that wrongly pointed /privacy and /terms at the homepage, telling Google
  // this page's canonical version IS "/". Google renders JS before indexing, so it sees these.
  useEffect(() => {
    const prevTitle = document.title;
    document.title = `${title} — Motion Visual`;

    const descMeta = document.querySelector('meta[name="description"]');
    const prevDesc = descMeta?.getAttribute('content') ?? null;
    descMeta?.setAttribute('content', description);

    const canonical = document.querySelector('link[rel="canonical"]');
    const prevCanonical = canonical?.getAttribute('href') ?? null;
    canonical?.setAttribute('href', `https://motion-visual.com${location.pathname}`);

    return () => {
      document.title = prevTitle;
      if (prevDesc !== null) descMeta?.setAttribute('content', prevDesc);
      if (prevCanonical !== null) canonical?.setAttribute('href', prevCanonical);
    };
  }, [title, description, location.pathname]);

  return (
    <div style={{ background: '#0A0A0B', minHeight: '100svh' }}>
      <header className="flex items-center justify-between" style={{ padding: 'clamp(20px,4vw,32px) clamp(24px,5vw,88px)' }}>
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo-dark.png" alt="Motion Visual" className="h-9 w-9 shrink-0 object-contain" />
          <span className="font-body text-[10px] tracking-[0.22em] uppercase" style={{ color: 'rgba(237,232,220,0.5)' }}>
            Motion Visual
          </span>
        </Link>
        <Link to="/" className="font-body text-xs transition-opacity hover:opacity-70"
          style={{ color: 'rgba(237,232,220,0.5)' }}>
          ← Back to site
        </Link>
      </header>

      <motion.main
        id="main-content"
        className="mx-auto"
        style={{ maxWidth: 720, padding: 'clamp(20px,4vw,32px) clamp(24px,5vw,88px) clamp(80px,10vw,140px)' }}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
      >
        <h1 className="font-display italic" style={{ fontSize: 'clamp(2.2rem,5vw,3.5rem)', letterSpacing: '-0.02em', color: '#EDE8DC' }}>
          {title}
        </h1>
        <p className="font-body text-xs mb-12 mt-3" style={{ color: 'rgba(237,232,220,0.5)' }}>
          Last updated {updated}
        </p>

        <div className="legal-prose">{children}</div>
      </motion.main>

      <footer style={{ borderTop: '1px solid rgba(237,232,220,0.07)', padding: 'clamp(24px,4vw,32px) clamp(24px,5vw,88px)' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-body text-xs" style={{ color: 'rgba(237,232,220,0.5)' }}>
            © 2026 Motion Visual Agency Ltd
          </span>
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="font-body text-xs transition-opacity hover:opacity-70" style={{ color: 'rgba(237,232,220,0.5)' }}>
              Privacy
            </Link>
            <Link to="/terms" className="font-body text-xs transition-opacity hover:opacity-70" style={{ color: 'rgba(237,232,220,0.5)' }}>
              Terms
            </Link>
            <a href="mailto:admin.team@motion-visual.com" className="font-body text-xs transition-opacity hover:opacity-70" style={{ color: 'rgba(237,232,220,0.5)' }}>
              admin.team@motion-visual.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
