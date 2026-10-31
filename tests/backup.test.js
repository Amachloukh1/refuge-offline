import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { backup, restore, verify } from '../scripts/backup-offline.mjs';

async function fixture(t) {
  const base = await mkdtemp(path.join(os.tmpdir(), 'offline-backup-'));
  t.after(() => rm(base, { recursive: true, force: true }));
  const source = path.join(base, 'source');
  await mkdir(source);
  for (const [name, value] of [['.env', 'PRIVATE=local'], ['data/history.json', 'private history'], ['node_modules/package/index.js', 'offline dependency'], ['node_modules/tmp/index.js', 'required tmp dependency'], ['models/model.bin', Buffer.alloc(1024 * 1024 + 3, 42)], ['runtime/old.log', 'excluded log'], ['.git/config', 'excluded repository']]) {
    await mkdir(path.dirname(path.join(source, name)), { recursive: true });
    await writeFile(path.join(source, name), value);
  }
  return { base, source, destination: path.join(base, 'backup') };
}
test('full offline backup and restore retain private data, dependencies and streamed bytes', async t => {
  const { base, source, destination } = await fixture(t);
  await backup({ source, destination, stopped: true });
  const manifest = await verify(destination);
  assert.equal(manifest.containsPrivateData, true);
  assert.ok(manifest.entries.some(entry => entry.path === '.env'));
  assert.ok(manifest.entries.some(entry => entry.path === 'node_modules/package/index.js'));
  assert.ok(manifest.entries.some(entry => entry.path === 'node_modules/tmp/index.js'));
  assert.ok(!manifest.entries.some(entry => entry.path.endsWith('.log') || entry.path.startsWith('.git')));
  const target = path.join(base, 'restored');
  await restore({ source: destination, destination: target });
  assert.equal(await readFile(path.join(target, '.env'), 'utf8'), 'PRIVATE=local');
  await verify(target);
  const secondBackup = path.join(base, 'second-backup');
  await backup({ source: target, destination: secondBackup, stopped: true });
  const secondManifest = await verify(secondBackup);
  assert.ok(!secondManifest.entries.some(entry => entry.path === 'backup-manifest.json'));
  assert.equal(await readFile(path.join(secondBackup, 'node_modules/tmp/index.js'), 'utf8'), 'required tmp dependency');
  await assert.rejects(backup({ source, destination, stopped: true }), /already exists/);
  await assert.rejects(restore({ source: destination, destination: target }), /already exists/);
});
test('corruption, traversal, overwrite and nested targets are refused', async t => {
  const { base, source, destination } = await fixture(t);
  await assert.rejects(backup({ source, destination }), /--stopped/);
  await assert.rejects(backup({ source, destination: path.join(source, 'copy'), stopped: true }), /outside/);
  await assert.rejects(backup({ source, destination: 'relative', stopped: true }), /absolute/);
  await backup({ source, destination, stopped: true });
  await writeFile(path.join(destination, '.env'), 'PRIVATE=other');
  await assert.rejects(verify(destination), /Checksum mismatch/);
  const target = path.join(base, 'rejected');
  await assert.rejects(restore({ source: destination, destination: target }), /Checksum mismatch/);
  const manifestFile = path.join(destination, 'backup-manifest.json');
  const manifest = JSON.parse(await readFile(manifestFile));
  manifest.entries[0].path = '../escape';
  await writeFile(manifestFile, JSON.stringify(manifest));
  await assert.rejects(verify(destination), /Unsafe manifest path/);
});
test('escaping symlinks fail explicitly; supported internal links survive restore', async t => {
  const { base, source, destination } = await fixture(t);
  const link = path.join(source, 'model-link');
  try { await symlink('models/model.bin', link, 'file'); }
  catch (error) { if (error.code === 'EPERM') return t.skip('Windows symlink permission unavailable'); throw error; }
  await backup({ source, destination, stopped: true });
  await restore({ source: destination, destination: path.join(base, 'restored') });
  await rm(link);
  await writeFile(path.join(base, 'external'), 'outside');
  await symlink('../external', link, 'file');
  await assert.rejects(backup({ source, destination: path.join(base, 'unsafe'), stopped: true }), /escapes source/);
});
