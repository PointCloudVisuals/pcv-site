# Point Cloud Visuals — site guide

Static multi-page marketing site (plain HTML/CSS/JS, no build step, no framework).
Dark editorial aesthetic. Open any `.html` directly in a browser.

## File map
| Path | Role |
|------|------|
| `Home.html` | Landing page. Hero, client logos, stakes, case-study teaser, about, FAQ, final CTA. |
| `Work.html` | Portfolio. Grid of clients + the video modal (lightbox). **Portfolio data lives here.** |
| `Work-Phoenix-LiDAR.html` | Long-form case study (one per client; pattern for future case studies). |
| `Approach.html` | Studio / process / pricing. |
| `About.html` | ⚠️ Exists but is **orphaned** — not linked from any nav. Link it or move to `archive/`. |
| `assets/shared.css` | Shared styles for every page except Home (Home has its own inline `<style>` + uses shared.css too). |
| `assets/shared.js` | Shared behavior: word reveals, magnetic buttons, etc. Loaded on Approach/Work/Phoenix. |
| `assets/enhance.js` | Loaded on **every** page. Scroll progress, view transitions, the bottom-left "Now [verb]" HUD chip, and the **auto-updating footer year**. |
| `assets/clients/` | Client logo PNGs (self-hosted, not hotlinked). |
| `archive/` | Old versions — `Contact.html` (now superseded by the in-page `#cta` section) and `Work-v1-sixcat.html`. Not linked from the live site. |
| `uploads/` | Source material from the brief (logos, photos, brief markdown). Not all are used. |
| `llms.txt`, `robots.txt`, `sitemap.xml` | SEO / AI-discovery files. |

## Navigation model
- Nav links are duplicated inline at the top of each page (no shared header include).
- **"Contact" and "Book a call" both point to `#cta`** — the Final CTA section present on every live page (`<div class="final-section" id="cta">`). There is no standalone contact page on the live site.

## Adding a new portfolio item (no real coding needed)
Everything is data-driven from the `PROJECTS` array near the top of the `<script>` block in **`Work.html`** (search for `var PROJECTS = [`). Each client is one object; add a new object to the array and it renders automatically into its category grid + modal.

```js
{
  client: 'Client Name',          // also the grid card title + modal grouping key (must be unique)
  cat: 'heritage',                // one of: heritage | aerial | arch | marine  (see CATS array)
  region: 'FR', tint: 'heritage', // region flag + colour tint for placeholders
  year: '2026',
  badge: 'Selected snippets',     // optional ribbon on the card
  railNote: '…',                  // optional note shown above the "More from" rail
  gridVid: 'bunny-id',            // optional: a different loop for the GRID card (else uses videos[0])
  card: 'One-paragraph blurb shown on the grid card.',
  videos: [                       // one or more films; first is the default in the modal
    {
      title: 'Film title',
      region: 'City, Country', year: '2026', duration: '~1 min',
      vid: 'bunny-stream-id',     // omit for a "coming soon" placeholder
      sd: false,                  // ← see "Video quality flag" below
      locked: true,               // ← NDA tile: shows in rail, not playable (omit vid)
      tint: 'heritage',
      summary: 'Longer description shown in the modal.',
      tags: ['Tag one', 'Tag two'],
      outcomes: [['Label','Value'], ['Label','Value']],
      caseStudy: 'Work-SomeClient.html'  // optional link to a full case-study page
    }
  ]
}
```

### Video hosting + quality flag
- Videos are streamed from Bunny CDN. The base + helpers are at the top of the script:
  `mp4(id)` → `play_1080p.mp4` (modal), `mp4720(id)` → `play_720p.mp4` (grid loops), `poster(id)` → thumbnail.
- **`sd: true`** marks a clip that only has a 720p rendition (e.g. shared with a case study).
  Those play the 720p file **and have fullscreen disabled** (so a low-res clip is never blown up).
  Default (`sd` absent/false) = real 1080p, fullscreen enabled.
- A new client also needs its logo at `assets/clients/<name>.png` and a tile added to the logos bar in `Home.html` (copy an existing `.logo-tile <a>` — keep `target="_blank" rel="noopener external"`).

## Design decisions (locked)
- **Hero video ratio: 4:5 (portrait).** Set on every breakpoint in `Home.html` `.hero-right`. Desktop sizes from height (capped to the viewport) so it never towers; mobile fills the column width. Export the hero loop at 4:5 (e.g. 1080×1350).
- **Footer:** `© <span data-year>…</span> Point Cloud Visuals` — `enhance.js` fills the year on load, so it auto-rolls over. (Melbourne, Australia was intentionally removed.)

## Known gotchas
- Reveal animations start at `opacity:0` and fade in via IntersectionObserver — static DOM snapshots/screenshots taken before the observer fires can look empty. This is not a bug.
- Home.html is large and keeps its CSS inline; the other pages share `assets/shared.css`. Type/colour tokens are defined as CSS variables in `:root`.
- Video files are served as plain MP4 URLs from the CDN; `controlslist="nodownload"` + right-click blocking are deterrents only. To actually protect clips, use Bunny signed/token URLs + referrer lock (see chat notes).
