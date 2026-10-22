import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { formatDate, formatGBP, KIND_LABEL } from '../../legal/format';
import { displayStatus } from './data';
import type { AgreementKind } from '../../legal/types';
import { Button, ErrorText, muted, PageTitle, StatusPill } from './ui';

type ListRow = {
  id: string;
  reference: string;
  kind: AgreementKind;
  title: string;
  client_name: string;
  client_business: string | null;
  status: string;
  created_at: string;
  sent_at: string | null;
  first_viewed_at: string | null;
  signed_at: string | null;
  expires_at: string | null;
  total: number | null;
};

export default function AgreementList() {
  const [rows, setRows] = useState<ListRow[] | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from('agreements')
      .select('id,reference,kind,title,client_name,client_business,status,created_at,sent_at,first_viewed_at,signed_at,expires_at,total:document->totalPence')
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        setRows((data ?? []) as ListRow[]);
      });
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageTitle eyebrow="Studio">Client agreements</PageTitle>
        <Button variant="primary" onClick={() => navigate('/studio/agreements/new')} className="mb-8" style={{ padding: '11px 22px' }}>
          New agreement
        </Button>
      </div>

      {error && <ErrorText>{error}</ErrorText>}

      {rows && rows.length === 0 && !error && (
        <div className="py-16 max-w-lg">
          <p className="font-body font-light text-sm leading-relaxed" style={{ color: 'rgba(237,232,220,0.7)' }}>
            No agreements yet. Create a Project Agreement before any work starts, a Change Request for anything extra, and a Completion Sign-off when you hand over.
          </p>
        </div>
      )}

      {rows && rows.length > 0 && (
        <ul className="flex flex-col" style={{ borderBottom: '1px solid rgba(237,232,220,0.07)' }}>
          {rows.map(r => {
            const last = r.signed_at ?? r.first_viewed_at ?? r.sent_at ?? r.created_at;
            return (
              <li key={r.id}>
                <Link to={`/studio/agreements/${r.id}`}
                  className="grid grid-cols-[1fr_auto] md:grid-cols-[8rem_minmax(0,1fr)_10rem_7rem_7rem] items-center gap-x-6 gap-y-1 py-4 transition-[background-color] duration-200 hover:bg-[rgba(237,232,220,0.03)]"
                  style={{ borderTop: '1px solid rgba(237,232,220,0.07)' }}>
                  <span className="font-body text-xs tabular-nums order-3 md:order-none" style={{ color: muted }}>{r.reference}</span>
                  <span className="min-w-0">
                    <span className="block font-body text-sm truncate" style={{ color: '#EDE8DC' }}>{r.title}</span>
                    <span className="block font-body font-light text-xs truncate" style={{ color: muted }}>
                      {KIND_LABEL[r.kind]} · {r.client_business ? `${r.client_business} (${r.client_name})` : r.client_name}
                    </span>
                  </span>
                  <span className="hidden md:block font-body text-xs" style={{ color: muted }}>{formatDate(last)}</span>
                  <span className="hidden md:block font-body text-sm tabular-nums text-right" style={{ color: '#EDE8DC' }}>
                    {typeof r.total === 'number' ? formatGBP(r.total) : '—'}
                  </span>
                  <span className="justify-self-end"><StatusPill status={displayStatus(r)} /></span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
