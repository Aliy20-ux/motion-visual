import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Check, RefreshCw } from 'lucide-react';
import { COMPANY, COMPANY_DISCLOSURE } from '../legal/company';
import { TRACKER_STAGES, buildTracker, type TrackerRaw } from '../tracker';

const ease = [0.23, 1, 0.32, 1] as const;
const muted = 'rgba(237,232,220,0.5)';
const card = { borderRadius: 16, border: '1px solid rgba(237,232,220,0.1)', background: 'rgba(237,232,220,0.02)', padding: 'clamp(20px,3vw,28px)' } as const;

type Load = { state: 'loading' } | { state: 'error'; message: string } | { state: 'ready'; raw: TrackerRaw };

const when = (iso: string | null) => (iso ? new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', timeZone: 'UTC' }) : null);

function usePrivatePageMeta(title: string) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;
    const meta = document.querySelector('meta[name="robots"]');
    const prevRobots = meta?.getAttribute('content') ?? null;
    meta?.setAttribute('content', 'noindex, nofollow');
    return () => { document.title = prevTitle; if (prevRobots !== null) meta?.setAttribute('content', prevRobots); };
  }, [title]);
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="agreement-ui" style={{ background: '#0A0A0B', minHeight: '100svh' }}>
      <header className="flex items-center justify-between" style={{ padding: 'clamp(20px,4vw,32px) clamp(24px,5vw,88px)' }}>
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo-dark.png" alt="" width={36} height={36} className="h-9 w-9 shrink-0 object-contain" />
          <span className="font-body text-[11px] tracking-[0.22em] uppercase" style={{ color: muted }}>Motion Visual</span>
        </Link>
        <span className="font-body text-[11px] tracking-[0.22em] uppercase" style={{ color: muted }}>Project tracker</span>
      </header>
      <main id="main-content" className="mx-auto" style={{ maxWidth: 860, padding: 'clamp(16px,4vw,48px) clamp(20px,5vw,40px) clamp(80px,10vw,140px)' }}>{children}</main>
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

const Row = ({ label, value, done }: { label: string; value: string | null; done: boolean }) => (
  <li className="flex items-center justify-between gap-4 py-3" style={{ borderTop: '1px solid rgba(237,232,220,0.07)' }}>
    <span className="flex items-center gap-2.5 font-body text-[13px]" style={{ color: 'rgba(237,232,220,0.86)' }}>
      <span aria-hidden="true" className="flex items-center justify-center shrink-0" style={{ width: 18, height: 18, borderRadius: 999, border: done ? '1px solid transparent' : '1px solid rgba(237,232,220,0.25)', background: done ? 'linear-gradient(135deg,#8B1010,#C41E1E)' : 'transparent' }}>
        {done && <Check size={11} style={{ color: '#F0EDED' }} />}
      </span>
      {label}
    </span>
    <span className="font-body text-[13px] text-right" style={{ color: value ? '#EDE8DC' : muted }}>{value ?? 'Not yet'}</span>
  </li>
);

export default function ProjectTracker() {
  const { token = '' } = useParams();
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [refreshing, setRefreshing] = useState(false);
  usePrivatePageMeta('Your project — Motion Visual');

  const fetchIt = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch('/api/project/open', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }), signal });
      const data = (await res.json().catch(() => ({}))) as { project?: TrackerRaw; error?: string };
      if (!res.ok || !data.project) return setLoad(l => (l.state === 'ready' ? l : { state: 'error', message: data.error ?? 'We couldn’t load this page.' }));
      setLoad({ state: 'ready', raw: data.project });
    } catch (err) {
      if ((err as { name?: string }).name === 'AbortError') return;
      setLoad(l => (l.state === 'ready' ? l : { state: 'error', message: 'We couldn’t reach our server. Check your connection and reload the page.' }));
    }
  }, [token]);

  useEffect(() => {
    const ctrl = new AbortController();
    void fetchIt(ctrl.signal);
    // Coming back to the tab refreshes it, so the page is current without asking.
    const onVisible = () => { if (document.visibilityState === 'visible') void fetchIt(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { ctrl.abort(); document.removeEventListener('visibilitychange', onVisible); };
  }, [fetchIt]);

  const refresh = async () => { setRefreshing(true); await fetchIt(); setRefreshing(false); };

  if (load.state === 'loading') return <Shell><div aria-busy="true" style={{ minHeight: '50svh' }} /></Shell>;
  if (load.state === 'error') {
    return (
      <Shell>
        <Notice title="Project page unavailable">
          <p>{load.message}</p>
          <p className="mt-3">If you think this is a mistake, email <a className="underline underline-offset-2" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.</p>
        </Notice>
      </Shell>
    );
  }

  const { raw } = load;
  const v = buildTracker(raw);
  const signed = raw.agreement?.status === 'signed';

  return (
    <Shell>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease }}>
        <p className="font-body text-[11px] tracking-[0.28em] uppercase mb-5" style={{ color: muted }}>{raw.businessName ?? 'Your project'}</p>
        <h1 className="font-display italic mb-8" style={{ fontSize: 'clamp(2.2rem,5.5vw,4rem)', lineHeight: 1, letterSpacing: '-0.025em', color: '#EDE8DC' }}>{raw.projectName}</h1>

        {/* The headline: where the 14 days are up to */}
        <section aria-label="Progress" style={{ ...card, marginBottom: 20 }}>
          {v.phase === 'live' ? (
            <>
              <p className="font-display italic gradient-text" style={{ fontSize: 'clamp(2.6rem,7vw,4.6rem)', lineHeight: 1 }}>Your site is live.</p>
              <p className="font-body font-light text-sm mt-3" style={{ color: 'rgba(237,232,220,0.8)' }}>
                {raw.launchDate ? `Launched ${when(raw.launchDate)}. ` : ''}Thank you for working with us.
              </p>
              {raw.reviewToken && (
                <Link to={`/review/${raw.reviewToken}`} className="inline-flex items-center gap-2 font-body text-xs font-semibold mt-5"
                  style={{ minHeight: 46, padding: '0 22px', borderRadius: 999, background: 'linear-gradient(135deg,#8B1010,#C41E1E)', color: '#F0EDED', letterSpacing: '0.04em' }}>
                  Tell us how we did <ArrowRight size={14} aria-hidden="true" />
                </Link>
              )}
            </>
          ) : v.phase === 'underway' ? (
            <>
              <p className="font-body text-[11px] tracking-[0.24em] uppercase mb-3" style={{ color: muted }}>{v.pastTarget ? 'Past the 14-day target' : 'Your 14 days'}</p>
              <p className="font-display italic" style={{ fontSize: 'clamp(3rem,9vw,5.5rem)', lineHeight: 0.95, letterSpacing: '-0.03em', color: '#EDE8DC' }}>
                Day {v.day} <span style={{ color: muted, fontSize: '0.5em' }}>of {v.totalDays}</span>
              </p>
              <div role="progressbar" aria-label="Days used" aria-valuemin={0} aria-valuemax={v.totalDays} aria-valuenow={Math.min(v.day ?? 0, v.totalDays)} className="mt-6" style={{ height: 6, borderRadius: 999, background: 'rgba(237,232,220,0.08)', overflow: 'hidden' }}>
                <div style={{ width: `${v.progress * 100}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#8B1010,#E03A3A)' }} />
              </div>
              <p className="font-body font-light text-sm mt-4" style={{ color: 'rgba(237,232,220,0.8)' }}>
                {v.pastTarget
                  ? `The target for sharing your site was ${when(v.siteBy)}. We’re still working on it, and you can email us any time.`
                  : `We aim to share your finished site by ${when(v.siteBy)}.`}
              </p>
            </>
          ) : (
            <>
              <p className="font-display italic" style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', lineHeight: 1.05, color: '#EDE8DC' }}>Your 14 days haven’t started yet.</p>
              <p className="font-body font-light text-sm mt-3" style={{ color: 'rgba(237,232,220,0.8)', maxWidth: '52ch' }}>
                The clock starts on the day we have both your signed agreement and your content. Here’s what we’re waiting for.
              </p>
            </>
          )}
        </section>

        {/* Waiting on you */}
        {v.waiting.length > 0 && (
          <section aria-label="Waiting on you" style={{ ...card, marginBottom: 20, border: '1px solid rgba(196,30,30,0.4)', background: 'rgba(196,30,30,0.06)' }}>
            <p className="font-body text-[11px] tracking-[0.24em] uppercase mb-3" style={{ color: '#E86A6A' }}>Waiting on you</p>
            <ul>
              {v.waiting.map(w => (
                <li key={w.id} className="flex items-center justify-between gap-4 py-2 flex-wrap">
                  <span className="font-body text-sm" style={{ color: '#EDE8DC' }}>{w.text}</span>
                  {w.href && (
                    <Link to={w.href} className="inline-flex items-center gap-2 font-body text-xs font-semibold shrink-0"
                      style={{ minHeight: 44, padding: '0 20px', borderRadius: 999, background: 'linear-gradient(135deg,#8B1010,#C41E1E)', color: '#F0EDED' }}>
                      Open <ArrowRight size={13} aria-hidden="true" />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {raw.note && (
          <section aria-label="A note from us" style={{ ...card, marginBottom: 20 }}>
            <p className="font-body text-[11px] tracking-[0.24em] uppercase mb-2" style={{ color: muted }}>A note from us</p>
            <p className="font-body text-sm leading-relaxed" style={{ color: '#EDE8DC', whiteSpace: 'pre-line' }}>{raw.note}</p>
          </section>
        )}

        {/* Stages */}
        <section aria-label="Stages" style={{ ...card, marginBottom: 20 }}>
          <p className="font-body text-[11px] tracking-[0.24em] uppercase mb-5" style={{ color: muted }}>Where it’s at</p>
          <ol className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 12 }}>
            {TRACKER_STAGES.map((s, i) => {
              const state = v.phase === 'live' || i < v.stageIndex ? 'done' : i === v.stageIndex ? 'now' : 'next';
              return (
                <li key={s} aria-current={state === 'now' ? 'step' : undefined} className="font-body text-[13px]" style={{ paddingTop: 12, borderTop: `2px solid ${state === 'next' ? 'rgba(237,232,220,0.1)' : state === 'now' ? '#E03A3A' : '#8B1010'}`, color: state === 'next' ? muted : '#EDE8DC' }}>
                  <span className="block text-[11px] tracking-[0.2em] uppercase mb-1" style={{ color: state === 'now' ? '#E86A6A' : muted }}>{state === 'done' ? 'Done' : state === 'now' ? 'Now' : 'Next'}</span>
                  {s}
                </li>
              );
            })}
          </ol>
        </section>

        {/* Dates */}
        <section aria-label="Key dates" style={card}>
          <p className="font-body text-[11px] tracking-[0.24em] uppercase mb-3" style={{ color: muted }}>The details</p>
          <ul>
            {raw.agreement && <Row label="Project Agreement signed" value={signed ? when(raw.agreement.signedOn) : null} done={signed} />}
            <Row label="Your content received" value={when(raw.contentReceivedOn)} done={!!raw.contentReceivedOn} />
            <Row label="First design (target)" value={when(v.firstDesignBy)} done={v.stageIndex > 1 || v.phase === 'live'} />
            <Row label={v.phase === 'live' ? 'Launched' : 'Finished site shared by'} value={v.phase === 'live' ? when(raw.launchDate) : when(v.siteBy)} done={v.phase === 'live'} />
          </ul>
          <p className="font-body font-light text-[11px] leading-relaxed mt-4" style={{ color: muted }}>
            Dates count working days Monday to Friday and are targets. See your Project Agreement for the terms.
          </p>
        </section>

        <div className="flex items-center justify-between gap-4 flex-wrap mt-8">
          <button type="button" onClick={refresh} disabled={refreshing} className="inline-flex items-center gap-2 font-body text-xs cursor-pointer disabled:opacity-60"
            style={{ minHeight: 44, padding: '0 18px', borderRadius: 999, border: '1px solid rgba(237,232,220,0.18)', color: '#EDE8DC' }}>
            <RefreshCw size={13} aria-hidden="true" /> {refreshing ? 'Checking…' : 'Check for updates'}
          </button>
          <p className="font-body font-light text-xs" style={{ color: muted }}>Questions? <a className="underline underline-offset-2" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></p>
        </div>
      </motion.div>
    </Shell>
  );
}
