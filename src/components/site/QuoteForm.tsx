'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, type QuoteSubmission } from '../../lib/supabase';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';

/* ── Question definitions ── */
type QType = 'text' | 'email' | 'choice' | 'textarea';
interface Question {
  id: string;
  q: string;
  sub: string;
  type: QType;
  placeholder?: string;
  options?: string[];
  required: boolean;
}

const questions: Question[] = [
  {
    id: 'business_name',
    q: "What's your\nbusiness called?",
    sub: "We'll personalise everything around your brand.",
    type: 'text',
    placeholder: 'e.g. The Crown Hotel',
    required: true,
  },
  {
    id: 'contact_name',
    q: "And your name?",
    sub: "So we know who we're speaking to.",
    type: 'text',
    placeholder: 'First and last name',
    required: true,
  },
  {
    id: 'email',
    q: "Best email\nto reach you?",
    sub: "We'll send your proposal here. No spam, ever.",
    type: 'email',
    placeholder: 'you@yourbusiness.com',
    required: true,
  },
  {
    id: 'budget',
    q: "What's your\nbudget?",
    sub: "This helps us scope the right solution for you.",
    type: 'choice',
    options: ['£2,000 – £5,000', '£5,000 – £10,000', '£10,000 – £20,000', '£20,000+'],
    required: true,
  },
  {
    id: 'timeline',
    q: "When do you\nneed it?",
    sub: "We'll work backwards from your deadline.",
    type: 'choice',
    options: ['ASAP', '2–4 weeks', '1–2 months', 'No rush'],
    required: true,
  },
  {
    id: 'notes',
    q: "Anything else\nto add?",
    sub: "Goals, inspiration, existing brand — or skip and we'll cover it in our call.",
    type: 'textarea',
    placeholder: 'Start typing…',
    required: false,
  },
];

type FormData = {
  business_name: string; contact_name: string; email: string;
  budget: string; timeline: string; notes: string;
  phone: string; website: string; project_type: string; extras: string[];
};

const initForm: FormData = {
  business_name: '', contact_name: '', email: '',
  budget: '', timeline: '', notes: '',
  phone: '', website: '', project_type: '', extras: [],
};

type Phase = 'intro' | 'form' | 'success';

/* ── Gold underline input ── */
function GoldInput({
  type = 'text',
  value,
  onChange,
  onKeyDown,
  placeholder,
  inputRef,
  autoFocus,
}: {
  type?: string; value: string; onChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  placeholder?: string; inputRef: React.RefObject<HTMLInputElement | null>; autoFocus?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative max-w-2xl">
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        autoComplete="off"
        autoFocus={autoFocus}
        className="w-full bg-transparent outline-none font-display italic pb-5"
        style={{
          fontSize: 'clamp(1.8rem,3.8vw,3.2rem)',
          letterSpacing: '-0.02em',
          color: '#EDE8DC',
          borderBottom: '1px solid rgba(237,232,220,0.14)',
          caretColor: '#C41E1E',
        }}
      />
      {/* Animated gold underline */}
      <motion.div
        className="absolute bottom-0 left-0 h-px"
        style={{ background: 'linear-gradient(to right, #8B1010, #E83838)' }}
        animate={{ width: focused ? '100%' : '0%' }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

/* ── Gold underline textarea ── */
function GoldTextarea({
  value, onChange, placeholder, textareaRef,
}: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative max-w-2xl">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        rows={5}
        className="w-full bg-transparent outline-none resize-none font-body py-3 pb-4"
        style={{
          fontSize: 'clamp(1rem,1.4vw,1.25rem)',
          lineHeight: 1.75,
          color: '#EDE8DC',
          borderBottom: '1px solid rgba(237,232,220,0.14)',
          caretColor: '#C41E1E',
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 h-px"
        style={{ background: 'linear-gradient(to right, #8B1010, #E83838)' }}
        animate={{ width: focused ? '100%' : '0%' }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

/* ── Choice card ── */
function ChoiceCard({
  label, keyHint, selected, onClick,
}: { label: string; keyHint: string; selected: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="relative text-left rounded-2xl cursor-pointer"
      style={{
        padding: 'clamp(20px,2.5vw,32px) clamp(20px,2.5vw,32px)',
        background: selected ? 'rgba(196,30,30,0.1)' : 'rgba(237,232,220,0.03)',
        border: selected
          ? '1px solid rgba(196,30,30,0.5)'
          : '1px solid rgba(237,232,220,0.09)',
      }}
      whileHover={{ scale: 1.02, background: 'rgba(237,232,220,0.055)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Key hint */}
      <span className="absolute top-4 right-5 font-body text-[10px] tracking-widest"
        style={{ color: selected ? 'rgba(196,30,30,0.8)' : 'rgba(237,232,220,0.2)' }}>
        {keyHint}
      </span>

      {/* Label */}
      <p className="font-display italic pr-8"
        style={{
          fontSize: 'clamp(1.2rem,2vw,1.75rem)',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          color: selected ? '#EDE8DC' : 'rgba(237,232,220,0.6)',
        }}>
        {label}
      </p>

      {/* Selected check */}
      {selected && (
        <motion.div
          className="absolute top-4 left-5"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
          <Check size={13} style={{ color: '#C41E1E' }} />
        </motion.div>
      )}
    </motion.button>
  );
}

/* ── Gold CTA button ── */
function GoldButton({ children, onClick, disabled }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-3 rounded-full font-body font-semibold cursor-pointer"
      style={{
        background: 'linear-gradient(135deg, #8B1010, #C41E1E)',
        color: '#F0EDED',
        padding: '15px 36px',
        fontSize: '0.875rem',
        letterSpacing: '0.02em',
        opacity: disabled ? 0.6 : 1,
      }}
      whileHover={disabled ? {} : { scale: 1.04, filter: 'brightness(1.08)' }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.button>
  );
}

/* ── Main component ── */
export default function QuoteForm() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [qIdx, setQIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [form, setForm] = useState<FormData>(initForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const q = questions[qIdx];
  const isLast = qIdx === questions.length - 1;
  const progressPct = ((qIdx + 1) / questions.length) * 100;

  /* Auto-focus input on question change */
  useEffect(() => {
    if (phase !== 'form') return;
    const t = setTimeout(() => {
      if (q.type === 'textarea') textareaRef.current?.focus();
      else inputRef.current?.focus();
    }, 480);
    return () => clearTimeout(t);
  }, [qIdx, phase, q.type]);

  /* Keyboard shortcuts for choice questions */
  useEffect(() => {
    if (phase !== 'form' || q.type !== 'choice') return;
    const map: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
    const handler = (e: KeyboardEvent) => {
      const i = map[e.key.toLowerCase()];
      if (i !== undefined && q.options && i < q.options.length) {
        selectChoice(q.options[i]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, qIdx, q.type]);

  const getValue = () => (form as Record<string, unknown>)[q.id] as string;
  const setValue = (val: string) => {
    setForm(f => ({ ...f, [q.id]: val }));
    setError('');
  };

  const validate = useCallback((): boolean => {
    const val = getValue();
    if (q.required && !String(val).trim()) {
      setError('This field is required.');
      return false;
    }
    if (q.id === 'email' && val && !/\S+@\S+\.\S+/.test(String(val))) {
      setError('Please enter a valid email address.');
      return false;
    }
    return true;
  }, [q, form]);

  const advance = useCallback(async () => {
    if (!validate()) return;
    setError('');
    if (!isLast) {
      setDir(1);
      setQIdx(i => i + 1);
    } else {
      setLoading(true);
      try {
        const payload: QuoteSubmission = { ...form, status: 'new' };
        const { error: err } = await supabase.from('quote_submissions').insert([payload]);
        if (err) throw err;
        setPhase('success');
      } catch {
        setError('Something went wrong. Please email hello@motionvisual.co.uk');
      } finally {
        setLoading(false);
      }
    }
  }, [validate, isLast, form]);

  const goBack = () => {
    if (qIdx > 0) { setDir(-1); setQIdx(i => i - 1); setError(''); }
    else setPhase('intro');
  };

  const skip = () => {
    if (!q.required) {
      setError('');
      if (!isLast) { setDir(1); setQIdx(i => i + 1); }
      else advance();
    }
  };

  const selectChoice = (opt: string) => {
    setForm(f => ({ ...f, [q.id]: opt }));
    setError('');
    setTimeout(() => {
      if (!isLast) { setDir(1); setQIdx(i => i + 1); }
      else advance();
    }, 300);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && q.type !== 'textarea') { e.preventDefault(); advance(); }
  };

  /* Slide variants */
  const variants = {
    enter: (d: number) => ({ y: d > 0 ? 64 : -64, opacity: 0 }),
    center: { y: 0, opacity: 1 },
    exit: (d: number) => ({ y: d > 0 ? -64 : 64, opacity: 0 }),
  };

  const ease = [0.16, 1, 0.3, 1] as const;
  const CRIMSON = 'linear-gradient(to right, #8B1010, #C41E1E, #D0D0D0)';

  return (
    <section id="quote" style={{ background: '#09090A', minHeight: '100svh', position: 'relative', overflow: 'hidden' }}>
      <div style={{ height: 1, background: 'rgba(237,232,220,0.07)' }} />

      {/* ── Gold progress bar ── */}
      {phase === 'form' && (
        <motion.div
          className="absolute top-0 left-0 h-[2px] z-20"
          style={{ background: CRIMSON }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.55, ease }}
        />
      )}

      {/* ── INTRO ── */}
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro"
            className="flex flex-col justify-center"
            style={{ minHeight: '100svh', padding: 'clamp(80px,10vw,140px) clamp(24px,7vw,120px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -32 }}
            transition={{ duration: 0.55 }}>

            <motion.div className="flex items-center gap-4 mb-10"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.6, ease }}>
              <div className="w-8 h-px" style={{ background: CRIMSON }} />
              <span className="font-body text-[10px] tracking-[0.32em] uppercase" style={{ color: 'rgba(237,232,220,0.35)' }}>
                {questions.length} questions · 3 minutes
              </span>
            </motion.div>

            <div className="overflow-hidden">
              <motion.h2 className="font-display italic"
                style={{ fontSize: 'clamp(2rem,8vw,11rem)', lineHeight: 0.88, letterSpacing: '-0.025em', color: '#EDE8DC' }}
                initial={{ y: '108%' }} animate={{ y: 0 }}
                transition={{ duration: 1.0, ease, delay: 0.2 }}>
                Start something
              </motion.h2>
            </div>
            <div className="overflow-hidden mb-12">
              <motion.h2 className="font-display italic gradient-text"
                style={{ fontSize: 'clamp(2rem,8vw,11rem)', lineHeight: 0.88, letterSpacing: '-0.025em' }}
                initial={{ y: '108%' }} animate={{ y: 0 }}
                transition={{ duration: 1.0, ease, delay: 0.32 }}>
                remarkable.
              </motion.h2>
            </div>

            <motion.p className="font-body font-light text-sm leading-relaxed mb-14 max-w-sm"
              style={{ color: 'rgba(237,232,220,0.42)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65, duration: 0.7 }}>
              Tell us about your project and we'll come back with a personalised proposal within 24 hours — no obligation, no sales pressure.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.78, duration: 0.6 }}>
              <GoldButton onClick={() => setPhase('form')}>
                Let's begin <ArrowRight size={16} />
              </GoldButton>
            </motion.div>

            {/* Ambient glow */}
            <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(196,30,30,0.06) 0%, transparent 70%)' }} />
          </motion.div>
        )}

        {/* ── QUESTIONS ── */}
        {phase === 'form' && (
          <motion.div key="form"
            className="flex flex-col"
            style={{ minHeight: '100svh', padding: 'clamp(80px,10vw,120px) clamp(24px,7vw,120px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}>

            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={qIdx}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.52, ease }}
                className="flex flex-col justify-center flex-1 max-w-4xl">

                {/* Counter + back */}
                <div className="flex items-center gap-6 mb-10">
                  <span className="font-body text-[10px] tracking-[0.3em] uppercase" style={{ color: 'rgba(237,232,220,0.28)' }}>
                    {String(qIdx + 1).padStart(2, '0')} / {String(questions.length).padStart(2, '0')}
                  </span>
                  <button onClick={goBack}
                    className="inline-flex items-center gap-1.5 font-body text-[10px] tracking-[0.2em] uppercase transition-opacity hover:opacity-80 cursor-pointer"
                    style={{ color: 'rgba(237,232,220,0.28)' }}>
                    <ArrowLeft size={10} /> Back
                  </button>
                </div>

                {/* Question headline */}
                <h2 className="font-display italic mb-4"
                  style={{
                    fontSize: 'clamp(2.6rem,5.5vw,8rem)',
                    lineHeight: 0.92,
                    letterSpacing: '-0.025em',
                    color: '#EDE8DC',
                    whiteSpace: 'pre-line',
                  }}>
                  {q.q}
                </h2>

                {/* Sub */}
                <p className="font-body text-sm mb-10" style={{ color: 'rgba(237,232,220,0.38)', lineHeight: 1.6 }}>
                  {q.sub}
                </p>

                {/* ── Text / Email ── */}
                {(q.type === 'text' || q.type === 'email') && (
                  <GoldInput
                    type={q.type}
                    value={getValue()}
                    onChange={setValue}
                    onKeyDown={handleKey}
                    placeholder={q.placeholder}
                    inputRef={inputRef}
                    autoFocus
                  />
                )}

                {/* ── Textarea ── */}
                {q.type === 'textarea' && (
                  <GoldTextarea
                    value={getValue()}
                    onChange={setValue}
                    placeholder={q.placeholder}
                    textareaRef={textareaRef}
                  />
                )}

                {/* ── Choices ── */}
                {q.type === 'choice' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                    {q.options?.map((opt, oi) => (
                      <ChoiceCard
                        key={opt}
                        label={opt}
                        keyHint={['A', 'B', 'C', 'D'][oi]}
                        selected={getValue() === opt}
                        onClick={() => selectChoice(opt)}
                      />
                    ))}
                  </div>
                )}

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.p className="font-body text-xs mt-5"
                      style={{ color: '#F87171' }}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Navigation (text/textarea questions only; choices auto-advance) */}
                {q.type !== 'choice' && (
                  <div className="flex items-center gap-6 mt-12 flex-wrap">
                    <GoldButton onClick={advance} disabled={loading}>
                      {loading ? 'Sending…' : isLast ? 'Send Brief' : 'Next'}
                      {!loading && <ArrowRight size={15} />}
                    </GoldButton>

                    {!q.required && (
                      <button onClick={skip}
                        className="font-body text-xs cursor-pointer transition-opacity hover:opacity-80"
                        style={{ color: 'rgba(237,232,220,0.3)', textDecoration: 'underline', textUnderlineOffset: 4 }}>
                        Skip this →
                      </button>
                    )}

                    <span className="font-body text-[10px] tracking-[0.18em] uppercase hidden md:block"
                      style={{ color: 'rgba(237,232,220,0.18)' }}>
                      {isLast ? 'Enter ↵ to submit' : 'Enter ↵ to continue'}
                    </span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── SUCCESS ── */}
        {phase === 'success' && (
          <motion.div key="success"
            className="flex flex-col justify-center"
            style={{ minHeight: '100svh', padding: 'clamp(80px,10vw,140px) clamp(24px,7vw,120px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}>

            {/* Animated check */}
            <motion.div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-14"
              style={{ background: 'linear-gradient(135deg, #8B1010, #C41E1E)' }}
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22, delay: 0.2 }}>
              <Check size={28} style={{ color: '#F0EDED' }} />
            </motion.div>

            <div className="overflow-hidden">
              <motion.h2 className="font-display italic"
                style={{ fontSize: 'clamp(3rem,7.5vw,10rem)', lineHeight: 0.9, letterSpacing: '-0.025em', color: '#EDE8DC' }}
                initial={{ y: '108%' }} animate={{ y: 0 }}
                transition={{ duration: 0.9, ease, delay: 0.3 }}>
                We'll be
              </motion.h2>
            </div>
            <div className="overflow-hidden mb-12">
              <motion.h2 className="font-display italic gradient-text"
                style={{ fontSize: 'clamp(3rem,7.5vw,10rem)', lineHeight: 0.9, letterSpacing: '-0.025em' }}
                initial={{ y: '108%' }} animate={{ y: 0 }}
                transition={{ duration: 0.9, ease, delay: 0.42 }}>
                in touch.
              </motion.h2>
            </div>

            <motion.p className="font-body font-light text-sm leading-relaxed max-w-sm"
              style={{ color: 'rgba(237,232,220,0.42)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85, duration: 0.7 }}>
              Thanks {form.contact_name.split(' ')[0] || 'there'}. One of our founders will reach out at{' '}
              <span style={{ color: '#EDE8DC' }}>{form.email}</span> within 24 hours.
            </motion.p>

            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse 50% 40% at 30% 50%, rgba(196,30,30,0.06) 0%, transparent 70%)' }} />
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ height: 1, background: 'rgba(237,232,220,0.07)' }} />
    </section>
  );
}
