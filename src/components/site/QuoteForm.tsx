'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, type QuoteSubmission } from '../../lib/supabase';
import { Check } from 'lucide-react';

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

/* ── Underline input ── */
function UnderlineInput({
  type = 'text', value, onChange, placeholder, id,
}: { type?: string; value: string; onChange: (v: string) => void; placeholder?: string; id?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      className="w-full bg-transparent font-body text-sm outline-none"
      style={{
        color: '#EDE8DC',
        padding: '12px 0',
        borderBottom: focused ? '1px solid rgba(196,30,30,0.6)' : '1px solid rgba(237,232,220,0.12)',
        transition: 'border-color 0.22s',
        fontSize: '0.9rem',
      }}
    />
  );
}

/* ── Underline textarea ── */
function UnderlineTextarea({ value, onChange, id }: { value: string; onChange: (v: string) => void; id?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      id={id}
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder="Tell us about your project..."
      rows={3}
      className="w-full bg-transparent font-body text-sm outline-none resize-none"
      style={{
        color: '#EDE8DC',
        padding: '12px 0',
        borderBottom: focused ? '1px solid rgba(196,30,30,0.6)' : '1px solid rgba(237,232,220,0.12)',
        lineHeight: 1.7,
        transition: 'border-color 0.22s',
        fontSize: '0.9rem',
      }}
    />
  );
}

/* ── Field label ── */
function FieldLabel({ htmlFor, label, optional, error }: {
  htmlFor?: string; label: string; optional?: boolean; error?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <label htmlFor={htmlFor} className="font-body text-[9px] tracking-[0.28em] uppercase"
        style={{ color: error ? '#F87171' : 'rgba(237,232,220,0.38)' }}>
        {label}
      </label>
      {optional && (
        <span className="font-body text-[9px] tracking-[0.15em] uppercase"
          style={{ color: 'rgba(237,232,220,0.18)' }}>Optional</span>
      )}
      {error && (
        <span className="font-body text-[9px]" style={{ color: '#F87171' }}>{error}</span>
      )}
    </div>
  );
}

/* ── Chip button ── */
function ChipGroup({ label, options, value, onChange, error, optional }: {
  label: string; options: readonly string[];
  value: string; onChange: (v: string) => void; error?: string; optional?: boolean;
}) {
  return (
    <div>
      <FieldLabel label={label} error={error} optional={optional} />
      <div className="flex flex-wrap gap-2 pt-2">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(value === opt ? '' : opt)}
            className="font-body text-xs rounded-full cursor-pointer transition-all duration-180"
            style={{
              padding: '8px 16px',
              background: value === opt ? 'rgba(196,30,30,0.12)' : 'transparent',
              border: value === opt ? '1px solid rgba(196,30,30,0.48)' : '1px solid rgba(237,232,220,0.1)',
              color: value === opt ? '#EDE8DC' : 'rgba(237,232,220,0.4)',
            }}>
            {opt}
          </button>
        ))}
      </div>
    </div>
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
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.project_type) e.project_type = 'Select one';
    if (!form.budget) e.budget = 'Select one';
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

                <motion.h2 className="font-display italic mb-1"
                  style={{ fontSize: 'clamp(2.4rem,5vw,7rem)', lineHeight: 0.9, letterSpacing: '-0.025em', color: '#EDE8DC' }}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0 }}
                  transition={{ duration: 0.85, ease }}>
                  Start your
                </motion.h2>
                <motion.h2 className="font-display italic gradient-text mb-8"
                  style={{ fontSize: 'clamp(2.4rem,5vw,7rem)', lineHeight: 0.9, letterSpacing: '-0.025em' }}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0 }}
                  transition={{ duration: 0.85, ease, delay: 0.08 }}>
                  project.
                </motion.h2>

                <motion.p
                  className="font-body font-light text-sm leading-relaxed mb-12"
                  style={{ color: 'rgba(237,232,220,0.42)', maxWidth: '38ch' }}
                  initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                  viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2 }}>
                  Fill in your details and we'll come back with a personalised proposal
                  within 24 hours. No obligation, no pressure.
                </motion.p>

                {/* ── Trust stats — horizontal row ── */}
                <motion.div
                  className="flex items-start gap-10"
                  initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                  viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.3 }}>
                  {[
                    { stat: '24h', label: 'Proposal turnaround' },
                    { stat: '£0', label: 'Consultation fee' },
                    { stat: '28+', label: 'Sites delivered' },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <span className="font-display italic gradient-text"
                        style={{ fontSize: 'clamp(1.6rem,2.8vw,2.6rem)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                        {item.stat}
                      </span>
                      <span className="font-body text-xs" style={{ color: 'rgba(237,232,220,0.3)' }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* ── RIGHT: Flat form ── */}
              <motion.div
                initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.8, ease, delay: 0.15 }}>

                <form onSubmit={handleSubmit} className="flex flex-col gap-8">

                  {/* Name + Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <FieldLabel htmlFor="name" label="Your name" error={errors.name} />
                      <UnderlineInput id="name" value={form.name} onChange={v => set('name', v)} placeholder="John Smith" />
                    </div>
                    <div>
                      <FieldLabel htmlFor="phone" label="Phone number" optional />
                      <UnderlineInput id="phone" type="tel" value={form.phone} onChange={v => set('phone', v)} placeholder="+44 7XXX XXXXXX" />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <FieldLabel htmlFor="email" label="Email address" error={errors.email} />
                    <UnderlineInput id="email" type="email" value={form.email} onChange={v => set('email', v)} placeholder="john@company.com" />
                  </div>

                  {/* What do you need */}
                  <ChipGroup
                    label="What do you need?"
                    options={projectTypes}
                    value={form.project_type}
                    onChange={v => set('project_type', v)}
                    error={errors.project_type}
                  />

                  {/* Budget */}
                  <ChipGroup
                    label="Budget range"
                    options={budgets}
                    value={form.budget}
                    onChange={v => set('budget', v)}
                    error={errors.budget}
                  />

                  {/* Notes */}
                  <div>
                    <FieldLabel htmlFor="notes" label="Anything to add" optional />
                    <UnderlineTextarea id="notes" value={form.notes} onChange={v => set('notes', v)} />
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center font-body font-semibold cursor-pointer rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, #8B1010, #C41E1E)',
                      color: '#F0EDED',
                      padding: '17px 32px',
                      fontSize: '0.875rem',
                      letterSpacing: '0.04em',
                      border: 'none',
                      opacity: loading ? 0.7 : 1,
                    }}
                    whileHover={loading ? {} : { filter: 'brightness(1.1)', scale: 1.01 }}
                    whileTap={loading ? {} : { scale: 0.98 }}>
                    {loading ? 'Sending…' : 'Send Enquiry'}
                  </motion.button>

                  <p className="text-center font-body text-[10px] tracking-[0.15em] uppercase -mt-4"
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
