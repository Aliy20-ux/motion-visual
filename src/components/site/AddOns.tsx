'use client';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Plus, Minus, Sparkles } from 'lucide-react';
import { scrollToHash } from '../../lib/smoothScroll';
import { ADD_ONS as addOns, PLANS, PLAN_PAGES, PLAN_PRICE, EXTRA_PAGE_PRICE, depositFor, gbp, priceFor, smallestPlanFor, suggestFor, type PlanKey } from '../../pricing';

const EASE = [0.16, 1, 0.3, 1] as const;

export default function AddOns() {
  const [plan, setPlan] = useState<PlanKey>('Essential');
  const [extraPages, setExtraPages] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);

  // Shown when the panel changes the plan or removes add-ons for the visitor, with a way back.
  const [notice, setNotice] = useState<null | { text: string; undo: () => void }>(null);

  // Total pages stay the same when the plan changes: Signature's 5 included pages absorb any extra pages bought on Essential.
  const extraFor = (to: PlanKey, pagesTotal: number) => Math.max(0, pagesTotal - PLAN_PAGES[to]);

  const toggle = (id: string) => {
    const a = addOns.find(x => x.id === id);
    if (!a) return;
    if (picked.includes(id)) {
      setNotice(null);
      setPicked(p => p.filter(x => x !== id));
      return;
    }
    const to = a.plans.includes(plan) ? plan : smallestPlanFor(a);
    if (!to || to === plan) {
      setNotice(null);
      setPicked(p => [...p, id]);
      return;
    }
    // This add-on only exists on a bigger plan, so move the build there instead of ignoring the click.
    const before = { plan, extraPages, picked };
    setPlan(to);
    setExtraPages(extraFor(to, PLAN_PAGES[plan] + extraPages));
    setPicked(p => [...p, id]);
    setNotice({
      text: `We've moved your build to ${to} (${gbp(PLAN_PRICE[to])}) because ${a.name} is only available on ${to}.`,
      undo: () => { setPlan(before.plan); setExtraPages(before.extraPages); setPicked(before.picked); setNotice(null); },
    });
  };

  const choosePlan = (p: PlanKey) => {
    const before = { plan, extraPages, picked };
    // Drop anything the new plan can't buy, and say so.
    const dropped = picked.map(id => addOns.find(a => a.id === id)).filter((a): a is NonNullable<typeof a> => !!a && !a.plans.includes(p));
    setPlan(p);
    setExtraPages(0);
    setPicked(cur => cur.filter(id => addOns.find(a => a.id === id)?.plans.includes(p)));
    setNotice(dropped.length === 0 ? null : {
      text: `${dropped.map(a => a.name).join(' and ')} ${dropped.length > 1 ? 'were' : 'was'} removed because ${dropped.length > 1 ? "they're" : "it's"} only available on Signature.`,
      undo: () => { setPlan(before.plan); setExtraPages(before.extraPages); setPicked(before.picked); setNotice(null); },
    });
  };

  const calc = useMemo(() => {
    const pagesTotal = PLAN_PAGES[plan] + extraPages;
    const total = priceFor(plan, pagesTotal, picked);
    const rule = suggestFor(plan, pagesTotal, picked);

    // Only ever suggests Signature to an Essential build. Flagship has its own section further down.
    let suggestion: null | { to: 'Signature'; text: string } = null;
    if (rule?.to === 'Signature') {
      // Compare like for like: what the same pages and add-ons cost on Signature.
      const diff = rule.signatureTotal - rule.total;
      const includes = 'up to 5 pages, cinematic animations, advanced + local SEO and the Lite order builder';
      suggestion = {
        to: 'Signature',
        text: diff <= 0
          ? `Signature costs ${gbp(rule.signatureTotal)} for the same build, which is ${gbp(-diff)} less. It also includes ${includes}.`
          : `For ${diff < 500 ? 'just ' : ''}${gbp(diff)} more, Signature gives you ${includes}.${diff < 500 ? " That's better value for this build." : ' Worth comparing before you decide.'}`,
      };
    }
    return { pagesTotal, total, suggestion };
  }, [plan, extraPages, picked]);

  // Flagship-only add-ons (the online shop) are scoped through the Flagship section, not priced here.
  const buildable = addOns.filter(a => !a.flagship);
  const eligible = buildable.filter(a => a.plans.includes(plan));
  const chosen = eligible.filter(a => picked.includes(a.id));

  const sendToQuote = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const lines = [
      `Plan: ${plan}${calc.pagesTotal > PLAN_PAGES[plan] ? ` (${calc.pagesTotal} pages)` : ''}`,
      ...chosen.map(a => `Add-on: ${a.name}${a.includedIn?.includes(plan) ? ' (included)' : ` (${gbp(a.price!)})`}`),
      `Estimated total: ${gbp(calc.total)}`,
    ];
    const budget = plan === 'Essential' ? 'Essential — £800' : 'Signature — £1,600';
    const config = { plan, extraPages, addOnIds: picked.filter(id => eligible.some(a => a.id === id)) };
    const detail = { budget, notes: lines.join('\n'), config };
    (window as unknown as { __mvPrefill?: typeof detail }).__mvPrefill = detail; // in case the form hasn't lazy-loaded yet
    window.dispatchEvent(new CustomEvent('mv:prefill', { detail }));
    scrollToHash('#quote')(e);
  };

  const card = { borderRadius: 16, border: '1px solid rgba(237,232,220,0.08)', background: 'rgba(237,232,220,0.02)' } as const;

  return (
    <section id="addons" className="relative overflow-hidden"
      style={{ background: '#0A0A0B', padding: '0 clamp(24px,5vw,80px) clamp(72px,9vw,124px)' }}>
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
                      padding: '12px 22px', minHeight: 44, borderRadius: 999,
                      background: plan === p ? 'linear-gradient(135deg,#8B1010,#C41E1E)' : 'transparent',
                      color: plan === p ? '#F0EDED' : 'rgba(237,232,220,0.6)',
                      border: plan === p ? '1px solid transparent' : '1px solid rgba(237,232,220,0.12)',
                    }}>
                    {p} · {gbp(PLAN_PRICE[p])}
                    <span style={{ opacity: 0.85, fontWeight: 300 }}> · {PLAN_PAGES[p] === 1 ? '1 landing page' : `up to ${PLAN_PAGES[p]} pages`}</span>
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
                    style={{ width: 44, height: 44, borderRadius: 999, border: '1px solid rgba(237,232,220,0.15)', color: '#EDE8DC' }}>
                    <Minus size={14} />
                  </button>
                  <span className="font-display italic text-xl w-6 text-center" style={{ color: '#EDE8DC' }}>{extraPages}</span>
                  <button type="button" aria-label="Add a page" onClick={() => setExtraPages(n => Math.min(15, n + 1))}
                    className="flex items-center justify-center cursor-pointer"
                    style={{ width: 44, height: 44, borderRadius: 999, border: '1px solid rgba(237,232,220,0.15)', color: '#EDE8DC' }}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Add-ons */}
            <div style={{ ...card, padding: 'clamp(20px,2.5vw,28px)' }}>
              <p className="font-body text-[10px] tracking-[0.22em] uppercase mb-4" style={{ color: 'rgba(237,232,220,0.5)' }}>2 · Optional add-ons</p>
              <AnimatePresence initial={false}>
                {notice && (
                  <motion.div key="notice" role="status"
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: EASE }}>
                    <div className="flex items-start justify-between gap-3 mb-4" style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(196,30,30,0.4)', background: 'rgba(196,30,30,0.08)' }}>
                      <p className="font-body font-light text-[12px] leading-relaxed" style={{ color: 'rgba(237,232,220,0.8)' }}>{notice.text}</p>
                      <button type="button" onClick={notice.undo}
                        className="font-body text-[11px] font-semibold underline underline-offset-4 cursor-pointer shrink-0"
                        style={{ color: '#EDE8DC', minHeight: 44, padding: '0 4px' }}>
                        Undo
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {buildable.map(a => {
                  const included = a.includedIn?.includes(plan);
                  const needsBigger = !a.plans.includes(plan);
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
                          style={{ color: included ? 'rgba(237,232,220,0.6)' : '#E5534B' }}>
                          {on && <Check size={12} />}
                          {needsBigger && <span className="text-[9px] tracking-[0.12em] uppercase font-semibold" style={{ padding: '2px 7px', borderRadius: 999, border: '1px solid rgba(237,232,220,0.25)', color: 'rgba(237,232,220,0.7)' }}>Signature</span>}
                          {included ? 'Included' : `+${gbp(a.price!)}`}
                        </span>
                      </span>
                      <span className="block font-body font-light text-[11px] leading-relaxed mt-1.5" style={{ color: 'rgba(237,232,220,0.5)' }}>
                        {a.blurb}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="font-body font-light text-[11px] leading-relaxed mt-4" style={{ color: 'rgba(237,232,220,0.5)' }}>
                Add-ons marked Signature need the Signature plan: choosing one moves your build there, and you can undo it.
              </p>
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
              <span className="font-body text-xs" style={{ color: 'rgba(237,232,220,0.5)' }}>Total, one-off</span>
              <span className="font-display italic gradient-text" style={{ fontSize: '2.2rem', lineHeight: 1 }}>{gbp(calc.total)}</span>
            </div>
            <p className="font-body font-light text-[11px] mt-2" style={{ color: 'rgba(237,232,220,0.5)' }}>
              {`A deposit of ${gbp(depositFor(calc.total))} (25%) secures your start date.`}
            </p>

            <AnimatePresence initial={false}>
              {calc.suggestion && (
                <motion.div key={calc.suggestion.to}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.25, ease: EASE }}>
                  <div className="mt-5" style={{ padding: 14, borderRadius: 12, border: '1px solid rgba(196,30,30,0.4)', background: 'rgba(196,30,30,0.08)' }}>
                    <p className="font-body text-[10px] tracking-[0.18em] uppercase flex items-center gap-1.5 mb-2" style={{ color: '#E5534B' }}>
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
              Request this package
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
