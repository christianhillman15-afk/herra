/* =========================================================
   Herrera's Tile — self-assembling 3D tile wall
   Scroll-driven (via a CSS-sticky section, no pin), Three.js.
   Degrades gracefully: no WebGL / no Three / reduced-motion.
   ========================================================= */
(function () {
  "use strict";

  var section = document.getElementById("build");
  var canvas = document.getElementById("buildCanvas");
  if (!section || !canvas) return;

  function fail() { section.classList.add("no-3d"); }
  if (!window.THREE) { fail(); return; }

  var reduce = false;
  try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

  var THREE = window.THREE;
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  } catch (e) { fail(); return; }
  if (!renderer || !renderer.getContext()) { fail(); return; }

  var portrait = window.innerHeight > window.innerWidth;
  var COLS = portrait ? 6 : 10;
  var ROWS = portrait ? 8 : 6;
  var SIZE = 1, GAP = 0.12, DEPTH = 0.3;
  var totalW = COLS * (SIZE + GAP) - GAP;
  var totalH = ROWS * (SIZE + GAP) - GAP;
  var FOV = 42;

  var isMobile = false;
  try { isMobile = window.matchMedia("(max-width: 860px)").matches; } catch (e) {}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
  if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);

  // --- Lighting: firelight on stone ---
  scene.add(new THREE.AmbientLight(0x503d29, 1.0));
  var key = new THREE.DirectionalLight(0xffe0b0, 1.6); key.position.set(6, 9, 12); scene.add(key);
  var ember = new THREE.PointLight(0xc15a2e, 1.5, 60); ember.position.set(-8, -3, 10); scene.add(ember);
  var champ = new THREE.PointLight(0xecd598, 0.9, 60); champ.position.set(9, 7, 8); scene.add(champ);

  // --- Tiles ---
  var group = new THREE.Group();
  group.rotation.y = -0.14; group.rotation.x = 0.02;
  scene.add(group);

  var geo = new THREE.BoxGeometry(SIZE, SIZE, DEPTH);
  var stones = [0xE6DDCB, 0xEAE1CF, 0xD9CBB0, 0xF2E9D8, 0xDDD2BC];
  var accents = [0xC9A24A, 0x6E2A25];
  var tiles = [];
  // deterministic-ish pseudo-random (no Math.random dependency issues; fine here)
  function rnd() { return Math.random(); }

  for (var r = 0; r < ROWS; r++) {
    for (var c = 0; c < COLS; c++) {
      var isAccent = rnd() < 0.13;
      var color = isAccent ? accents[Math.floor(rnd() * accents.length)] : stones[Math.floor(rnd() * stones.length)];
      var mat = new THREE.MeshStandardMaterial({
        color: color, roughness: isAccent ? 0.4 : 0.62, metalness: isAccent ? 0.55 : 0.12, transparent: true, opacity: 0
      });
      if (isAccent) mat.emissive = new THREE.Color(color).multiplyScalar(0.14);
      var m = new THREE.Mesh(geo, mat);
      var tx = c * (SIZE + GAP) - totalW / 2 + SIZE / 2;
      var ty = totalH / 2 - (r * (SIZE + GAP) + SIZE / 2);
      // scattered origin
      var sx = tx + (rnd() - 0.5) * 12;
      var sy = ty + (rnd() - 0.5) * 9;
      var sz = -7 - rnd() * 12;
      // build order: bottom row first, left→right (like real tiling)
      var order = ((ROWS - 1 - r) * COLS + c) / (COLS * ROWS - 1);
      m.userData = { tx: tx, ty: ty, sx: sx, sy: sy, sz: sz,
        rx: (rnd() - 0.5) * 3, ry: (rnd() - 0.5) * 3, rz: (rnd() - 0.5) * 3, order: order };
      m.position.set(sx, sy, sz);
      group.add(m); tiles.push(m);
    }
  }

  function fit() {
    var w = canvas.clientWidth || section.clientWidth || window.innerWidth;
    var h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    var vfov = FOV * Math.PI / 180;
    var zH = (totalH * 1.2 / 2) / Math.tan(vfov / 2);
    var zW = (totalW * 1.12 / 2) / (Math.tan(vfov / 2) * camera.aspect);
    camera.position.set(0, 0, Math.max(zH, zW));
    camera.updateProjectionMatrix();
  }

  function ease(t) { return 1 - Math.pow(1 - t, 3); }

  var progress = reduce ? 1 : 0, target = progress;
  var WIN = 0.4; // fraction of the timeline each tile takes to settle

  function sectionProgress() {
    var rect = section.getBoundingClientRect();
    var denom = rect.height - window.innerHeight;
    return denom > 0 ? Math.min(1, Math.max(0, -rect.top / denom)) : 0;
  }

  function render() {
    progress += (target - progress) * 0.12;
    for (var i = 0; i < tiles.length; i++) {
      var m = tiles[i], d = m.userData;
      var tp = (progress - d.order * (1 - WIN)) / WIN;
      tp = Math.min(1, Math.max(0, tp));
      var e = ease(tp);
      m.position.x = d.sx + (d.tx - d.sx) * e;
      m.position.y = d.sy + (d.ty - d.sy) * e;
      m.position.z = d.sz + (0 - d.sz) * e;
      m.rotation.x = d.rx * (1 - e);
      m.rotation.y = d.ry * (1 - e);
      m.rotation.z = d.rz * (1 - e);
      var s = 0.25 + 0.75 * e; m.scale.setScalar(s);
      if (e >= 0.999) { if (m.material.transparent) { m.material.transparent = false; m.material.opacity = 1; } }
      else { m.material.transparent = true; m.material.opacity = e; }
    }
    if (!reduce) {
      group.rotation.y = -0.14 + (progress - 0.5) * 0.22;
      group.rotation.x = 0.02 + Math.sin(progress * Math.PI) * 0.03;
    }
    renderer.render(scene, camera);
  }

  var running = false;
  function loop() { if (!running) return; target = sectionProgress(); render(); requestAnimationFrame(loop); }

  fit();
  render(); // paint an initial frame

  if (reduce) {
    // static finished wall; re-render only on resize
    target = progress = 1; render();
    window.addEventListener("resize", function () { fit(); render(); });
    return;
  }

  window.addEventListener("resize", function () { fit(); if (!running) render(); });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { if (!running) { running = true; fit(); loop(); } }
        else { running = false; }
      });
    }, { rootMargin: "200px 0px 200px 0px", threshold: 0 });
    io.observe(section);
  } else {
    running = true; loop();
  }
})();
