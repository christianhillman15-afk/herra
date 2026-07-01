/* =========================================================
   Herrera's Tile LLC — Interactions
   ========================================================= */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Current year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky header shadow ---------- */
  const header = $("#header");
  const onScrollHeader = () => {
    if (!header) return;
    header.classList.toggle("is-stuck", window.scrollY > 8);
  };
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---------- Mobile nav ---------- */
  const navToggle = $("#navToggle");
  const nav = $("#nav");
  const closeNav = () => {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  };
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) closeNav();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Animated stat counters ---------- */
  const counters = $$(".stat__num");
  const runCounter = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || "";
    const duration = 1500;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window && counters.length) {
    const cio = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach((el) => (el.textContent = (el.dataset.count || "") + (el.dataset.suffix || "")));
  }

  /* ---------- Active nav link on scroll (scrollspy) ---------- */
  const sections = ["services", "about", "process", "gallery", "reviews", "areas"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navLinks = $$(".nav__link");
  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((l) =>
              l.classList.toggle("is-active", l.getAttribute("href") === "#" + id)
            );
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Back to top ---------- */
  const toTop = $("#toTop");
  if (toTop) {
    const onScrollTop = () => toTop.classList.toggle("is-visible", window.scrollY > 600);
    onScrollTop();
    window.addEventListener("scroll", onScrollTop, { passive: true });
    toTop.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
  }

  /* ---------- Gallery (data-driven + lightbox) ---------- */
  const galleryData = [
    { src: "1600585154340-be6161a56a0c", cap: "Modern tile flooring", cls: "gallery__item--wide" },
    { src: "1620626011761-996317b8d101", cap: "Custom tiled shower", cls: "gallery__item--tall" },
    { src: "1615873968403-89e068629265", cap: "Paver patio", cls: "" },
    { src: "1556909212-d5b604d0c90d", cap: "Kitchen backsplash", cls: "" },
    { src: "1503387762-592deb58ef4e", cap: "Outdoor walkway", cls: "gallery__item--wide" },
    { src: "1584622650111-993a426fbf0a", cap: "Detail craftsmanship", cls: "" },
    { src: "1581858726788-75bc0f6a952d", cap: "Stone tile install", cls: "" },
    { src: "1522708323590-d24dbb6b0267", cap: "Finished living space", cls: "gallery__item--wide" },
  ];
  const grid = $("#galleryGrid");
  const galleryUrls = [];
  if (grid) {
    galleryData.forEach((item, i) => {
      const url = `https://images.unsplash.com/photo-${item.src}?auto=format&fit=crop&w=900&q=80`;
      galleryUrls.push(url);
      const fig = document.createElement("figure");
      fig.className = "gallery__item reveal " + item.cls;
      fig.dataset.index = String(i);
      fig.setAttribute("role", "button");
      fig.setAttribute("tabindex", "0");
      fig.setAttribute("aria-label", "View " + item.cap);
      fig.innerHTML =
        `<img src="${url}" alt="${item.cap} by Herrera's Tile" loading="lazy" />` +
        `<figcaption class="gallery__cap">${item.cap}</figcaption>`;
      grid.appendChild(fig);
    });

    // observe newly created reveals
    if ("IntersectionObserver" in window) {
      const gio = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      $$(".gallery__item.reveal").forEach((el) => gio.observe(el));
    } else {
      $$(".gallery__item.reveal").forEach((el) => el.classList.add("is-in"));
    }
  }

  /* ---------- Lightbox ---------- */
  const lightbox = $("#lightbox");
  const lbImg = $("#lbImg");
  const lbClose = $("#lbClose");
  const lbPrev = $("#lbPrev");
  const lbNext = $("#lbNext");
  let lbIndex = 0;

  const showLb = (i) => {
    if (!galleryUrls.length) return;
    lbIndex = (i + galleryUrls.length) % galleryUrls.length;
    lbImg.src = galleryUrls[lbIndex];
    lbImg.alt = galleryData[lbIndex].cap;
  };
  const openLb = (i) => {
    if (!lightbox) return;
    showLb(i);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };
  const closeLb = () => {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  if (grid) {
    grid.addEventListener("click", (e) => {
      const item = e.target.closest(".gallery__item");
      if (item) openLb(parseInt(item.dataset.index, 10));
    });
    grid.addEventListener("keydown", (e) => {
      const item = e.target.closest(".gallery__item");
      if (item && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        openLb(parseInt(item.dataset.index, 10));
      }
    });
  }
  if (lbClose) lbClose.addEventListener("click", closeLb);
  if (lbPrev) lbPrev.addEventListener("click", () => showLb(lbIndex - 1));
  if (lbNext) lbNext.addEventListener("click", () => showLb(lbIndex + 1));
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLb();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (!lightbox || !lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") showLb(lbIndex - 1);
    if (e.key === "ArrowRight") showLb(lbIndex + 1);
  });

  /* ---------- Contact form validation ---------- */
  const form = $("#quoteForm");
  const note = $("#formNote");

  const setFieldError = (input, message) => {
    const field = input.closest(".field");
    if (!field) return;
    field.classList.toggle("is-invalid", Boolean(message));
    const err = field.querySelector("[data-error]");
    if (err) err.textContent = message || "";
  };

  const validators = {
    name: (v) => (v.trim().length >= 2 ? "" : "Please enter your name."),
    phone: (v) =>
      /^[\d\s()+.-]{7,}$/.test(v.trim()) ? "" : "Please enter a valid phone number.",
    email: (v) =>
      v.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
        ? ""
        : "Please enter a valid email address.",
    message: (v) => (v.trim().length >= 10 ? "" : "Tell us a little about your project."),
  };

  const validateField = (input) => {
    const fn = validators[input.name];
    if (!fn) return true;
    const msg = fn(input.value);
    setFieldError(input, msg);
    return !msg;
  };

  if (form) {
    // live-clear errors as user types
    $$("input, textarea, select", form).forEach((input) => {
      input.addEventListener("blur", () => {
        if (validators[input.name]) validateField(input);
      });
      input.addEventListener("input", () => {
        const field = input.closest(".field");
        if (field && field.classList.contains("is-invalid")) validateField(input);
      });
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fields = ["name", "phone", "email", "message"]
        .map((n) => form.elements[n])
        .filter(Boolean);
      let ok = true;
      let firstInvalid = null;
      fields.forEach((input) => {
        if (!validateField(input) && ok) {
          ok = false;
          firstInvalid = input;
        } else if (!validateField(input)) {
          ok = false;
        }
      });

      if (!ok) {
        if (note) {
          note.textContent = "Please fix the highlighted fields.";
          note.className = "form__note is-error";
        }
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const action = form.getAttribute("action") || "";
      const submitBtn = form.querySelector('button[type="submit"]');

      // If Formspree (or another endpoint) is configured, submit via fetch.
      const isConfigured = action && !action.includes("your-form-id");

      if (isConfigured) {
        try {
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Sending…";
          }
          const res = await fetch(action, {
            method: "POST",
            body: new FormData(form),
            headers: { Accept: "application/json" },
          });
          if (res.ok) {
            form.reset();
            if (note) {
              note.textContent = "Thanks! Your request is on its way. We'll be in touch within one business day.";
              note.className = "form__note is-success";
            }
          } else {
            throw new Error("Bad response");
          }
        } catch (err) {
          if (note) {
            note.textContent = "Something went wrong. Please call or message us on Facebook instead.";
            note.className = "form__note is-error";
          }
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Send My Request";
          }
        }
      } else {
        // No backend configured yet — fall back to a mailto so no lead is lost.
        const data = new FormData(form);
        const subject = encodeURIComponent(
          `Estimate request: ${data.get("service") || "General"} — ${data.get("name")}`
        );
        const body = encodeURIComponent(
          `Name: ${data.get("name")}\n` +
            `Phone: ${data.get("phone")}\n` +
            `Email: ${data.get("email") || "—"}\n` +
            `Service: ${data.get("service")}\n\n` +
            `${data.get("message")}`
        );
        window.location.href = `mailto:info@herrerastile.com?subject=${subject}&body=${body}`;
        if (note) {
          note.textContent = "Opening your email app to send the request…";
          note.className = "form__note is-success";
        }
      }
    });
  }
})();
