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

// `onUnavailable` fires when the widget can't run at all — script blocked (ad blocker, offline), a widget error
// (for example a hostname not allowed on the Turnstile widget, as on preview sites) or an unsupported browser.
// The form then lets the enquiry through to the CRM without a quote, instead of blocking the visitor on a check
// that never appeared. A visitor who simply fails the challenge doesn't trigger this.
//
// The widget is created ONCE per mount. The callbacks are read through refs, so a parent that passes a fresh
// function on every render (every keystroke in the form) does not tear the widget down and rebuild it — which
// would restart the challenge each time, flood Cloudflare, and drop the token the visitor already earned.
// To get a fresh widget (a token works once), the parent remounts this component with a new `key`.
export default function Turnstile({ onToken, onUnavailable }: { onToken: (token: string | null) => void; onUnavailable?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const onTokenRef = useRef(onToken);
  const onUnavailableRef = useRef(onUnavailable);
  onTokenRef.current = onToken;
  onUnavailableRef.current = onUnavailable;

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    let widgetId: string | null = null;
    let cancelled = false;
    const unavailable = () => { onTokenRef.current(null); onUnavailableRef.current?.(); };
    loadScript().then(() => {
      if (cancelled || !ref.current || !window.turnstile) return;
      widgetId = window.turnstile.render(ref.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'dark',
        callback: (token: string) => onTokenRef.current(token),
        'expired-callback': () => onTokenRef.current(null),
        'error-callback': unavailable,
        'unsupported-callback': unavailable,
      });
    }).catch(unavailable);
    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, []);

  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={ref} className="flex justify-center" style={{ minHeight: 65 }} />;
}
