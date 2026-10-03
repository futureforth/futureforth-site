// Copies Squarespace-hosted images into this repository so the site no longer depends on
// Squarespace's servers. Reads scripts/image-urls.txt, saves each image under
// public/images/sq/, and records where each one went in src/data/image-map.json.
// Safe to re-run: images already downloaded are skipped.
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';

const LIST = 'scripts/image-urls.txt';
const OUT_DIR = 'public/images/sq';
const MAP = 'src/data/image-map.json';
const WIDTH = '1500w'; // Squarespace resizes on request; 1500px wide is plenty for this site

const urls = (await readFile(LIST, 'utf8')).split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
let map = {};
try { map = JSON.parse(await readFile(MAP, 'utf8')); } catch {}
await mkdir(OUT_DIR, { recursive: true });

const exists = (p) => access(p).then(() => true, () => false);
const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/gif': '.gif', 'image/webp': '.webp', 'image/svg+xml': '.svg' };
const failed = [];
let fetched = 0;

for (const url of urls) {
  if (map[url] && (await exists(path.join('public', map[url])))) continue;
  try {
    const res = await fetch(`${url}?format=${WIDTH}`, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const type = (res.headers.get('content-type') ?? '').split(';')[0];
    const ext = EXT[type];
    if (!ext) throw new Error(`unexpected content type "${type}"`);
    const hash = createHash('sha1').update(url).digest('hex').slice(0, 10);
    const stem = decodeURIComponent(url.split('/').pop()).replace(/\.[A-Za-z0-9]+$/, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 40) || 'image';
    const rel = `/images/sq/${hash}-${stem}${ext}`;
    await writeFile(path.join('public', rel), Buffer.from(await res.arrayBuffer()));
    map[url] = rel;
    fetched += 1;
  } catch (err) {
    failed.push(`${url} (${err.message})`);
  }
}

const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)));
await writeFile(MAP, JSON.stringify(sorted, null, 1) + '\n');
console.log(`${urls.length} listed, ${fetched} downloaded this run, ${Object.keys(map).length} in the map, ${failed.length} failed`);
for (const f of failed) console.log('FAILED', f);
