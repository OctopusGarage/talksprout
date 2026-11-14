import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getOfflineStatus } from '../src/offline-readiness';

test('registration success alone is not offline readiness', async () => {
  const storage = { keys: async () => [] } as unknown as CacheStorage;
  assert.equal(await getOfflineStatus(storage, 'https://app.test/a/', true), 'installing');
  assert.equal(await getOfflineStatus(storage, 'https://app.test/a/', false), 'unknown');
});
test('only a complete cache for this scope proves readiness', async () => {
  const scope = 'https://app.test/a/';
  let complete = true;
  const cache = { match: async (url: string) => url.endsWith('__offline_ready__') ? new Response(JSON.stringify([scope, scope + 'app.js'])) : complete ? new Response('cached') : undefined };
  const storage = { keys: async () => ['talksprout-scope-' + encodeURIComponent(scope) + '-v1'], open: async () => cache } as unknown as CacheStorage;
  assert.equal(await getOfflineStatus(storage, scope, false), 'ready');
  complete = false;
  assert.equal(await getOfflineStatus(storage, scope, false), 'unknown');
  assert.equal(await getOfflineStatus(storage, 'https://app.test/b/', false), 'unknown');
});
test('denied cache storage reports unavailable', async () => {
  const storage = { keys: async () => { throw Error('denied'); } } as unknown as CacheStorage;
  assert.equal(await getOfflineStatus(storage, 'https://app.test/', false), 'unavailable');
});
