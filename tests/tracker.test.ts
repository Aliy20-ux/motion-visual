import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TRACKER_STAGES, addDays, addWorkingDays, buildTracker, daysBetween, type TrackerRaw } from '../src/tracker';

const base: TrackerRaw = {
  projectName: 'Mon Ami website', businessName: 'Mon Ami', stage: 'Design', today: '2026-10-26', launchDate: null,
  contentReceivedOn: '2026-10-20', note: null, agreement: { status: 'signed', signedOn: '2026-10-19', signToken: null }, reviewToken: null,
};

test('dates: counting days and working days (Monday to Friday only)', () => {
  assert.equal(daysBetween('2026-10-20', '2026-10-26'), 6);
  assert.equal(addDays('2026-10-20', 14), '2026-11-03');
  assert.equal(addWorkingDays('2026-10-23', 2), '2026-10-27', 'a Friday + 2 working days is the Tuesday');
  assert.equal(addWorkingDays('2026-10-21', 2), '2026-10-23');
  assert.equal(addWorkingDays('2026-10-24', 1), '2026-10-26', 'a Saturday + 1 is the Monday');
  assert.equal(daysBetween('2026-03-28', '2026-03-30'), 2, 'the clocks changing does not shift the count');
});

test('day 0 is the later of the signed agreement and the content, and the day count follows', () => {
  const v = buildTracker(base);
  assert.equal(v.dayZero, '2026-10-20');
  assert.equal(v.day, 6);
  assert.equal(v.totalDays, 14);
  assert.equal(v.siteBy, '2026-11-03');
  assert.equal(v.firstDesignBy, '2026-10-22');
  assert.equal(v.phase, 'underway');
  assert.ok(Math.abs(v.progress - 6 / 14) < 1e-9);
  const later = buildTracker({ ...base, agreement: { status: 'signed', signedOn: '2026-10-23', signToken: null } });
  assert.equal(later.dayZero, '2026-10-23');
  assert.equal(later.day, 3);
});

test('the clock has not started until BOTH the agreement is signed and the content has arrived', () => {
  const noContent = buildTracker({ ...base, contentReceivedOn: null });
  assert.equal(noContent.phase, 'not-started'); assert.equal(noContent.day, null); assert.equal(noContent.siteBy, null);
  const unsigned = buildTracker({ ...base, agreement: { status: 'sent', signedOn: null, signToken: 'a'.repeat(48) } });
  assert.equal(unsigned.phase, 'not-started'); assert.equal(unsigned.day, null);
});

test('a project with no agreement on file starts from the content date alone', () => {
  const v = buildTracker({ ...base, agreement: null });
  assert.equal(v.dayZero, '2026-10-20'); assert.equal(v.day, 6);
});

test('day 0 shows as day 0 and never goes negative', () => {
  assert.equal(buildTracker({ ...base, today: '2026-10-20' }).day, 0);
  assert.equal(buildTracker({ ...base, today: '2026-10-18' }).day, 0);
});

test('what is waiting on the client: the agreement, the content, and feedback', () => {
  const sign = buildTracker({ ...base, contentReceivedOn: null, agreement: { status: 'sent', signedOn: null, signToken: 'b'.repeat(48) } });
  assert.deepEqual(sign.waiting.map(w => w.id), ['agreement', 'content']);
  assert.equal(sign.waiting[0].href, `/agreement/${'b'.repeat(48)}`);
  const expired = buildTracker({ ...base, agreement: { status: 'sent', signedOn: null, signToken: null } });
  assert.equal(expired.waiting[0].id, 'agreement-expired'); assert.equal(expired.waiting[0].href, undefined);
  assert.deepEqual(buildTracker({ ...base, stage: 'Client Review' }).waiting.map(w => w.id), ['design']);
  assert.deepEqual(buildTracker(base).waiting, [], 'nothing waiting when all is in');
  assert.deepEqual(buildTracker({ ...base, agreement: { status: 'draft', signedOn: null, signToken: null }, contentReceivedOn: '2026-10-20' }).waiting, [], 'an unsent draft is not the client\'s to action');
});

test('once the site is launching or live nothing is "waiting", and live shows complete', () => {
  assert.deepEqual(buildTracker({ ...base, stage: 'Launch', contentReceivedOn: null }).waiting, []);
  const live = buildTracker({ ...base, stage: 'Live', day: undefined } as never);
  assert.equal(live.phase, 'live'); assert.equal(live.progress, 1); assert.equal(live.pastTarget, false); assert.deepEqual(live.waiting, []);
});

test('past day 14 is flagged, never hidden', () => {
  const v = buildTracker({ ...base, today: '2026-11-10' });
  assert.equal(v.day, 21); assert.equal(v.pastTarget, true); assert.equal(v.progress, 1);
  assert.equal(buildTracker({ ...base, today: '2026-11-03' }).pastTarget, false, 'day 14 itself is still on time');
});

test('stages follow the project board and an unknown stage falls back to the first', () => {
  assert.deepEqual([...TRACKER_STAGES], ['Discovery', 'Design', 'Build', 'Client Review', 'Launch', 'Live']);
  assert.equal(buildTracker({ ...base, stage: 'Build' }).stageIndex, 2);
  assert.equal(buildTracker({ ...base, stage: 'Mystery' }).stageIndex, 0);
});
