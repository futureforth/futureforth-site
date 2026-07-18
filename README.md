# Futureforth Website — Phase 1 (Astro Rebuild)

This is a self-hosted, modern, fully responsive replacement for the Futureforth Squarespace site,
built with [Astro](https://astro.build). It ships zero JavaScript by default (a tiny bit of vanilla JS
runs the mobile nav menu), which is ideal for SEO and page speed. It deploys free on Netlify, Vercel,
or Cloudflare Pages.

## What was built (Phase 1 — done)

All core marketing pages, faithfully ported from the live futureforth.com content, **at their exact
original URLs** (no redirects needed when you cut over DNS):

- `/` — Home
- `/workshops`
- `/corporate-improv-training-in-nashville`
- `/grow-your-business-with-ai`
- `/dave-delaney-coaching`
- `/personal-coaching`
- `/communication-presentations`
- `/book-dave-delaney`
- `/nice-method-presentations`
- `/contact`
- `/virtual-testimonials`
- `/freetools`
- `/about` (includes a `#dave` anchor, so `/about#dave` still works)
- `/10x`
- `/for-conference-planners`
- `/new-business-networking`
- `/presentation-testimonials-1`
- `/privacy-policy`
- `/affiliate`

Every page has a unique `<title>` and meta description (reused from the live Squarespace page where
available), a self-referencing canonical URL, Open Graph + Twitter Card tags, semantic HTML with one
`<h1>` per page, and descriptive `alt` text on every image. JSON-LD structured data (ProfessionalService
+ Person schema for Dave Delaney) is on the homepage and `/about`. An XML sitemap is generated
automatically at build time via `@astrojs/sitemap`, and `public/robots.txt` allows all crawlers and
points to it.

**Note on 3 duplicate-content URL groups:** the live Squarespace site actually 301-redirects
`/communication-presentations` and `/nice-method-presentations` to `/book-dave-delaney`, and
`/personal-coaching` to `/dave-delaney-coaching` — i.e. Squarespace already treats these as one page
under one URL. Per your brief ("every page keeps its exact URL, no redirects"), this rebuild keeps **all
of those URLs live as real pages**, sharing the same real copy via an Astro partial
(`src/components/PresentationsContent.astro` and `src/components/CoachingContent.astro`) so there's only
one place to edit the content. Each page is self-canonical. If you'd rather match Squarespace's original
redirect behavior for cleaner SEO (avoiding any near-duplicate-content signal), that's a 10-minute change
— just turn the "extra" pages into redirects in `astro.config.mjs` — happy to do that in a follow-up pass
if you prefer it.

## Futureforth as a parent-company hub

Futureforth is now positioned as the parent brand over three destinations, and the site is built
to reflect that:

1. **Dave Delaney — Keynote Speaker** (`https://www.davedelaney.me`) — Dave's own live site for his
   keynote speaking business. Not part of this repo; linked out to.
2. **Wise Squirrels — ADHD Podcast** (`https://wisesquirrels.com`) — the podcast's own live site, a
   community/resource hub for late-diagnosed adults with ADHD. Not part of this repo; linked out to.
3. **Futureforth's own coaching, workshops, and consulting** — lives directly on this site
   (`/workshops`, `/dave-delaney-coaching`, `/personal-coaching`, `/communication-presentations`,
   `/10x`, `/for-conference-planners`, `/new-business-networking`,
   `/corporate-improv-training-in-nashville`, `/grow-your-business-with-ai`, etc.).

The homepage (`src/pages/index.astro`) now leads with a **"The Futureforth Family"** hub section
right after the hero (`src/components/BrandHub.astro`), with three cards linking to all three
destinations — the two sibling sites open in a new tab with a visible `↗` external-link indicator.
The same three links also appear as a persistent "Our Family of Brands" cluster in the primary nav's
**More** dropdown (`src/components/Nav.astro`) and as a footer line, "Part of the Futureforth family:
Dave Delaney (Speaker) · Wise Squirrels (Podcast)" (`src/components/Footer.astro`).

**The blog has been removed, not deferred.** The placeholder `/nice-blog` section (3 fake posts, an
Astro content collection) that shipped in the original Phase 1 build has been deleted entirely —
`src/pages/nice-blog/`, `src/content/blog/`, and `src/content/config.ts` are all gone, along with every
nav/footer link that pointed to it. Dave decided the blog wasn't worth migrating. If a blog is wanted
again in the future, it would need to be rebuilt from scratch rather than resumed from this scaffold.

## Local preview

```bash
npm install
npm run dev
```

Then open the URL it prints (usually `http://localhost:4321`).

## Verified production build

```bash
npm install
npm run build
```

This was run and verified as part of this build: all 19 static pages build successfully, each with a
unique title/description, and `dist/sitemap-index.xml` + `dist/sitemap-0.xml` are generated correctly.
`npm run preview` will serve the built `dist/` folder locally so you can click through it exactly as it
will appear in production.

**Important dependency note:** `package.json` pins `@astrojs/sitemap` to the exact version `3.2.1`
(no `^`). Newer 3.x releases of that package (tested: 3.7.3) use a newer Astro integration hook that
isn't populated correctly on Astro 4.16, which crashes the build after generating pages but before
writing the sitemap. If you ever run `npm update`, keep this pin — or upgrade `astro` to v5 alongside it.

## Deploying for free

### Option A — Netlify (recommended, simplest for this project)

1. Push this folder to a GitHub repository (or drag-and-drop the `dist/` folder after running
   `npm run build`, though connecting the repo is better since it rebuilds automatically on every push).
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**.
3. Connect your GitHub repo. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy. You'll get a free `*.netlify.app` URL immediately.
5. **Connect futureforth.com:** Site settings → Domain management → Add a custom domain → enter
   `futureforth.com`. Netlify will show you the DNS records to add.
6. **At your domain registrar** (wherever futureforth.com is registered — check your Squarespace
   account or a WHOIS lookup if unsure), update DNS:
   - Either point your registrar's nameservers to Netlify's (Netlify DNS, easiest, gives free SSL +
     CDN automatically), **or**
   - Keep your current DNS host and add the specific `A` record (Netlify's load balancer IP, shown in
     your dashboard) and a `CNAME` for `www` pointing to your `*.netlify.app` address.
7. Netlify auto-provisions a free SSL certificate once DNS resolves.

### Option B — Vercel

1. Push this folder to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo. Vercel auto-detects Astro —
   no config needed (build command `astro build`, output `dist`).
3. Deploy. You'll get a free `*.vercel.app` URL.
4. **Connect futureforth.com:** Project → Settings → Domains → add `futureforth.com`. Vercel shows the
   exact `A`/`CNAME` records to add.
5. **At your registrar**, add those records (or switch nameservers to Vercel's for the simplest setup).
6. SSL is automatic once DNS resolves.

Both are free for a site this size. Pick whichever dashboard you find friendlier — Netlify's Forms
integration (see below) is a nice reason to lean Netlify if you want the contact form working with zero
extra signup.

## ⚠️ Before you cancel Squarespace or repoint DNS

**The blog was intentionally not migrated** (see "Futureforth as a parent-company hub" above — Dave
decided to abandon it rather than port it). That means your ~35 existing blog posts on the live
Squarespace site have **no equivalent URL on this new site**. If you repoint `futureforth.com`'s DNS
without a plan for those URLs, every one of them will 404, and Google will start dropping them from its
index. Reasonable options, your call:

1. **Accept the 404s.** If the old posts drove little traffic and you're fully done with the blog, this
   may simply be fine — just expect a temporary dip in indexed pages.
2. **Redirect old blog URLs to something useful** (e.g. the homepage, or the closest live page/topic) at
   the DNS/hosting layer (Netlify/Vercel redirects) so visitors and search engines land somewhere
   relevant instead of a dead end.
3. **Keep Squarespace alive on a subdomain** temporarily (e.g. `blog.futureforth.com`) if you want the
   old posts to stay reachable without keeping the whole site on Squarespace.

Either way, get a list of your old blog post URLs before you cancel Squarespace, in case you want to set
up redirects later.

## "Needs review" — what to check before this goes live

1. **All photos are placeholders.** The sandboxed build environment used to build this site could not
   reach `images.squarespace-cdn.com` (network egress was blocked), so every photo in `public/images/`
   is a generated placeholder graphic (navy/orange gradient with a text label describing what should be
   there — e.g. "Dave Delaney keynote speaking"). **You need to re-download the real photos from your
   Squarespace media library and drop them into `public/images/` with the same filenames** before
   launch. Every placeholder's `alt` text already describes the real intended image, so once you swap
   the files the site needs no other changes. The logo (`public/images/logo.png`) and favicon are also
   text-based placeholders — swap in your real logo file.
2. **Brand colors are placeholders.** I used a navy (`#122542`) + warm amber (`#e2823c`) palette as a
   sensible professional default — I could not access your real brand hex codes. All color values live
   in **one file: `src/styles/global.css`**, in the `:root { ... }` block at the top (see the
   `--color-navy-*` and `--color-accent-*` custom properties). Update those few hex values and the whole
   site re-themes.
3. **Contact form has no backend yet.** `/contact` has a real, styled HTML form, but this is a static
   site with no server, so it can't send email on its own yet. The page's source has clear comments
   showing the two free options: **Netlify Forms** (one HTML attribute, zero signup, if you host on
   Netlify) or **Formspree** (free tier, works on any host — just change the form's `action` URL). Until
   one is wired up, the page also shows a direct `mailto:`/phone fallback so no inquiry gets lost.
4. **Free interactive tools weren't rebuilt.** `/freetools` links out to the original Squarespace-hosted
   calculators/quizzes (`/conference-calculator`, `/churn-calculator`, `/ai-quiz`, `/disc-test`) at their
   old URLs, since those weren't in the Phase 1 page list and use Squarespace's built-in interactive
   tools. These will break once Squarespace is cancelled — rebuilding them as small Astro/JS tools is a
   good Phase 3 candidate.
5. **Old blog URLs aren't covered.** The blog was removed, not migrated — see "Before you cancel
   Squarespace or repoint DNS" above for how to handle the ~35 old post URLs on cutover.
6. **Duplicate-URL content groups** — see the note above about `/communication-presentations` /
   `/nice-method-presentations` / `/book-dave-delaney` and `/personal-coaching` /
   `/dave-delaney-coaching` sharing the same real copy across multiple live URLs. Flagging this in case
   you'd rather have Squarespace's original redirect behavior instead.
7. **`for-conference-planners`, `privacy-policy`, and `affiliate`** carry a `noindex` meta tag, matching
   the `NOINDEX` setting Squarespace had on those same pages. Everything else is indexable.
8. Two calendar/Amazon links (`https://calendar.app.google/...` for 10X Conference Coaching bookings,
   `https://amzn.to/3pPiglK` for the book) were carried over as-is from the live site — verify they're
   still the links you want to use.

## Where things live (quick reference)

- **Brand colors:** `src/styles/global.css` → `:root` block at the top.
- **Fonts:** loaded from Google Fonts (Inter + Sora) in `src/layouts/BaseLayout.astro`, with
  `font-display: swap`. Swap the `<link>` there if you'd rather self-host fonts.
- **Nav + footer:** `src/components/Nav.astro` and `src/components/Footer.astro` — edit once, applies
  site-wide via `src/layouts/BaseLayout.astro`.
- **Homepage brand hub ("The Futureforth Family"):** `src/components/BrandHub.astro`, included near the
  top of `src/pages/index.astro` — edit the `brands` array there to change card copy or links.
- **Placeholder images:** everything in `public/images/` (including `public/images/trust/*` client
  logos) — see item 1 above.
- **JSON-LD / structured data:** `src/data/schema.js`.
- **SEO tags per page:** set via props passed to `<BaseLayout title=… description=… path=… image=… />`
  at the top of each file in `src/pages/`.

## Tech stack

- [Astro](https://astro.build) 4.x (static output, zero JS by default)
- `@astrojs/sitemap` for automatic sitemap generation
- Plain CSS with custom properties (no Tailwind/CSS framework) — see `src/styles/global.css`
- A few lines of vanilla JS for the mobile hamburger menu and nav dropdowns (`src/components/Nav.astro`)
- No React/Vue/Svelte — nothing to hydrate, nothing to break
