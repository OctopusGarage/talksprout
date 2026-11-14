import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createOfflineCheck } from '../src/offline-check';
import type { OfflineStatus } from '../src/offline-readiness';
const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
function setup(read: () => Promise<OfflineStatus> = async () => 'unknown') {
  let visible = true;
  const timers = new Map<number, { callback: () => void; delay: number }>();
  let id = 0;
  let reads = 0;
  const statuses: OfflineStatus[] = [];
  const checker = createOfflineCheck({
    read: () => { reads++; return read(); },
    publish: status => statuses.push(status),
    visible: () => visible,
    schedule: (callback, delay) => { timers.set(++id, { callback, delay }); return id; },
    cancel: handle => { timers.delete(handle); },
  });
  return { checker, timers, statuses, reads: () => reads, hide: () => { visible = false; checker.suspend(); }, show: () => { visible = true; checker.resume(); }, tick: async () => {
    const next = timers.entries().next().value;
    assert.ok(next);
    timers.delete(next[0]); next[1].callback(); await flush();
  } };
}
test('unknown readiness gets five backoff retries and repeated resume does not reset the burst', async () => {
  const s = setup(); s.checker.resume(); await flush();
  for (const delay of [2000, 4000, 8000, 16000, 30000]) {
    s.checker.resume();
    assert.equal([...s.timers.values()][0]?.delay, delay);
    await s.tick();
  }
  assert.equal(s.reads(), 6); assert.equal(s.timers.size, 0);
  s.checker.resume(); await flush(); assert.equal(s.reads(), 7);
});
test('hidden checks pause and foreground starts a new bounded burst', async () => {
  const s = setup(async () => 'installing'); s.checker.resume(); await flush(); s.hide();
  assert.equal(s.timers.size, 0); s.checker.resume(); await flush(); assert.equal(s.reads(), 1);
  s.show(); await flush(); assert.equal(s.reads(), 2); assert.equal([...s.timers.values()][0]?.delay, 2000);
});
test('ready and unavailable stop retries', async () => {
  for (const status of ['ready', 'unavailable'] as const) {
    const s = setup(async () => status); s.checker.resume(); await flush();
    assert.deepEqual(s.statuses, [status]); assert.equal(s.timers.size, 0);
  }
});
test('lifecycle restart discards stale results and serializes disk reads', async () => {
  const resolves: ((s: OfflineStatus) => void)[] = [];
  const s = setup(() => new Promise(resolve => resolves.push(resolve)));
  s.checker.resume(); s.checker.restart(); assert.equal(s.reads(), 1);
  resolves[0]!('ready'); await flush(); assert.deepEqual(s.statuses, []); assert.equal(s.reads(), 2);
  resolves[1]!('installing'); await flush(); assert.deepEqual(s.statuses, ['installing']);
});
test('hidden or disposed in-flight reads cannot publish or schedule', async () => {
  for (const dispose of [false, true]) {
    let resolve!: (s: OfflineStatus) => void;
    const s = setup(() => new Promise(r => { resolve = r; })); s.checker.resume();
    if (dispose) s.checker.dispose(); else s.hide();
    resolve('ready'); await flush(); assert.deepEqual(s.statuses, []); assert.equal(s.timers.size, 0);
    if (dispose) { s.checker.restart(); await flush(); assert.equal(s.reads(), 1); }
  }
});
test('foreground waits for hidden in-flight work before starting fresh evidence', async () => {
  const resolves: ((s: OfflineStatus) => void)[] = [];
  const s = setup(() => new Promise(resolve => resolves.push(resolve)));
  s.checker.resume(); s.hide(); s.show(); assert.equal(s.reads(), 1);
  resolves[0]!('ready'); await flush(); assert.deepEqual(s.statuses, []); assert.equal(s.reads(), 2);
  resolves[1]!('ready'); await flush(); assert.deepEqual(s.statuses, ['ready']); assert.equal(s.timers.size, 0);
});
test('failed cache read reports unavailable without unhandled rejection or retries', async () => {
  const s = setup(async () => { throw Error('denied'); }); s.checker.resume(); await flush();
  assert.deepEqual(s.statuses, ['unavailable']); assert.equal(s.timers.size, 0);
});
