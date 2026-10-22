import { useEffect, useRef } from 'react';
import { TURNSTILE_SITE_KEY } from '../../lib/turnstile';

// Cloudflare Turnstile bot check. Renders only when VITE_TURNSTILE_SITE_KEY is set, so the form keeps
// working until the widget is created (see docs/QUOTES.md). The server enforces the check only when
// TURNSTILE_SECRET_KEY is set — set both together.
type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global { interface Window { turnstile?: TurnstileApi } }

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.turnstile) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    const script = existing ?? Object.assign(document.createElement('script'), { src: SCRIPT_SRC, async: true });
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => reject(new Error('Turnstile failed to load')));
    if (!existing) document.head.appendChild(script);
  });
}

// `onUnavailable` fires when the widget can't load at all (ad blocker, offline): the form then lets the enquiry
// through to the CRM without a quote, instead of blocking the visitor on a check that never appeared.
export default function Turnstile({ onToken, onUnavailable }: { onToken: (token: string | null) => void; onUnavailable?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    let widgetId: string | null = null;
    let cancelled = false;
    loadScript().then(() => {
      if (cancelled || !ref.current || !window.turnstile) return;
      widgetId = window.turnstile.render(ref.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'dark',
        callback: (token: string) => onToken(token),
        'expired-callback': () => onToken(null),
        'error-callback': () => onToken(null),
      });
    }).catch(() => { onToken(null); onUnavailable?.(); });
    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [onToken, onUnavailable]);

  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={ref} className="flex justify-center" style={{ minHeight: 65 }} />;
}
