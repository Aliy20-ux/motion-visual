import type { Block, LegalSection } from '../../legal/types';

function BlockView({ block }: { block: Block }) {
  if (block.type === 'p') return <p>{block.text}</p>;
  if (block.type === 'ul') return <ul>{block.items.map((item, i) => <li key={i}>{item}</li>)}</ul>;
  return (
    <div className="overflow-x-auto">
      <table>
        <thead><tr>{block.head.map((h, i) => <th key={i} scope="col">{h}</th>)}</tr></thead>
        <tbody>{block.rows.map((row, r) => <tr key={r}>{row.map((cell, c) => <td key={c}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

/**
 * Numbered clauses with the plain-English note set in the margin on wide
 * screens (above the clause on narrow ones) — the note is read first, the
 * binding wording sits beside it.
 */
export default function LegalSections({ sections, startAt = 1 }: { sections: LegalSection[]; startAt?: number }) {
  return (
    <div>
      {sections.map((s, i) => (
        <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`}
          className="clause grid gap-x-10 gap-y-3 lg:grid-cols-[minmax(0,1fr)_15rem]"
          style={{ padding: '1.75rem 0', borderTop: '1px solid rgba(237,232,220,0.07)' }}>
          <h3 id={`${s.id}-h`} className="font-display italic flex items-baseline gap-3 lg:col-start-1"
            style={{ fontSize: '1.35rem', letterSpacing: '-0.01em', color: '#EDE8DC' }}>
            <span className="font-body not-italic text-[11px] tracking-[0.14em] tabular-nums" style={{ color: 'rgba(196,30,30,0.9)' }}>
              {String(startAt + i).padStart(2, '0')}
            </span>
            {s.heading}
          </h3>
          {s.plain && (
            <aside aria-label="In plain English"
              className="lg:col-start-2 lg:row-start-1 lg:row-span-2 self-start"
              style={{ borderLeft: '2px solid rgba(196,30,30,0.6)', paddingLeft: '0.9rem' }}>
              <p className="font-body text-[9px] tracking-[0.28em] uppercase mb-1.5" style={{ color: 'rgba(237,232,220,0.5)' }}>
                In plain English
              </p>
              <p className="font-body font-light text-[0.82rem] leading-relaxed" style={{ color: 'rgba(237,232,220,0.78)' }}>
                {s.plain}
              </p>
            </aside>
          )}
          <div className="legal-prose lg:col-start-1">
            {s.blocks.map((b, j) => <BlockView key={j} block={b} />)}
          </div>
        </section>
      ))}
    </div>
  );
}
