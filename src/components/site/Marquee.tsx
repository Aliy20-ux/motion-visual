const row1 = ['Motion Visual', '·', 'Edinburgh', '·', 'Premium Websites', '·', 'Award Quality', '·', 'Digital Excellence', '·', 'Motion Visual', '·', 'Edinburgh', '·', 'Premium Websites', '·', 'Award Quality', '·', 'Digital Excellence'];
const row2 = ['Days Not Months', '·', 'Obsessively Crafted', '·', 'Built to Convert', '·', 'Secure by Default', '·', 'Days Not Months', '·', 'Obsessively Crafted', '·', 'Built to Convert', '·', 'Secure by Default'];

export default function Marquee() {
  return (
    <section className="overflow-hidden py-6 relative" style={{ borderTop: '1px solid rgba(244,241,236,0.06)', borderBottom: '1px solid rgba(244,241,236,0.06)' }}>
      <div className="marquee-left flex gap-8 whitespace-nowrap mb-3">
        {row1.concat(row1).map((item, i) => (
          <span
            key={i}
            className={`font-body text-xs tracking-[0.22em] uppercase shrink-0 ${item === '·' ? '' : 'font-medium'}`}
            style={{ color: item === '·' ? 'rgba(124,58,237,0.6)' : 'rgba(244,241,236,0.35)' }}
          >
            {item}
          </span>
        ))}
      </div>
      <div className="marquee-right flex gap-8 whitespace-nowrap">
        {row2.concat(row2).map((item, i) => (
          <span
            key={i}
            className={`font-body text-xs tracking-[0.22em] uppercase shrink-0 ${item === '·' ? '' : ''}`}
            style={{ color: item === '·' ? 'rgba(6,182,212,0.6)' : 'rgba(244,241,236,0.22)' }}
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
