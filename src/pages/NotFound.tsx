import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { COMPANY } from '../legal/company';

// functions/_middleware.ts makes unknown URLs return this app shell with a real
// HTTP 404. noindex stays as a second signal for crawlers (and covers client-side
// navigation to a dead link, where no new response is fetched).
export default function NotFound() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Page not found — Motion Visual';

    // index.html already ships a robots meta tag for the real routes — override
    // its content in place rather than appending a second, conflicting one.
    const meta = document.querySelector('meta[name="robots"]');
    const prevRobots = meta?.getAttribute('content') ?? null;
    meta?.setAttribute('content', 'noindex, nofollow');

    return () => {
      document.title = prevTitle;
      if (prevRobots !== null) meta?.setAttribute('content', prevRobots);
    };
  }, []);

  return (
    <div style={{ background: '#0A0A0B', minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
      <header className="flex items-center" style={{ padding: 'clamp(20px,4vw,32px) clamp(24px,5vw,88px)' }}>
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo-dark.png" alt="" className="h-9 w-9 shrink-0 object-contain" />
          <span className="font-body text-[11px] tracking-[0.22em] uppercase" style={{ color: 'rgba(237,232,220,0.72)' }}>
            Motion Visual
          </span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center"
        style={{ padding: 'clamp(24px,5vw,88px)' }}>
        <span className="font-body text-[11px] tracking-[0.32em] uppercase mb-6"
          style={{ color: 'rgba(237,232,220,0.62)' }}>
          404
        </span>
        <h1 className="font-display italic mb-5"
          style={{ fontSize: 'clamp(2.4rem,6vw,5rem)', lineHeight: 0.95, letterSpacing: '-0.025em', color: '#EDE8DC' }}>
          This page <span className="gradient-text">wandered off.</span>
        </h1>
        <p className="font-body font-light text-sm leading-relaxed mb-10"
          style={{ color: 'rgba(237,232,220,0.72)', maxWidth: '42ch' }}>
          The link you followed doesn't lead anywhere — it may be outdated or mistyped.
        </p>
        <Link to="/"
          className="gradient-bg inline-flex items-center justify-center gap-2 rounded-full font-body font-semibold text-sm text-white"
          style={{ padding: '15px 32px' }}>
          Back to the homepage
        </Link>
      </main>

      <footer style={{ borderTop: '1px solid rgba(237,232,220,0.07)', padding: 'clamp(24px,4vw,32px) clamp(24px,5vw,88px)' }}>
        <div className="max-w-7xl mx-auto flex justify-center">
          <span className="font-body text-xs" style={{ color: 'rgba(237,232,220,0.62)' }}>
            © 2026 {COMPANY.legalName}
          </span>
        </div>
      </footer>
    </div>
  );
}
