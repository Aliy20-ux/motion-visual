'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, type QuoteSubmission } from '../../lib/supabase';
import { ArrowRight, Check } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

const projectTypes = ['New Website', 'Redesign', 'E-commerce', 'Something Else'] as const;
const budgets = ['£2,000 – £5,000', '£5,000 – £10,000', '£10,000 – £20,000', '£20,000+'] as const;

type FormData = {
  name: string;
  email: string;
  phone: string;
  project_type: string;
  budget: string;
  notes: string;
};

const initForm: FormData = { name: '', email: '', phone: '', project_type: '', budget: '', notes: '' };

/* ── Styled text input ── */
function StyledInput({
  type = 'text', value, onChange, placeholder,
}: { type?: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      className="w-full bg-transparent font-body text-sm outline-none"
      style={{
        color: '#EDE8DC',
        padding: '13px 16px',
        borderRadius: 10,
        border: focused ? '1px solid rgba(196,30,30,0.55)' : '1px solid rgba(237,232,220,0.1)',
        background: focused ? 'rgba(196,30,30,0.04)' : 'rgba(237,232,220,0.03)',
        transition: 'border-color 0.22s, background 0.22s',
        fontSize: '0.875rem',
      }}
    />
  );
}

/* ── Styled textarea ── */
function StyledTextarea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder="Goals, inspiration, existing brand — or leave blank and we'll cover it on the call."
      rows={3}
      className="w-full bg-transparent font-body text-sm outline-none resize-none"
      style={{
        color: '#EDE8DC',
        padding: '13px 16px',
        borderRadius: 10,
        border: focused ? '1px solid rgba(196,30,30,0.55)' : '1px solid rgba(237,232,220,0.1)',
        background: focused ? 'rgba(196,30,30,0.04)' : 'rgba(237,232,220,0.03)',
        lineHeight: 1.75,
        transition: 'border-color 0.22s, background 0.22s',
        fontSize: '0.875rem',
      }}
    />
  );
}

/* ── Field wrapper ── */
function Field({ label, error, optional, children }: {
  label: string; error?: string; optional?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="font-body text-[10px] tracking-[0.24em] uppercase"
          style={{ color: error ? '#F87171' : 'rgba(237,232,220,0.38)' }}>
          {label}
        </label>
        {optional && (
          <span className="font-body text-[9px] tracking-[0.15em] uppercase"
            style={{ color: 'rgba(237,232,220,0.18)' }}>Optional</span>
        )}
      </div>
      {children}
      {error && (
        <p className="font-body text-[10px] mt-1.5" style={{ color: '#F87171' }}>{error}</p>
      )}
    </div>
  );
}

/* ── Choice chips ── */
function ChipGroup({ label, options, value, onChange, error, optional }: {
  label: string; options: readonly string[];
  value: string; onChange: (v: string) => void; error?: string; optional?: boolean;
}) {
  return (
    <Field label={label} error={error} optional={optional}>
      <div className="flex flex-wrap gap-2 pt-0.5">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(value === opt ? '' : opt)}
            className="font-body text-xs rounded-full cursor-pointer"
            style={{
              padding: '9px 18px',
              background: value === opt ? 'rgba(196,30,30,0.14)' : 'rgba(237,232,220,0.04)',
              border: value === opt ? '1px solid rgba(196,30,30,0.5)' : '1px solid rgba(237,232,220,0.1)',
              color: value === opt ? '#EDE8DC' : 'rgba(237,232,220,0.45)',
              transition: 'all 0.18s',
            }}>
            {opt}
          </button>
        ))}
      </div>
    </Field>
  );
}

/* ── Main component ── */
export default function QuoteForm() {
  const [form, setForm] = useState<FormData>(initForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const set = (k: keyof FormData, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) e.name = 'Please enter your name.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Please enter a valid email.';
    if (!form.project_type) e.project_type = 'Please select one.';
    if (!form.budget) e.budget = 'Please select one.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload: QuoteSubmission = {
        business_name: form.name,
        contact_name: form.name,
        email: form.email,
        phone: form.phone,
        project_type: form.project_type,
        budget: form.budget,
        timeline: '',
        notes: form.notes,
        extras: [],
        status: 'new',
      };
      const { error: err } = await supabase.from('quote_submissions').insert([payload]);
      if (err) throw err;
      setSubmitted(true);
    } catch {
      setErrors({ email: 'Something went wrong. Email us at hello@motionvisual.co.uk' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="quote"
      className="relative overflow-hidden"
      style={{ background: '#09090A', padding: 'clamp(100px,12vw,160px) clamp(24px,5vw,88px)' }}
    >
      {/* Top rule */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'rgba(237,232,220,0.07)' }} />

      {/* Atmospheric glow */}
      <div className="absolute bottom-0 right-0 w-[700px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(circle at 100% 100%, rgba(196,30,30,0.07) 0%, transparent 65%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">

          {/* ── Success ── */}
          {submitted ? (
            <motion.div key="success"
              className="flex flex-col items-center justify-center py-24 text-center"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>

              <motion.div
                className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center mb-10"
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22, delay: 0.2 }}>
                <Check size={26} style={{ color: '#F0EDED' }} />
              </motion.div>

              <h2 className="font-display italic mb-4"
                style={{ fontSize: 'clamp(2.5rem,6vw,7rem)', lineHeight: 0.9, letterSpacing: '-0.025em', color: '#EDE8DC' }}>
                We'll be in touch.
              </h2>
              <p className="font-body font-light text-sm mt-4"
                style={{ color: 'rgba(237,232,220,0.42)', maxWidth: '38ch', lineHeight: 1.7 }}>
                Thanks {form.name.split(' ')[0] || 'there'}. One of our founders will reach out at{' '}
                <span style={{ color: '#EDE8DC' }}>{form.email}</span> within 24 hours.
              </p>
            </motion.div>
          ) : (

            /* ── Two-column layout ── */
            <motion.div key="form"
              className="grid grid-cols-1 lg:grid-cols-[1fr_1.55fr] gap-16 xl:gap-28 items-start"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}>

              {/* ── LEFT: Headline + trust ── */}
              <div className="lg:sticky lg:top-28">
                <motion.div className="flex items-center gap-4 mb-8"
                  initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.6 }}>
                  <div className="w-8 h-px gradient-bg" />
                  <span className="font-body text-[10px] tracking-[0.32em] uppercase"
                    style={{ color: 'rgba(237,232,220,0.35)' }}>
                    Free Enquiry
                  </span>
                </motion.div>

                <div className="overflow-hidden mb-1">
                  <motion.h2 className="font-display italic"
                    style={{ fontSize: 'clamp(2.2rem,4.8vw,6.5rem)', lineHeight: 0.9, letterSpacing: '-0.025em', color: '#EDE8DC' }}
                    initial={{ y: '108%' }} whileInView={{ y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.85, ease }}>
                    Start your
                  </motion.h2>
                </div>
                <div className="overflow-hidden mb-8">
                  <motion.h2 className="font-display italic gradient-text"
                    style={{ fontSize: 'clamp(2.2rem,4.8vw,6.5rem)', lineHeight: 0.9, letterSpacing: '-0.025em' }}
                    initial={{ y: '108%' }} whileInView={{ y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.85, ease, delay: 0.1 }}>
                    project.
                  </motion.h2>
                </div>

                <motion.p
                  className="font-body font-light text-sm leading-relaxed mb-12"
                  style={{ color: 'rgba(237,232,220,0.42)', maxWidth: '36ch' }}
                  initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                  viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.25 }}>
                  Fill in the form with your details — including your number so we can call you — and we'll come back with a personalised proposal within 24 hours. No obligation, no pressure.
                </motion.p>

                {/* Trust stats */}
                <motion.div
                  className="flex flex-col"
                  initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                  viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.35 }}>
                  {[
                    { stat: '24h', label: 'Proposal turnaround' },
                    { stat: '£0', label: 'Consultation fee' },
                    { stat: '28+', label: 'Sites delivered' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-5 py-5"
                      style={{ borderTop: '1px solid rgba(237,232,220,0.07)' }}>
                      <span className="font-display italic gradient-text"
                        style={{ fontSize: '1.5rem', letterSpacing: '-0.02em', minWidth: '3.8rem' }}>
                        {item.stat}
                      </span>
                      <span className="font-body text-xs" style={{ color: 'rgba(237,232,220,0.32)' }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                  <div style={{ height: 1, background: 'rgba(237,232,220,0.07)' }} />
                </motion.div>
              </div>

              {/* ── RIGHT: Form card ── */}
              <motion.div
                initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.8, ease, delay: 0.15 }}>

                <form
                  onSubmit={handleSubmit}
                  className="rounded-3xl"
                  style={{
                    background: 'rgba(237,232,220,0.025)',
                    border: '1px solid rgba(237,232,220,0.09)',
                    padding: 'clamp(28px,4vw,52px)',
                  }}>

                  {/* Name + Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <Field label="Your name" error={errors.name}>
                      <StyledInput value={form.name} onChange={v => set('name', v)} placeholder="James Miller" />
                    </Field>
                    <Field label="Phone number" optional>
                      <StyledInput type="tel" value={form.phone} onChange={v => set('phone', v)} placeholder="+44 7700 000 000" />
                    </Field>
                  </div>

                  {/* Email */}
                  <div className="mb-6">
                    <Field label="Email address" error={errors.email}>
                      <StyledInput type="email" value={form.email} onChange={v => set('email', v)} placeholder="you@yourbusiness.com" />
                    </Field>
                  </div>

                  {/* What do you need */}
                  <div className="mb-6">
                    <ChipGroup
                      label="What do you need?"
                      options={projectTypes}
                      value={form.project_type}
                      onChange={v => set('project_type', v)}
                      error={errors.project_type}
                    />
                  </div>

                  {/* Budget */}
                  <div className="mb-6">
                    <ChipGroup
                      label="Budget range"
                      options={budgets}
                      value={form.budget}
                      onChange={v => set('budget', v)}
                      error={errors.budget}
                    />
                  </div>

                  {/* Notes */}
                  <div className="mb-8">
                    <Field label="Anything to add" optional>
                      <StyledTextarea value={form.notes} onChange={v => set('notes', v)} />
                    </Field>
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 font-body font-semibold cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, #8B1010, #C41E1E)',
                      color: '#F0EDED',
                      padding: '17px 32px',
                      fontSize: '0.875rem',
                      letterSpacing: '0.04em',
                      borderRadius: 12,
                      border: 'none',
                      opacity: loading ? 0.7 : 1,
                    }}
                    whileHover={loading ? {} : { filter: 'brightness(1.1)', scale: 1.01 }}
                    whileTap={loading ? {} : { scale: 0.98 }}>
                    {loading ? 'Sending…' : 'Send Enquiry'}
                    {!loading && <ArrowRight size={16} />}
                  </motion.button>

                  <p className="text-center font-body text-[10px] tracking-[0.15em] uppercase mt-5"
                    style={{ color: 'rgba(237,232,220,0.18)' }}>
                    Free consultation · No obligation · Reply within 24h
                  </p>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
