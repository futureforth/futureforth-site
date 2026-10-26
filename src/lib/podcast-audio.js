// Maps Nice Podcast episodes to their audio files.
// At build time this reads the Simplecast feed; if the feed can't be reached it
// falls back to the known links in src/data/podcast-audio.json so the build never fails.
import seed from '../data/podcast-audio.json' with { type: 'json' };

export const FEED_URL = 'https://feeds.simplecast.com/Ue6zZsh3';

const decode = (s) =>
  s.replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').trim();

export function parseFeed(xml) {
  const items = [];
  for (const block of xml.match(/<item\b[\s\S]*?<\/item>/g) ?? []) {
    const title = decode(block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '');
    const url = decode(block.match(/<enclosure\b[^>]*\burl="([^"]+)"/)?.[1] ?? '').split('?')[0];
    const number = title.match(/^#?\s*(?:NICE)?\s*(\d+)\b/i)?.[1];
    if (url && number) items.push({ number, title, url });
  }
  return items;
}

let cache;
function feedItems() {
  // Cache the promise, not the result, so parallel page builds share one request.
  cache ??= (async () => {
    try {
      const res = await fetch(FEED_URL, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const items = parseFeed(await res.text());
      console.log(`[podcast] read ${items.length} episodes from the feed`);
      return items;
    } catch (err) {
      console.warn(`[podcast] feed unavailable (${err.message}); using saved audio links only`);
      return [];
    }
  })();
  return cache;
}

// The episode number comes from the title ("NICE26 - ..."), not the URL: one episode's
// URL says nice25 although it is episode 26.
export function episodeNumber(episode) {
  return (episode.title.match(/^\s*NICE\s*(\d+)/i) ?? episode.slug.match(/^nice(\d+)-/))?.[1] ?? null;
}

export function pickAudio(episode, items, fallback = seed) {
  const number = episodeNumber(episode);
  if (!number) return null;
  const matches = items.filter((i) => i.number === number);
  if (matches.length === 1) return matches[0].url;
  if (matches.length > 1) {
    // Two feed items share a number: pick the one whose title mentions the guest in the URL.
    const words = episode.slug.replace(/^nice\d+-/, '').split('-').filter((w) => w.length > 2);
    const hit = matches.find((i) => words.some((w) => i.title.toLowerCase().includes(w)));
    return hit?.url ?? null;
  }
  return fallback[number] ?? null;
}

export async function audioFor(episode) {
  return pickAudio(episode, await feedItems());
}
