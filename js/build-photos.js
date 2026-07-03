/* =========================================================
   Herrera's Tile — scroll-driven tile-install timelapse
   Crossfades through a sequence of build-stage photos as you
   scroll the CSS-sticky #build section (no pin, stays smooth).
   Degrades gracefully: no-JS / reduced-motion show the finished
   frame (the .build__still image already in the markup).
   ========================================================= */
(function () {
  "use strict";

  var section = document.getElementById("build");
  var seq = document.getElementById("buildSeq");
  if (!section || !seq) return;

  var reduce = false;
  try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

  var N = 12;
  var LABELS = ["Bare framing", "Backer board", "Waterproofing", "Floor prep",
    "Setting the floor", "Floor tiled", "Walls begin", "Walls rising",
    "Walls set", "Grouted", "Fixtures in", "Finished"];

  // Build crossfade layers + preload every frame (small; needed for smooth scrub)
  var layers = [];
  for (var i = 1; i <= N; i++) {
    var img = document.createElement("img");
    img.className = "build__frame";
    img.src = "assets/img/build/frame-" + (i < 10 ? "0" + i : i) + ".jpg";
    img.alt = "";
    img.decoding = "async";
    img.style.opacity = i === 1 ? "1" : "0";
    seq.appendChild(img);
    layers.push(img);
  }

  var bar = document.getElementById("buildBar");
  var count = document.getElementById("buildCount");
  var label = document.getElementById("buildStageLabel");

  var progress = reduce ? 1 : 0, target = progress;

  function sectionProgress() {
    var r = section.getBoundingClientRect();
    var d = r.height - window.innerHeight;
    return d > 0 ? Math.min(1, Math.max(0, -r.top / d)) : 0;
  }

  function apply() {
    var idxF = progress * (N - 1);
    var base = Math.floor(idxF);
    var frac = idxF - base;
    if (base >= N - 1) { base = N - 1; frac = 0; }
    // only the two adjacent frames are visible; they blend (opaque photos cover the rest)
    for (var i = 0; i < N; i++) {
      layers[i].style.opacity = i === base ? (1 - frac) : (i === base + 1 ? frac : 0);
    }
    if (bar) bar.style.width = (progress * 100) + "%";
    var shown = Math.round(progress * (N - 1));
    if (count) count.textContent = (shown + 1 < 10 ? "0" : "") + (shown + 1) + " / " + N;
    if (label) label.textContent = LABELS[shown];
  }

  apply();

  if (reduce) {
    // static finished frame
    progress = 1; apply();
    return;
  }

  var running = false;
  function loop() {
    if (!running) return;
    target = sectionProgress();
    progress += (target - progress) * 0.14;
    apply();
    requestAnimationFrame(loop);
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { if (!running) { running = true; loop(); } }
        else { running = false; }
      });
    }, { rootMargin: "150px 0px 150px 0px", threshold: 0 });
    io.observe(section);
  } else {
    running = true; loop();
  }
})();
