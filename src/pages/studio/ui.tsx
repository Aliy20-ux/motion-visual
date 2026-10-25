import type { DisplayStatus } from './data';

export const muted = 'rgba(237,232,220,0.5)';
const line = 'rgba(237,232,220,0.14)';

export function Label({ htmlFor, children, hint }: { htmlFor?: string; children: React.ReactNode; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="block mb-1.5">
      <span className="font-body text-[9px] tracking-[0.28em] uppercase" style={{ color: muted }}>{children}</span>
      {hint && <span className="block font-body font-light text-[11px] mt-0.5 normal-case tracking-normal" style={{ color: 'rgba(237,232,220,0.8)' }}>{hint}</span>}
    </label>
  );
}

const fieldStyle: React.CSSProperties = {
  color: '#EDE8DC',
  background: 'rgba(237,232,220,0.03)',
  border: `1px solid ${line}`,
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: '0.88rem',
};

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full font-body outline-none focus-visible:border-[rgba(196,30,30,0.6)] ${props.className ?? ''}`} style={{ ...fieldStyle, ...props.style }} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full font-body outline-none resize-y leading-relaxed focus-visible:border-[rgba(196,30,30,0.6)] ${props.className ?? ''}`} style={{ ...fieldStyle, ...props.style }} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`w-full font-body outline-none ${props.className ?? ''}`} style={{ ...fieldStyle, background: '#121214', ...props.style }} />;
}

export function Button({ variant = 'ghost', className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }) {
  const look = variant === 'primary'
    ? 'gradient-bg text-[#F0EDED]'
    : variant === 'danger'
      ? 'border border-[rgba(248,113,113,0.4)] text-[#F87171] hover:bg-[rgba(248,113,113,0.08)]'
      : 'border border-[rgba(237,232,220,0.14)] text-[#EDE8DC] hover:bg-[rgba(237,232,220,0.06)]';
  return (
    <button {...props}
      className={`font-body text-xs rounded-full transition-[background-color,opacity] duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none ${look} ${className}`}
      style={{ padding: '9px 16px', ...props.style }} />
  );
}

const STATUS_STYLE: Record<DisplayStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'rgba(237,232,220,0.84)', bg: 'rgba(237,232,220,0.06)' },
  sent: { label: 'Sent', color: '#93C5FD', bg: 'rgba(147,197,253,0.1)' },
  viewed: { label: 'Viewed', color: '#FCD34D', bg: 'rgba(252,211,77,0.1)' },
  signed: { label: 'Signed', color: '#86EFAC', bg: 'rgba(134,239,172,0.1)' },
  void: { label: 'Void', color: 'rgba(237,232,220,0.62)', bg: 'transparent' },
  expired: { label: 'Expired', color: '#F87171', bg: 'rgba(248,113,113,0.08)' },
};

export function StatusPill({ status }: { status: DisplayStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span className="inline-block font-body text-[10px] tracking-[0.12em] uppercase rounded-full"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.color}33`, padding: '3px 9px' }}>
      {s.label}
    </span>
  );
}

export function PageTitle({ children, eyebrow }: { children: React.ReactNode; eyebrow?: string }) {
  return (
    <div className="mb-8">
      {eyebrow && <p className="font-body text-[9px] tracking-[0.28em] uppercase mb-2" style={{ color: muted }}>{eyebrow}</p>}
      <h1 className="font-display italic" style={{ fontSize: 'clamp(2rem,4vw,3rem)', letterSpacing: '-0.02em', color: '#EDE8DC', lineHeight: 1 }}>
        {children}
      </h1>
    </div>
  );
}

export function ErrorText({ children }: { children: React.ReactNode }) {
  return <p role="alert" className="font-body text-sm" style={{ color: '#F87171' }}>{children}</p>;
}
