#!/usr/bin/env python3
"""Checks the built site (dist/) against public/_redirects and for broken internal links.
Run after `npm run build`. Exits non-zero if anything is wrong."""
import os, re, sys
built = set()
for root, _, files in os.walk('dist'):
    for f in files:
        p = os.path.join(root, f)[4:]
        built.add((p[:-11] or '/') if f == 'index.html' else p)
built = {b.rstrip('/') or '/' for b in built}
rules = [l.split() for l in open('public/_redirects') if l.strip() and not l.startswith('#')]
srcs = [r[0] for r in rules]
static = [s for s in srcs if '*' not in s]
problems = {
    'duplicate sources': sorted({s for s in srcs if srcs.count(s) > 1}),
    'source is a real page': [s for s in srcs if s in built],
    'real page hidden by a pattern': [b for b in built for s in srcs if s.endswith('/*') and b.startswith(s[:-1])],
    'chained redirects': [r[:2] for r in rules if r[1].split('#')[0] in set(srcs)],
    'redirect target missing': sorted({r[1] for r in rules if r[1].startswith('/') and r[1].split('#')[0] not in built}),
}
broken, images = {}, set()
for root, _, files in os.walk('dist'):
    for f in files:
        if f.endswith('.html'):
            h = open(os.path.join(root, f), encoding='utf-8').read()
            for l in set(re.findall(r'href="(/[^"#?]*)', h)):
                k = l.rstrip('/') or '/'
                covered = any(x.endswith('/*') and k.startswith(x[:-1]) for x in srcs)
                if k not in built and k not in srcs and not covered:
                    broken[k] = broken.get(k, 0) + 1
            images |= set(re.findall(r'src="(/[^"]+\.(?:png|jpe?g|gif|svg|webp))"', h))
problems['broken internal links'] = broken
problems['missing local images'] = sorted(i for i in images if not os.path.exists('dist' + i))
# Code-block pages must not pick up site styles through shared class names.
css = open('src/styles/global.css', encoding='utf-8').read()
reset = re.search(r'\[id\^="ff-"\] :is\(([^)]*)\)', css)
reset_classes = {c.strip().lstrip('.') for c in reset.group(1).split(',')} if reset else set()
site_classes = set(re.findall(r'(?m)^\.([A-Za-z][\w-]*)', css))
leaks = {}
for f in sorted(os.listdir('src/tools')):
    html = open(os.path.join('src/tools', f), encoding='utf-8').read()
    if not re.search(r'id="ff-', html):
        continue
    used = {c for group in re.findall(r'class="([^"]+)"', html) for c in group.split()}
    clash = sorted((used & site_classes) - reset_classes)
    if clash:
        leaks[f] = clash
problems['site styles leaking into code-block pages'] = leaks
print(f'{len(built)} built files, {len(rules)} redirects ({len(static)} static, {len(srcs) - len(static)} patterns)')
bad = {k: v for k, v in problems.items() if v}
for k, v in bad.items():
    print(f'PROBLEM - {k}: {v}')
print('OK' if not bad else f'{len(bad)} problem type(s)')
sys.exit(1 if bad else 0)
