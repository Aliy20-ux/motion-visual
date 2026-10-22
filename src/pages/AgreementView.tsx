import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Printer } from 'lucide-react';
import AgreementDocumentView from '../components/agreement/AgreementDocumentView';
import { formatDate, formatDateTime, KIND_LABEL } from '../legal/format';
import { COMPANY, COMPANY_DISCLOSURE } from '../legal/company';
import type { PublicAgreement } from '../legal/types';
import { scrollToHash, scrollToTarget } from '../lib/smoothScroll';

const ease = [0.23, 1, 0.32, 1] as const;
const muted = 'rgba(237,232,220,0.5)';

type Load =
  | { state: 'loading' }
  | { state: 'error'; message: string }
  | { state: 'ready'; agreement: PublicAgreement };

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
      <header className="no-print flex items-center justify-between" style={{ padding: 'clamp(20px,4vw,32px) clamp(24px,5vw,88px)' }}>
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo-dark.png" alt="Motion Visual" width={36} height={36} className="h-9 w-9 shrink-0 object-contain" />
          <span className="font-body text-[10px] tracking-[0.22em] uppercase" style={{ color: muted }}>Motion Visual</span>
        </Link>
        <span className="font-body text-[10px] tracking-[0.22em] uppercase" style={{ color: muted }}>Client agreement</span>
      </header>
      <main id="main-content" className="mx-auto" style={{ maxWidth: 1080, padding: 'clamp(12px,3vw,24px) clamp(20px,5vw,88px) clamp(80px,10vw,140px)' }}>
        {children}
      </main>
      <footer className="no-print" style={{ borderTop: '1px solid rgba(237,232,220,0.07)', padding: 'clamp(24px,4vw,32px) clamp(24px,5vw,88px)' }}>
        <p className="max-w-7xl mx-auto font-body text-xs leading-relaxed text-center" style={{ color: muted }}>
          {COMPANY_DISCLOSURE} <a className="underline underline-offset-2" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
        </p>
      </footer>
    </div>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-24 text-center mx-auto" style={{ maxWidth: '44ch' }}>
      <h1 className="font-display italic mb-4" style={{ fontSize: 'clamp(2.2rem,5vw,3.5rem)', letterSpacing: '-0.02em', color: '#EDE8DC' }}>{title}</h1>
      <div className="font-body font-light text-sm leading-relaxed" style={{ color: 'rgba(237,232,220,0.65)' }}>{children}</div>
    </div>
  );
}

export default function AgreementView() {
  const { token = '' } = useParams();
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [emailed, setEmailed] = useState<boolean | null>(null);
  usePrivatePageMeta('Your agreement — Motion Visual');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/agreement/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async res => {
        const data = (await res.json().catch(() => ({}))) as { agreement?: PublicAgreement; error?: string };
        if (cancelled) return;
        if (!res.ok || !data.agreement) setLoad({ state: 'error', message: data.error ?? 'We couldn’t load this agreement.' });
        else setLoad({ state: 'ready', agreement: data.agreement });
      })
      .catch(() => !cancelled && setLoad({ state: 'error', message: 'We couldn’t reach our server. Check your connection and reload the page.' }));
    return () => { cancelled = true; };
  }, [token]);

  if (load.state === 'loading') {
    return <Shell><div aria-busy="true" style={{ minHeight: '60svh' }} /></Shell>;
  }
  if (load.state === 'error') {
    return (
      <Shell>
        <Notice title="Agreement unavailable">
          <p>{load.message}</p>
          <p className="mt-3">If you think this is a mistake, email <a className="underline underline-offset-2" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.</p>
        </Notice>
      </Shell>
    );
  }

  const { agreement } = load;
  const doc = agreement.document;

  if (agreement.status === 'void') {
    return (
      <Shell>
        <Notice title="This agreement was withdrawn">
          <p>{doc.reference} is no longer open for signing — usually because we’ve sent you a revised version. Check your inbox for the latest copy, or email us.</p>
        </Notice>
      </Shell>
    );
  }

  const signed = agreement.status === 'signed';
  const signature = signed && agreement.signerName && agreement.signedAt
    ? {
        signerName: agreement.signerName,
        signedAt: agreement.signedAt,
        documentHash: agreement.documentHash,
        startChoice: typeof agreement.signerConsents?.startChoice === 'string' ? agreement.signerConsents.startChoice : null,
      }
    : null;

  return (
    <Shell>
      <AnimatePresence>
        {signed && signature && (
          <motion.div key="signed" className="no-print mb-14 flex flex-col sm:flex-row sm:items-center gap-5 p-6"
            style={{ border: '1px solid rgba(196,30,30,0.35)', background: 'rgba(196,30,30,0.06)' }}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease }}>
            <span className="w-11 h-11 rounded-full gradient-bg flex items-center justify-center shrink-0" aria-hidden="true">
              <Check size={20} style={{ color: '#F0EDED' }} />
            </span>
            <div className="flex-1" role="status">
              <p className="font-body text-sm" style={{ color: '#EDE8DC' }}>
                Signed by {signature.signerName} on {formatDateTime(signature.signedAt)}.
              </p>
              <p className="font-body font-light text-xs mt-1" style={{ color: muted }}>
                {emailed === false
                  ? 'Your signature is saved, but we couldn’t email your copy just now — save this page as a PDF, and we’ll resend it.'
                  : `A signed copy has been emailed to ${doc.client.email}. You can come back to this link at any time.`}
              </p>
            </div>
            <PrintButton />
          </motion.div>
        )}
      </AnimatePresence>

      {!signed && (
        <div className="no-print flex flex-wrap items-center justify-between gap-4 mb-12 pb-6" style={{ borderBottom: '1px solid rgba(237,232,220,0.07)' }}>
          <p className="font-body font-light text-sm" style={{ color: 'rgba(237,232,220,0.65)', maxWidth: '52ch' }}>
            Please read your {KIND_LABEL[doc.kind].toLowerCase()} below. Nothing is binding until you sign at the end.
          </p>
          <div className="flex items-center gap-4">
            <PrintButton />
            {agreement.status === 'sent' && (
              <a href="#sign" onClick={scrollToHash('#sign')} className="font-body text-xs rounded-full gradient-bg" style={{ padding: '10px 18px', color: '#F0EDED' }}>
                Go to signing
              </a>
            )}
          </div>
        </div>
      )}

      <AgreementDocumentView doc={doc} signature={signature} expiresAt={agreement.expiresAt} />

      {agreement.status === 'expired' && (
        <Notice title="This agreement has expired">
          <p>It was open until {agreement.expiresAt ? formatDate(agreement.expiresAt) : 'its expiry date'}. Email <a className="underline underline-offset-2" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> and we’ll send you a fresh copy.</p>
        </Notice>
      )}

      {agreement.status === 'sent' && (
        <SignPanel token={token} agreement={agreement}
          onSigned={(next, wasEmailed) => {
            setEmailed(wasEmailed);
            setLoad({ state: 'ready', agreement: next });
            scrollToTarget('#main-content');
          }} />
      )}
    </Shell>
  );
}

function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 font-body text-xs rounded-full transition-[background-color,border-color] duration-200 hover:bg-[rgba(237,232,220,0.06)] active:scale-[0.97]"
      style={{ padding: '9px 16px', border: '1px solid rgba(237,232,220,0.14)', color: '#EDE8DC' }}>
      <Printer size={14} aria-hidden="true" /> Save as PDF
    </button>
  );
}

function SignPanel({ token, agreement, onSigned }: {
  token: string;
  agreement: PublicAgreement;
  onSigned: (next: PublicAgreement, emailed: boolean) => void;
}) {
  const doc = agreement.document;
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [startChoice, setStartChoice] = useState<'now' | 'wait' | ''>('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);

  // A stale "please tick…" shouldn't linger once they've started fixing it.
  const clearError = () => error && setError('');

  const showError = (message: string) => {
    setError(message);
    requestAnimationFrame(() => errorRef.current?.focus());
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (doc.consents.some(c => c.required && !checks[c.id])) return showError('Please tick each confirmation box before signing.');
    if (doc.startChoiceRequired && !startChoice) return showError('Please choose when you’d like us to start work.');
    if (name.trim().length < 2) return showError('Please type your full name to sign.');

    setSubmitting(true);
    try {
      const res = await fetch('/api/agreement/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          documentHash: agreement.documentHash,
          signerName: name.trim(),
          consents: { ...checks, ...(doc.startChoiceRequired ? { startChoice } : {}) },
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { agreement?: PublicAgreement; emailed?: boolean; error?: string };
      if (!res.ok || !data.agreement) {
        showError(data.error ?? 'Something went wrong while signing. Please try again.');
      } else {
        onSigned(data.agreement, data.emailed !== false);
      }
    } catch {
      showError('We couldn’t reach our server. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="sign" aria-labelledby="sign-h" className="no-print mt-16 pt-12" style={{ borderTop: '1px solid rgba(237,232,220,0.12)', scrollMarginTop: 24 }}>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_15rem] gap-x-10 gap-y-8">
        <form onSubmit={submit} noValidate className="flex flex-col gap-8">
          <h2 id="sign-h" className="font-display italic" style={{ fontSize: 'clamp(2rem,4.5vw,3.2rem)', lineHeight: 1, letterSpacing: '-0.02em', color: '#EDE8DC' }}>
            Sign your {KIND_LABEL[doc.kind].toLowerCase()}
          </h2>

          <fieldset className="flex flex-col gap-4">
            <legend className="font-body text-[9px] tracking-[0.28em] uppercase mb-4" style={{ color: muted }}>Please confirm</legend>
            {doc.consents.map(c => (
              <label key={c.id} className="flex gap-3 items-start cursor-pointer">
                <input type="checkbox" checked={!!checks[c.id]}
                  onChange={e => { setChecks(prev => ({ ...prev, [c.id]: e.target.checked })); clearError(); }}
                  className="mt-1 h-4 w-4 shrink-0 accent-[#C41E1E]" />
                <span className="font-body font-light text-sm leading-relaxed" style={{ color: '#EDE8DC' }}>{c.label}</span>
              </label>
            ))}
          </fieldset>

          {doc.startChoiceRequired && doc.startChoices && (
            <fieldset className="flex flex-col gap-4">
              <legend className="font-body text-[9px] tracking-[0.28em] uppercase mb-2" style={{ color: muted }}>When should we start?</legend>
              <p className="font-body font-light text-xs leading-relaxed" style={{ color: muted, maxWidth: '62ch' }}>
                As a consumer you have 14 days to cancel. We can start now, or wait until those 14 days have passed.
              </p>
              {(['now', 'wait'] as const).map(choice => (
                <label key={choice} className="flex gap-3 items-start cursor-pointer">
                  <input type="radio" name="startChoice" value={choice} checked={startChoice === choice}
                    onChange={() => { setStartChoice(choice); clearError(); }} className="mt-1 h-4 w-4 shrink-0 accent-[#C41E1E]" />
                  <span className="font-body font-light text-sm leading-relaxed" style={{ color: '#EDE8DC' }}>{doc.startChoices![choice]}</span>
                </label>
              ))}
            </fieldset>
          )}

          <div>
            <label htmlFor="signer-name" className="font-body text-[9px] tracking-[0.28em] uppercase" style={{ color: muted }}>
              Type your full name to sign
            </label>
            <input id="signer-name" type="text" value={name} onChange={e => { setName(e.target.value); clearError(); }} autoComplete="name"
              maxLength={120} placeholder={doc.client.name}
              className="w-full bg-transparent font-body outline-none mt-1"
              style={{ color: '#EDE8DC', padding: '12px 0', fontSize: '0.95rem', borderBottom: '1px solid rgba(237,232,220,0.18)' }} />
            {/* The signature itself — what they type, set the way it will appear on the signed copy. */}
            <p aria-hidden="true" className="font-display italic mt-6 min-h-[1.2em] truncate"
              style={{ fontSize: 'clamp(2.2rem,6vw,3.6rem)', lineHeight: 1.1, color: name.trim() ? '#EDE8DC' : 'rgba(237,232,220,0.18)' }}>
              {name.trim() || 'Your signature'}
            </p>
            <div className="h-px mt-1" style={{ background: 'linear-gradient(to right, rgba(196,30,30,0.7), rgba(237,232,220,0.1))' }} />
          </div>

          {error && (
            <p ref={errorRef} tabIndex={-1} role="alert" className="font-body text-sm outline-none" style={{ color: '#F87171' }}>{error}</p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <button type="submit" disabled={submitting}
              className="gradient-bg font-body text-sm rounded-full disabled:opacity-60"
              style={{ padding: '14px 30px', color: '#F0EDED' }}>
              {submitting ? 'Signing…' : `Sign ${KIND_LABEL[doc.kind].toLowerCase()}`}
            </button>
            <p className="font-body font-light text-xs leading-relaxed" style={{ color: muted, maxWidth: '48ch' }}>
              Clicking sign is a legally binding electronic signature. We’ll record the time, your IP address and device, and email a signed copy to {doc.client.email}.
            </p>
          </div>
        </form>

        <QuestionBox token={token} />
      </div>
    </section>
  );
}

function QuestionBox({ token }: { token: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (message.trim().length < 2) return setError('Please write your question first.');
    setState('sending');
    try {
      const res = await fetch('/api/agreement/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, message: message.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) { setError(data.error ?? 'We couldn’t send your question.'); setState('idle'); }
      else setState('sent');
    } catch {
      setError('We couldn’t reach our server. Please try again.');
      setState('idle');
    }
  };

  return (
    <aside aria-label="Ask a question" className="self-start lg:pt-3" style={{ borderLeft: '2px solid rgba(196,30,30,0.6)', paddingLeft: '0.9rem' }}>
      <p className="font-body text-[9px] tracking-[0.28em] uppercase mb-1.5" style={{ color: muted }}>Not sure about something?</p>
      {state === 'sent' ? (
        <p role="status" className="font-body font-light text-[0.82rem] leading-relaxed" style={{ color: 'rgba(237,232,220,0.78)' }}>
          Thanks — we’ve got your question and will reply by email. If anything needs changing, we’ll send you a revised agreement.
        </p>
      ) : !open ? (
        <>
          <p className="font-body font-light text-[0.82rem] leading-relaxed mb-3" style={{ color: 'rgba(237,232,220,0.78)' }}>
            Ask before you sign. If the answer changes anything, we’ll send a revised version.
          </p>
          <button type="button" onClick={() => setOpen(true)} aria-expanded={open}
            className="font-body text-xs underline underline-offset-4 transition-opacity hover:opacity-70" style={{ color: '#E83838' }}>
            Ask a question
          </button>
        </>
      ) : (
        <form onSubmit={send} className="flex flex-col gap-3">
          <label htmlFor="question" className="sr-only">Your question</label>
          <textarea id="question" rows={4} value={message} onChange={e => setMessage(e.target.value)} maxLength={4000}
            placeholder="e.g. Can we add a gallery page?" autoFocus
            className="w-full bg-transparent font-body text-sm outline-none resize-y"
            style={{ color: '#EDE8DC', padding: '8px 0', borderBottom: '1px solid rgba(237,232,220,0.18)', lineHeight: 1.6 }} />
          {error && <p role="alert" className="font-body text-xs" style={{ color: '#F87171' }}>{error}</p>}
          <button type="submit" disabled={state === 'sending'}
            className="self-start font-body text-xs rounded-full transition-[background-color] duration-200 hover:bg-[rgba(237,232,220,0.06)] active:scale-[0.97] disabled:opacity-60"
            style={{ padding: '9px 16px', border: '1px solid rgba(237,232,220,0.14)', color: '#EDE8DC' }}>
            {state === 'sending' ? 'Sending…' : 'Send question'}
          </button>
        </form>
      )}
    </aside>
  );
}
