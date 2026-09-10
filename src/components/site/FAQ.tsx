'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

// Kept in sync with the FAQPage JSON-LD in index.html — structured data must
// match content actually visible on the page, or Google can ignore/flag it.
const faqs = [
  {
    q: 'How long does it take to build a website with Motion Visual?',
    a: "Most projects are delivered in 14 days from the first call. Our fastest delivery has been 11 days for a fully bespoke, animated website.",
  },
  {
    q: 'How much does a website cost at Motion Visual?',
    a: "Our Essential package ranges from £1,499 to £3,499, Signature from £3,999 to £6,999, and Flagship is scoped individually and quoted on a call. Book a free call and we'll give you an exact number within 24 hours.",
  },
  {
    q: 'Does Motion Visual work with businesses outside Edinburgh?',
    a: "Yes. While we're based in Edinburgh, we work with clients across Scotland and the UK remotely. The process is entirely online and has never slowed a project down.",
  },
];

function FAQRow({ index, q, a, isOpen, onToggle }: {
  index: number; q: string; a: string; isOpen: boolean; onToggle: () => void;
}) {
  const panelId = `faq-panel-${index}`;
  const buttonId = `faq-button-${index}`;

  return (
    <div style={{ borderBottom: '1px solid rgba(237,232,220,0.07)' }}>
      <h3>
        <button
          id={buttonId}
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="w-full flex items-center justify-between gap-6 text-left cursor-pointer"
          style={{ padding: 'clamp(22px,3vw,30px) 0' }}>
          <span className="font-display italic"
            style={{ fontSize: 'clamp(1.05rem,2vw,1.4rem)', letterSpacing: '-0.015em', color: '#EDE8DC' }}>
            {q}
          </span>
          <motion.span
            className="shrink-0 flex items-center justify-center rounded-full"
            style={{ width: 32, height: 32, border: '1px solid rgba(237,232,220,0.14)' }}
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2, ease }}>
            <Plus size={14} strokeWidth={1.75} style={{ color: 'rgba(237,232,220,0.6)' }} />
          </motion.span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        style={{
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 250ms cubic-bezier(0.16,1,0.3,1)',
        }}>
        <div style={{ overflow: 'hidden' }}>
          <p className="font-body font-light text-sm leading-relaxed"
            style={{ color: 'rgba(237,232,220,0.5)', maxWidth: '62ch', paddingBottom: 'clamp(22px,3vw,30px)' }}>
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="relative"
      style={{ background: '#09090A', padding: 'clamp(80px,11vw,150px) clamp(24px,5vw,88px)' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'rgba(237,232,220,0.07)' }} />

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="w-8 h-px gradient-bg" />
          <span className="font-body text-[10px] tracking-[0.32em] uppercase"
            style={{ color: 'rgba(237,232,220,0.5)' }}>FAQ</span>
        </motion.div>

        <motion.h2
          className="font-display italic mb-14"
          style={{ fontSize: 'clamp(2rem,5.5vw,5.5rem)', lineHeight: 0.95, letterSpacing: '-0.025em', color: '#EDE8DC' }}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0 }}
          transition={{ duration: 0.85, ease }}>
          Questions, <span className="gradient-text">answered.</span>
        </motion.h2>

        <div style={{ borderTop: '1px solid rgba(237,232,220,0.07)' }}>
          {faqs.map((item, i) => (
            <FAQRow
              key={item.q}
              index={i}
              q={item.q}
              a={item.a}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
