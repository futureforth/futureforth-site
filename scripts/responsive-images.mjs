// Runs after `astro build`. For every local image used in the built pages it creates smaller
// WebP copies, then rewrites each <img> so phones download a small file and big screens a
// large one. It also adds width/height (so the page does not jump while loading) and makes
// images load lazily. Social share images in <meta> tags are left untouched.
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const DIST = 'dist';
const OUT = 'images/opt';
const WIDTHS = [160, 320, 640, 960, 1280];
const DEFAULT_SIZES = 'auto, (max-width: 760px) 100vw, 760px';

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

const htmlFiles = (await walk(DIST)).filter((f) => f.endsWith('.html'));
const pages = new Map();
const wanted = new Set();
const IMG = /<img\b[^>]*>/g;
const srcOf = (tag) => tag.match(/\ssrc="(\/images\/[^"]+\.(?:webp|jpe?g|png))"/i)?.[1];

for (const f of htmlFiles) {
  const html = await readFile(f, 'utf8');
  pages.set(f, html);
  for (const tag of html.match(IMG) ?? []) {
    const src = srcOf(tag);
    if (src && !src.startsWith(`/${OUT}/`)) wanted.add(src);
  }
}

await mkdir(path.join(DIST, OUT), { recursive: true });
const info = new Map();
let made = 0;
await Promise.all(
  [...wanted].map(async (src) => {
    const file = path.join(DIST, decodeURIComponent(src));
    try {
      const meta = await sharp(file).metadata();
      const stem = path.basename(src).replace(/\.[^.]+$/, '');
      const variants = [];
      for (const w of WIDTHS.filter((w) => w < meta.width)) {
        const rel = `/${OUT}/${stem}-${w}.webp`;
        await sharp(file).resize({ width: w }).webp({ quality: 78 }).toFile(path.join(DIST, rel));
        variants.push({ w, rel });
        made += 1;
      }
      info.set(src, { width: meta.width, height: meta.height, variants });
    } catch (err) {
      console.warn(`[images] skipped ${src}: ${err.message}`);
    }
  })
);

let rewritten = 0;
for (const [f, html] of pages) {
  const next = html.replace(IMG, (tag) => {
    const src = srcOf(tag);
    const meta = src && info.get(src);
    if (!meta) return tag;
    const has = (name) => new RegExp(`\\s${name}=`).test(tag);
    let extra = '';
    if (meta.variants.length && !has('srcset')) {
      const set = [...meta.variants.map((v) => `${v.rel} ${v.w}w`), `${src} ${meta.width}w`].join(', ');
      extra += ` srcset="${set}"`;
      if (!has('sizes')) extra += ` sizes="${DEFAULT_SIZES}"`;
    }
    if (!has('width') && !has('height')) extra += ` width="${meta.width}" height="${meta.height}"`;
    if (!has('loading')) extra += ' loading="lazy"';
    if (!has('decoding')) extra += ' decoding="async"';
    if (!extra) return tag;
    rewritten += 1;
    return tag.replace(/\s*\/?>$/, `${extra}>`);
  });
  if (next !== html) await writeFile(f, next);
}
console.log(`[images] ${wanted.size} images, ${made} smaller copies made, ${rewritten} <img> tags updated`);
