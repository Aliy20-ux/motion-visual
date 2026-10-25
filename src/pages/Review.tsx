import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Star } from 'lucide-react';
import { COMPANY, COMPANY_DISCLOSURE } from '../legal/company';

const ease = [0.23, 1, 0.32, 1] as const;
const muted = 'rgba(237,232,220,0.5)';
const RATING_WORDS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

type Opened = {
  status: 'open' | 'submitted' | 'expired';
  clientName: string;
  businessName: string | null;
  projectName: string | null;
  googleReviewUrl: string | null;
  submitted: { rating: number; body: string } | null;
};
type Load = { state: 'loading' } | { state: 'error'; message: string } | { state: 'ready'; review: Opened };
type Sent = { rating: number; body: string; googleReviewUrl: string | null };

function usePrivatePageMeta(title: string) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;
    const meta = document.querySelector('meta[name="robots"]');
    const prevRobots = meta?.getAttribute('content') ?? null;
    meta?.setAttribute('content', 'noindex, nofollow');
    return () => {
      document.title = prevTitle;
      if (prevRobots !== null) meta?.setAttribute('content', prevRobots);
    };
  }, [title]);
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="agreement-ui" style={{ background: '#0A0A0B', minHeight: '100svh' }}>
      <header className="flex items-center justify-between" style={{ padding: 'clamp(20px,4vw,32px) clamp(24px,5vw,88px)' }}>
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo-dark.png" alt="" width={36} height={36} className="h-9 w-9 shrink-0 object-contain" />
          <span className="font-body text-[10px] tracking-[0.22em] uppercase" style={{ color: muted }}>Motion Visual</span>
        </Link>
        <span className="font-body text-[10px] tracking-[0.22em] uppercase" style={{ color: muted }}>Client review</span>
      </header>
      <main id="main-content" className="mx-auto" style={{ maxWidth: 720, padding: 'clamp(24px,6vw,64px) clamp(20px,5vw,40px) clamp(80px,10vw,140px)' }}>
        {children}
      </main>
      <footer style={{ borderTop: '1px solid rgba(237,232,220,0.07)', padding: 'clamp(24px,4vw,32px) clamp(24px,5vw,88px)' }}>
        <p className="max-w-7xl mx-auto font-body text-xs leading-relaxed text-center" style={{ color: muted }}>
          {COMPANY_DISCLOSURE} <a className="underline underline-offset-2" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
        </p>
      </footer>
    </div>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-16 text-center mx-auto" style={{ maxWidth: '44ch' }}>
      <h1 className="font-display italic mb-4" style={{ fontSize: 'clamp(2.2rem,5vw,3.5rem)', letterSpacing: '-0.02em', color: '#EDE8DC' }}>{title}</h1>
      <div className="font-body font-light text-sm leading-relaxed" style={{ color: 'rgba(237,232,220,0.8)' }}>{children}</div>
    </div>
  );
}

/** Five stars as one radio group: tab to it, then arrow keys (or tap) to choose. */
function StarInput({ value, onChange, describedBy }: { value: number; onChange: (n: number) => void; describedBy?: string }) {
  const [hover, setHover] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const shown = hover || value;

  const move = (to: number) => {
    const n = Math.min(5, Math.max(1, to));
    onChange(n);
    refs.current[n - 1]?.focus();
  };
  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); move((value || 0) + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); move((value || 2) - 1); }
    else if (e.key === 'Home') { e.preventDefault(); move(1); }
    else if (e.key === 'End') { e.preventDefault(); move(5); }
  };

  return (
    <div>
      <div role="radiogroup" aria-label="Your rating out of 5 stars" aria-describedby={describedBy} className="flex items-center gap-1 sm:gap-2" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            ref={el => { refs.current[n - 1] = el; }}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? 's' : ''}, ${RATING_WORDS[n]}`}
            tabIndex={value === n || (value === 0 && n === 1) ? 0 : -1}
            onClick={() => onChange(n)}
            onKeyDown={onKey}
            onMouseEnter={() => setHover(n)}
            className="star-btn cursor-pointer flex items-center justify-center"
            style={{ width: 56, height: 56, color: n <= shown ? '#E03A3A' : 'rgba(237,232,220,0.22)' }}
          >
            <Star size={40} strokeWidth={1.5} fill={n <= shown ? 'currentColor' : 'none'} aria-hidden="true" />
          </button>
        ))}
      </div>
      <p className="font-body text-xs mt-2" style={{ color: muted, minHeight: 18 }} aria-live="polite">{value ? RATING_WORDS[value] : 'Tap a star'}</p>
      <style>{`
        .star-btn { transition: transform 140ms cubic-bezier(0.23,1,0.32,1), color 140ms ease; }
        .star-btn:active { transform: scale(0.9); }
        .star-btn:focus-visible { outline: 2px solid rgba(224,58,58,0.8); outline-offset: 2px; border-radius: 8px; }
        @media (prefers-reduced-motion: reduce) { .star-btn { transition: none; } }
      `}</style>
    </div>
  );
}

export default function Review() {
  const { token = '' } = useParams();
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  usePrivatePageMeta('Leave a review — Motion Visual');

  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');
  const [name, setName] = useState('');
  const [business, setBusiness] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState<Sent | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/review/open', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      .then(async res => {
        const data = (await res.json().catch(() => ({}))) as { review?: Opened; error?: string };
        if (cancelled) return;
        if (!res.ok || !data.review) setLoad({ state: 'error', message: data.error ?? 'We couldn’t load this page.' });
        else {
          setLoad({ state: 'ready', review: data.review });
          setName(n => n || data.review!.clientName);
          setBusiness(b => b || data.review!.businessName || '');
        }
      })
      .catch(() => !cancelled && setLoad({ state: 'error', message: 'We couldn’t reach our server. Check your connection and reload the page.' }));
    return () => { cancelled = true; };
  }, [token]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (rating < 1) return setError('Please choose a star rating first.');
    if (!name.trim()) return setError('Please add your name.');
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/review/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, rating, body, name, business, consent }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; googleReviewUrl?: string | null; error?: string };
      if (!res.ok || !data.ok) setError(data.error ?? 'Something went wrong sending your review. Please try again.');
      else setSent({ rating, body: body.trim(), googleReviewUrl: data.googleReviewUrl ?? null });
    } catch {
      setError('We couldn’t reach our server. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const copyReview = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };
  const openGoogle = () => {
    fetch('/api/review/google', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }), keepalive: true }).catch(() => null);
  };

  if (load.state === 'loading') return <Shell><div aria-busy="true" style={{ minHeight: '50svh' }} /></Shell>;
  if (load.state === 'error') {
    return (
      <Shell>
        <Notice title="Review link unavailable">
          <p>{load.message}</p>
          <p className="mt-3">If you think this is a mistake, email <a className="underline underline-offset-2" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.</p>
        </Notice>
      </Shell>
    );
  }

  const { review } = load;
  if (review.status === 'expired') {
    return (
      <Shell>
        <Notice title="This link has expired">
          <p>Review links last 90 days. If you’d still like to leave one, email <a className="underline underline-offset-2" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> and we’ll send a fresh link.</p>
        </Notice>
      </Shell>
    );
  }
  if (review.status === 'submitted' && !sent) {
    return (
      <Shell>
        <Notice title="Thank you">
          <p>You’ve already left your review{review.submitted ? ` (${review.submitted.rating} out of 5)` : ''}. We really appreciate it.</p>
        </Notice>
      </Shell>
    );
  }

  const first = (review.clientName || name).split(' ')[0];
  const googleUrl = sent?.googleReviewUrl ?? null;

  return (
    <Shell>
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div key="thanks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease }}>
            <span className="w-11 h-11 rounded-full gradient-bg flex items-center justify-center mb-6" aria-hidden="true">
              <Check size={20} style={{ color: '#F0EDED' }} />
            </span>
            <h1 className="font-display italic mb-4" style={{ fontSize: 'clamp(2.4rem,6vw,4rem)', lineHeight: 1, letterSpacing: '-0.025em', color: '#EDE8DC' }} role="status">
              Thank you{first ? `, ${first}` : ''}.
            </h1>
            <p className="font-body font-light text-sm leading-relaxed" style={{ color: 'rgba(237,232,220,0.84)', maxWidth: '52ch' }}>
              Your review is with our team. We read every one, and it helps the next business find us.
            </p>

            {googleUrl && (
              <div className="mt-10" style={{ padding: 'clamp(20px,3vw,28px)', borderRadius: 16, border: '1px solid rgba(237,232,220,0.1)', background: 'rgba(237,232,220,0.02)' }}>
                <h2 className="font-display italic mb-2" style={{ fontSize: '1.6rem', color: '#EDE8DC' }}>Would you also post it on Google?</h2>
                <p className="font-body font-light text-sm leading-relaxed mb-5" style={{ color: 'rgba(237,232,220,0.8)', maxWidth: '54ch' }}>
                  It takes a minute and means a lot to a small studio. Google only accepts reviews from your own Google account, so nothing is posted for you: copy your words, then paste them in.
                </p>
                <div className="flex flex-wrap gap-3">
                  {sent.body && (
                    <button type="button" onClick={() => copyReview(sent.body)}
                      className="font-body text-xs font-semibold cursor-pointer"
                      style={{ minHeight: 44, padding: '0 22px', borderRadius: 999, border: '1px solid rgba(237,232,220,0.2)', color: '#EDE8DC', background: 'transparent' }}>
                      {copied ? 'Copied' : 'Copy my review'}
                    </button>
                  )}
                  <a href={googleUrl} target="_blank" rel="noopener noreferrer" onClick={openGoogle}
                    className="inline-flex items-center justify-center font-body text-xs font-semibold cursor-pointer"
                    style={{ minHeight: 44, padding: '0 24px', borderRadius: 999, background: 'linear-gradient(135deg,#8B1010,#C41E1E)', color: '#F0EDED', letterSpacing: '0.04em' }}>
                    Open Google reviews
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} noValidate initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease }}>
            <p className="font-body text-[10px] tracking-[0.28em] uppercase mb-5" style={{ color: muted }}>
              {review.projectName ? `${review.projectName}` : 'Your project'} · now live
            </p>
            <h1 className="font-display italic mb-4" style={{ fontSize: 'clamp(2.6rem,7vw,4.6rem)', lineHeight: 0.98, letterSpacing: '-0.03em', color: '#EDE8DC' }}>
              How did we <span className="gradient-text">do{first ? `, ${first}` : ''}?</span>
            </h1>
            <p className="font-body font-light text-sm leading-relaxed mb-10" style={{ color: 'rgba(237,232,220,0.8)', maxWidth: '50ch' }}>
              A few honest words help the next business decide, and help us get better. It takes about a minute.
            </p>

            <div className="mb-10">
              <fieldset style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
                <legend className="font-body text-[10px] tracking-[0.22em] uppercase mb-4" style={{ color: muted }}>Your rating</legend>
                <StarInput value={rating} onChange={n => { setRating(n); setError(''); }} />
              </fieldset>
            </div>

            <div className="mb-8">
              <label htmlFor="review-body" className="font-body text-[10px] tracking-[0.22em] uppercase block mb-3" style={{ color: muted }}>Your review <span>(optional)</span></label>
              <textarea id="review-body" value={body} onChange={e => setBody(e.target.value)} maxLength={2000} rows={5}
                placeholder="What was it like working with us? What did you like, and what could be better?"
                className="w-full font-body text-sm resize-y"
                style={{ background: 'rgba(237,232,220,0.03)', border: '1px solid rgba(237,232,220,0.14)', borderRadius: 12, color: '#EDE8DC', padding: '14px 16px', lineHeight: 1.6, minHeight: 130 }} />
              <p className="font-body text-[11px] mt-1.5 text-right" style={{ color: muted }}>{body.length} / 2000</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
              <div>
                <label htmlFor="review-name" className="font-body text-[10px] tracking-[0.22em] uppercase block mb-3" style={{ color: muted }}>Your name</label>
                <input id="review-name" value={name} onChange={e => setName(e.target.value)} maxLength={80} autoComplete="name" required
                  className="w-full font-body text-sm" style={{ background: 'rgba(237,232,220,0.03)', border: '1px solid rgba(237,232,220,0.14)', borderRadius: 12, color: '#EDE8DC', padding: '0 16px', minHeight: 48 }} />
              </div>
              <div>
                <label htmlFor="review-business" className="font-body text-[10px] tracking-[0.22em] uppercase block mb-3" style={{ color: muted }}>Business <span>(optional)</span></label>
                <input id="review-business" value={business} onChange={e => setBusiness(e.target.value)} maxLength={120} autoComplete="organization"
                  className="w-full font-body text-sm" style={{ background: 'rgba(237,232,220,0.03)', border: '1px solid rgba(237,232,220,0.14)', borderRadius: 12, color: '#EDE8DC', padding: '0 16px', minHeight: 48 }} />
              </div>
            </div>

            <label htmlFor="review-consent" className="flex items-start gap-3 cursor-pointer mb-2" style={{ minHeight: 44 }}>
              <input id="review-consent" type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}
                className="mt-1 shrink-0" style={{ width: 20, height: 20, accentColor: '#C41E1E' }} />
              <span className="font-body font-light text-sm leading-relaxed" style={{ color: 'rgba(237,232,220,0.86)' }}>
                You can show my review, with my name{business.trim() ? ' and business' : ''}, on the Motion Visual website.
              </span>
            </label>
            <p className="font-body font-light text-xs leading-relaxed mb-8" style={{ color: muted, maxWidth: '60ch' }}>
              Our team reads every review. We only hold back anything abusive, spam, or about a different business, and we never edit your words. Without a tick here we keep your review private.
            </p>

            <div role="alert" aria-live="assertive">
              {error && <p className="font-body text-sm mb-4" style={{ color: '#F2766B' }}>{error}</p>}
            </div>
            <button type="submit" disabled={busy}
              className="font-body text-xs font-semibold cursor-pointer disabled:opacity-60"
              style={{ minHeight: 52, padding: '0 36px', borderRadius: 999, background: 'linear-gradient(135deg,#8B1010,#C41E1E)', color: '#F0EDED', letterSpacing: '0.06em' }}>
              {busy ? 'Sending…' : 'Send my review'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </Shell>
  );
}
