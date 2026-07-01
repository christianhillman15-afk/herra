# Herrera's Tile LLC — Website

A fast, modern, fully responsive marketing website for **Herrera's Tile LLC** —
tile installation, paver installation, framing, and handyman services in
**El Mirage, Arizona** and the West Valley.

Built as a lightweight static site (HTML + CSS + vanilla JS). No build step, no
dependencies — it runs anywhere and loads fast.

---

## 🚀 Preview locally

Just open `index.html` in a browser, or serve the folder for a production-like preview:

```bash
# Python 3
python3 -m http.server 8000
# then visit http://localhost:8000
```

---

## ✏️ Customize it (do these before going live)

Everything you'll want to change is easy to find:

| What | Where | Notes |
|------|-------|-------|
| **Phone number** | `index.html` → search `data-editable="phone"` and `href="tel:+1"` | Replace with the real number in both the link text and the `tel:` link. |
| **Email address** | `index.html` → search `info@herrerastile.com` | Appears in the contact section and structured data. |
| **Contact form delivery** | `index.html` → `<form ... action="https://formspree.io/f/your-form-id">` | See "Wire up the form" below. |
| **Photos** | `css/styles.css` (hero + about) and `js/main.js` (`galleryData`) | Currently high-quality stock placeholders. Swap in your own project photos. |
| **Reviews** | `index.html` → `#reviews` section | Replace sample testimonials with real customer quotes. |
| **Business hours** | `index.html` → top bar + JSON-LD `openingHoursSpecification` | Update if different. |
| **Domain / URLs** | `index.html` → `<link rel="canonical">`, Open Graph tags, `sitemap.xml`, `robots.txt` | Set to your real domain once you have it. |
| **Stats** | `index.html` → `#stats` `data-count` values | Adjust the numbers to match the business. |

> The placeholder images are royalty-free stock from Unsplash so the site looks
> complete out of the box. Replacing them with real photos of Herrera's Tile
> work will make it far more powerful.

---

## 📨 Wire up the contact form

The form is ready for [Formspree](https://formspree.io) (free tier available)
so you receive estimate requests by email with **zero backend**:

1. Create a free account at formspree.io and add a new form.
2. Copy your form endpoint (looks like `https://formspree.io/f/abcdwxyz`).
3. In `index.html`, replace `action="https://formspree.io/f/your-form-id"` with it.

That's it — submissions will email you automatically, with built-in validation.

**Until it's configured**, the form gracefully falls back to opening the
visitor's email app pre-filled with their details, so no lead is lost.

Prefer a different provider (Netlify Forms, Getform, Basin, etc.)? Just point
the `action` at their endpoint — the JavaScript submits via `fetch` to any
endpoint that accepts a POST.

---

## 🌐 Deploy (pick one — all free)

**Netlify** — drag the folder onto <https://app.netlify.com/drop>, done.

**Vercel** — `vercel` in the project folder, or import the repo at vercel.com.

**GitHub Pages** — push to GitHub, then Settings → Pages → deploy from branch
(root). Your site goes live at `https://<user>.github.io/<repo>/`.

**Cloudflare Pages** — connect the repo, framework preset "None", output dir `/`.

To use a custom domain (e.g. `herrerastile.com`), add it in your host's
dashboard and point your domain's DNS at them.

---

## 🧭 What's included

- **Sticky navigation** with mobile menu and scroll-spy active states
- **Cinematic hero** with subtle motion and clear calls to action
- **Animated stat counters**
- **Services** — Tile, Paver, Handyman, Framing
- **Why Us / About** with feature highlights
- **4-step process** section
- **Filterable-style gallery** with keyboard-accessible lightbox
- **Testimonials**
- **Service-area** list for the West Valley
- **Validated contact form** with graceful fallback
- **SEO**: semantic HTML, meta + Open Graph tags, `LocalBusiness` structured
  data (JSON-LD), `sitemap.xml`, `robots.txt`
- **Accessibility**: skip link, focus styles, ARIA labels, reduced-motion support
- **Performance**: no frameworks, lazy-loaded images, system-friendly fonts

---

## 📁 Structure

```
.
├── index.html        # All page content and structured data
├── css/
│   └── styles.css    # Design system + all styling
├── js/
│   └── main.js       # Nav, reveals, counters, gallery/lightbox, form
├── robots.txt
├── sitemap.xml
├── site.webmanifest
└── README.md
```

---

© Herrera's Tile LLC · El Mirage, Arizona
