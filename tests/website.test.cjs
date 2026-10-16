const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { collectAssets } = require('../scripts/asset-graph.cjs');
const { createServer } = require('../scripts/serve.cjs');
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
let server, base;
before(async () => {
  execFileSync(process.execPath, ['scripts/sync-app-preview.cjs'], { cwd: root });
  execFileSync(process.execPath, ['scripts/build.cjs'], { cwd: root });
  server = createServer(dist);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server && new Promise(resolve => server.close(resolve)));

test('every runtime dependency resolves and is copied without changing bytes', async () => {
  const files = collectAssets(root);
  assert.ok(files.length > 100);
  assert.deepEqual(collectAssets(dist), files);
  for (const file of files) {
    assert.deepEqual(fs.readFileSync(path.join(dist, file)), fs.readFileSync(path.join(root, file)), file);
    const response = await fetch(`${base}/${file}`, { method: 'HEAD' });
    assert.equal(response.status, 200, file);
  }
  for (const file of ['README.md', 'package.json', 'app-preview/templates', 'docs', 'scripts', 'qa', 'linear_homepage.html']) {
    assert.equal(fs.existsSync(path.join(dist, file)), false, file);
  }
});

test('homepage, preview and video are served with their expected content types', async () => {
  assert.match(await (await fetch(base)).text(), /Kayak —/);
  const preview = await fetch(`${base}/app-preview/`);
  assert.equal(preview.status, 200);
  const html = await preview.text();
  assert.match(html, /connect-src 'none'/);
  const embedded = html.match(/<script type="application\/json" id="preview-pages">([\s\S]*?)<\/script>/);
  assert.deepEqual(Object.keys(JSON.parse(embedded[1])), ['task', 'schedule', 'extensions', 'new-task']);
  assert.equal((await fetch(`${base}/assets/video/hero-office-loop.mp4`, { method: 'HEAD' })).headers.get('content-type'), 'video/mp4');
});

test('server does not expose repository files or accept malformed/write requests', async () => {
  for (const file of ['/package.json', '/.git/config', '/scripts/build.cjs', '/missing.html']) {
    assert.ok([403, 404].includes((await fetch(base + file)).status), file);
  }
  assert.equal((await fetch(base + '/assets%2f..%2fpackage.json')).status, 403);
  assert.equal((await fetch(base + '/%ZZ')).status, 400);
  assert.equal((await fetch(base, { method: 'POST' })).status, 405);
});
