// Squarespace-hosted images are copied into public/images/sq/ by scripts/fetch-images.mjs,
// which records each copy in src/data/image-map.json. These helpers swap a Squarespace URL
// for its local copy, and leave it untouched if it has not been copied yet.
import map from '../data/image-map.json' with { type: 'json' };

const clean = (url) => url.replace(/&amp;/g, '&').split('?')[0];

export function img(url) {
  return map[clean(url)] ?? url;
}

export function localize(html) {
  return html.replace(/https?:\/\/images\.squarespace-cdn\.com\/[^\s"'<>)]+/g, (url) => map[clean(url)] ?? url);
}
