const row1 = ['Motion Visual', '×', 'Edinburgh', '×', 'Premium Websites', '×', 'Award Quality', '×', 'Digital Excellence', '×', 'Motion Visual', '×', 'Edinburgh', '×', 'Premium Websites', '×', 'Award Quality', '×', 'Digital Excellence'];
const row2 = ['Days Not Months', '×', 'Obsessively Crafted', '×', 'Built to Convert', '×', 'Secure by Default', '×', 'Edinburgh Born', '×', 'Internet Renowned', '×', 'Days Not Months', '×', 'Obsessively Crafted', '×', 'Built to Convert', '×', 'Secure by Default'];

export default function Marquee() {
  return (
    <section className="overflow-hidden relative" style={{ borderTop: '1px solid rgba(237,232,220,0.07)', borderBottom: '1px solid rgba(237,232,220,0.07)', background: '#0C0C0F' }}>
      {/* Row 1 */}
      <div className="marquee-left flex gap-10 whitespace-nowrap py-4 border-b" style={{ borderColor: 'rgba(237,232,220,0.06)' }}>
        {row1.concat(row1).map((item, i) => (
          <span key={i} className="font-body shrink-0"
            style={{
              fontSize: '11px',
              letterSpacing: item === '×' ? '0' : '0.22em',
              textTransform: 'uppercase',
              fontWeight: item === '×' ? 300 : 500,
              color: item === '×' ? 'rgba(196,30,30,0.5)' : 'rgba(237,232,220,0.32)',
            }}>
            {item}
          </span>
        ))}
      </div>
      {/* Row 2 */}
      <div className="marquee-right flex gap-10 whitespace-nowrap py-4">
        {row2.concat(row2).map((item, i) => (
          <span key={i} className="font-body shrink-0"
            style={{
              fontSize: '11px',
              letterSpacing: item === '×' ? '0' : '0.22em',
              textTransform: 'uppercase',
              fontWeight: item === '×' ? 300 : 400,
              color: item === '×' ? 'rgba(176,120,16,0.45)' : 'rgba(237,232,220,0.22)',
            }}>
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
