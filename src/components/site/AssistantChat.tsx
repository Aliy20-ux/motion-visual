'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowUp, Check, MessageCircle, RotateCcw, X } from 'lucide-react';
import { COMPANY } from '../../legal/company';

const EASE = [0.23, 1, 0.32, 1] as const;
const MAX_HISTORY = 12;
const SUGGESTIONS = ['How much does a website cost?', 'How long does it take?', 'What do the care plans include?', 'Can you build an online shop?'];
const GREETING = 'Hi, I’m Motion Visual’s AI assistant. Ask me about our packages, prices, process or care plans.';
const FALLBACK_ERROR = 'I’m having trouble answering right now. Please press “Talk to a founder” and we’ll get back to you.';

type Msg = { id: number; role: 'user' | 'assistant'; content: string; error?: boolean };
type View = 'chat' | 'handoff' | 'sent';

/** Turns our own web address and email into links. Everything else stays plain text. */
function Linked({ text }: { text: string }) {
  const parts = text.split(/(https:\/\/motion-visual\.com[^\s]*|admin\.team@motion-visual\.com)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (i % 2 === 0) return p;
        const trail = p.match(/[.,!?;:)]+$/)?.[0] ?? '';
        const core = trail ? p.slice(0, -trail.length) : p;
        const href = core.includes('@') ? `mailto:${core}` : core;
        return (
          <span key={i}>
            <a href={href} target={core.includes('@') ? undefined : '_blank'} rel="noopener noreferrer" style={{ color: '#EDE8DC', textDecoration: 'underline', textUnderlineOffset: 3 }}>{core}</a>
            {trail}
          </span>
        );
      })}
    </>
  );
}

const field = {
  width: '100%', background: 'rgba(237,232,220,0.04)', border: '1px solid rgba(237,232,220,0.14)', borderRadius: 12,
  color: '#EDE8DC', fontSize: 14, padding: '0 14px', minHeight: 46,
} as const;
const label = { display: 'block', fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase' as const, color: 'rgba(237,232,220,0.72)', marginBottom: 6 };

export default function AssistantChat() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>('chat');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [announce, setAnnounce] = useState('');
  const idRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const openedAt = useRef(Date.now());

  // Hand-off form
  const [hName, setHName] = useState('');
  const [hEmail, setHEmail] = useState('');
  const [hPhone, setHPhone] = useState('');
  const [hMessage, setHMessage] = useState('');
  const [hError, setHError] = useState('');
  const [hBusy, setHBusy] = useState(false);

  useEffect(() => () => abortRef.current?.abort(), []);

  const close = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => launcher.current?.focus(), 0);
  }, []);

  useEffect(() => {
    if (open && view === 'chat') textarea.current?.focus();
  }, [open, view]);

  // Escape closes the chat from anywhere (focus can be on the page after a suggested question disappears).
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [open, close]);

  // Stay at the bottom while an answer arrives, unless the visitor has scrolled up to re-read.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [messages, open, view]);
  const onScroll = () => {
    const el = scroller.current;
    if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  };

  // Fit the box to what is typed, up to three lines.
  useLayoutEffect(() => {
    const el = textarea.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  }, [input, open, view]);

  const send = async (raw: string) => {
    const q = raw.trim();
    if (!q || streaming) return;
    const userMsg: Msg = { id: ++idRef.current, role: 'user', content: q };
    const botId = ++idRef.current;

    // What the server sees: finished exchanges only (a question whose answer failed is left out), newest twelve turns, starting with a visitor message.
    const turns: { role: 'user' | 'assistant'; content: string }[] = [];
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      const next = messages[i + 1];
      if (m.role === 'user' && next && !next.error && next.content) turns.push({ role: 'user', content: m.content }, { role: 'assistant', content: next.content });
    }
    const history = [...turns.slice(-(MAX_HISTORY - 1)), { role: 'user' as const, content: q }];
    while (history.length > 1 && history[0].role !== 'user') history.shift();

    stick.current = true;
    setMessages(m => [...m, userMsg, { id: botId, role: 'assistant', content: '' }]);
    setInput('');
    setStreaming(true);
    setAnnounce('');
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const setBot = (patch: (cur: Msg) => Msg) => setMessages(m => m.map(x => (x.id === botId ? patch(x) : x)));
    const fail = (text: string) => setBot(x => ({ ...x, content: text, error: true }));

    try {
      const res = await fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history }), signal: ctrl.signal });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        fail(data.error ?? FALLBACK_ERROR);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let full = '';
      let failed = false;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (!line) continue;
          let ev: { t?: string; v?: string };
          try { ev = JSON.parse(line); } catch { continue; }
          if (ev.t === 'text' && ev.v) { full += ev.v; const snapshot = full; setBot(x => ({ ...x, content: snapshot })); }
          else if (ev.t === 'error') { failed = true; fail(ev.v || FALLBACK_ERROR); }
        }
      }
      if (!failed && !full) fail(FALLBACK_ERROR);
      if (!failed && full) setAnnounce(full);
    } catch (err) {
      if ((err as { name?: string }).name !== 'AbortError') fail('I couldn’t reach our server. Check your connection and try again, or press “Talk to a founder”.');
    } finally {
      setStreaming(false);
    }
  };

  const reset = () => {
    abortRef.current?.abort();
    setMessages([]); setInput(''); setStreaming(false); setAnnounce(''); setView('chat');
    textarea.current?.focus();
  };

  const submitHandoff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hBusy) return;
    if (!hName.trim()) return setHError('Please add your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(hEmail.trim())) return setHError('Please check your email address.');
    setHBusy(true); setHError('');
    const transcript = messages.filter(m => m.content && !m.error).map(m => ({ role: m.role, content: m.content }));
    try {
      const res = await fetch('/api/assistant-handoff', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: hName, email: hEmail, phone: hPhone, message: hMessage, transcript, elapsedMs: Date.now() - openedAt.current }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) { setHError(data.error ?? `Something went wrong. Please email ${COMPANY.email}.`); return; }
      // Also drop it in the CRM, like the website's other forms (the team email above is the reliable route).
      import('../../lib/supabase').then(({ supabase }) => supabase.from('leads').insert([{
        business_name: hName, contact_name: hName, email: hEmail, phone: hPhone, source: 'Website Chat', stage: 'New Lead' as const,
        notes: ['Asked to talk to a founder from the website chat.', hMessage.trim(), '', ...transcript.map(t => `${t.role === 'user' ? 'Visitor' : 'Assistant'}: ${t.content}`)].filter(x => x !== undefined).join('\n'),
      }])).catch(() => null);
      setView('sent');
    } catch {
      setHError(`We couldn’t reach our server. Please email ${COMPANY.email}.`);
    } finally {
      setHBusy(false);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(input); }
  };

  return (
    <div className="assistant-ui">
      <AnimatePresence initial={false}>
        {!open && (
          <motion.button
            key="launcher"
            ref={launcher}
            type="button"
            aria-label="Ask us anything"
            aria-haspopup="dialog"
            onClick={() => { setOpen(true); openedAt.current = Date.now(); }}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2, ease: EASE }}
            className="fixed flex items-center gap-2.5 font-body text-xs font-semibold cursor-pointer active:scale-[0.97]"
            style={{
              right: 'max(16px, env(safe-area-inset-right))', bottom: 'max(16px, env(safe-area-inset-bottom))', zIndex: 60,
              minHeight: 52, padding: '0 20px 0 16px', borderRadius: 999, color: '#F0EDED', letterSpacing: '0.04em',
              background: 'linear-gradient(135deg,#8B1010,#C41E1E)', boxShadow: '0 10px 30px rgba(139,16,16,0.35)',
            }}>
            <MessageCircle size={18} aria-hidden="true" /> <span className="hidden sm:inline">Ask us anything</span><span className="sm:hidden">Ask</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            role="dialog"
            aria-label="Motion Visual assistant"
            initial={{ opacity: 0, y: 14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="fixed flex flex-col"
            style={{
              left: 12, right: 'max(12px, env(safe-area-inset-right))', marginLeft: 'auto', maxWidth: 400,
              bottom: 'max(12px, env(safe-area-inset-bottom))', zIndex: 70,
              height: 'min(640px, calc(100svh - 24px))', transformOrigin: 'bottom right',
              background: '#0E0E10', border: '1px solid rgba(237,232,220,0.12)', borderRadius: 20, overflow: 'hidden',
              boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(196,30,30,0.08)',
            }}>

            <div className="flex items-center gap-3 shrink-0" style={{ padding: '14px 14px 14px 18px', borderBottom: '1px solid rgba(237,232,220,0.08)', background: 'linear-gradient(180deg, rgba(196,30,30,0.1), transparent)' }}>
              {view === 'handoff' && (
                <button type="button" aria-label="Back to the chat" onClick={() => setView('chat')} className="flex items-center justify-center cursor-pointer" style={{ width: 40, height: 40, borderRadius: 999, color: 'rgba(237,232,220,0.84)' }}>
                  <ArrowLeft size={18} aria-hidden="true" />
                </button>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-display italic" style={{ fontSize: '1.25rem', lineHeight: 1.1, color: '#EDE8DC' }}>Motion Visual</p>
                <p className="font-body" style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(237,232,220,0.72)', marginTop: 3 }}>
                  AI assistant
                </p>
              </div>
              {view === 'chat' && messages.length > 0 && (
                <button type="button" aria-label="Start a new chat" title="Start a new chat" onClick={reset} className="flex items-center justify-center cursor-pointer" style={{ width: 40, height: 40, borderRadius: 999, color: 'rgba(237,232,220,0.8)' }}>
                  <RotateCcw size={16} aria-hidden="true" />
                </button>
              )}
              <button type="button" aria-label="Close the chat" onClick={close} className="flex items-center justify-center cursor-pointer" style={{ width: 40, height: 40, borderRadius: 999, color: 'rgba(237,232,220,0.84)' }}>
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {view === 'chat' && (
              <>
                <div ref={scroller} onScroll={onScroll} role="log" aria-label="Conversation" aria-busy={streaming} className="flex-1 overflow-y-auto" style={{ padding: '16px 16px 8px' }}>
                  <div style={{ maxWidth: '88%', background: 'rgba(237,232,220,0.06)', color: '#EDE8DC', borderRadius: '16px 16px 16px 4px', padding: '10px 14px', fontSize: 13.5, lineHeight: 1.6 }}>
                    {GREETING}
                  </div>
                  {messages.length === 0 && (
                    <div className="flex flex-wrap gap-2" style={{ marginTop: 14 }}>
                      {SUGGESTIONS.map(s => (
                        <button key={s} type="button" onClick={() => void send(s)} className="font-body cursor-pointer text-left"
                          style={{ minHeight: 40, padding: '8px 14px', borderRadius: 999, fontSize: 12.5, color: 'rgba(237,232,220,0.8)', border: '1px solid rgba(237,232,220,0.16)', background: 'transparent' }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                  {messages.map(m => (
                    <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'} style={{ marginTop: 10 }}>
                      <div
                        style={m.role === 'user'
                          ? { maxWidth: '88%', background: 'linear-gradient(135deg,#8B1010,#C41E1E)', color: '#F0EDED', borderRadius: '16px 16px 4px 16px', padding: '10px 14px', fontSize: 13.5, lineHeight: 1.6, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }
                          : { maxWidth: '88%', background: 'rgba(237,232,220,0.06)', color: m.error ? '#F2A19A' : '#EDE8DC', borderRadius: '16px 16px 16px 4px', padding: '10px 14px', fontSize: 13.5, lineHeight: 1.6, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                        {m.role === 'assistant' && !m.content && streaming ? (
                          <span aria-label="Typing" className="inline-flex gap-1" style={{ height: 20, alignItems: 'center' }}>
                            {[0, 1, 2].map(i => <span key={i} className="assistant-dot" style={{ animationDelay: `${i * 0.16}s` }} />)}
                          </span>
                        ) : m.role === 'assistant' ? <span aria-hidden={streaming && m === messages[messages.length - 1] ? 'true' : undefined}><Linked text={m.content} /></span> : m.content}
                        {m.error && (
                          <button type="button" onClick={() => setView('handoff')} className="block cursor-pointer" style={{ marginTop: 8, fontSize: 12.5, color: '#EDE8DC', textDecoration: 'underline', textUnderlineOffset: 3, minHeight: 32 }}>Talk to a founder</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Read out once, when an answer is complete, instead of word by word as it streams. */}
                <p role="status" className="sr-only">{announce}</p>

                <div className="shrink-0" style={{ padding: '8px 14px 12px', borderTop: '1px solid rgba(237,232,220,0.08)' }}>
                  <form onSubmit={e => { e.preventDefault(); void send(input); }} className="flex items-end gap-2">
                    <label htmlFor="assistant-input" className="sr-only">Your question</label>
                    <textarea
                      id="assistant-input" ref={textarea} rows={1} value={input} maxLength={500}
                      onChange={e => setInput(e.target.value)} onKeyDown={onKey}
                      placeholder="Ask about prices, timings, care plans…"
                      className="flex-1 resize-none font-body"
                      style={{ ...field, padding: '12px 14px', minHeight: 46, lineHeight: 1.4 }} />
                    <button type="submit" aria-label="Send" disabled={streaming || !input.trim()} className="flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-40"
                      style={{ width: 46, height: 46, borderRadius: 999, background: 'linear-gradient(135deg,#8B1010,#C41E1E)', color: '#F0EDED' }}>
                      <ArrowUp size={18} aria-hidden="true" />
                    </button>
                  </form>
                  <div className="flex items-center justify-between gap-3" style={{ marginTop: 8 }}>
                    <p className="font-body" style={{ fontSize: 10.5, lineHeight: 1.4, color: 'rgba(237,232,220,0.8)', maxWidth: '30ch' }}>
                      AI can make mistakes. Prices and terms on this site always apply.
                    </p>
                    <button type="button" onClick={() => setView('handoff')} className="font-body font-semibold cursor-pointer shrink-0"
                      style={{ minHeight: 40, padding: '0 16px', borderRadius: 999, fontSize: 12, color: '#EDE8DC', border: '1px solid rgba(237,232,220,0.2)' }}>
                      Talk to a founder
                    </button>
                  </div>
                </div>
              </>
            )}

            {view === 'handoff' && (
              <form onSubmit={submitHandoff} noValidate className="flex-1 overflow-y-auto" style={{ padding: '18px 18px 20px' }}>
                <h2 className="font-display italic" style={{ fontSize: '1.6rem', lineHeight: 1.05, color: '#EDE8DC', marginBottom: 6 }}>Talk to a founder</h2>
                <p className="font-body font-light" style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(237,232,220,0.8)', marginBottom: 16 }}>
                  Leave your details and one of us will reply by email. Your chat so far comes with it, so you won’t need to repeat yourself.
                </p>
                <div style={{ display: 'grid', gap: 14 }}>
                  <div><label htmlFor="as-name" className="font-body" style={label}>Your name</label><input id="as-name" value={hName} onChange={e => setHName(e.target.value)} autoComplete="name" maxLength={120} style={field} /></div>
                  <div><label htmlFor="as-email" className="font-body" style={label}>Email</label><input id="as-email" type="email" value={hEmail} onChange={e => setHEmail(e.target.value)} autoComplete="email" maxLength={254} style={field} /></div>
                  <div><label htmlFor="as-phone" className="font-body" style={label}>Phone <span>(optional)</span></label><input id="as-phone" type="tel" value={hPhone} onChange={e => setHPhone(e.target.value)} autoComplete="tel" maxLength={40} style={field} /></div>
                  <div><label htmlFor="as-msg" className="font-body" style={label}>Anything to add <span>(optional)</span></label><textarea id="as-msg" rows={3} value={hMessage} onChange={e => setHMessage(e.target.value)} maxLength={1000} style={{ ...field, padding: '12px 14px', lineHeight: 1.5 }} /></div>
                </div>
                <div role="alert" aria-live="assertive">{hError && <p className="font-body" style={{ fontSize: 13, color: '#F2A19A', marginTop: 12 }}>{hError}</p>}</div>
                <button type="submit" disabled={hBusy} className="w-full font-body font-semibold cursor-pointer disabled:opacity-60"
                  style={{ marginTop: 16, minHeight: 50, borderRadius: 999, fontSize: 13, letterSpacing: '0.04em', background: 'linear-gradient(135deg,#8B1010,#C41E1E)', color: '#F0EDED' }}>
                  {hBusy ? 'Sending…' : 'Send to a founder'}
                </button>
                <p className="font-body font-light" style={{ fontSize: 11, lineHeight: 1.5, color: 'rgba(237,232,220,0.8)', marginTop: 10 }}>
                  We use these details only to reply to you. See our <a href="/privacy" style={{ textDecoration: 'underline' }}>Privacy Policy</a>.
                </p>
              </form>
            )}

            {view === 'sent' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center" style={{ padding: 28 }} role="status">
                <span className="gradient-bg flex items-center justify-center" style={{ width: 52, height: 52, borderRadius: 999, marginBottom: 18 }} aria-hidden="true"><Check size={22} style={{ color: '#F0EDED' }} /></span>
                <h2 className="font-display italic" style={{ fontSize: '1.9rem', lineHeight: 1.05, color: '#EDE8DC', marginBottom: 8 }}>Thank you, {hName.trim().split(' ')[0]}.</h2>
                <p className="font-body font-light" style={{ fontSize: 13.5, lineHeight: 1.65, color: 'rgba(237,232,220,0.8)', maxWidth: '30ch' }}>
                  A founder will reply to <span style={{ color: '#EDE8DC' }}>{hEmail.trim()}</span>.
                </p>
                <button type="button" onClick={() => setView('chat')} className="font-body font-semibold cursor-pointer" style={{ marginTop: 22, minHeight: 44, padding: '0 22px', borderRadius: 999, fontSize: 12.5, color: '#EDE8DC', border: '1px solid rgba(237,232,220,0.2)' }}>Back to the chat</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        .assistant-dot { width: 6px; height: 6px; border-radius: 999px; background: rgba(237,232,220,0.55); animation: assistant-pulse 1s ease-in-out infinite; }
        @keyframes assistant-pulse { 0%, 100% { opacity: 0.3; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-2px); } }
      `}</style>
    </div>
  );
}
