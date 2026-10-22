import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { COMPANY } from '../legal/company';
import { Button, ErrorText, Label, TextArea, TextInput, muted } from './studio/ui';

// The customer's first-design brief, opened from the link in their quote email (/brief/<private token>).
// Field list and limits mirror server/briefs.ts, which is the authority — it re-validates everything.
const FIELDS: { key: string; label: string; hint?: string; max: number; required?: boolean; rows?: number }[] = [
  { key: 'businessName', label: 'Business name', max: 120, required: true },
  { key: 'whatYouDo', label: 'What does your business do?', hint: 'A few sentences in your own words.', max: 1500, required: true, rows: 4 },
  { key: 'location', label: 'Location and opening hours', max: 600, rows: 3 },
  { key: 'contactDetails', label: 'Contact details to show on the site', hint: 'Phone, email, address, social links.', max: 600, rows: 3 },
  { key: 'logoAndColours', label: 'Brand colours and fonts', hint: 'Only if you have specific ones.', max: 800, rows: 3 },
  { key: 'pages', label: 'What should each page say or show?', hint: 'List your pages and what goes on each one.', max: 4000, rows: 6 },
  { key: 'servicesAndPrices', label: 'Services, products and prices', max: 3000, rows: 5 },
  { key: 'links', label: 'Your social media and other links', hint: 'Instagram, Facebook, TikTok, Google Business Profile, booking or ordering links. If you have social pages, we’ll take your logo and photos from there.', max: 1000, rows: 3 },
  { key: 'likedSites', label: 'Websites you like', hint: 'Two or three, and what you like about them.', max: 1000, rows: 3 },
  { key: 'dislikes', label: 'Anything you dislike or want to avoid', max: 1000, rows: 3 },
  { key: 'tone', label: 'The feel or tone you want', hint: 'For example: warm and friendly, sleek and premium, playful.', max: 600, rows: 2 },
  { key: 'anythingElse', label: 'Anything else we should know?', max: 2000, rows: 4 },
];

type QuoteSummary = { reference: string; customerName: string; plan: string; extraPages: number; submitted: boolean };
type Phase = 'loading' | 'ready' | 'notfound' | 'unavailable' | 'done';

export default function Brief() {
  const { token = '' } = useParams();
  const [phase, setPhase] = useState<Phase>('loading');
  const [quote, setQuote] = useState<QuoteSummary | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [honeypot, setHoneypot] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Your brief — Motion Visual';
    const meta = document.querySelector('meta[name="robots"]');
    const prevRobots = meta?.getAttribute('content') ?? null;
    meta?.setAttribute('content', 'noindex, nofollow');
    return () => {
      document.title = prevTitle;
      if (prevRobots !== null) meta?.setAttribute('content', prevRobots);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/brief/view', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      .then(async res => {
        if (cancelled) return;
        if (res.status === 404) return setPhase('notfound');
        if (!res.ok) return setPhase('unavailable');
        const { quote: q } = (await res.json()) as { quote: QuoteSummary };
        setQuote(q);
        setPhase(q.submitted ? 'done' : 'ready');
      })
      .catch(() => !cancelled && setPhase('unavailable'));
    return () => { cancelled = true; };
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch('/api/brief/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, brief: values, website: honeypot }),
      });
      if (res.ok || res.status === 409) setPhase('done');
      else {
        const { error: code } = (await res.json().catch(() => ({}))) as { error?: string };
        setError(code && code !== 'unavailable' && code !== 'not_found' ? code : `Something went wrong. Please email ${COMPANY.email} and we’ll sort it out.`);
      }
    } catch {
      setError(`Something went wrong. Please email ${COMPANY.email} and we’ll sort it out.`);
    } finally {
      setBusy(false);
    }
  };

  const shell = (children: React.ReactNode) => (
    <div className="agreement-ui" style={{ background: '#0A0A0B', minHeight: '100svh' }}>
      <header style={{ padding: 'clamp(20px,4vw,32px) clamp(20px,5vw,64px)', borderBottom: '1px solid rgba(237,232,220,0.07)' }}>
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo-dark.png" alt="" width={32} height={32} className="h-8 w-8 shrink-0 object-contain" />
          <span className="font-body text-[10px] tracking-[0.22em] uppercase" style={{ color: muted }}>Motion Visual</span>
        </Link>
      </header>
      <main id="main-content" className="mx-auto" style={{ maxWidth: 760, padding: 'clamp(28px,5vw,56px) clamp(20px,5vw,40px) 96px' }}>{children}</main>
    </div>
  );

  const title = (text: string) => (
    <h1 className="font-display italic mb-4" style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', letterSpacing: '-0.02em', color: '#EDE8DC', lineHeight: 1 }}>{text}</h1>
  );
  const body = (text: React.ReactNode) => (
    <p className="font-body font-light text-sm leading-relaxed" style={{ color: 'rgba(237,232,220,0.7)', maxWidth: '60ch' }}>{text}</p>
  );

  if (phase === 'loading') return shell(<div aria-busy="true" style={{ minHeight: '40svh' }} />);
  if (phase === 'notfound') return shell(<>{title('We couldn’t find that link')}{body(<>Please check the link in your quote email, or email <a href={`mailto:${COMPANY.email}`} className="underline">{COMPANY.email}</a> and we’ll help.</>)}</>);
  if (phase === 'unavailable') return shell(<>{title('Something went wrong')}{body(<>Please try again in a moment, or email <a href={`mailto:${COMPANY.email}`} className="underline">{COMPANY.email}</a>.</>)}</>);
  if (phase === 'done') {
    return shell(<>
      {title('Thanks — we’ve got your brief')}
      {body(<>We’ve emailed you a confirmation. We’ll start your first design once your Project Agreement is signed and we have your content, and we aim to share it within 2 working days of that. If you have any questions, email <a href={`mailto:${COMPANY.email}`} className="underline">{COMPANY.email}</a> and quote {quote?.reference}.</>)}
    </>);
  }

  return shell(<>
    <p className="font-body text-[9px] tracking-[0.28em] uppercase mb-3" style={{ color: muted }}>Quote {quote?.reference} · {quote?.plan}</p>
    {title('Tell us about your business')}
    {body(<>Hi {quote?.customerName.split(' ')[0]}, this helps us design your first draft. Only the first two questions are required — answer what you can, and anything you leave blank we’ll ask about.</>)}
    <form onSubmit={submit} className="flex flex-col gap-6 mt-10">
      {/* Honeypot: real visitors never see or fill this. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
        <label>Website<input tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} /></label>
      </div>
      {FIELDS.map(f => (
        <div key={f.key}>
          <Label htmlFor={`brief-${f.key}`} hint={f.hint}>{f.label}{f.required ? ' *' : ''}</Label>
          {f.rows
            ? <TextArea id={`brief-${f.key}`} rows={f.rows} maxLength={f.max} required={f.required} value={values[f.key] ?? ''} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))} />
            : <TextInput id={`brief-${f.key}`} maxLength={f.max} required={f.required} value={values[f.key] ?? ''} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))} />}
        </div>
      ))}
      <p className="font-body font-light text-xs leading-relaxed" style={{ color: muted }}>
        By sending this brief you’re happy for us to use your logo and photos from your social media pages and Google listing on your new website. See our <Link to="/privacy" className="underline">Privacy Policy</Link>.
      </p>
      {error && <ErrorText>{error}</ErrorText>}
      <Button type="submit" variant="primary" disabled={busy} className="self-start" style={{ padding: '13px 28px' }}>
        {busy ? 'Sending…' : 'Send my brief'}
      </Button>
    </form>
  </>);
}
