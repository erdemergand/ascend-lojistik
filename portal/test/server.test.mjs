import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createPortalServer } from '../server.mjs';

const credentials = { PORTAL_PREVIEW_ENABLED: 'true', PORTAL_PREVIEW_USER: 'reviewer', PORTAL_PREVIEW_PASSWORD: 'test-only-password-with-32-characters' };
const authorization = `Basic ${Buffer.from(`${credentials.PORTAL_PREVIEW_USER}:${credentials.PORTAL_PREVIEW_PASSWORD}`).toString('base64')}`;
async function start(t, env) {
  const server = await createPortalServer(env);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((done) => { server.close(done); server.closeAllConnections(); }));
  return `http://127.0.0.1:${server.address().port}`;
}
test('closed by default; health is available without exposing the prototype', async (t) => {
  const base = await start(t, {});
  assert.equal((await fetch(`${base}/healthz`)).status, 200);
  for (const path of ['/', '/01_NCTS_BRANDED_v15.html', '/ascend_logo_correct.png']) {
    assert.equal((await fetch(base + path, { headers: { authorization } })).status, 503);
  }
});
test('invalid preview credentials stop startup', async () => {
  for (const env of [{ PORTAL_PREVIEW_ENABLED: 'true' }, { ...credentials, PORTAL_PREVIEW_PASSWORD: 'short' }, { ...credentials, PORTAL_PREVIEW_USER: 'a:b' }]) {
    await assert.rejects(createPortalServer(env), /Preview requires/);
  }
});
test('every prototype asset requires server authentication, including direct module URLs', async (t) => {
  const base = await start(t, credentials);
  for (const path of ['/', '/index.html', '/01_NCTS_BRANDED_v15.html', '/02_LOJISTIK_PORTAL_BRANDED_v14.html', '/03_KULLANICI_YONETIMI.html', '/ascend_logo_correct.png']) {
    const denied = await fetch(base + path);
    assert.equal(denied.status, 401);
    assert.match(denied.headers.get('www-authenticate'), /Basic/);
    assert.equal((await fetch(base + path, { headers: { authorization: 'Basic wrong' } })).status, 401);
    const allowed = await fetch(base + path, { headers: { authorization } });
    assert.equal(allowed.status, 200);
    assert.equal(allowed.headers.get('cache-control'), 'no-store');
    assert.match(allowed.headers.get('x-robots-tag'), /noindex/);
    assert.ok((await allowed.arrayBuffer()).byteLength > 0);
  }
});
test('only allowlisted files are served; unknown write/API endpoints are rejected', async (t) => {
  const base = await start(t, credentials);
  for (const path of ['/.env', '/server.mjs', '/package.json', '/prototype/index.html', '/%2e%2e%2f.env', '/api/ncts/finance', '/api/export']) {
    assert.equal((await fetch(base + path, { headers: { authorization } })).status, 404);
  }
  assert.equal((await fetch(base, { method: 'POST', headers: { authorization } })).status, 405);
  const head = await fetch(base, { method: 'HEAD', headers: { authorization } });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
});
