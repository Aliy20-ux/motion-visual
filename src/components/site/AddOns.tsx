'use client';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Plus, Minus, Sparkles } from 'lucide-react';
import { scrollToHash } from '../../lib/smoothScroll';

const EASE = [0.16, 1, 0.3, 1] as const;

type PlanKey = 'Essential' | 'Signature';
const PLANS: PlanKey[] = ['Essential', 'Signature'];

// ─── PRICES — edit here, everything below recalculates ───────────────────────
const PLAN_PRICE: Record<PlanKey, number> = { Essential: 800, Signature: 1600 };
const PLAN_PAGES: Record<PlanKey, number> = { Essential: 1, Signature: 5 };
const EXTRA_PAGE_PRICE = 80;
// Suggest Signature once an Essential build (plan + pages + add-ons) comes within this much of the Signature price.
const SUGGEST_SIGNATURE_WITHIN = 300;
// Suggest a Flagship scoping call once a Signature build reaches this total.
const SUGGEST_FLAGSHIP_TOTAL = 2600;
// Deposit rule: about 25% of the total, rounded up to the nearest £5.
const depositFor = (total: number) => Math.ceil((total * 0.25) / 5) * 5;

type AddOn = {
  id: string;
  name: string;
  blurb: string;
  price?: number;          // undefined = quote on a call (Flagship territory)
  plans: PlanKey[];        // plans that can buy it — hidden on any other plan
  includedIn?: PlanKey[];  // already part of that plan, so shown as included
  flagship?: boolean;      // selecting it nudges towards a Flagship scoping call
};

const addOns: AddOn[] = [
  { id: 'order-lite', name: 'Interactive order builder (Lite)', blurb: 'Customers build their order or package on your site and send it to you as an enquiry or summary email. No card payment.', price: 250, plans: ['Essential', 'Signature'], includedIn: ['Signature'] },
  { id: 'order-full', name: 'Interactive order builder (full)', blurb: 'A fuller version of the builder, still ending in an enquiry or summary email. No card payment.', price: 400, plans: ['Signature'] },
  { id: 'local-seo', name: 'Local SEO Boost', blurb: 'Local keywords, schema markup and Google Business Profile optimisation, to help nearby customers find you.', price: 250, plans: ['Essential', 'Signature'] },
  { id: 'gallery', name: 'Gallery with filters', blurb: 'A photo gallery your visitors can filter by category.', price: 75, plans: ['Essential', 'Signature'] },
  { id: 'reviews', name: 'Reviews wall', blurb: 'Your best customer reviews displayed on the site.', price: 75, plans: ['Essential', 'Signature'] },
  { id: 'confirmations', name: 'Email / WhatsApp confirmations', blurb: 'Automatic confirmation messages when someone enquires or books.', price: 100, plans: ['Signature'] },
  { id: 'booking', name: 'Booking', blurb: 'Let customers book appointments or tables straight from your site.', price: 200, plans: ['Signature'] },
  { id: 'editor', name: 'Content editor', blurb: 'A simple dashboard to change text, prices and photos yourself.', price: 150, plans: ['Signature'] },
  { id: 'shop', name: 'Online shop / ordering', blurb: 'Take payments and orders online, with stock and delivery options. Scoped and quoted on a call.', plans: ['Essential', 'Signature'], flagship: true },
];

const gbp = (n: number) => `£${n.toLocaleString('en-GB')}`;

export default function AddOns() {
  const [plan, setPlan] = useState<PlanKey>('Essential');
  const [extraPages, setExtraPages] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (id: string) =>
    setPicked(p => (p.includes(id) ? p.filter(x => x !== id) : [...p, id]));

  const choosePlan = (p: PlanKey) => {
    setPlan(p);
    setExtraPages(0);
    // Drop anything the new plan can't buy.
    setPicked(cur => cur.filter(id => addOns.find(a => a.id === id)?.plans.includes(p)));
  };

  const calc = useMemo(() => {
    const priceFor = (p: PlanKey, pagesTotal: number) => {
      const extra = Math.max(0, pagesTotal - PLAN_PAGES[p]);
      const addonSum = addOns
        .filter(a => picked.includes(a.id) && a.price !== undefined && a.plans.includes(p) && !a.includedIn?.includes(p))
        .reduce((s, a) => s + a.price!, 0);
      return PLAN_PRICE[p] + extra * EXTRA_PAGE_PRICE + addonSum;
    };
    const pagesTotal = PLAN_PAGES[plan] + extraPages;
    const total = priceFor(plan, pagesTotal);
    const sigTotal = priceFor('Signature', pagesTotal);
    const wantsFlagship = addOns.some(a => a.flagship && picked.includes(a.id));

    let suggestion: null | { to: 'Signature' | 'Flagship'; text: string } = null;
    if (wantsFlagship) {
      suggestion = {
        to: 'Flagship',
        text: 'Online shops and ordering are built under our Flagship plan. We scope it together on a quick call, so you only pay for what you need.',
      };
    } else if (plan === 'Signature' && total >= SUGGEST_FLAGSHIP_TOTAL) {
      suggestion = {
        to: 'Flagship',
        text: `A build this size is usually better value as a Flagship project, with a dedicated project lead and unlimited pages. Book a call and we'll scope it with you.`,
      };
    } else if (plan === 'Essential' && total >= PLAN_PRICE.Signature - SUGGEST_SIGNATURE_WITHIN) {
      // Compare like for like: what the same pages and add-ons cost on Signature.
      const diff = sigTotal - total;
      const includes = 'up to 5 pages, cinematic animations, advanced + local SEO and the Lite order builder';
      suggestion = {
        to: 'Signature',
        text: diff <= 0
          ? `Signature costs ${gbp(sigTotal)} for the same build, which is ${gbp(-diff)} less. It also includes ${includes}.`
          : `For ${diff < 500 ? 'just ' : ''}${gbp(diff)} more, Signature gives you ${includes}.${diff < 500 ? " That's better value for this build." : ' Worth comparing before you decide.'}`,
      };
    }
    return { pagesTotal, total, suggestion };
  }, [plan, extraPages, picked]);

  const visible = addOns.filter(a => a.plans.includes(plan));
  const chosen = visible.filter(a => picked.includes(a.id));
  const hiddenCount = addOns.length - visible.length;
  const isFlagshipEstimate = calc.suggestion?.to === 'Flagship';

  const sendToQuote = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const lines = [
      `Plan: ${plan}${calc.pagesTotal > PLAN_PAGES[plan] ? ` (${calc.pagesTotal} pages)` : ''}`,
      ...chosen.map(a => `Add-on: ${a.name}${a.price === undefined ? ' (Flagship, to be quoted)' : a.includedIn?.includes(plan) ? ' (included)' : ` (${gbp(a.price)})`}`),
      `Estimated total: ${isFlagshipEstimate ? 'Custom — to be scoped on a call' : gbp(calc.total)}`,
    ];
    const budget = isFlagshipEstimate ? 'Flagship — Custom' : plan === 'Essential' ? 'Essential — £800' : 'Signature — £1,600';
    const detail = { budget, notes: lines.join('\n') };
    (window as unknown as { __mvPrefill?: typeof detail }).__mvPrefill = detail; // in case the form hasn't lazy-loaded yet
    window.dispatchEvent(new CustomEvent('mv:prefill', { detail }));
    scrollToHash('#quote')(e);
  };

  const card = { borderRadius: 16, border: '1px solid rgba(237,232,220,0.08)', background: 'rgba(237,232,220,0.02)' } as const;

  return (
    <section id="addons" className="relative overflow-hidden"
      style={{ background: '#0A0A0B', padding: '0 clamp(24px,5vw,80px) clamp(100px,12vw,160px)' }}>
      <div className="relative z-10 max-w-6xl mx-auto">

        <motion.div className="text-center mb-12"
          initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.75, ease: EASE }}>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-8 h-px gradient-bg" />
            <span className="font-body text-[10px] tracking-[0.32em] uppercase" style={{ color: 'rgba(237,232,220,0.5)' }}>Make it yours</span>
            <div className="w-8 h-px gradient-bg" />
          </div>
          <h2 className="font-display italic mb-5"
            style={{ fontSize: 'clamp(2rem,4.5vw,5rem)', lineHeight: 0.95, letterSpacing: '-0.025em' }}>
            <span style={{ color: '#EDE8DC' }}>Build your </span>
            <span className="gradient-text">perfect package.</span>
          </h2>
          <p className="font-body font-light text-sm leading-relaxed mx-auto"
            style={{ color: 'rgba(237,232,220,0.5)', maxWidth: '50ch' }}>
            Start with a plan, then add only what your business needs. If your wish-list is better value on a bigger plan, we'll tell you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">

          {/* ── Left: choices ── */}
          <div className="flex flex-col gap-5">

            {/* Plan toggle + pages */}
            <div style={{ ...card, padding: 'clamp(20px,2.5vw,28px)' }}>
              <p className="font-body text-[10px] tracking-[0.22em] uppercase mb-4" style={{ color: 'rgba(237,232,220,0.5)' }}>1 · Starting plan</p>
              <div className="flex gap-3 flex-wrap">
                {PLANS.map(p => (
                  <button key={p} type="button" onClick={() => choosePlan(p)}
                    aria-pressed={plan === p}
                    className="font-body text-xs font-semibold cursor-pointer transition-colors"
                    style={{
                      padding: '12px 22px', borderRadius: 999,
                      background: plan === p ? 'linear-gradient(135deg,#8B1010,#C41E1E)' : 'transparent',
                      color: plan === p ? '#F0EDED' : 'rgba(237,232,220,0.6)',
                      border: plan === p ? '1px solid transparent' : '1px solid rgba(237,232,220,0.12)',
                    }}>
                    {p} · {gbp(PLAN_PRICE[p])}
                    <span style={{ opacity: 0.7, fontWeight: 300 }}> · {PLAN_PAGES[p] === 1 ? '1 landing page' : `up to ${PLAN_PAGES[p]} pages`}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between gap-4 mt-6 flex-wrap">
                <div>
                  <p className="font-body text-sm" style={{ color: '#EDE8DC' }}>Extra pages</p>
                  <p className="font-body font-light text-[11px]" style={{ color: 'rgba(237,232,220,0.5)' }}>
                    {gbp(EXTRA_PAGE_PRICE)} each · {calc.pagesTotal} page{calc.pagesTotal > 1 ? 's' : ''} in total
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" aria-label="Remove a page" disabled={extraPages === 0}
                    onClick={() => setExtraPages(n => Math.max(0, n - 1))}
                    className="flex items-center justify-center cursor-pointer disabled:opacity-30"
                    style={{ width: 36, height: 36, borderRadius: 999, border: '1px solid rgba(237,232,220,0.15)', color: '#EDE8DC' }}>
                    <Minus size={14} />
                  </button>
                  <span className="font-display italic text-xl w-6 text-center" style={{ color: '#EDE8DC' }}>{extraPages}</span>
                  <button type="button" aria-label="Add a page" onClick={() => setExtraPages(n => Math.min(15, n + 1))}
                    className="flex items-center justify-center cursor-pointer"
                    style={{ width: 36, height: 36, borderRadius: 999, border: '1px solid rgba(237,232,220,0.15)', color: '#EDE8DC' }}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Add-ons */}
            <div style={{ ...card, padding: 'clamp(20px,2.5vw,28px)' }}>
              <p className="font-body text-[10px] tracking-[0.22em] uppercase mb-4" style={{ color: 'rgba(237,232,220,0.5)' }}>2 · Optional add-ons</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {visible.map(a => {
                  const included = a.includedIn?.includes(plan);
                  const on = picked.includes(a.id) && !included;
                  return (
                    <button key={a.id} type="button" disabled={included}
                      aria-pressed={on} onClick={() => toggle(a.id)}
                      className="text-left cursor-pointer transition-colors disabled:cursor-default"
                      style={{
                        padding: '14px 16px', borderRadius: 12,
                        border: on ? '1px solid rgba(196,30,30,0.55)' : '1px solid rgba(237,232,220,0.08)',
                        background: on ? 'rgba(196,30,30,0.07)' : 'transparent',
                        opacity: included ? 0.55 : 1,
                      }}>
                      <span className="flex items-start justify-between gap-3">
                        <span className="font-body text-[13px]" style={{ color: '#EDE8DC' }}>{a.name}</span>
                        <span className="font-body text-[12px] font-semibold flex items-center gap-1 shrink-0"
                          style={{ color: included ? 'rgba(237,232,220,0.6)' : '#C41E1E' }}>
                          {on && <Check size={12} />}
                          {included ? 'Included' : a.price !== undefined ? `+${gbp(a.price)}` : 'Flagship'}
                        </span>
                      </span>
                      <span className="block font-body font-light text-[11px] leading-relaxed mt-1.5" style={{ color: 'rgba(237,232,220,0.5)' }}>
                        {a.blurb}
                      </span>
                    </button>
                  );
                })}
              </div>
              {hiddenCount > 0 && (
                <p className="font-body font-light text-[11px] leading-relaxed mt-4" style={{ color: 'rgba(237,232,220,0.5)' }}>
                  More add-ons — the full order builder, booking, confirmations and a content editor — are available on Signature.
                </p>
              )}
              <p className="font-body font-light text-[11px] leading-relaxed mt-2" style={{ color: 'rgba(237,232,220,0.5)' }}>
                Add-ons are one-off prices. We never guarantee search rankings or business results.
              </p>
            </div>
          </div>

          {/* ── Right: summary ── */}
          <div className="lg:sticky lg:top-28" style={{ ...card, padding: 'clamp(20px,2.5vw,28px)', border: '1.5px solid rgba(196,30,30,0.35)', background: 'rgba(196,30,30,0.04)' }}>
            <p className="font-body text-[10px] tracking-[0.22em] uppercase mb-4" style={{ color: 'rgba(237,232,220,0.5)' }}>Your package</p>

            <div className="flex flex-col gap-2 font-body text-[13px]" style={{ color: 'rgba(237,232,220,0.75)' }}>
              <div className="flex justify-between"><span>{plan} plan</span><span>{gbp(PLAN_PRICE[plan])}</span></div>
              {extraPages > 0 && (
                <div className="flex justify-between"><span>{extraPages} extra page{extraPages > 1 ? 's' : ''}</span><span>{gbp(extraPages * EXTRA_PAGE_PRICE)}</span></div>
              )}
              {chosen.map(a => (
                <div key={a.id} className="flex justify-between gap-3">
                  <span>{a.name}</span>
                  <span className="shrink-0">{a.includedIn?.includes(plan) ? 'Included' : a.price !== undefined ? gbp(a.price) : 'Quoted'}</span>
                </div>
              ))}
            </div>

            <div className="my-5" style={{ height: 1, background: 'rgba(237,232,220,0.1)' }} />

            <div className="flex items-baseline justify-between">
              <span className="font-body text-xs" style={{ color: 'rgba(237,232,220,0.5)' }}>
                {isFlagshipEstimate ? 'Estimate' : 'Total, one-off'}
              </span>
              <span className="font-display italic gradient-text" style={{ fontSize: '2.2rem', lineHeight: 1 }}>
                {isFlagshipEstimate ? 'Custom' : gbp(calc.total)}
              </span>
            </div>
            <p className="font-body font-light text-[11px] mt-2" style={{ color: 'rgba(237,232,220,0.5)' }}>
              {isFlagshipEstimate
                ? 'Deposit and payment terms are agreed individually.'
                : `A deposit of ${gbp(depositFor(calc.total))} (about 25%) secures your start date.`}
            </p>

            <AnimatePresence initial={false}>
              {calc.suggestion && (
                <motion.div key={calc.suggestion.to}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.25, ease: EASE }}>
                  <div className="mt-5" style={{ padding: 14, borderRadius: 12, border: '1px solid rgba(196,30,30,0.4)', background: 'rgba(196,30,30,0.08)' }}>
                    <p className="font-body text-[10px] tracking-[0.18em] uppercase flex items-center gap-1.5 mb-2" style={{ color: '#C41E1E' }}>
                      <Sparkles size={11} /> Better value: {calc.suggestion.to}
                    </p>
                    <p className="font-body font-light text-[12px] leading-relaxed" style={{ color: 'rgba(237,232,220,0.75)' }}>{calc.suggestion.text}</p>
                    {calc.suggestion.to === 'Signature' && (
                      <button type="button" onClick={() => { setPlan('Signature'); setExtraPages(Math.max(0, calc.pagesTotal - PLAN_PAGES.Signature)); }}
                        className="font-body text-[11px] font-semibold underline underline-offset-4 mt-3 cursor-pointer" style={{ color: '#EDE8DC' }}>
                        Switch to Signature
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <a href="#quote" onClick={sendToQuote}
              className="inline-flex w-full items-center justify-center font-body text-xs font-semibold cursor-pointer transition-opacity hover:opacity-85 mt-5"
              style={{ padding: '14px 24px', borderRadius: 999, background: 'linear-gradient(135deg,#8B1010,#C41E1E)', color: '#F0EDED', letterSpacing: '0.05em' }}>
              {isFlagshipEstimate ? 'Book a scoping call' : 'Request this package'}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
