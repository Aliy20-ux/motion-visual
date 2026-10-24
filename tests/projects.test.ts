import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildBoard, type BoardRow } from '../src/pages/studio/projects';

let n = 0;
const row = (over: Partial<BoardRow>): BoardRow => ({
  id: `id-${++n}`, reference: `MV-${n}`, kind: 'project', parent_id: null, title: `Project ${n}`,
  client_id: null, client_name: 'Jane Smith', client_business: 'Mon Ami Edinburgh', client_email: 'jane@example.com',
  client_type: 'business', status: 'signed', created_at: '2026-10-01T09:00:00Z', sent_at: '2026-10-01T10:00:00Z',
  first_viewed_at: null, signed_at: '2026-10-02T09:00:00Z', signer_name: 'Jane Smith', expires_at: null, total: 160000, ...over,
});
const ids = (list: { project: BoardRow | null; signoff: BoardRow | null }[]) => list.map(i => (i.project ?? i.signoff)!.id);

test('a signed project with no sign-off is in progress', () => {
  const p = row({ id: 'p' });
  const b = buildBoard([p]);
  assert.deepEqual(ids(b['in-progress']), ['p']);
  assert.equal(b.completed.length, 0);
});

test('a project moves to Completed the moment its sign-off is signed', () => {
  const p = row({ id: 'p' });
  const sent = row({ id: 's', kind: 'completion', parent_id: 'p', status: 'sent', signed_at: null, signer_name: null });
  assert.deepEqual(ids(buildBoard([p, sent])['awaiting-signoff']), ['p']);

  const signed = { ...sent, status: 'signed', signed_at: '2026-10-24T10:39:00Z', signer_name: 'Jane Smith' };
  const b = buildBoard([p, signed]);
  assert.deepEqual(ids(b.completed), ['p']);
  assert.equal(b.completed[0].signoff?.id, 's');
  assert.equal(b['awaiting-signoff'].length + b['in-progress'].length, 0);
});

test('an unsigned or unsent agreement is not yet a live project', () => {
  const b = buildBoard([row({ id: 'd', status: 'draft', signed_at: null, sent_at: null }), row({ id: 'x', status: 'sent', signed_at: null })]);
  assert.deepEqual(ids(b['agreement-out']).sort(), ['d', 'x']);
});

test('void agreements and unsent sign-off drafts are ignored', () => {
  const p = row({ id: 'p' });
  const draft = row({ id: 'sd', kind: 'completion', parent_id: 'p', status: 'draft', signed_at: null });
  const voided = row({ id: 'sv', kind: 'completion', parent_id: 'p', status: 'void' });
  const b = buildBoard([p, draft, voided, row({ id: 'vp', status: 'void' })]);
  assert.deepEqual(ids(b['in-progress']), ['p']);
  assert.equal(b.completed.length + b['agreement-out'].length, 0);
});

test('a sign-off on a change request still completes the project behind it', () => {
  const p = row({ id: 'p' });
  const change = row({ id: 'c', kind: 'change', parent_id: 'p' });
  const signed = row({ id: 's', kind: 'completion', parent_id: 'c', status: 'signed', signed_at: '2026-10-24T10:00:00Z' });
  assert.deepEqual(ids(buildBoard([p, change, signed]).completed), ['p']);
});

test('a signed sign-off with no linked agreement still appears under Completed', () => {
  const orphan = row({ id: 'o', kind: 'completion', parent_id: null, status: 'signed', signed_at: '2026-10-20T10:00:00Z' });
  const b = buildBoard([orphan]);
  assert.equal(b.completed.length, 1);
  assert.equal(b.completed[0].project, null);
});

test('newest activity is listed first, and each project appears once', () => {
  const rows = [
    row({ id: 'p1' }), row({ id: 'p2' }),
    row({ id: 's1', kind: 'completion', parent_id: 'p1', status: 'signed', signed_at: '2026-10-10T10:00:00Z' }),
    row({ id: 's2', kind: 'completion', parent_id: 'p2', status: 'signed', signed_at: '2026-10-20T10:00:00Z' }),
    row({ id: 's2b', kind: 'completion', parent_id: 'p2', status: 'signed', signed_at: '2026-10-21T10:00:00Z' }),
  ];
  const b = buildBoard(rows);
  assert.deepEqual(ids(b.completed), ['p2', 'p1']);
  assert.equal(b.completed[0].signoff?.id, 's2b');
});
