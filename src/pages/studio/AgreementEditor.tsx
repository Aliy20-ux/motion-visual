import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import AgreementDocumentView from '../../components/agreement/AgreementDocumentView';
import { buildDocument, splitLines, TERMS_VERSION } from '../../legal/buildDocument';
import { depositPence, formatDate, formatGBP, KIND_LABEL, parsePounds } from '../../legal/format';
import type { AgreementDocument, AgreementKind, ClientType, Delivery } from '../../legal/types';
import type { AgreementRow, CrmClient, QuoteSeed } from './data';
import { Button, Label, muted, PageTitle, Select, TextArea, TextInput } from './ui';

type PaymentDraft = { label: string; amount: string; due: string };

type Draft = {
  kind: AgreementKind;
  delivery: Delivery;
  previewUrl: string;
  clientType: ClientType;
  clientId: string;
  clientName: string;
  clientBusiness: string;
  clientEmail: string;
  parentId: string;
  parentLabel: string;
  title: string;
  summary: string;
  included: string;
  excluded: string;
  thirdParty: string;
  delivered: string;
  outstanding: string;
  total: string;
  payments: PaymentDraft[];
  timeline: string;
  revisions: string;
};

type ParentOption = Pick<AgreementRow, 'id' | 'reference' | 'title' | 'kind' | 'client_id' | 'client_name' | 'client_business' | 'client_email' | 'client_type'>;

// Defaults are starting points the team edits per client — they're what most
// disputes turn on, so the "Not included" list is pre-filled rather than blank.
const DEFAULT_EXCLUDED = [
  'Custom-built booking, payment or account systems — third-party platforms are linked or embedded only',
  'Pages, sections or features not listed under “Included”',
  'Writing website copy beyond editing the text you supply',
  'Logo or brand identity design',
  'Paid third-party subscriptions, plugins, fonts or stock imagery',
  'Moving content or customer data from another website or system',
  'Hosting, maintenance and support after the 30-day bug-fix period (available as a care plan)',
].join('\n');

const DEFAULT_REVISIONS = 'Two rounds of changes: one combined round on your first design, and one more during the build.';
const DEFAULT_TIMELINE = 'First design within 2 working days and site shared with you by day 14, counted from the day we have your signed agreement and your content; balance due within 7 days of us sharing the finished site.';
const READY_REVISIONS = 'One round of changes to fit the site to your business.';
const READY_TIMELINE = 'Your changes made within 5 working days of receiving your content; live within 3 working days of your balance clearing.';

function emptyDraft(kind: AgreementKind = 'project'): Draft {
  return {
    kind,
    delivery: 'standard',
    previewUrl: '',
    clientType: 'business',
    clientId: '',
    clientName: '',
    clientBusiness: '',
    clientEmail: '',
    parentId: '',
    parentLabel: '',
    title: '',
    summary: '',
    included: '',
    excluded: kind === 'project' ? DEFAULT_EXCLUDED : kind === 'change' ? 'Anything not listed under “Included” above' : '',
    thirdParty: '',
    delivered: '',
    outstanding: '',
    total: '',
    payments: [],
    timeline: kind === 'project' ? DEFAULT_TIMELINE : '',
    revisions: kind === 'project' ? DEFAULT_REVISIONS : '',
  };
}

const poundsText = (pence: number) => (pence / 100).toFixed(pence % 100 === 0 ? 0 : 2);

/** Standard terms: deposit of 25% of the build price on signing, balance within 7 days of sharing the finished site. */
function standardPaymentRows(totalPence: number, ready: boolean): PaymentDraft[] {
  const deposit = depositPence(totalPence);
  return [
    { label: 'Deposit', amount: poundsText(deposit), due: ready
      ? 'When you sign — refunded in full if you cancel before we start your changes'
      : 'When you sign — refunded in full if you cancel before we begin work' },
    { label: 'Balance', amount: poundsText(totalPence - deposit), due: 'Within 7 days of us sharing your finished site, before launch' },
  ];
}

// The same inclusions the pricing section promises on every build.
const QUOTE_STANDARD_INCLUDED = [
  'Fully custom design — no templates',
  'Two rounds of changes',
  'Your domain registered in your name, first year included',
];

/** A website quote becomes a Project Agreement draft. The team still sets the client type and can edit everything. */
function draftFromQuote(q: QuoteSeed): Draft {
  const base = emptyDraft('project');
  return {
    ...base,
    clientName: q.customerName,
    clientEmail: q.customerEmail,
    title: `${q.plan} website — quote ${q.reference}`,
    summary: `Website project from quote ${q.reference}, issued ${formatDate(q.issuedOn)}.`,
    included: [
      ...q.lines.map(l => (l.pounds === 0 ? `${l.label} (included in your plan)` : `${l.label}${l.note ? ` — ${l.note}` : ''}`)),
      ...QUOTE_STANDARD_INCLUDED,
    ].join('\n'),
    total: poundsText(q.totalPence),
    payments: standardPaymentRows(q.totalPence, false),
  };
}

function draftFromDocument(doc: AgreementDocument, row?: Pick<AgreementRow, 'client_id' | 'parent_id'>): Draft {
  return {
    kind: doc.kind,
    delivery: doc.delivery ?? 'standard',
    previewUrl: doc.previewUrl ?? '',
    clientType: doc.client.type,
    clientId: row?.client_id ?? '',
    clientName: doc.client.name,
    clientBusiness: doc.client.business ?? '',
    clientEmail: doc.client.email,
    parentId: row?.parent_id ?? '',
    parentLabel: !row?.parent_id && doc.parent ? doc.parent.title : '',
    title: doc.title,
    summary: doc.summary,
    included: doc.included.join('\n'),
    excluded: doc.excluded.join('\n'),
    thirdParty: doc.thirdParty.join('\n'),
    delivered: doc.delivered.join('\n'),
    outstanding: doc.outstanding.join('\n'),
    total: doc.totalPence === null ? '' : poundsText(doc.totalPence),
    payments: doc.payments.map(p => ({ label: p.label, amount: poundsText(p.amountPence), due: p.due })),
    timeline: doc.timeline,
    revisions: doc.revisions,
  };
}

const todayISO = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' });

export default function AgreementEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const duplicateFrom = (location.state as { from?: { doc: AgreementDocument; client_id: string | null; parent_id: string | null } } | null)?.from;
  const fromQuote = id ? undefined : (location.state as { fromQuote?: QuoteSeed } | null)?.fromQuote;

  const [draft, setDraft] = useState<Draft>(() => duplicateFrom ? draftFromDocument(duplicateFrom.doc, duplicateFrom) : fromQuote ? draftFromQuote(fromQuote) : emptyDraft());
  const [loaded, setLoaded] = useState(!id);
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [parents, setParents] = useState<ParentOption[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('clients').select('id,business_name,contact_name,email').is('archived_at', null).order('business_name')
      .then(({ data }) => setClients((data ?? []) as CrmClient[]));
    supabase.from('agreements').select('id,reference,title,kind,client_id,client_name,client_business,client_email,client_type')
      .eq('status', 'signed').in('kind', ['project', 'change']).order('created_at', { ascending: false })
      .then(({ data }) => setParents((data ?? []) as ParentOption[]));
  }, []);

  useEffect(() => {
    if (!id) return;
    supabase.from('agreements').select('*').eq('id', id).maybeSingle().then(({ data }) => {
      const row = data as AgreementRow | null;
      if (!row || row.status !== 'draft') { navigate(`/studio/agreements/${id}`, { replace: true }); return; }
      setDraft(draftFromDocument(row.document, row));
      setLoaded(true);
    });
  }, [id, navigate]);

  // Validation messages describe the draft as it was on Save — drop them once it changes.
  useEffect(() => setErrors([]), [draft]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft(d => ({ ...d, [key]: value }));

  const parent = parents.find(p => p.id === draft.parentId) ?? null;
  const totalPence = parsePounds(draft.total);
  const payments = draft.payments.map(p => ({ label: p.label, amountPence: parsePounds(p.amount) ?? 0, due: p.due }));
  const paymentsSum = payments.reduce((sum, p) => sum + p.amountPence, 0);

  const doc = buildDocument({
    kind: draft.kind,
    delivery: draft.delivery,
    previewUrl: draft.previewUrl,
    title: draft.title || 'Untitled agreement',
    issuedOn: todayISO(),
    client: {
      name: draft.clientName || 'Client name',
      business: draft.clientType === 'business' ? draft.clientBusiness || null : null,
      email: draft.clientEmail || 'client@example.com',
      type: draft.clientType,
    },
    parent: draft.kind === 'project' ? null
      : parent ? { reference: parent.reference, title: parent.title }
      : draft.parentLabel.trim() ? { reference: null, title: draft.parentLabel.trim() }
      : null,
    summary: draft.summary,
    included: draft.kind === 'completion' ? [] : splitLines(draft.included),
    excluded: draft.kind === 'completion' ? [] : splitLines(draft.excluded),
    thirdParty: draft.kind === 'completion' ? [] : splitLines(draft.thirdParty),
    delivered: draft.kind === 'completion' ? splitLines(draft.delivered) : [],
    outstanding: draft.kind === 'completion' ? splitLines(draft.outstanding) : [],
    totalPence: draft.total.trim() ? totalPence : null,
    payments: draft.kind === 'completion' ? [] : payments,
    timeline: draft.kind === 'completion' ? '' : draft.timeline,
    revisions: draft.kind === 'completion' ? '' : draft.revisions,
  });

  const validate = (): string[] => {
    const e: string[] = [];
    if (!draft.clientName.trim()) e.push('Add the client’s name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.clientEmail.trim())) e.push('Add a valid client email — the agreement is sent there.');
    if (draft.clientType === 'business' && !draft.clientBusiness.trim()) e.push('Add the business name (or switch the client to Consumer).');
    if (!draft.title.trim()) e.push('Give the agreement a title.');
    if (draft.kind !== 'project' && !parent && !draft.parentLabel.trim()) e.push('Say which agreement this relates to.');
    if (draft.kind === 'project' && draft.delivery === 'ready-made' && !/^https?:\/\/\S+\.\S+/.test(draft.previewUrl.trim())) {
      e.push('Add the preview link for the ready-made site — it’s what the client is buying.');
    }
    if (draft.kind === 'completion') {
      if (!splitLines(draft.delivered).length) e.push('List what was delivered.');
      if (draft.total.trim() && totalPence === null) e.push('The final balance isn’t a valid amount.');
    } else {
      if (!splitLines(draft.included).length) e.push('List what’s included — this is what the client is paying for.');
      if (totalPence === null || totalPence <= 0) e.push('Add the total price.');
      if (!draft.payments.length) e.push('Add at least one payment.');
      if (draft.payments.some(p => !p.label.trim() || !p.due.trim() || !parsePounds(p.amount))) e.push('Each payment needs a name, an amount and when it’s due.');
      if (totalPence !== null && draft.payments.length && paymentsSum !== totalPence) {
        e.push(`Payments add up to ${formatGBP(paymentsSum)}, but the total is ${formatGBP(totalPence)}.`);
      }
    }
    return e;
  };

  const save = async () => {
    const problems = validate();
    setErrors(problems);
    if (problems.length) return;
    setSaving(true);
    const record = {
      kind: draft.kind,
      parent_id: draft.kind === 'project' ? null : parent?.id ?? null,
      client_id: draft.clientId || null,
      client_name: doc.client.name,
      client_business: doc.client.business,
      client_email: doc.client.email,
      client_type: draft.clientType,
      title: doc.title,
      document: doc,
      terms_version: TERMS_VERSION,
    };
    const result = id
      ? await supabase.from('agreements').update(record).eq('id', id).select('id,reference').single()
      : await supabase.from('agreements').insert(record).select('id,reference').single();
    setSaving(false);
    if (result.error) { setErrors([result.error.message]); return; }
    // The customer said yes: move the quote on, and note which agreement it became. Only the quote's
    // status fields are writable by the team, and a failure here must not lose the saved draft.
    if (fromQuote && !id && fromQuote.status === 'issued') {
      await supabase.from('web_quotes').update({ status: 'accepted', status_note: `Agreement ${result.data.reference} drafted` }).eq('id', fromQuote.id).eq('status', 'issued');
    }
    navigate(`/studio/agreements/${result.data.id}`);
  };

  const pickClient = (clientId: string) => {
    const c = clients.find(x => x.id === clientId);
    setDraft(d => ({
      ...d,
      clientId,
      ...(c ? { clientBusiness: c.business_name, clientName: c.contact_name ?? d.clientName, clientEmail: c.email ?? d.clientEmail } : {}),
    }));
  };

  const pickParent = (parentId: string) => {
    const p = parents.find(x => x.id === parentId);
    setDraft(d => ({
      ...d,
      parentId,
      ...(p ? {
        clientId: p.client_id ?? '',
        clientType: p.client_type,
        clientName: p.client_name,
        clientBusiness: p.client_business ?? '',
        clientEmail: p.client_email,
        title: d.title || (d.kind === 'completion' ? `${p.title} — completion` : ''),
      } : {}),
    }));
  };

  const switchKind = (kind: AgreementKind) => {
    setDraft(d => {
      const fresh = emptyDraft(kind);
      // Keep who it's for; reset the kind-specific defaults.
      return { ...fresh, clientType: d.clientType, clientId: d.clientId, clientName: d.clientName, clientBusiness: d.clientBusiness, clientEmail: d.clientEmail, title: d.title, summary: d.summary };
    });
  };

  // Standard terms: deposit of 25% of the build price on signing, balance within 7 days of sharing the finished site.
  const ready = draft.kind === 'project' && draft.delivery === 'ready-made';

  // Swaps the schedule-dependent defaults, but only where they're still untouched defaults.
  const switchDelivery = (delivery: Delivery) => {
    setDraft(d => {
      const toReady = delivery === 'ready-made';
      const swap = (value: string, from: string, to: string) => (value === from || value === '' ? to : value);
      return {
        ...d,
        delivery,
        timeline: toReady ? swap(d.timeline, DEFAULT_TIMELINE, READY_TIMELINE) : swap(d.timeline, READY_TIMELINE, DEFAULT_TIMELINE),
        revisions: toReady ? swap(d.revisions, DEFAULT_REVISIONS, READY_REVISIONS) : swap(d.revisions, READY_REVISIONS, DEFAULT_REVISIONS),
        payments: [],
      };
    });
  };

  const standardPayments = () => {
    if (totalPence === null) { setErrors(['Add the total price first.']); return; }
    const deposit = depositPence(totalPence);
    if (totalPence <= deposit) { setErrors([`The total must be more than the ${formatGBP(deposit)} deposit.`]); return; }
    setDraft(d => ({ ...d, payments: standardPaymentRows(totalPence, ready) }));
  };

  const setPayment = (i: number, patch: Partial<PaymentDraft>) =>
    setDraft(d => ({ ...d, payments: d.payments.map((p, j) => (j === i ? { ...p, ...patch } : p)) }));

  if (!loaded) return <div aria-busy="true" style={{ minHeight: '50svh' }} />;

  const isCompletion = draft.kind === 'completion';

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] gap-12">
      {/* ── Form ── */}
      <div className="flex flex-col gap-7">
        <PageTitle eyebrow={id ? 'Edit draft' : 'New agreement'}>{KIND_LABEL[draft.kind]}</PageTitle>

        {fromQuote && !id && (
          <p role="note" className="-mt-4 font-body font-light text-xs leading-relaxed rounded-lg"
            style={{ color: 'rgba(237,232,220,0.8)', border: '1px solid rgba(252,211,77,0.35)', background: 'rgba(252,211,77,0.06)', padding: '10px 12px' }}>
            Prefilled from quote {fromQuote.reference}. <strong>Check the client type</strong> below — the website doesn’t ask whether the customer is a consumer or a business, and it changes their cancellation rights. Review the included list and payments, then save.
          </p>
        )}

        <div className="-mt-4">
          <Label htmlFor="kind">Type</Label>
          <Select id="kind" value={draft.kind} onChange={e => switchKind(e.target.value as AgreementKind)} disabled={!!id}>
            <option value="project">Project Agreement — before work starts</option>
            <option value="change">Change Request — extra work on an existing project</option>
            <option value="completion">Completion Sign-off — at handover</option>
          </Select>
        </div>

        {draft.kind === 'project' && (
          <div>
            <Label hint="Ready-made: you’ve already built the site and shown it on a preview link.">How it’s delivered</Label>
            <div className="flex gap-2" role="radiogroup" aria-label="How it’s delivered">
              {(['standard', 'ready-made'] as const).map(dv => (
                <button key={dv} type="button" role="radio" aria-checked={draft.delivery === dv} onClick={() => switchDelivery(dv)}
                  className="flex-1 font-body text-xs rounded-lg transition-[background-color,border-color] duration-200"
                  style={{
                    padding: '10px 12px',
                    border: `1px solid ${draft.delivery === dv ? 'rgba(196,30,30,0.5)' : 'rgba(237,232,220,0.14)'}`,
                    background: draft.delivery === dv ? 'rgba(196,30,30,0.1)' : 'transparent',
                    color: '#EDE8DC',
                  }}>
                  {dv === 'standard' ? 'Standard build (14 days)' : 'Ready-made site'}
                </button>
              ))}
            </div>
            {draft.delivery === 'ready-made' && (
              <div className="mt-3">
                <Label htmlFor="preview-url" hint="The link you showed them — this is the scope of the agreement.">Preview link</Label>
                <TextInput id="preview-url" type="url" value={draft.previewUrl} onChange={e => set('previewUrl', e.target.value)}
                  placeholder="https://client-name.aliy20.workers.dev" />
              </div>
            )}
          </div>
        )}

        {draft.kind !== 'project' && (
          <div>
            <Label htmlFor="parent" hint="Pick the signed agreement, or describe one made before this system existed.">Relates to</Label>
            <Select id="parent" value={draft.parentId} onChange={e => pickParent(e.target.value)}>
              <option value="">Not in the system — describe it below</option>
              {parents.map(p => <option key={p.id} value={p.id}>{p.reference} — {p.title} ({p.client_business ?? p.client_name})</option>)}
            </Select>
            {!draft.parentId && (
              <TextInput className="mt-2" value={draft.parentLabel} onChange={e => set('parentLabel', e.target.value)}
                placeholder="e.g. Website build, launched and paid in full in October 2026" />
            )}
          </div>
        )}

        <fieldset className="flex flex-col gap-4">
          <legend className="font-body text-[9px] tracking-[0.28em] uppercase mb-3" style={{ color: muted }}>Client</legend>
          {clients.length > 0 && (
            <div>
              <Label htmlFor="crm-client">From the CRM</Label>
              <Select id="crm-client" value={draft.clientId} onChange={e => pickClient(e.target.value)}>
                <option value="">— Not linked —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.business_name}{c.contact_name ? ` (${c.contact_name})` : ''}</option>)}
              </Select>
            </div>
          )}
          <div className="flex gap-2" role="radiogroup" aria-label="Client type">
            {(['business', 'consumer'] as const).map(t => (
              <button key={t} type="button" role="radio" aria-checked={draft.clientType === t} onClick={() => set('clientType', t)}
                className="flex-1 font-body text-xs rounded-lg transition-[background-color,border-color] duration-200"
                style={{
                  padding: '10px 12px',
                  border: `1px solid ${draft.clientType === t ? 'rgba(196,30,30,0.5)' : 'rgba(237,232,220,0.14)'}`,
                  background: draft.clientType === t ? 'rgba(196,30,30,0.1)' : 'transparent',
                  color: '#EDE8DC',
                }}>
                {t === 'business' ? 'Business (incl. sole trader)' : 'Consumer (individual)'}
              </button>
            ))}
          </div>
          <p className="font-body font-light text-[11px] leading-relaxed -mt-2" style={{ color: 'rgba(237,232,220,0.45)' }}>
            {draft.clientType === 'consumer'
              ? 'Consumer agreements automatically include the 14-day cancellation right, the model cancellation form, and a “when should we start?” choice — required by law.'
              : 'Business terms include an entire-agreement clause and a liability cap.'}
          </p>
          {draft.clientType === 'business' && (
            <div>
              <Label htmlFor="client-business">Business name</Label>
              <TextInput id="client-business" value={draft.clientBusiness} onChange={e => set('clientBusiness', e.target.value)} />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client-name">{draft.clientType === 'business' ? 'Contact name' : 'Full name'}</Label>
              <TextInput id="client-name" value={draft.clientName} onChange={e => set('clientName', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="client-email">Email</Label>
              <TextInput id="client-email" type="email" value={draft.clientEmail} onChange={e => set('clientEmail', e.target.value)} />
            </div>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="font-body text-[9px] tracking-[0.28em] uppercase mb-3" style={{ color: muted }}>The work</legend>
          <div>
            <Label htmlFor="title">Title</Label>
            <TextInput id="title" value={draft.title} onChange={e => set('title', e.target.value)}
              placeholder={draft.kind === 'change' ? 'e.g. Custom booking system' : 'e.g. Barbershop website'} />
          </div>
          <div>
            <Label htmlFor="summary" hint="One or two sentences in plain English.">Summary</Label>
            <TextArea id="summary" rows={3} value={draft.summary} onChange={e => set('summary', e.target.value)} />
          </div>
          {isCompletion ? (
            <>
              <div>
                <Label htmlFor="delivered" hint="One item per line.">Delivered</Label>
                <TextArea id="delivered" rows={5} value={draft.delivered} onChange={e => set('delivered', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="outstanding" hint="Snags you’ll still fix — leave empty if none.">Outstanding</Label>
                <TextArea id="outstanding" rows={3} value={draft.outstanding} onChange={e => set('outstanding', e.target.value)} />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="included" hint={ready ? 'One per line: the pages on the preview site, plus the changes you’ll make.' : 'One item per line. Be specific: name every page and feature.'}>Included</Label>
                <TextArea id="included" rows={6} value={draft.included} onChange={e => set('included', e.target.value)}
                  placeholder={'Home, Services, Gallery and Contact pages\nTreatwell booking button on every page\nMobile-friendly layout\nDomain name (first year), registered in your name'} />
              </div>
              <div>
                <Label htmlFor="excluded" hint="Pre-filled with the usual exclusions — edit to fit.">Not included</Label>
                <TextArea id="excluded" rows={6} value={draft.excluded} onChange={e => set('excluded', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="third-party" hint="e.g. Treatwell (bookings), Stripe (payments). One per line.">Third-party platforms</Label>
                <TextArea id="third-party" rows={2} value={draft.thirdParty} onChange={e => set('thirdParty', e.target.value)} />
              </div>
            </>
          )}
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="font-body text-[9px] tracking-[0.28em] uppercase mb-3" style={{ color: muted }}>{isCompletion ? 'Final balance' : 'Price'}</legend>
          <div>
            <Label htmlFor="total" hint={isCompletion ? 'Optional — what’s still owed at handover.' : 'No VAT — Motion Visual isn’t VAT registered.'}>
              {isCompletion ? 'Balance due (£)' : 'Total price (£)'}
            </Label>
            <TextInput id="total" inputMode="decimal" value={draft.total} onChange={e => set('total', e.target.value)} placeholder="e.g. 700" />
          </div>
          {!isCompletion && (
            <>
              <div className="flex flex-col gap-3">
                {draft.payments.map((p, i) => (
                  <div key={i} className="grid grid-cols-[1fr_6rem_auto] gap-2 items-start">
                    <TextInput aria-label={`Payment ${i + 1} name`} value={p.label} onChange={e => setPayment(i, { label: e.target.value })} placeholder="Deposit" />
                    <TextInput aria-label={`Payment ${i + 1} amount`} inputMode="decimal" value={p.amount} onChange={e => setPayment(i, { amount: e.target.value })} placeholder="£" />
                    <Button type="button" aria-label={`Remove payment ${i + 1}`} onClick={() => setDraft(d => ({ ...d, payments: d.payments.filter((_, j) => j !== i) }))}>✕</Button>
                    <TextInput aria-label={`Payment ${i + 1} due`} className="col-span-2" value={p.due} onChange={e => setPayment(i, { due: e.target.value })} placeholder="When it’s due — e.g. Before any work starts" />
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={standardPayments}>25% deposit + balance</Button>
                <Button type="button" onClick={() => setDraft(d => ({ ...d, payments: [...d.payments, { label: '', amount: '', due: '' }] }))}>Add payment</Button>
                {totalPence !== null && draft.payments.length > 0 && (
                  <span className="font-body text-xs self-center" style={{ color: paymentsSum === totalPence ? '#86EFAC' : '#F87171' }}>
                    {formatGBP(paymentsSum)} of {formatGBP(totalPence)}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="timeline">Timeline</Label>
                <TextInput id="timeline" value={draft.timeline} onChange={e => set('timeline', e.target.value)} placeholder="e.g. About 3 weeks from receiving the deposit and your content" />
              </div>
              <div>
                <Label htmlFor="revisions">Revisions</Label>
                <TextInput id="revisions" value={draft.revisions} onChange={e => set('revisions', e.target.value)} />
              </div>
            </>
          )}
        </fieldset>

        {errors.length > 0 && (
          <div role="alert" className="flex flex-col gap-1.5 p-4 rounded-lg" style={{ border: '1px solid rgba(248,113,113,0.35)', background: 'rgba(248,113,113,0.06)' }}>
            {errors.map(e => <p key={e} className="font-body text-xs" style={{ color: '#FCA5A5' }}>{e}</p>)}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="primary" onClick={save} disabled={saving} style={{ padding: '11px 24px' }}>
            {saving ? 'Saving…' : 'Save draft'}
          </Button>
          <Button type="button" onClick={() => navigate(id ? `/studio/agreements/${id}` : '/studio/agreements')}>Cancel</Button>
        </div>
        <p className="font-body font-light text-[11px] leading-relaxed -mt-3" style={{ color: 'rgba(237,232,220,0.45)' }}>
          Drafts stay private. You’ll review and send from the next screen. Once sent, an agreement can’t be edited — void it and send a revised copy instead.
        </p>
      </div>

      {/* ── Live preview: exactly what the client will see ── */}
      <div className="min-w-0">
        <p className="font-body text-[9px] tracking-[0.28em] uppercase mb-4" style={{ color: muted }}>Client preview</p>
        <div className="p-5 sm:p-8 rounded-xl" style={{ border: '1px solid rgba(237,232,220,0.08)', background: '#0C0C0E' }}>
          <AgreementDocumentView doc={doc} />
        </div>
      </div>
    </div>
  );
}
