# Herrera's Tile LLC — Website

A fast, cinematic, fully responsive marketing website for **Herrera's Tile LLC** —
tile installation, paver installation, framing, and handyman services in
**El Mirage, Arizona** and the West Valley.

Design concept: **"Firelight on Stone"** — a directed warm-luxe remodel film. The
page moves through a deliberate **dark → light → dark → light** act rhythm:
cinematic showcase moments (hero, gallery, final CTA) land in warm espresso dark,
while every read-and-decide moment (services, proof, estimate) lands in honest,
open daylight.

Built as a self-contained static site (HTML + CSS + vanilla JS). No build step and
no runtime dependencies on any CDN — fonts, images, and the animation libraries
are all vendored locally, so it loads fast and never shows a broken asset.

---

## ✨ What makes it feel premium

- **Buttery smooth inertia scrolling** (Lenis) wired to the GSAP ticker.
- **Cinematic overture** — a letterbox preloader that hands off into the hero.
- **Split-text headline reveals** that "settle" into place as you scroll.
- **Curtain-wipe image reveals** with an inner counter-scale.
- **Before / After proof slider** — drag (or arrow-key) to reveal the transformation.
- **Pinned horizontal "projects reel"** gallery with a keyboard-accessible lightbox.
- **Pinned, scrubbed process sequence.**
- **Firelight bloom, film grain, and champagne-metal** accents on the dark acts.
- **Magnetic CTAs, tilt cards, a velocity marquee, and a context cursor** (desktop only).
- A sophisticated palette (espresso / parchment / oxblood / champagne) and a
  Fraunces + Hanken Grotesk type pairing.

Every effect is **pure enhancement**: all content is fully visible and usable with
no JavaScript, and everything is disabled cleanly under `prefers-reduced-motion`.

---

## 🚀 Preview locally

```bash
python3 -m http.server 8000
# visit http://localhost:8000
```

Or just open `index.html` in a browser.

---

## ✏️ Customize it (do these before going live)

| What | Where |
|------|-------|
| **Phone number** | `index.html` → search `data-editable="phone"` and `href="tel:+1"` |
| **Email address** | `index.html` → search `info@herrerastile.com` |
| **Contact form delivery** | `index.html` → `<form ... action="https://formspree.io/f/your-form-id">` (see below) |
| **Photos** | Replace files in `assets/img/` (keep the same filenames). See `assets/img/CREDITS.md` |
| **Before/After pair** | Swap `assets/img/before.jpg` and `assets/img/after.jpg` with a real matched job |
| **Reviews** | `index.html` → `#reviews` section — replace with real customer quotes |
| **Stats** | `index.html` → `#stats` `data-count` values |
| **Domain / URLs** | `index.html` canonical + OG tags, `sitemap.xml`, `robots.txt` |

> The photos are royalty-free stock (Unsplash / Pexels) so the site looks complete
> out of the box. Replacing them with real photos of Herrera's Tile work — and a
> real matched before/after pair — is the single biggest upgrade you can make.

### Swapping images
Every image is referenced by a **fixed filename** in `assets/img/`. To change one,
just drop in a new file with the same name (e.g. overwrite `hero.jpg`). Landscape
slots want wide photos; `gallery-1.jpg`, `gallery-4.jpg`, and `about-main.jpg` are
portrait. Aim for ~1600px wide, optimized JPEG/WebP.

---

## 📨 Wire up the contact form

Ready for [Formspree](https://formspree.io) (free tier) — no backend needed:

1. Create a form at formspree.io and copy its endpoint (`https://formspree.io/f/abcdwxyz`).
2. In `index.html`, replace `action="https://formspree.io/f/your-form-id"` with it.

Until it's configured, the form gracefully falls back to opening the visitor's email
app pre-filled, so no lead is lost. Any endpoint that accepts a POST works (Netlify
Forms, Getform, Basin, etc.) — the JS submits via `fetch`.

---

## 🌐 Deploy (pick one — all free)

- **Netlify** — drag the folder onto <https://app.netlify.com/drop>.
- **Vercel** — `vercel`, or import the repo.
- **GitHub Pages** — Settings → Pages → deploy from branch (root).
- **Cloudflare Pages** — connect the repo, framework preset "None", output dir `/`.

Then point a custom domain (e.g. `herrerastile.com`) at your host.

---

## 📁 Structure

```
.
├── index.html            # Content + structured data
├── css/
│   ├── fonts.css         # Self-hosted @font-face (Fraunces + Hanken Grotesk)
│   └── styles.css        # Design system, act theming, all sections
├── js/
│   ├── vendor/           # gsap.min.js, ScrollTrigger.min.js, lenis.min.js (self-hosted)
│   └── main.js           # Motion system + all interactions
├── assets/
│   ├── fonts/            # woff2 font files
│   └── img/              # All photography (+ CREDITS.md)
├── robots.txt · sitemap.xml · site.webmanifest
└── README.md
```

---

## ♿ Accessibility & SEO

- Semantic HTML, skip link, ARIA labels, visible focus states, keyboard-operable
  gallery lightbox and before/after slider.
- Full `prefers-reduced-motion` support (all motion disabled, content intact).
- Meta + Open Graph tags, `LocalBusiness` JSON-LD, `sitemap.xml`, `robots.txt`.

---

© Herrera's Tile LLC · El Mirage, Arizona
