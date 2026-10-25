import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { formatDate, formatGBP } from '../../legal/format';
import { displayStatus } from './data';
import { buildBoard, STAGE_COPY, STAGE_ORDER, type BoardProject, type BoardRow, type ProjectStage } from './projects';
import { Button, ErrorText, muted, PageTitle, StatusPill } from './ui';

const COLUMNS =
  'id,reference,kind,parent_id,title,client_id,client_name,client_business,client_email,client_type,status,created_at,sent_at,first_viewed_at,signed_at,signer_name,expires_at,total:document->totalPence';

const COMPLETED_PREVIEW = 6;

export default function ProjectBoard() {
  const [rows, setRows] = useState<BoardRow[] | null>(null);
  const [error, setError] = useState('');
  const [showAllCompleted, setShowAllCompleted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from('agreements').select(COLUMNS).order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        setRows((data ?? []) as BoardRow[]);
      });
  }, []);

  const board = useMemo(() => (rows ? buildBoard(rows) : null), [rows]);

  return (
    <div>
      <PageTitle eyebrow="Studio">Projects</PageTitle>
      <p className="font-body font-light text-sm -mt-4 mb-10 max-w-xl" style={{ color: 'rgba(237,232,220,0.84)' }}>
        Every project sorts itself. It moves to Completed the moment the client signs its Completion Sign-off, so there’s nothing to update by hand.
      </p>

      {error && <ErrorText>{error}</ErrorText>}
      {!board && !error && <div aria-busy="true" style={{ minHeight: '30svh' }} />}

      {board && STAGE_ORDER.map(stage => {
        const all = board[stage];
        const items = stage === 'completed' && !showAllCompleted ? all.slice(0, COMPLETED_PREVIEW) : all;
        return (
          <section key={stage} aria-labelledby={`stage-${stage}`} className="mb-12">
            <h2 id={`stage-${stage}`} className="font-display italic mb-3" style={{ fontSize: '1.5rem', color: '#EDE8DC' }}>
              {STAGE_COPY[stage].title} <span className="font-body not-italic text-xs tabular-nums" style={{ color: muted }}>{all.length}</span>
            </h2>
            {all.length === 0 ? (
              <p className="font-body font-light text-sm py-3" style={{ color: muted }}>{STAGE_COPY[stage].empty}</p>
            ) : (
              <ul style={{ borderBottom: '1px solid rgba(237,232,220,0.07)' }}>
                {items.map(item => <Row key={item.key} item={item} onSendSignoff={() => startSignoff(item)} />)}
              </ul>
            )}
            {stage === 'completed' && all.length > COMPLETED_PREVIEW && (
              <Button onClick={() => setShowAllCompleted(v => !v)} className="mt-4">
                {showAllCompleted ? 'Show fewer' : `Show all ${all.length}`}
              </Button>
            )}
          </section>
        );
      })}
    </div>
  );

  function startSignoff(item: BoardProject) {
    if (!item.project) return;
    navigate('/studio/agreements/new', { state: { completionFor: item.project } });
  }
}

function Row({ item, onSendSignoff }: { item: BoardProject; onSendSignoff: () => void }) {
  const primary = item.project ?? item.signoff!;
  const target = item.stage === 'completed' || item.stage === 'awaiting-signoff' ? (item.signoff ?? primary) : primary;
  const who = primary.client_business ? `${primary.client_business} (${primary.client_name})` : primary.client_name;
  const total = item.project?.total ?? item.signoff?.total ?? null;

  return (
    <li className="grid grid-cols-[1fr_auto] md:grid-cols-[8rem_minmax(0,1fr)_13rem_7rem_9rem] items-center gap-x-6 gap-y-1 py-4"
      style={{ borderTop: '1px solid rgba(237,232,220,0.07)' }}>
      <Link to={`/studio/agreements/${target.id}`} className="contents">
        <span className="font-body text-xs tabular-nums order-3 md:order-none" style={{ color: muted }}>{primary.reference}</span>
        <span className="min-w-0">
          <span className="block font-body text-sm truncate hover:underline" style={{ color: '#EDE8DC' }}>{primary.title}</span>
          <span className="block font-body font-light text-xs truncate" style={{ color: muted }}>{who}</span>
        </span>
        <span className="hidden md:block font-body text-xs" style={{ color: muted }}>{detail(item.stage, item)}</span>
        <span className="hidden md:block font-body text-sm tabular-nums text-right" style={{ color: '#EDE8DC' }}>
          {typeof total === 'number' ? formatGBP(total) : '—'}
        </span>
      </Link>
      <span className="justify-self-end">
        {item.stage === 'in-progress' && <Button onClick={onSendSignoff} aria-label={`Send completion sign-off for ${primary.title}`}>Send sign-off</Button>}
        {item.stage === 'awaiting-signoff' && item.signoff && <StatusPill status={displayStatus(item.signoff)} />}
        {item.stage === 'agreement-out' && item.project && <StatusPill status={displayStatus(item.project)} />}
        {item.stage === 'completed' && <StatusPill status="signed" />}
      </span>
    </li>
  );
}

function detail(stage: ProjectStage, item: BoardProject): string {
  if (stage === 'completed') {
    const by = item.signoff?.signer_name;
    return `Signed off ${formatDate(item.since)}${by ? ` by ${by}` : ''}`;
  }
  if (stage === 'awaiting-signoff') return `Sign-off sent ${formatDate(item.since)}`;
  if (stage === 'agreement-out') return `Agreement sent ${formatDate(item.since)}`;
  return `Agreement signed ${formatDate(item.since)}`;
}
