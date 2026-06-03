# Point Cloud Visuals — website

Static marketing site for Point Cloud Visuals (plain HTML/CSS/JS, no build step).
Dark editorial aesthetic. Cinematic LiDAR / 3D-scan visualisation studio, Melbourne.

## Structure
| Path | Role |
|------|------|
| `index.html` | Home / landing page (hero, logos, case studies, compare, about, value, FAQ, CTA). |
| `Work.html` | Portfolio grid + video lightbox. Portfolio data lives in the `PROJECTS` array in this file. |
| `Approach.html` | Studio / process / pricing. |
| `About.html` | Founder bio (not linked from nav). |
| `assets/` | `shared.css`, `shared.js`, `enhance.js`, client/hardware logos, avatars, photos, brand marks. |
| `llms.txt`, `robots.txt`, `sitemap.xml` | SEO / AI-discovery files (served from the site root). |
| `netlify.toml` | Hosting config: clean-URL rewrites (`/work`, `/approach`) + headers. |
| `CLAUDE.md` | Working guide for editing the site (how to add a portfolio item, etc.). |

## Hosting
Deployed on Netlify. No build command; publish directory is the repo root.
Canonical/social/structured-data URLs target `https://pointcloudvisuals.com`.
Until the custom domain is attached, the site runs fine on the temporary
`*.netlify.app` URL — only the metadata references the final domain.

## Local preview
Open `index.html` directly in a browser, or run a static server:
`python3 -m http.server` then visit `http://localhost:8000`.
