# Point Cloud Visuals — site guide (for coding agents & the owner)

Static marketing site for **Point Cloud Visuals** (PCV): a Sydney studio that turns
LiDAR / photogrammetry / 3D-scan datasets into cinematic visual packages.
Plain HTML/CSS/JS — **no build step, no framework.** Dark editorial aesthetic
(Cormorant display serif + Geist / Geist Mono, near-black `#0E0E10`, brass `#B89968`).

> **Read this first, then skim `index.html` and `Work.html`.** This file is the fast map of
> the whole build. The repo is the single source of truth — not any chat history.

---

## Hosting & deployment pipeline (important)
- **Source of truth:** this GitHub repo, `PointCloudVisuals/pcv-site`, branch `main`.
- **Host:** Netlify, connected to this repo. **Pushing to `main` auto-deploys** to
  `https://pointcloudvisuals.com` (~1–2 min; watch Netlify → Deploys for "Published").
- **To preview a change safely:** push a branch and open a **Pull Request** → Netlify builds a
  **Deploy Preview** URL on the PR. The live site is untouched until the PR is merged.
- **Domain:** registrar is **GoDaddy** (DNS stays there — do NOT switch nameservers; email runs
  on **Zoho**, so leave all MX/TXT records alone). Apex `A` → `75.2.60.5`, `www` CNAME →
  `<site>.netlify.app`. **Primary domain = apex (non-www)**; www 301→apex. SSL = Netlify Let's Encrypt.
- `netlify.toml` holds **clean-URL rewrites** (`/work`→`/Work.html`, `/approach`→`/Approach.html`)
  and **security headers** (X-Content-Type-Options, Referrer-Policy, X-Frame-Options, HSTS,
  Permissions-Policy). The site's canonical/OG/sitemap URLs all assume `pointcloudvisuals.com`.

## File map
| Path | Role |
|------|------|
| `index.html` | **Home / landing page.** Hero (lazy-loaded 4:5 Bunny video), client+hardware logos, case-study teaser, old-way/PCV-way compare, About Edwin, value/results, FAQ, final CTA (`#cta`). Keeps its CSS **inline**; also uses `assets/shared.css`. |
| `Work.html` | **Portfolio.** Sector grid + video lightbox modal. **All portfolio data is the `PROJECTS` array** here. Per-film deep links live here too (see below). |
| `Approach.html` | Studio / process / pricing (3 tiers, AUD). |
| `About.html` | Founder bio — **orphaned** (not linked from nav). Keep or move to archive. |
| `assets/shared.css` | Shared styles for Work/Approach/About (+ Home uses it alongside its inline CSS). |
| `assets/shared.js` | Shared behaviour (word reveals, magnetic buttons) — Work/Approach. |
| `assets/enhance.js` | Loaded on **every** page: scroll progress, view transitions, "Now [verb]" HUD chip, **auto-updating footer year**, and the **hero-video lazy-loader**. |
| `assets/clients/`, `assets/hardware/`, `assets/avatars/` | Self-hosted logo/photo PNGs & JPGs (optimized; longest edge ≤600px for logos). |
| `assets/og-cover.jpg` | Social-share card (1200×630). Referenced by all pages' OG/Twitter tags. |
| `llms.txt`, `robots.txt`, `sitemap.xml` | SEO / AI-discovery files, served from the site root. |
| `netlify.toml` | Hosting config (rewrites + headers). |

## Navigation model
- Nav links are inlined at the top of each page (no shared header include).
- The **"Home" nav link points to `/`** (homepage is `index.html`); Work/Approach use `.html` files
  (clean `/work` `/approach` resolve via `netlify.toml`).
- **"Contact" points to `#cta`** — the Final CTA section on every page. No standalone contact page.
- **Every "Book a call" button opens Calendly directly** (new tab), on every page:
  `https://calendly.com/projects-pointcloudvisuals/30min` (no `?month=` param, so it opens on the current month).
  The `30min` slug is the only working Calendly URL, but the event itself books **15-minute** slots,
  so site copy says "15-minute call". Don't "fix" the slug to `15min` (it doesn't exist).
- **Bottom CTA on every page:** "Reserve a call slot →" (Calendly) + "Apply with my project" (Tally).
- **Home hero buttons work directly too:** "Reserve a call slot →" (Calendly) and "Apply with my project"
  (Tally questionnaire `https://tally.so/r/w8WKPz`), both in a new tab.

## Operational facts (don't re-derive these)
- **Founder name: Edwin Boer** (everywhere — visible + metadata + llms.txt).
- **Turnaround: 3–6 business days** (kept consistent across visible copy, JSON-LD, and llms.txt).
- **Analytics:** GA4, Measurement ID **`G-FTRXZBT6EL`**, tag in `<head>` of every page. (Property is
  owned by a separate Google account; `winbyed@gmail.com` is added as a user.)
- **Video hosting:** **Bunny Stream** library `vz-39886892-05f` (NOT a CDN Pull Zone). Pages embed
  **direct MP4 URLs** (`…/<id>/play_1080p.mp4`, `play_720p.mp4`, poster `…/<id>/thumbnail.jpg`).
  A **referrer lock** is set in Bunny: Allowed Referrers = `pointcloudvisuals.com`.
  → **Videos therefore DO NOT play on Netlify preview / `*.netlify.app` domains — only on the live
  domain. This is expected, not a bug.** Do not enable token-auth / block-direct-for-own-domain
  (would break the live embeds).
- **Hero video:** locked **4:5** ratio; **lazy-loaded** (poster paints first, `data-src` attached on
  `window.load` by `enhance.js`) for mobile LCP.

## Adding a new portfolio item (little coding needed)
Everything is data-driven from the `PROJECTS` array near the top of the `<script>` in **`Work.html`**
(search `var PROJECTS = [`). Add one object; it renders into its sector grid + modal automatically.
Each playable film also carries a **`slug`** (its deep-link id). A new client also needs a logo at
`assets/clients/<name>.png`, and a tile in the logos bar in `index.html`
(copy an existing `.logo-tile <a>`, keep `target="_blank" rel="noopener external"`).

```js
{ client:'Client Name', cat:'heritage'|'aerial'|'arch'|'marine', region:'FR', tint:'heritage',
  year:'2026', badge:'…', railNote:'…', gridVid:'bunny-id', card:'Grid-card blurb.',
  videos:[ { title:'Film title', slug:'short-film-slug', region:'City, Country', year:'2026',
    duration:'~1 min', vid:'bunny-stream-id', sd:false, locked:false, tint:'heritage',
    summary:'Modal description.', tags:['…'], outcomes:[['Label','Value']] } ] }
```
- `sd:true` = clip only has a 720p rendition → plays 720p + fullscreen disabled.
- `locked:true` (omit `vid`) = NDA tile: shows in the rail, not playable, **no deep-link slug**.

## Per-film deep links  (`/work#slug`)
Each **playable** film has a `slug`; sharing `https://pointcloudvisuals.com/work#<slug>` opens that
film directly, playing. Implementation in `Work.html`: a `bySlug` map, `filmHash()`, `openFromHash()`
on load, and `openModal`/`setVideo` write the hash via `pushState`/`replaceState` (rail-switching adds
no history entries; Back closes the modal / returns to the grid). **14 current slugs:**
`amsterdam-landmark`, `historic-city-centre`, `institutional-survey`, `sandy-creek-flood`,
`city-scale-texas`, `road-corridor-scan`, `uav-survey-flythrough`, `apartment-as-built`,
`city-centre-multifamily`, `villa-france`, `farm-buildings`, `house-to-restaurant`,
`multi-mall-pitch`, `hull-scan-films`.

## Known gotchas
- Reveal animations start at `opacity:0` and fade in on scroll — static snapshots can look empty. Not a bug.
- Videos are plain MP4 URLs; `controlslist="nodownload"` + right-click block are deterrents only. The real
  protection is the Bunny referrer lock (set).
- `index.html` is large and keeps CSS inline; other pages share `assets/shared.css`.

## Project status & open to-dos (verify against the repo)
- ✅ Live on `pointcloudvisuals.com` (HTTPS), GA4 wired, images optimized, loader removed,
  turnaround copy consistent, hero lazy-loaded, security headers + Bunny referrer lock set.
- ⏳ **Per-film deep links** were built on branch `deep-link-videos` via PR — confirm it's merged to `main`.
- ⏳ **If deep links are merged:** add the 14 `/work#slug` URLs to `sitemap.xml` for SEO (optional).
- ⏳ **Google Search Console:** submit `sitemap.xml`, request indexing of `/`, `/work`, `/approach` (owner-side).
- ⏳ Optional: Bing Webmaster Tools (import from Search Console).

## Working style for agents
- Make changes on a **branch + PR** so the owner can preview on Netlify before it goes live.
- Keep the visual design as-is unless asked — the owner reviewed and approved the current look.
- After merging, the owner tests on the **live domain** (videos only play there, per the referrer lock).
</content>
