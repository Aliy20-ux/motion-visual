import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import AgreementDocumentView from '../../components/agreement/AgreementDocumentView';
import { formatDateTime, KIND_LABEL } from '../../legal/format';
import { agreementLink, displayStatus, loadAgreement, type AgreementEvent, type AgreementRow } from './data';
import { Button, ErrorText, Label, muted, PageTitle, StatusPill, TextArea, TextInput } from './ui';

const EVENT_LABEL: Record<AgreementEvent['type'], string> = {
  created: 'Draft created',
  sent: 'Signing link issued to client',
  viewed: 'Opened by client',
  question: 'Client asked a question',
  signed: 'Signed by client',
  voided: 'Voided',
};

function shortDevice(ua: string | null): string {
  if (!ua) return '';
  const os = /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac OS X/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : 'Other';
  const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
  return `${browser} on ${os}`;
}

export default function AgreementDetail({ session }: { session: Session }) {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [row, setRow] = useState<AgreementRow | null | undefined>(undefined);
  const [events, setEvents] = useState<AgreementEvent[]>([]);
  const [team, setTeam] = useState<Record<string, string>>({});
  const [panel, setPanel] = useState<'none' | 'send' | 'void'>('none');
  const [message, setMessage] = useState('');
  const [validDays, setValidDays] = useState('14');
  const [voidReason, setVoidReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refresh = useCallback(async () => {
    const result = await loadAgreement(id);
    setRow(result.row);
    setEvents(result.events);
  }, [id]);

  useEffect(() => {
    refresh();
    supabase.from('team_members').select('id,full_name').then(({ data }) => {
      setTeam(Object.fromEntries((data ?? []).map((m: { id: string; full_name: string }) => [m.id, m.full_name])));
    });
  }, [refresh]);

  if (row === undefined) return <div aria-busy="true" style={{ minHeight: '50svh' }} />;
  if (row === null) return <ErrorText>Agreement not found.</ErrorText>;

  const status = displayStatus(row);
  const link = agreementLink(row.access_token);

  const send = async () => {
    setBusy(true); setError(''); setNotice('');
    try {
      const res = await fetch('/api/agreements/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ id: row.id, message, validDays: Number(validDays) || 14 }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; emailed?: boolean; error?: string };
      if (!data.ok) setError(data.error ?? 'Couldn’t send the agreement.');
      else if (!data.emailed) setError('Marked as sent, but the email didn’t go through. Copy the link and send it yourself, or try Resend.');
      else { setNotice(`Sent to ${row.client_email}.`); setPanel('none'); setMessage(''); }
    } catch {
      setError('Couldn’t reach the server.');
    }
    setBusy(false);
    refresh();
  };

  const voidIt = async () => {
    if (!voidReason.trim()) { setError('Say why it’s being voided — the client won’t see this, but the audit trail will.'); return; }
    setBusy(true); setError('');
    const { error: err } = await supabase.from('agreements').update({ status: 'void', void_reason: voidReason.trim() }).eq('id', row.id);
    setBusy(false);
    if (err) setError(err.message);
    else { setPanel('none'); refresh(); }
  };

  const remove = async () => {
    if (!window.confirm(`Delete draft ${row.reference}? This can’t be undone.`)) return;
    const { error: err } = await supabase.from('agreements').delete().eq('id', row.id);
    if (err) setError(err.message);
    else navigate('/studio/agreements');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setNotice('Link copied.');
    } catch {
      setNotice(link);
    }
  };

  const duplicate = () => navigate('/studio/agreements/new', {
    state: { from: { doc: row.document, client_id: row.client_id, parent_id: row.parent_id } },
  });

  const signature = row.status === 'signed' && row.signer_name && row.signed_at
    ? {
        signerName: row.signer_name,
        signedAt: row.signed_at,
        documentHash: row.document_hash,
        startChoice: typeof row.signer_consents?.startChoice === 'string' ? row.signer_consents.startChoice : null,
      }
    : null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] gap-12">
      <div className="flex flex-col gap-6">
        <div>
          <PageTitle eyebrow={`${KIND_LABEL[row.kind]} · ${row.reference}`}>{row.title}</PageTitle>
          <div className="-mt-4 flex items-center gap-3">
            <StatusPill status={status} />
            <span className="font-body text-xs" style={{ color: muted }}>
              {row.client_business ? `${row.client_business} · ` : ''}{row.client_name} · {row.client_email}
            </span>
          </div>
        </div>

        {/* ── Actions for the current state ── */}
        <div className="flex flex-wrap gap-2">
          {row.status === 'draft' && (
            <>
              <Button variant="primary" onClick={() => { setPanel('send'); setError(''); }}>Send to client</Button>
              <Button onClick={() => navigate(`/studio/agreements/${row.id}/edit`)}>Edit</Button>
              <Button variant="danger" onClick={remove}>Delete draft</Button>
            </>
          )}
          {row.status === 'sent' && (
            <>
              <Button variant="primary" onClick={() => { setPanel('send'); setError(''); }}>{status === 'expired' ? 'Re-open & resend' : 'Resend'}</Button>
              <Button onClick={copyLink}>Copy client link</Button>
            </>
          )}
          {row.status === 'signed' && <Button onClick={copyLink}>Copy client link</Button>}
          {(row.status === 'draft' || row.status === 'sent') && (
            <Button variant="danger" onClick={() => { setPanel('void'); setError(''); }}>Void</Button>
          )}
          <Button onClick={duplicate}>Duplicate as new draft</Button>
        </div>

        {panel === 'send' && (
          <div className="flex flex-col gap-4 p-5 rounded-xl" style={{ border: '1px solid rgba(237,232,220,0.1)' }}>
            <p className="font-body text-sm" style={{ color: '#EDE8DC' }}>
              Email a private signing link to <strong className="font-medium">{row.client_email}</strong>.
            </p>
            <div>
              <Label htmlFor="send-message" hint="Optional — shown at the top of the email.">Personal note</Label>
              <TextArea id="send-message" rows={3} value={message} onChange={e => setMessage(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="valid-days" hint="After this the link stops accepting signatures (1–60 days).">Open for (days)</Label>
              <TextInput id="valid-days" inputMode="numeric" value={validDays} onChange={e => setValidDays(e.target.value)} style={{ maxWidth: 120 }} />
            </div>
            {row.status === 'draft' && (
              <p className="font-body font-light text-xs leading-relaxed" style={{ color: muted }}>
                Sending locks the wording. Check the preview first — after this, changes mean voiding and sending a revised copy.
              </p>
            )}
            <div className="flex gap-2">
              <Button variant="primary" onClick={send} disabled={busy}>{busy ? 'Sending…' : 'Send now'}</Button>
              <Button onClick={() => setPanel('none')}>Cancel</Button>
            </div>
          </div>
        )}

        {panel === 'void' && (
          <div className="flex flex-col gap-4 p-5 rounded-xl" style={{ border: '1px solid rgba(248,113,113,0.3)' }}>
            <p className="font-body text-sm" style={{ color: '#EDE8DC' }}>
              Voiding withdraws the agreement — the client’s link will say it’s been withdrawn. This can’t be undone.
            </p>
            <div>
              <Label htmlFor="void-reason">Reason (internal)</Label>
              <TextInput id="void-reason" value={voidReason} onChange={e => setVoidReason(e.target.value)} placeholder="e.g. Price revised after call" />
            </div>
            <div className="flex gap-2">
              <Button variant="danger" onClick={voidIt} disabled={busy}>Void agreement</Button>
              <Button onClick={() => setPanel('none')}>Cancel</Button>
            </div>
          </div>
        )}

        {error && <ErrorText>{error}</ErrorText>}
        {notice && <p role="status" className="font-body text-sm break-all" style={{ color: '#86EFAC' }}>{notice}</p>}

        {row.status === 'signed' && (
          <div className="p-5 rounded-xl flex flex-col gap-1.5" style={{ border: '1px solid rgba(134,239,172,0.25)', background: 'rgba(134,239,172,0.04)' }}>
            <p className="font-body text-[9px] tracking-[0.28em] uppercase mb-1" style={{ color: muted }}>Signature evidence</p>
            <p className="font-body text-sm" style={{ color: '#EDE8DC' }}>{row.signer_name}</p>
            <p className="font-body text-xs" style={{ color: muted }}>{formatDateTime(row.signed_at!)}</p>
            <p className="font-body text-xs" style={{ color: muted }}>IP {row.signer_ip ?? 'unknown'} · {shortDevice(row.signer_user_agent)}</p>
            <p className="font-body text-[10px] break-all mt-1" style={{ color: muted }}>SHA-256 {row.document_hash}</p>
          </div>
        )}

        {/* ── Audit trail ── */}
        <div>
          <p className="font-body text-[9px] tracking-[0.28em] uppercase mb-3" style={{ color: muted }}>Audit trail</p>
          <ol className="flex flex-col">
            {events.map(ev => (
              <li key={ev.id} className="py-3" style={{ borderTop: '1px solid rgba(237,232,220,0.07)' }}>
                <p className="font-body text-sm" style={{ color: '#EDE8DC' }}>
                  {EVENT_LABEL[ev.type]}
                  {ev.team_member_id && team[ev.team_member_id] ? <span style={{ color: muted }}> — {team[ev.team_member_id]}</span> : null}
                </p>
                <p className="font-body text-xs" style={{ color: muted }}>
                  {formatDateTime(ev.created_at)}
                  {ev.ip ? ` · IP ${ev.ip}` : ''}
                  {ev.user_agent ? ` · ${shortDevice(ev.user_agent)}` : ''}
                </p>
                {ev.type === 'question' && typeof ev.detail.message === 'string' && (
                  <p className="font-body font-light text-sm mt-2 whitespace-pre-wrap" style={{ color: 'rgba(237,232,220,0.8)', borderLeft: '2px solid rgba(196,30,30,0.5)', paddingLeft: 10 }}>
                    {ev.detail.message}
                  </p>
                )}
                {ev.type === 'voided' && typeof ev.detail.reason === 'string' && (
                  <p className="font-body font-light text-xs mt-1" style={{ color: muted }}>Reason: {ev.detail.reason}</p>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="min-w-0">
        <p className="font-body text-[9px] tracking-[0.28em] uppercase mb-4" style={{ color: muted }}>
          {row.status === 'draft' ? 'Preview — exactly what the client will see' : 'What the client sees'}
        </p>
        <div className="p-5 sm:p-8 rounded-xl" style={{ border: '1px solid rgba(237,232,220,0.08)', background: '#0C0C0E' }}>
          <AgreementDocumentView doc={row.document} signature={signature} expiresAt={row.expires_at} />
        </div>
      </div>
    </div>
  );
}
