'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, type QuoteSubmission } from '../../lib/supabase';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';

const extras = [
  'SEO Package', 'E-commerce', 'Booking System', 'Admin Panel',
  'Scroll Animations', 'Branding', 'Copywriting', 'Maintenance',
];

const budgets = ['£2,000 – £5,000', '£5,000 – £10,000', '£10,000 – £20,000', '£20,000+'];
const timelines = ['ASAP', '2–4 weeks', '1–2 months', 'No rush'];

type Step = 1 | 2 | 3 | 4;

type FormData = {
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  website: string;
  project_type: string;
  extras: string[];
  budget: string;
  timeline: string;
  notes: string;
};

const initialData: FormData = {
  business_name: '', contact_name: '', email: '', phone: '',
  website: '', project_type: '', extras: [], budget: '', timeline: '', notes: '',
};

const inputClass = `w-full font-body text-sm bg-transparent border-b py-3 outline-none transition-colors duration-200 placeholder:text-white/20`;
const inputStyle = { borderBottomColor: 'rgba(244,241,236,0.15)', color: '#F4F1EC' };

export default function QuoteForm() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof FormData, val: string) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const toggleExtra = (extra: string) => {
    setForm(f => ({
      ...f,
      extras: f.extras.includes(extra) ? f.extras.filter(e => e !== extra) : [...f.extras, extra],
    }));
  };

  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (step === 1) {
      if (!form.business_name.trim()) e.business_name = 'Required';
      if (!form.contact_name.trim()) e.contact_name = 'Required';
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    }
    if (step === 3) {
      if (!form.budget) e.budget = 'Please select a budget';
      if (!form.timeline) e.timeline = 'Please select a timeline';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s => Math.min(s + 1, 4) as Step); };
  const back = () => setStep(s => Math.max(s - 1, 1) as Step);

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload: QuoteSubmission = { ...form, status: 'new' };
      const { error } = await supabase.from('quote_submissions').insert([payload]);
      if (error) throw error;
      setSubmitted(true);
    } catch {
      alert('Something went wrong. Please email us directly at hello@motionvisual.co.uk');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section id="quote" className="relative" style={{ padding: 'clamp(80px,10vw,140px) clamp(20px,5vw,80px)' }}>
        <motion.div
          className="max-w-2xl mx-auto text-center flex flex-col items-center gap-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}
        >
          <div className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center">
            <Check size={32} className="text-white" />
          </div>
          <h2 className="font-display italic gradient-text" style={{ fontSize: 'clamp(2rem,5vw,4rem)', letterSpacing: '-0.02em' }}>
            We'll be in touch.
          </h2>
          <p className="font-body font-light text-sm leading-relaxed" style={{ color: 'rgba(244,241,236,0.5)' }}>
            Thanks {form.contact_name.split(' ')[0]}. We've received your brief and one of the founders will reach out within 24 hours.
          </p>
        </motion.div>
      </section>
    );
  }

  const stepLabels = ['Business', 'Services', 'Budget', 'Notes'];

  return (
    <section id="quote" className="relative" style={{ padding: 'clamp(80px,10vw,140px) clamp(20px,5vw,80px)' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-8 h-px gradient-bg" />
          <span className="font-body text-[10px] tracking-[0.3em] uppercase" style={{ color: 'rgba(244,241,236,0.35)' }}>Get a Quote</span>
        </div>
        <h2 className="font-display italic mb-16" style={{ fontSize: 'clamp(2.5rem,6vw,6rem)', lineHeight: 0.92, letterSpacing: '-0.02em', color: '#F4F1EC' }}>
          Start something<br /><span className="gradient-text">remarkable.</span>
        </h2>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-14">
          {stepLabels.map((label, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    background: i + 1 < step ? 'linear-gradient(135deg,#7C3AED,#06B6D4)' : i + 1 === step ? 'rgba(124,58,237,0.2)' : 'rgba(244,241,236,0.08)',
                    border: i + 1 === step ? '1px solid #7C3AED' : 'none',
                  }}
                >
                  {i + 1 < step
                    ? <Check size={12} className="text-white" />
                    : <span className="font-body text-[10px]" style={{ color: i + 1 === step ? '#7C3AED' : 'rgba(244,241,236,0.3)' }}>{i + 1}</span>}
                </div>
                <span className="font-body text-[11px] tracking-wider uppercase hidden sm:block" style={{ color: i + 1 === step ? 'rgba(244,241,236,0.7)' : 'rgba(244,241,236,0.25)' }}>{label}</span>
              </div>
              {i < 3 && <div className="w-8 h-px" style={{ background: i + 1 < step ? '#7C3AED' : 'rgba(244,241,236,0.1)' }} />}
            </div>
          ))}
        </div>

        {/* Form steps */}
        <div className="glass rounded-2xl p-8 md:p-12">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h3 className="font-display italic text-2xl mb-8" style={{ color: '#F4F1EC' }}>Tell us about your business.</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <Field label="Business Name *" error={errors.business_name}>
                    <input className={inputClass} style={inputStyle} placeholder="e.g. The Crown Hotel" value={form.business_name} onChange={e => set('business_name', e.target.value)} />
                  </Field>
                  <Field label="Your Name *" error={errors.contact_name}>
                    <input className={inputClass} style={inputStyle} placeholder="First and last name" value={form.contact_name} onChange={e => set('contact_name', e.target.value)} />
                  </Field>
                  <Field label="Email Address *" error={errors.email}>
                    <input className={inputClass} style={inputStyle} type="email" placeholder="you@yourbusiness.com" value={form.email} onChange={e => set('email', e.target.value)} />
                  </Field>
                  <Field label="Phone (optional)">
                    <input className={inputClass} style={inputStyle} placeholder="+44 7700 000000" value={form.phone} onChange={e => set('phone', e.target.value)} />
                  </Field>
                  <Field label="Existing Website (optional)" className="md:col-span-2">
                    <input className={inputClass} style={inputStyle} placeholder="https://yoursite.com" value={form.website} onChange={e => set('website', e.target.value)} />
                  </Field>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h3 className="font-display italic text-2xl mb-2" style={{ color: '#F4F1EC' }}>What do you need?</h3>
                <p className="font-body text-xs mb-8" style={{ color: 'rgba(244,241,236,0.4)' }}>Select everything that applies — we'll tailor our proposal accordingly.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {extras.map(extra => {
                    const active = form.extras.includes(extra);
                    return (
                      <button
                        key={extra}
                        onClick={() => toggleExtra(extra)}
                        className="relative text-left p-4 rounded-xl transition-all duration-200"
                        style={{
                          background: active ? 'rgba(124,58,237,0.12)' : 'rgba(244,241,236,0.04)',
                          border: active ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(244,241,236,0.08)',
                        }}
                      >
                        {active && <div className="absolute top-3 right-3 w-4 h-4 rounded-full gradient-bg flex items-center justify-center"><Check size={9} className="text-white" /></div>}
                        <span className="font-body text-xs" style={{ color: active ? '#F4F1EC' : 'rgba(244,241,236,0.5)' }}>{extra}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h3 className="font-display italic text-2xl mb-8" style={{ color: '#F4F1EC' }}>Budget & timeline.</h3>
                <div className="space-y-8">
                  <Field label="Budget Range *" error={errors.budget}>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {budgets.map(b => (
                        <button key={b} onClick={() => set('budget', b)} className="p-4 rounded-xl text-left transition-all duration-200 font-body text-sm"
                          style={{ background: form.budget === b ? 'rgba(124,58,237,0.12)' : 'rgba(244,241,236,0.04)', border: form.budget === b ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(244,241,236,0.08)', color: form.budget === b ? '#F4F1EC' : 'rgba(244,241,236,0.5)' }}>
                          {b}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Ideal Timeline *" error={errors.timeline}>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {timelines.map(t => (
                        <button key={t} onClick={() => set('timeline', t)} className="p-4 rounded-xl text-left transition-all duration-200 font-body text-sm"
                          style={{ background: form.timeline === t ? 'rgba(124,58,237,0.12)' : 'rgba(244,241,236,0.04)', border: form.timeline === t ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(244,241,236,0.08)', color: form.timeline === t ? '#F4F1EC' : 'rgba(244,241,236,0.5)' }}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h3 className="font-display italic text-2xl mb-8" style={{ color: '#F4F1EC' }}>Anything else to add?</h3>
                <Field label="Project Notes (optional)">
                  <textarea
                    className={`${inputClass} resize-none`}
                    style={{ ...inputStyle, height: 120 }}
                    placeholder="Tell us about your brand, goals, inspiration, or anything that helps us understand your vision..."
                    value={form.notes}
                    onChange={e => set('notes', e.target.value)}
                  />
                </Field>
                {/* Summary */}
                <div className="mt-8 p-6 rounded-xl" style={{ background: 'rgba(244,241,236,0.04)', border: '1px solid rgba(244,241,236,0.08)' }}>
                  <p className="font-body text-xs tracking-wider uppercase mb-4" style={{ color: 'rgba(244,241,236,0.3)' }}>Summary</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[['Business', form.business_name], ['Contact', form.contact_name], ['Budget', form.budget], ['Timeline', form.timeline]].map(([k, v]) => (
                      <div key={k}>
                        <span className="font-body text-xs" style={{ color: 'rgba(244,241,236,0.35)' }}>{k}: </span>
                        <span className="font-body text-xs font-medium" style={{ color: 'rgba(244,241,236,0.7)' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  {form.extras.length > 0 && (
                    <p className="font-body text-xs mt-2" style={{ color: 'rgba(244,241,236,0.35)' }}>
                      Extras: <span style={{ color: 'rgba(244,241,236,0.7)' }}>{form.extras.join(', ')}</span>
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10">
            {step > 1
              ? <button onClick={back} className="flex items-center gap-2 font-body text-sm transition-opacity hover:opacity-100" style={{ color: 'rgba(244,241,236,0.45)' }}>
                  <ArrowLeft size={14} /> Back
                </button>
              : <div />}
            {step < 4
              ? <button onClick={next} className="gradient-bg flex items-center gap-2 rounded-full font-body text-sm font-medium text-white px-8 py-4 hover:opacity-90 transition-opacity">
                  Next <ArrowRight size={14} />
                </button>
              : <button onClick={submit} disabled={loading} className="gradient-bg flex items-center gap-2 rounded-full font-body text-sm font-medium text-white px-8 py-4 hover:opacity-90 transition-opacity disabled:opacity-50">
                  {loading ? 'Sending...' : 'Send Brief'} {!loading && <ArrowRight size={14} />}
                </button>}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children, error, className = '' }: { label: string; children: React.ReactNode; error?: string; className?: string }) {
  return (
    <div className={className}>
      <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1" style={{ color: 'rgba(244,241,236,0.4)' }}>{label}</label>
      {children}
      {error && <p className="font-body text-xs mt-1" style={{ color: '#F87171' }}>{error}</p>}
    </div>
  );
}
