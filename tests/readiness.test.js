import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createReadiness } from '../server/readiness.js';

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'readiness-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const bytes = Buffer.alloc(1024 * 1024 + 5, 77);
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  for (const [catalog, folder] of [['videos.catalog.json', 'videos'], ['maps.catalog.json', 'maps'], ['wiki.catalog.json', 'zim'], ['catalog.json', 'documents']]) {
    await mkdir(path.join(root, 'content', folder), { recursive: true });
    await writeFile(path.join(root, 'content', folder, 'sample.bin'), bytes);
    await writeFile(path.join(root, 'content', catalog), JSON.stringify([{ filename: 'sample.bin', bytes: bytes.length, sha256 }]));
  }
  await mkdir(path.join(root, 'runtime'));
  await writeFile(path.join(root, 'runtime/runtime.bin'), bytes);
  await writeFile(path.join(root, 'content/runtime.catalog.json'), JSON.stringify([{ archive: 'runtime/runtime.bin', sha256 }]));
  const wikiBase = 'content/wiki-reader/kiwix-js-4.4.0/dist';
  const wikiFiles = ['index.html', 'www/index.html', 'www/js/theme-init.js', 'www/js/init.js', 'www/js/bundle.js', 'www/js/libzim-wasm.js', 'www/js/libzim-wasm.wasm', 'www/js/xzdec-wasm.wasm', 'www/js/zstddec-wasm.wasm', 'www/css/bootstrap.min.css', 'www/css/app.css', 'www/css/transition.css'];
  for (const name of ['dist/index.html', 'dist/assets/app.js', 'server/index.js', 'data/document-index.json', ...wikiFiles.map(name => `${wikiBase}/${name}`)]) {
    await mkdir(path.dirname(path.join(root, name)), { recursive: true });
    await writeFile(path.join(root, name), 'fixture');
  }
  const model = Buffer.from('local-model');
  const config = Buffer.from('{}');
  const digest = data => createHash('sha256').update(data).digest('hex');
  await mkdir(path.join(root, 'models/blobs'), { recursive: true });
  for (const data of [model, config]) await writeFile(path.join(root, 'models/blobs', `sha256-${digest(data)}`), data);
  const manifest = JSON.stringify({ config: { digest: `sha256:${digest(config)}`, size: config.length }, layers: [{ mediaType: 'application/vnd.ollama.image.model', digest: `sha256:${digest(model)}`, size: model.length }] });
  const manifestFile = path.join(root, 'models/manifests-v2/ollama.com/library/test/model');
  await mkdir(path.dirname(manifestFile), { recursive: true });
  await writeFile(manifestFile, manifest);
  await writeFile(path.join(root, 'content/ai.catalog.json'), JSON.stringify({ model: 'test:model', digest: digest(manifest), bytes: model.length + config.length }));
  return { root, bytes, modelFile: path.join(root, 'models/blobs', `sha256-${digest(model)}`) };
}
async function finish(manager) {
  for (let tries = 0; tries < 1000; tries++) {
    const state = manager.snapshot();
    if (state.status !== 'running') return state;
    await new Promise(resolve => setTimeout(resolve, 5));
  }
  throw new Error('Readiness job timed out');
}
test('readiness runs only on demand, serializes jobs and streams deep checks', async t => {
  const { root, bytes } = await fixture(t);
  const manager = createReadiness(root);
  assert.equal(manager.snapshot().status, 'idle');
  const first = manager.start();
  assert.equal(first.mode, 'light');
  assert.equal(manager.start({ deep: true }).mode, 'light');
  first.results.push({ bogus: true });
  const light = await finish(manager);
  assert.equal(light.counts.failed, 0);
  assert.equal(light.progress.bytesRead, 0);
  assert.equal(light.results.some(row => row.bogus), false);
  // Same byte size passes light inspection but deep SHA finds corruption.
  await writeFile(path.join(root, 'content/videos/sample.bin'), Buffer.alloc(bytes.length, 78));
  manager.start({ deep: true });
  const deep = await finish(manager);
  assert.equal(deep.status, 'completed');
  assert.equal(deep.counts.failed, 1);
  assert.equal(deep.results.find(row => row.category === 'videos').message, 'checksum_mismatch');
  assert.ok(deep.progress.bytesRead >= bytes.length * 5);
  assert.ok(!JSON.stringify(deep).includes(root));
});
test('readiness refuses catalog traversal and file symlinks outside expected folder', async t => {
  const { root } = await fixture(t);
  await writeFile(path.join(root, 'content/videos.catalog.json'), JSON.stringify([{ filename: '../maps/sample.bin' }]));
  const manager = createReadiness(root);
  manager.start();
  assert.equal((await finish(manager)).results.find(row => row.category === 'videos').message, 'unsafe_path');
  await rm(path.join(root, 'content/videos/sample.bin'));
  try { await symlink(path.join(root, 'content/maps/sample.bin'), path.join(root, 'content/videos/sample.bin')); }
  catch (error) { if (error.code === 'EPERM') return t.diagnostic('Symlink check unavailable without Windows Developer Mode.'); throw error; }
  await writeFile(path.join(root, 'content/videos.catalog.json'), JSON.stringify([{ filename: 'sample.bin' }]));
  manager.start();
  assert.equal((await finish(manager)).results.find(row => row.category === 'videos').message, 'unsafe_path');
});
test('missing served wiki bundle and missing or corrupted model blobs cannot pass', async t => {
  const { root, modelFile } = await fixture(t);
  const bundle = path.join(root, 'content/wiki-reader/kiwix-js-4.4.0/dist/www/js/bundle.js');
  // An intact source tree cannot substitute for the actually served dist tree.
  await mkdir(path.join(root, 'content/wiki-reader/kiwix-js-4.4.0/www'), { recursive: true });
  await writeFile(path.join(root, 'content/wiki-reader/kiwix-js-4.4.0/www/index.html'), 'source remains');
  await rm(bundle);
  await rm(modelFile);
  const manager = createReadiness(root);
  manager.start();
  const missing = await finish(manager);
  assert.equal(missing.results.find(row => row.category === 'wiki-reader' && row.id === 'bundle.js').status, 'failed');
  assert.ok(missing.results.some(row => row.category === 'model' && row.status === 'failed'));
  await writeFile(bundle, 'restored');
  await writeFile(modelFile, 'wrong-model'); // Same length as local-model.
  manager.start({ deep: true });
  const corrupt = await finish(manager);
  assert.ok(corrupt.results.some(row => row.category === 'model' && row.message === 'checksum_mismatch'));
});
