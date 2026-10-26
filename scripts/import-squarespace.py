#!/usr/bin/env python3
"""One-time import: Squarespace WordPress-format export -> src/data/blog.json and podcast.json.

Usage: python3 scripts/import-squarespace.py path/to/export.xml
The export itself is not kept in this repository (it contains drafts and disabled pages).
"""
import html, json, re, sys
import xml.etree.ElementTree as ET

NS = {'wp': 'http://wordpress.org/export/1.2/', 'content': 'http://purl.org/rss/1.0/modules/content/',
      'excerpt': 'http://wordpress.org/export/1.2/excerpt/'}

def path_of(link):
    return re.sub(r'^https?://[^/]+', '', link or '').rstrip('/')

def clean(body):
    b = body
    b = re.sub(r'<(script|style)\b.*?</\1>', '', b, flags=re.S | re.I)
    b = re.sub(r'\s(class|style|data-[\w-]+|id)="[^"]*"', '', b)
    b = re.sub(r'</?(div|span)\b[^>]*>', '', b)                     # layout wrappers only
    b = re.sub(r'href="https?://(www\.)?futureforth\.com/?', 'href="/', b)
    b = re.sub(r'(<img[^>]+src="[^"?]+)\?format=original"', r'\1?format=1500w"', b)
    b = re.sub(r'<img(?![^>]*\bloading=)', '<img loading="lazy"', b)
    def fig(m):
        inner = m.group(1)
        img = re.search(r'<img[^>]*>', inner)
        cap = re.sub(r'<[^>]+>', '', inner).strip()
        if not img:
            return inner
        return '<figure>' + img.group(0) + (f'<figcaption>{cap}</figcaption>' if cap else '') + '</figure>'
    b = re.sub(r'\[caption[^\]]*\](.*?)\[/caption\]', fig, b, flags=re.S)
    b = re.sub(r'<(/?)h1\b', r'<\1h2', b)
    b = re.sub(r'<p>\s*(&nbsp;)?\s*</p>', '', b)
    b = re.sub(r'\n\s*\n+', '\n', b).strip()
    return b

def text_of(b):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', b))).strip()

def main(src):
    items = ET.parse(src).getroot().find('channel').findall('item')
    out = {'nice-blog': [], 'nice-podcast': []}
    for it in items:
        g = lambda p: it.findtext(p, namespaces=NS) or ''
        if g('wp:post_type') != 'post' or g('wp:status') != 'publish':
            continue
        p = path_of(g('link'))
        m = re.match(r'^/(nice-blog|nice-podcast)/([^/]+)$', p)
        if not m:
            continue
        body = clean(g('content:encoded'))
        txt = text_of(body)
        first_img = re.search(r'<img[^>]+src="([^"]+)"', body)
        out[m.group(1)].append({
            'slug': m.group(2),
            'title': html.unescape(g('title')).strip(),
            'date': g('wp:post_date')[:10],
            'excerpt': (txt[:157].rsplit(' ', 1)[0] + '…') if len(txt) > 160 else txt,
            'image': first_img.group(1) if first_img else None,
            'tags': sorted({c.text for c in it.findall('category') if c.text}),
            'html': body,
        })
    for k, name in (('nice-blog', 'blog'), ('nice-podcast', 'podcast')):
        rows = sorted(out[k], key=lambda r: r['date'], reverse=True)
        with open(f'src/data/{name}.json', 'w', encoding='utf-8') as f:
            json.dump(rows, f, ensure_ascii=False, indent=1)
        print(name, len(rows), 'items', rows[0]['date'], '..', rows[-1]['date'])

if __name__ == '__main__':
    main(sys.argv[1])
