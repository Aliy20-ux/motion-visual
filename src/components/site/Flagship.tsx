'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';
import { supabase, type Lead } from '../../lib/supabase';
import { FLAGSHIP } from '../../flagship';
import { CARE_PLANS, carePriceLabel } from '../../commercial';
import Turnstile from './Turnstile';
import { TURNSTILE_SITE_KEY } from '../../lib/turnstile';
import { FieldLabel, UnderlineInput, UnderlineTextarea } from './QuoteForm';

const EASE = [0.16, 1, 0.3, 1] as const;
// Same human-speed check the quote form uses; the server repeats it.
const MIN_HUMAN_FILL_MS = 2500;

type Fields = { name: string; email: string; phone: string; notes: string };
const empty: Fields = { name: '', email: '', phone: '', notes: '' };

/** Flagship builds are scoped on a call, so this is an enquiry, not a quote. It reaches the team as a scoping-call request. */
export default function Flagship() {
  const [form, setForm] = useState<Fields>(empty);
  const [honeypot, setHoneypot] = useState('');
  const [mountedAt] = useState(() => Date.now());
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileRun, setTurnstileRun] = useState(0);
  const [turnstileBlocked, setTurnstileBlocked] = useState(false);

  const set = (k: keyof Fields, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const problems: Partial<Record<keyof Fields, string>> = {};
    if (!form.name.trim()) problems.name = 'Required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) problems.email = 'Invalid email';
    if (form.notes.trim().length < 10) problems.notes = 'A sentence or two, please';
    setErrors(problems);
    if (Object.keys(problems).length) return;
    if (TURNSTILE_SITE_KEY && !turnstileToken && !turnstileBlocked) {
      setFormError('Please complete the check above so we know you’re not a bot.');
      return;
    }
    // Bot-shaped: say nothing useful and send nothing.
    if (honeypot.trim() || Date.now() - mountedAt < MIN_HUMAN_FILL_MS) { setSubmitted(true); return; }

    setLoading(true);
    const lead: Lead = {
      business_name: form.name,
      contact_name: form.name,
      email: form.email,
      phone: form.phone,
      source: 'Website Flagship Enquiry',
      stage: 'New Lead',
      notes: ['Project type: Flagship enquiry', 'Package: Flagship — Custom', `\n${form.notes.trim()}`].join('\n'),
    };
    // The CRM record and the team email are independent routes for the same enquiry: either one landing is a success.
    const [dbResult, emailResult] = await Promise.allSettled([
      supabase.from('leads').insert([lead]).then(({ error }) => { if (error) throw error; }),
      fetch('/api/quote-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, email: form.email, phone: form.phone,
          project_type: 'Flagship enquiry', budget: 'Flagship — Custom', notes: form.notes,
          plan: 'Flagship', extraPages: 0, addOnIds: [],
          elapsedMs: Date.now() - mountedAt, turnstileToken,
        }),
      }).then(res => { if (!res.ok) throw Object.assign(new Error('Enquiry failed'), { status: res.status }); }),
    ]);
    setLoading(false);
    setTurnstileToken(null);
    setTurnstileRun(n => n + 1);

    if (dbResult.status === 'fulfilled' || emailResult.status === 'fulfilled') setSubmitted(true);
    else {
      const status = (emailResult.reason as { status?: number } | undefined)?.status;
      setFormError(status === 429
        ? 'You’ve sent a few enquiries already. Please email us at aliy20@hotmail.co.uk and we’ll help directly.'
        : 'Something went wrong. Email us at aliy20@hotmail.co.uk');
    }
  };

  return (
    <section id="flagship" aria-labelledby="flagship-heading" className="relative overflow-hidden"
      style={{ background: '#080809', padding: 'clamp(72px,9vw,124px) clamp(24px,5vw,88px)' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'rgba(237,232,220,0.07)' }} />
      <div className="absolute top-0 left-0 w-[640px] h-[560px] pointer-events-none"
        style={{ background: 'radial-gradient(circle at 0% 0%, rgba(196,30,30,0.07) 0%, transparent 65%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-14 xl:gap-24 items-start">

        <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.75, ease: EASE }}>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-8 h-px gradient-bg" />
            <span className="font-body text-[11px] tracking-[0.32em] uppercase" style={{ color: 'rgba(237,232,220,0.72)' }}>Flagship</span>
          </div>
          <h2 id="flagship-heading" className="font-display italic mb-6" style={{ fontSize: 'clamp(2.4rem,5.2vw,5.4rem)', lineHeight: 0.95, letterSpacing: '-0.025em' }}>
            <span style={{ color: '#EDE8DC' }}>Built to </span><span className="gradient-text">own your market.</span>
          </h2>
          <p className="font-body font-light text-sm leading-relaxed mb-8" style={{ color: 'rgba(237,232,220,0.8)', maxWidth: '48ch' }}>
            {FLAGSHIP.description} Flagship projects are scoped with you on a call, so you only pay for what you need. Tell us what you’re building and a founder will come back to you.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mb-8">
            {FLAGSHIP.features.map(f => (
              <li key={f} className="flex items-start gap-2.5 font-body text-[13px] leading-snug" style={{ color: 'rgba(237,232,220,0.86)' }}>
                <Check size={14} className="shrink-0 mt-0.5" style={{ color: '#C41E1E' }} aria-hidden="true" /> {f}
              </li>
            ))}
          </ul>
          <p className="font-body font-light text-xs leading-relaxed" style={{ color: 'rgba(237,232,220,0.72)' }}>
            Flagship care plan: {carePriceLabel('flagship').replace(/^From/, 'from')} a month, scoped with you, with up to {CARE_PLANS.flagship.updatesPerMonth} updates (fair use) and a quarterly review call.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.75, ease: EASE, delay: 0.08 }}
          style={{ borderRadius: 16, border: '1px solid rgba(196,30,30,0.3)', background: 'rgba(196,30,30,0.035)', padding: 'clamp(24px,3vw,40px)' }}
          aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            {submitted ? (
              <motion.div key="done" className="py-10 text-center" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }}>
                <span className="w-14 h-14 rounded-full gradient-bg flex items-center justify-center mx-auto mb-6" aria-hidden="true"><Check size={22} style={{ color: '#F0EDED' }} /></span>
                <h3 className="font-display italic mb-3" style={{ fontSize: 'clamp(2rem,3.4vw,3rem)', lineHeight: 1, color: '#EDE8DC' }}>Thank you.</h3>
                <p className="font-body font-light text-sm" style={{ color: 'rgba(237,232,220,0.8)', lineHeight: 1.7, maxWidth: '38ch', margin: '0 auto' }}>
                  Thanks {form.name.split(' ')[0] || 'there'}. One of our founders will reach out at <span style={{ color: '#EDE8DC' }}>{form.email}</span> to arrange a scoping call.
                </p>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={submit} noValidate exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <p className="font-display italic mb-6" style={{ fontSize: '1.6rem', color: '#EDE8DC' }}>Flagship enquiry</p>
                <div className="space-y-6">
                  <div>
                    <FieldLabel htmlFor="fl-name" label="Your name" error={errors.name} />
                    <UnderlineInput id="fl-name" value={form.name} onChange={v => set('name', v)} autoComplete="name" error={errors.name} />
                  </div>
                  <div>
                    <FieldLabel htmlFor="fl-email" label="Email" error={errors.email} />
                    <UnderlineInput id="fl-email" type="email" value={form.email} onChange={v => set('email', v)} autoComplete="email" error={errors.email} />
                  </div>
                  <div>
                    <FieldLabel htmlFor="fl-phone" label="Phone" optional />
                    <UnderlineInput id="fl-phone" type="tel" value={form.phone} onChange={v => set('phone', v)} autoComplete="tel" />
                  </div>
                  <div>
                    <FieldLabel htmlFor="fl-notes" label="About your business and what you need" error={errors.notes} />
                    <UnderlineTextarea id="fl-notes" value={form.notes} onChange={v => set('notes', v)} rows={4}
                      placeholder="Your business, the number of locations or pages, whether you sell online, and any timing that matters." />
                  </div>
                </div>

                {/* Honeypot: visually hidden, never seen by people. */}
                <div aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }}>
                  <label>Leave this empty<input tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} /></label>
                </div>

                <div className="mt-6">
                  <Turnstile key={turnstileRun} onToken={setTurnstileToken} onUnavailable={() => setTurnstileBlocked(true)} />
                </div>
                {formError && <p role="alert" className="font-body text-sm mt-4" style={{ color: '#F87171' }}>{formError}</p>}
                <button type="submit" disabled={loading}
                  className="w-full mt-6 font-body text-xs font-semibold cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ minHeight: 52, borderRadius: 999, background: 'linear-gradient(135deg,#8B1010,#C41E1E)', color: '#F0EDED', letterSpacing: '0.06em' }}>
                  {loading ? 'Sending…' : 'Send Flagship enquiry'}
                </button>
                <p className="font-body font-light text-[11px] mt-3 text-center" style={{ color: 'rgba(237,232,220,0.72)' }}>
                  Free consultation · No obligation
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
