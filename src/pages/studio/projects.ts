import type { AgreementKind, ClientType } from '../../legal/types';

/** The columns the Projects board needs from `agreements` — no document bodies. */
export type BoardRow = {
  id: string;
  reference: string;
  kind: AgreementKind;
  parent_id: string | null;
  title: string;
  client_id: string | null;
  client_name: string;
  client_business: string | null;
  client_email: string;
  client_type: ClientType;
  status: string;
  created_at: string;
  sent_at: string | null;
  first_viewed_at: string | null;
  signed_at: string | null;
  signer_name: string | null;
  expires_at: string | null;
  /** Total in pence, from document->totalPence. */
  total: number | null;
};

export type ProjectStage = 'agreement-out' | 'in-progress' | 'awaiting-signoff' | 'completed';

export type BoardProject = {
  key: string;
  stage: ProjectStage;
  /** The Project Agreement. Null for a sign-off that was never linked to one. */
  project: BoardRow | null;
  /** The Completion Sign-off that decided the stage (sent or signed). */
  signoff: BoardRow | null;
  /** When it last moved: signed-off date for Completed, otherwise when the current step began. */
  since: string;
};

export const STAGE_ORDER: ProjectStage[] = ['awaiting-signoff', 'in-progress', 'agreement-out', 'completed'];

export const STAGE_COPY: Record<ProjectStage, { title: string; empty: string }> = {
  'awaiting-signoff': { title: 'Waiting for client sign-off', empty: 'Nothing waiting on a client.' },
  'in-progress': { title: 'In progress', empty: 'No projects in progress.' },
  'agreement-out': { title: 'Agreement not signed yet', empty: 'No agreements waiting to be signed.' },
  completed: { title: 'Completed', empty: 'Nothing completed yet.' },
};

/** Follows parent links (sign-off → change request → project) to the Project Agreement it belongs to. */
function rootProject(row: BoardRow, byId: Map<string, BoardRow>): BoardRow | null {
  let current: BoardRow | undefined = row;
  for (let hops = 0; current && hops < 8; hops++) {
    if (current.kind === 'project') return current;
    current = current.parent_id ? byId.get(current.parent_id) : undefined;
  }
  return null;
}

const newestFirst = (a: BoardProject, b: BoardProject) => b.since.localeCompare(a.since);
const stamp = (r: BoardRow) => r.signed_at ?? r.sent_at ?? r.created_at;

/**
 * Sorts every project into one of four stages from the agreements alone, so nothing has to be moved by hand:
 * a project is Completed the moment its Completion Sign-off is signed. Void agreements and unsent drafts of a
 * sign-off are ignored.
 */
export function buildBoard(rows: BoardRow[]): Record<ProjectStage, BoardProject[]> {
  const live = rows.filter(r => r.status !== 'void');
  const byId = new Map(live.map(r => [r.id, r]));
  const board: Record<ProjectStage, BoardProject[]> = { 'awaiting-signoff': [], 'in-progress': [], 'agreement-out': [], completed: [] };

  const signoffsByProject = new Map<string, BoardRow[]>();
  const unlinked: BoardRow[] = [];
  for (const r of live) {
    if (r.kind !== 'completion' || r.status === 'draft') continue;
    const root = rootProject(r, byId);
    if (!root) { unlinked.push(r); continue; }
    signoffsByProject.set(root.id, [...(signoffsByProject.get(root.id) ?? []), r]);
  }

  for (const p of live.filter(r => r.kind === 'project')) {
    if (p.status !== 'signed') {
      board['agreement-out'].push({ key: p.id, stage: 'agreement-out', project: p, signoff: null, since: p.sent_at ?? p.created_at });
      continue;
    }
    const signoffs = signoffsByProject.get(p.id) ?? [];
    const signed = signoffs.filter(s => s.status === 'signed').sort((a, b) => stamp(b).localeCompare(stamp(a)))[0];
    const pending = signoffs.filter(s => s.status === 'sent').sort((a, b) => stamp(b).localeCompare(stamp(a)))[0];
    if (signed) board.completed.push({ key: p.id, stage: 'completed', project: p, signoff: signed, since: stamp(signed) });
    else if (pending) board['awaiting-signoff'].push({ key: p.id, stage: 'awaiting-signoff', project: p, signoff: pending, since: stamp(pending) });
    else board['in-progress'].push({ key: p.id, stage: 'in-progress', project: p, signoff: null, since: p.signed_at ?? p.created_at });
  }

  // Sign-offs made before this system existed (or never linked to an agreement) still show up, never vanish.
  for (const s of unlinked) {
    if (s.status === 'signed') board.completed.push({ key: s.id, stage: 'completed', project: null, signoff: s, since: stamp(s) });
    else if (s.status === 'sent') board['awaiting-signoff'].push({ key: s.id, stage: 'awaiting-signoff', project: null, signoff: s, since: stamp(s) });
  }

  for (const stage of STAGE_ORDER) board[stage].sort(newestFirst);
  return board;
}
