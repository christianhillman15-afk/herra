/* =========================================================
   Herrera's Tile LLC — "Firelight on Stone" interactions
   Lenis + GSAP/ScrollTrigger. Everything degrades gracefully:
   all content is visible without JS; motion is pure enhancement.
   ========================================================= */
(function () {
  "use strict";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var reduce = false;
  try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  var hasGSAP = !!window.gsap;
  var hasST = hasGSAP && !!window.ScrollTrigger;
  var hasLenis = typeof window.Lenis === "function";
  var animate = hasGSAP && !reduce;
  var canHover = false;
  try { canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches; } catch (e) {}
  var isDesktop = false;
  try { isDesktop = window.matchMedia("(min-width: 861px)").matches; } catch (e) {}

  var gsap = window.gsap;
  if (hasST) gsap.registerPlugin(window.ScrollTrigger);

  /* ---------- Year ---------- */
  var y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  /* =======================================================
     SMOOTH SCROLL (Lenis) + GSAP ticker
     ======================================================= */
  var lenis = null;
  function initLenis() {
    if (!hasLenis || reduce) return;
    lenis = new window.Lenis({ lerp: isDesktop ? 0.09 : 0.12, smoothWheel: true, smoothTouch: false, wheelMultiplier: 1 });
    if (hasST) {
      lenis.on("scroll", window.ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (time) { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  function scrollToTarget(target, opts) {
    var headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h"), 10) || 74;
    var o = { offset: -headerH, duration: 1.1 };
    if (opts) for (var k in opts) o[k] = opts[k];
    if (lenis) lenis.scrollTo(target, o);
    else {
      var el = typeof target === "string" ? document.querySelector(target) : target;
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - headerH, behavior: reduce ? "auto" : "smooth" });
    }
  }
  // Anchor links glide
  $$('a[href^="#"]').forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === "#" || href.length < 2) return;
    a.addEventListener("click", function (e) {
      var el = document.getElementById(href.slice(1));
      if (!el) return;
      e.preventDefault();
      closeNav();
      scrollToTarget(el);
    });
  });

  /* =======================================================
     PRELOADER / OVERTURE
     ======================================================= */
  (function preloader() {
    var pre = $("#preloader");
    if (!pre) { setTimeout(start, 0); return; }
    var seen = false;
    try { seen = !!sessionStorage.getItem("herrera_seen"); } catch (e) {}

    if (seen || reduce || !animate) {
      pre.classList.add("is-done");
      try { sessionStorage.setItem("herrera_seen", "1"); } catch (e) {}
      setTimeout(start, 0);
      return;
    }

    var count = $("#preloaderCount");
    var mark = $(".preloader__mark path");
    var done = false;
    function finish() {
      if (done) return; done = true;
      try { sessionStorage.setItem("herrera_seen", "1"); } catch (e) {}
      var tl = gsap.timeline({ onComplete: function () { pre.style.display = "none"; } });
      tl.to("#preloader .preloader__center", { opacity: 0, duration: 0.35, ease: "power2.out" })
        .to(".preloader__bar--top", { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, 0.1)
        .to(".preloader__bar--bottom", { yPercent: 100, duration: 0.9, ease: "power4.inOut" }, 0.1)
        .add(function () { pre.classList.add("is-done"); start(); }, 0.5);
    }
    // count up + stroke draw
    var obj = { v: 0 };
    if (mark) { gsap.set(mark, { strokeDasharray: 100, strokeDashoffset: 100 }); gsap.to(mark, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }); }
    gsap.to(obj, {
      v: 100, duration: 1.2, ease: "power2.out",
      onUpdate: function () { if (count) count.textContent = Math.round(obj.v); },
      onComplete: finish
    });
    // hard timeout safety
    setTimeout(finish, 2600);
  })();

  /* =======================================================
     MAIN INIT (runs after overture handoff)
     ======================================================= */
  var started = false;
  function start() {
    if (started) return; started = true;
    initLenis();
    initHeader();
    initNav();
    initReveals();
    initSplit();
    initParallax();
    initCounters();
    initServiceSheen();
    initBeforeAfter();
    initGallery();
    initProcess();
    initMarquee();
    initScrollSpy();
    initBackToTop();
    initForm();
    initMagnetic();
    initTilt();
    initCursor();
    if (hasST) window.ScrollTrigger.refresh();
  }

  /* ---------- Header sticky ---------- */
  function initHeader() {
    var header = $("#header");
    if (!header) return;
    var onScroll = function () { header.classList.toggle("is-stuck", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile nav ---------- */
  var nav = $("#nav"), navToggle = $("#navToggle");
  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }
  function initNav() {
    if (!nav || !navToggle) return;
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });
  }

  /* ---------- Reveals ---------- */
  function initReveals() {
    var els = $$("[data-reveal]");
    if (!animate || !hasST) { return; } // visible by default
    els.forEach(function (el) {
      gsap.from(el, {
        y: 26, autoAlpha: 0, duration: 1, ease: "power4.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    });
    // curtain-wipe images
    $$(".reveal-wipe").forEach(function (fig) {
      var img = fig.querySelector("img");
      gsap.set(fig, { clipPath: "inset(0 100% 0 0)" });
      if (img) gsap.set(img, { scale: 1.25 });
      var tl = gsap.timeline({ scrollTrigger: { trigger: fig, start: "top 85%", once: true } });
      tl.to(fig, { clipPath: "inset(0 0% 0 0)", duration: 0.95, ease: "power2.inOut" });
      if (img) tl.to(img, { scale: 1, duration: 1.1, ease: "power2.out" }, 0);
    });
  }

  /* ---------- Split-text headline reveals ---------- */
  function splitWords(el) {
    // Wrap each word (and preserve child elements as atomic words) in a masked span.
    var words = [];
    var nodes = Array.prototype.slice.call(el.childNodes);
    el.textContent = "";
    nodes.forEach(function (node) {
      if (node.nodeType === 3) { // text
        var parts = node.textContent.split(/(\s+)/);
        parts.forEach(function (p) {
          if (p === "") return;
          if (/^\s+$/.test(p)) { el.appendChild(document.createTextNode(" ")); return; }
          var mask = document.createElement("span");
          mask.className = "word"; mask.style.display = "inline-block"; mask.style.overflow = "hidden"; mask.style.verticalAlign = "top";
          var inner = document.createElement("span");
          inner.className = "word-i"; inner.style.display = "inline-block"; inner.textContent = p;
          mask.appendChild(inner); el.appendChild(mask); el.appendChild(document.createTextNode(" "));
          words.push(inner);
        });
      } else if (node.nodeType === 1) { // element -> atomic word
        var mask2 = document.createElement("span");
        mask2.className = "word"; mask2.style.display = "inline-block"; mask2.style.overflow = "hidden"; mask2.style.verticalAlign = "top";
        node.style.display = "inline-block";
        mask2.appendChild(node); el.appendChild(mask2); el.appendChild(document.createTextNode(" "));
        words.push(node);
      }
    });
    return words;
  }
  function initSplit() {
    if (!animate || !hasST) return;
    $$("[data-split]").forEach(function (el) {
      var label = el.textContent.trim();
      el.setAttribute("aria-label", label);
      var words = splitWords(el);
      gsap.set(words, { yPercent: 115 });
      gsap.to(words, {
        yPercent: 0, duration: 1.0, ease: "power4.out", stagger: 0.055,
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    });
  }

  /* ---------- Parallax ---------- */
  function initParallax() {
    if (!animate || !hasST) return;
    $$("[data-parallax]").forEach(function (el) {
      var f = parseFloat(el.getAttribute("data-parallax")) || 0.1;
      var amt = f * 100;
      var host = el.closest("section") || el.parentElement;
      gsap.fromTo(el, { yPercent: -amt / 2 }, {
        yPercent: amt / 2, ease: "none",
        scrollTrigger: { trigger: host, start: "top bottom", end: "bottom top", scrub: true }
      });
    });
    // hero firelight bloom drift
    var bloom = $("#heroBloom");
    if (bloom) {
      gsap.to(bloom, { "--g-x": "62%", "--g-y": "44%", duration: 12, ease: "sine.inOut", yoyo: true, repeat: -1 });
    }
  }

  /* ---------- Counters ---------- */
  function initCounters() {
    var nums = $$(".stat__num");
    function run(el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      if (!animate) { el.textContent = target + suffix; return; }
      var o = { v: 0 };
      gsap.to(o, { v: target, duration: 1.5, ease: "power2.out", onUpdate: function () { el.textContent = Math.round(o.v) + suffix; } });
    }
    if (hasST && animate) {
      nums.forEach(function (el) { window.ScrollTrigger.create({ trigger: el, start: "top 92%", once: true, onEnter: function () { run(el); } }); });
    } else if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (ents, obs) { ents.forEach(function (en) { if (en.isIntersecting) { run(en.target); obs.unobserve(en.target); } }); }, { threshold: 0.5 });
      nums.forEach(function (el) { io.observe(el); });
    } else { nums.forEach(function (el) { el.textContent = (el.getAttribute("data-count") || "") + (el.getAttribute("data-suffix") || ""); }); }
  }

  /* ---------- Service card pointer sheen ---------- */
  function initServiceSheen() {
    if (!canHover) return;
    $$(".service").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
      });
    });
  }

  /* ---------- Before / After slider ---------- */
  function initBeforeAfter() {
    var ba = $("#ba"); if (!ba) return;
    var range = $("#baRange"), before = $("#baBefore"), handle = $("#baHandle"), frame = ba.querySelector(".ba__frame");
    function setPos(p) {
      p = Math.max(0, Math.min(100, p));
      // before layer is clipped from the LEFT by p, so we reveal "after" on the left
      if (before) before.style.clipPath = "inset(0 0 0 " + p + "%)";
      if (handle) handle.style.left = p + "%";
      if (range && range.value != p) range.value = p;
    }
    setPos(50);
    if (range) range.addEventListener("input", function () { setPos(parseFloat(range.value)); });
    // pointer drag on frame
    var dragging = false;
    function fromEvent(e) {
      var r = frame.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      setPos(x / r.width * 100);
    }
    if (frame) {
      frame.addEventListener("pointerdown", function (e) { dragging = true; fromEvent(e); });
      window.addEventListener("pointermove", function (e) { if (dragging) fromEvent(e); });
      window.addEventListener("pointerup", function () { dragging = false; });
    }
  }

  /* ---------- Gallery (data-driven + reel + lightbox) ---------- */
  var galleryData = [
    { file: "gallery-1.jpg", cap: "Modern porcelain bath", portrait: true },
    { file: "gallery-2.jpg", cap: "Paver patio & pool deck", portrait: false },
    { file: "gallery-3.jpg", cap: "Kitchen backsplash", portrait: false },
    { file: "gallery-4.jpg", cap: "Natural stone entry", portrait: true },
    { file: "gallery-5.jpg", cap: "Feature accent wall", portrait: false },
    { file: "gallery-6.jpg", cap: "Driveway pavers", portrait: false }
  ];
  var galleryUrls = [];
  function initGallery() {
    var track = $("#galleryTrack"), viewport = $("#galleryViewport");
    if (!track) return;
    galleryData.forEach(function (item, i) {
      var url = "assets/img/" + item.file;
      galleryUrls.push({ url: url, cap: item.cap });
      var card = document.createElement("a");
      card.className = "gallery__card photo" + (item.portrait ? " gallery__card--portrait" : "");
      card.href = url;
      card.setAttribute("data-index", i);
      card.setAttribute("aria-label", "View " + item.cap);
      card.innerHTML =
        '<span class="gallery__plate metal">' + ("0" + (i + 1)) + "</span>" +
        '<img src="' + url + '" alt="' + item.cap + ' by Herrera\'s Tile" loading="lazy" />' +
        '<span class="gallery__cap">' + item.cap + "</span>";
      card.addEventListener("click", function (e) { e.preventDefault(); openLb(i); });
      track.appendChild(card);
    });

    // Pinned horizontal scroll on desktop; native swipe otherwise
    if (animate && hasST && isDesktop) {
      var getScroll = function () { return track.scrollWidth - window.innerWidth + 40; };
      var tween = gsap.to(track, {
        x: function () { return -getScroll(); },
        ease: "none",
        scrollTrigger: {
          trigger: "#gallery", start: "top top", end: function () { return "+=" + getScroll(); },
          pin: true, scrub: 1, invalidateOnRefresh: true,
          onUpdate: function (self) { var p = $("#galleryProgress"); if (p) p.style.width = (self.progress * 100) + "%"; }
        }
      });
      // per-card image parallax within the horizontal scroll
      $$(".gallery__card img", track).forEach(function (img) {
        gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: "none", scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
      });
    } else {
      viewport.classList.add("is-native");
      var p2 = $("#galleryProgress"); if (p2) p2.parentElement.style.display = "none";
    }
  }

  /* Lightbox */
  var lbIndex = 0;
  var lightbox = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCap");
  function showLb(i) {
    if (!galleryUrls.length) return;
    lbIndex = (i + galleryUrls.length) % galleryUrls.length;
    lbImg.src = galleryUrls[lbIndex].url;
    lbImg.alt = galleryUrls[lbIndex].cap;
    if (lbCap) lbCap.textContent = galleryUrls[lbIndex].cap;
  }
  function openLb(i) { if (!lightbox) return; showLb(i); lightbox.classList.add("is-open"); lightbox.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; if (lenis) lenis.stop(); }
  function closeLb() { if (!lightbox) return; lightbox.classList.remove("is-open"); lightbox.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; if (lenis) lenis.start(); }
  (function lbWire() {
    var c = $("#lbClose"), pv = $("#lbPrev"), nx = $("#lbNext");
    if (c) c.addEventListener("click", closeLb);
    if (pv) pv.addEventListener("click", function () { showLb(lbIndex - 1); });
    if (nx) nx.addEventListener("click", function () { showLb(lbIndex + 1); });
    if (lightbox) lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener("keydown", function (e) {
      if (!lightbox || !lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") showLb(lbIndex - 1);
      if (e.key === "ArrowRight") showLb(lbIndex + 1);
    });
  })();

  /* ---------- Process ---------- */
  function initProcess() {
    var section = $("#process"), fill = $("#processFill"), steps = $$("#steps .step");
    if (!section || !steps.length) return;
    function setActive(idx) { steps.forEach(function (s, i) { s.classList.toggle("is-active", i === idx); }); }

    if (animate && hasST && isDesktop) {
      var st = window.ScrollTrigger.create({
        trigger: section, start: "top top", end: "+=2200", pin: true, scrub: 1, snap: 1 / (steps.length - 1),
        onUpdate: function (self) {
          if (fill) fill.style.height = (self.progress * 100) + "%";
          setActive(Math.round(self.progress * (steps.length - 1)));
        }
      });
    } else {
      // unpinned: fill draws on scroll, all steps visible
      if (hasST && animate) {
        gsap.to(fill, { height: "100%", ease: "none", scrollTrigger: { trigger: ".process__wrap", start: "top 70%", end: "bottom 70%", scrub: true } });
      } else if (fill) { fill.style.height = "100%"; }
      steps.forEach(function (s) { s.classList.add("is-active"); });
    }
  }

  /* ---------- Marquee ---------- */
  function initMarquee() {
    var track = $("#marquee");
    if (!track || !animate || !hasGSAP) return;
    var tl = gsap.to(track, { xPercent: -50, duration: 24, ease: "none", repeat: -1 });
    if (lenis && hasST) {
      lenis.on("scroll", function (e) {
        var v = Math.min(Math.abs(e.velocity || 0) * 0.06, 4);
        tl.timeScale(1 + v);
      });
    }
    if (hasST) window.ScrollTrigger.create({ trigger: ".marquee", start: "top bottom", end: "bottom top", onToggle: function (self) { self.isActive ? tl.play() : tl.pause(); } });
  }

  /* ---------- Scroll spy ---------- */
  function initScrollSpy() {
    var ids = ["services", "about", "process", "gallery", "reviews", "areas"];
    var links = $$(".nav__link");
    if (hasST && animate) {
      ids.forEach(function (id) {
        var sec = document.getElementById(id); if (!sec) return;
        window.ScrollTrigger.create({
          trigger: sec, start: "top 45%", end: "bottom 45%",
          onToggle: function (self) { if (self.isActive) links.forEach(function (l) { l.classList.toggle("is-active", l.getAttribute("href") === "#" + id); }); }
        });
      });
    } else if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (ents) { ents.forEach(function (en) { if (en.isIntersecting) { var id = en.target.id; links.forEach(function (l) { l.classList.toggle("is-active", l.getAttribute("href") === "#" + id); }); } }); }, { rootMargin: "-45% 0px -50% 0px" });
      ids.forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
    }
  }

  /* ---------- Back to top ---------- */
  function initBackToTop() {
    var btn = $("#toTop"); if (!btn) return;
    var onScroll = function () { btn.classList.toggle("is-visible", window.scrollY > 700); };
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    btn.addEventListener("click", function () { scrollToTarget(document.body, { offset: 0 }); });
  }

  /* ---------- Magnetic buttons ---------- */
  function initMagnetic() {
    if (!canHover || !animate) return;
    $$("[data-magnetic]").forEach(function (btn) {
      if (btn.type === "submit") return; // never move a control users aim at
      var xTo = gsap.quickTo(btn, "x", { duration: 0.6, ease: "power3.out" });
      var yTo = gsap.quickTo(btn, "y", { duration: 0.6, ease: "power3.out" });
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.28);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.28);
      });
      btn.addEventListener("pointerleave", function () { xTo(0); yTo(0); });
    });
  }

  /* ---------- Tilt cards ---------- */
  function initTilt() {
    if (!canHover || !animate) return;
    $$("[data-tilt]").forEach(function (card) {
      var rx = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3.out" });
      var ry = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3.out" });
      card.style.transformPerspective = "800px";
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        ry(px * 12); rx(-py * 12);
      });
      card.addEventListener("pointerleave", function () { rx(0); ry(0); });
    });
  }

  /* ---------- Custom cursor ---------- */
  function initCursor() {
    if (!canHover || !animate) return;
    var cur = $("#cursor"), label = $("#cursorLabel");
    if (!cur) return;
    cur.style.display = "flex"; cur.style.alignItems = "center"; cur.style.justifyContent = "center";
    var xTo = gsap.quickTo(cur, "x", { duration: 0.25, ease: "power3.out" });
    var yTo = gsap.quickTo(cur, "y", { duration: 0.25, ease: "power3.out" });
    window.addEventListener("pointermove", function (e) {
      cur.classList.add("is-active");
      xTo(e.clientX); yTo(e.clientY);
    });
    document.addEventListener("pointerleave", function () { cur.classList.remove("is-active"); });
    $$(".gallery__card").forEach(function (el) {
      el.addEventListener("pointerenter", function () { cur.classList.add("is-big"); if (label) label.textContent = "View"; });
      el.addEventListener("pointerleave", function () { cur.classList.remove("is-big"); if (label) label.textContent = ""; });
    });
    var baFrame = $("#ba .ba__frame");
    if (baFrame) {
      baFrame.addEventListener("pointerenter", function () { cur.classList.add("is-big"); if (label) label.textContent = "Drag"; });
      baFrame.addEventListener("pointerleave", function () { cur.classList.remove("is-big"); if (label) label.textContent = ""; });
    }
  }

  /* ---------- Contact form ---------- */
  function initForm() {
    var form = $("#quoteForm"), note = $("#formNote");
    if (!form) return;
    function setErr(input, msg) {
      var field = input.closest(".field"); if (!field) return;
      field.classList.toggle("is-invalid", !!msg);
      var e = field.querySelector("[data-error]"); if (e) e.textContent = msg || "";
    }
    var V = {
      name: function (v) { return v.trim().length >= 2 ? "" : "Please enter your name."; },
      phone: function (v) { return /^[\d\s()+.-]{7,}$/.test(v.trim()) ? "" : "Please enter a valid phone number."; },
      email: function (v) { return v.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Please enter a valid email address."; },
      message: function (v) { return v.trim().length >= 10 ? "" : "Tell us a little about your project."; }
    };
    function validate(input) { var fn = V[input.name]; if (!fn) return true; var m = fn(input.value); setErr(input, m); return !m; }
    $$("input, textarea, select", form).forEach(function (input) {
      input.addEventListener("blur", function () { if (V[input.name]) validate(input); });
      input.addEventListener("input", function () { var f = input.closest(".field"); if (f && f.classList.contains("is-invalid")) validate(input); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fields = ["name", "phone", "email", "message"].map(function (n) { return form.elements[n]; }).filter(Boolean);
      var ok = true, first = null;
      fields.forEach(function (input) { if (!validate(input)) { ok = false; if (!first) first = input; } });
      if (!ok) { if (note) { note.textContent = "Please fix the highlighted fields."; note.className = "form__note is-error"; } if (first) first.focus(); return; }
      var action = form.getAttribute("action") || "";
      var submitBtn = form.querySelector('button[type="submit"]');
      var configured = action && action.indexOf("your-form-id") === -1;
      if (configured) {
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending…"; }
        fetch(action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
          .then(function (res) {
            if (res.ok) { form.reset(); if (note) { note.textContent = "Thanks! Your request is on its way. We'll be in touch within one business day."; note.className = "form__note is-success"; } }
            else throw new Error("bad");
          })
          .catch(function () { if (note) { note.textContent = "Something went wrong. Please call or message us on Facebook instead."; note.className = "form__note is-error"; } })
          .then(function () { if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Send My Request"; } });
      } else {
        var d = new FormData(form);
        var subj = encodeURIComponent("Estimate request: " + (d.get("service") || "General") + " — " + d.get("name"));
        var body = encodeURIComponent("Name: " + d.get("name") + "\nPhone: " + d.get("phone") + "\nEmail: " + (d.get("email") || "—") + "\nService: " + d.get("service") + "\n\n" + d.get("message"));
        window.location.href = "mailto:info@herrerastile.com?subject=" + subj + "&body=" + body;
        if (note) { note.textContent = "Opening your email app to send the request…"; note.className = "form__note is-success"; }
      }
    });
  }

  // Recalculate ScrollTrigger after full load (images shift layout)
  window.addEventListener("load", function () { if (hasST) window.ScrollTrigger.refresh(); });
})();
