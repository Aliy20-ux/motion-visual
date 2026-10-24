import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

type PublicReview = { id: string; name: string; business: string | null; rating: number; body: string; date: string; featured: boolean };
type Payload = { count: number; average: number | string | null; reviews: PublicReview[] };

const monthYear = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });

function Stars({ n, size = 14 }: { n: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${n} out of 5 stars`} style={{ color: '#E03A3A' }}>
      {[1, 2, 3, 4, 5].map(i => <Star key={i} size={size} strokeWidth={1.5} fill={i <= n ? 'currentColor' : 'none'} aria-hidden="true" />)}
    </span>
  );
}

/** Real client reviews, approved by the team. Renders nothing at all until there is at least one: no placeholders. */
export default function Testimonials() {
  const [data, setData] = useState<Payload | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/reviews')
      .then(r => (r.ok ? (r.json() as Promise<Payload>) : null))
      .then(d => { if (!cancelled && d && Array.isArray(d.reviews)) setData(d); })
      .catch(() => null);
    return () => { cancelled = true; };
  }, []);

  if (!data || data.reviews.length === 0) return null;
  const [lead, ...rest] = data.reviews;
  const average = data.average === null ? null : Number(data.average);

  return (
    <section id="reviews" aria-labelledby="reviews-heading" className="relative overflow-hidden"
      style={{ background: '#0A0A0B', padding: 'clamp(80px,10vw,140px) clamp(24px,5vw,80px)' }}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

        <motion.div className="lg:col-span-5"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: EASE }}>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-8 h-px gradient-bg" />
            <span className="font-body text-[10px] tracking-[0.32em] uppercase" style={{ color: 'rgba(237,232,220,0.5)' }}>Client reviews</span>
          </div>
          <h2 id="reviews-heading" className="font-display italic" style={{ fontSize: 'clamp(2.2rem,4.6vw,4.4rem)', lineHeight: 0.96, letterSpacing: '-0.025em' }}>
            <span style={{ color: '#EDE8DC' }}>In their </span><span className="gradient-text">own words.</span>
          </h2>
          {average !== null && (
            <p className="font-body text-sm mt-8 flex items-center gap-3 flex-wrap" style={{ color: 'rgba(237,232,220,0.65)' }}>
              <Stars n={Math.round(average)} size={16} />
              <span>{average.toFixed(1)} out of 5 from {data.count} client review{data.count === 1 ? '' : 's'}</span>
            </p>
          )}
          <p className="font-body font-light text-xs leading-relaxed mt-4" style={{ color: 'rgba(237,232,220,0.6)', maxWidth: '38ch' }}>
            Left by clients through a private link sent with their final invoice. We approve reviews, we don’t edit them.
          </p>
        </motion.div>

        <div className="lg:col-span-7">
          <motion.figure
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}>
            <Stars n={lead.rating} size={18} />
            <blockquote className="font-display italic mt-6" style={{ fontSize: 'clamp(1.5rem,2.6vw,2.4rem)', lineHeight: 1.22, letterSpacing: '-0.015em', color: '#EDE8DC', whiteSpace: 'pre-line' }}>
              “{lead.body}”
            </blockquote>
            <figcaption className="font-body text-xs mt-6" style={{ color: 'rgba(237,232,220,0.6)' }}>
              <span style={{ color: '#EDE8DC' }}>{lead.name}</span>{lead.business ? `, ${lead.business}` : ''} · {monthYear(lead.date)}
            </figcaption>
          </motion.figure>

          {rest.length > 0 && (
            <ul className="mt-12">
              {rest.map((r, i) => (
                <motion.li key={r.id} className="py-7" style={{ borderTop: '1px solid rgba(237,232,220,0.08)' }}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.55, ease: EASE, delay: Math.min(i, 3) * 0.05 }}>
                  <figure>
                    <Stars n={r.rating} />
                    <blockquote className="font-body font-light text-sm leading-relaxed mt-3" style={{ color: 'rgba(237,232,220,0.8)', maxWidth: '62ch', whiteSpace: 'pre-line' }}>“{r.body}”</blockquote>
                    <figcaption className="font-body text-xs mt-3" style={{ color: 'rgba(237,232,220,0.55)' }}>
                      <span style={{ color: '#EDE8DC' }}>{r.name}</span>{r.business ? `, ${r.business}` : ''} · {monthYear(r.date)}
                    </figcaption>
                  </figure>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
