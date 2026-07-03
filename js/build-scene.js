/* =========================================================
   Herrera's Tile — a shower/floor tiling itself (3D)
   As you scroll, a real tile install comes together:
   substrate -> floor tiles laid back-to-front ->
   wall tiles set bottom-up -> champagne accent band.
   Driven by a CSS-sticky section (no scroll pin). Degrades
   gracefully (no WebGL / reduced motion).
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
  try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); }
  catch (e) { fail(); return; }
  if (!renderer || !renderer.getContext()) { fail(); return; }

  var isMobile = false;
  try { isMobile = window.matchMedia("(max-width: 860px)").matches; } catch (e) {}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
  if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;

  var scene = new THREE.Scene();
  var FOV = 42;
  var camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);

  // --- Lighting: firelight on stone ---
  scene.add(new THREE.AmbientLight(0x4c3c2b, 1.0));
  var key = new THREE.DirectionalLight(0xffe1b2, 1.45); key.position.set(6, 11, 12); scene.add(key);
  var fill = new THREE.DirectionalLight(0x6a4a30, 0.5); fill.position.set(-8, 5, 4); scene.add(fill);
  var ember = new THREE.PointLight(0xc15a2e, 1.3, 90); ember.position.set(-10, 2, 14); scene.add(ember);
  var champ = new THREE.PointLight(0xecd598, 0.8, 90); champ.position.set(10, 9, 10); scene.add(champ);

  var group = new THREE.Group();
  var BASE_ROT_Y = -0.62, BASE_ROT_X = 0.34;
  group.rotation.set(BASE_ROT_X, BASE_ROT_Y, 0);
  scene.add(group);

  // --- Layout ---
  var WALL_W = 6.6, WALL_H = 4.6, FLOOR_D = 5.4;
  var TILE = 1.0, GAP = 0.08, STEP = TILE + GAP, THK = 0.12;
  var wallCols = Math.round(WALL_W / STEP), wallRows = Math.round(WALL_H / STEP);
  var floorCols = wallCols, floorRows = Math.round(FLOOR_D / STEP);
  var accentRow = Math.floor(wallRows * 0.62); // which wall row is the accent band

  var STONE = [0xEAE1CF, 0xE6DDCB, 0xF2E9D8, 0xDED2BB];
  var TRAV = [0xCFB88E, 0xC4AC7E, 0xD8C39A, 0xBBA274];
  var CHAMP = [0xC9A24A, 0xD8B45C];
  var OX = 0x7A3A2E;
  var SUB = 0x6C665D;

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  var parts = [];
  function addPart(o) { parts.push(o); } // {mesh, t0, t1, start:{p,s,rx,ry,rz}, final:{p,s,rx,ry,rz}}

  var geoTile = new THREE.BoxGeometry(TILE, TILE, THK);

  function tile(color, fx, fy, fz, faceRot, t0, t1, normal) {
    var mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.5, metalness: color === OX || CHAMP.indexOf(color) > -1 ? 0.45 : 0.12, transparent: true, opacity: 1 });
    if (CHAMP.indexOf(color) > -1) mat.emissive = new THREE.Color(color).multiplyScalar(0.15);
    var m = new THREE.Mesh(geoTile, mat);
    group.add(m);
    // start: lifted off the surface along its normal + slight scatter + tilt
    var off = 2.4 + Math.random() * 1.6;
    addPart({
      mesh: m, t0: t0, t1: t1,
      final: { px: fx, py: fy, pz: fz, s: 1, rx: faceRot.x, ry: faceRot.y, rz: faceRot.z },
      start: {
        px: fx + normal.x * off + (Math.random() - 0.5) * 0.6,
        py: fy + normal.y * off + (Math.random() - 0.5) * 0.6,
        pz: fz + normal.z * off + (Math.random() - 0.5) * 0.6,
        s: 0.45,
        rx: faceRot.x + (Math.random() - 0.5) * 0.8,
        ry: faceRot.y + (Math.random() - 0.5) * 0.8,
        rz: faceRot.z + (Math.random() - 0.5) * 0.8
      }
    });
  }

  function panel(w, h, d, x, y, z, color, t0, t1) {
    var g = new THREE.BoxGeometry(w, h, d);
    var mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.95, metalness: 0.02, transparent: true, opacity: 1 });
    var m = new THREE.Mesh(g, mat); group.add(m);
    addPart({ mesh: m, t0: t0, t1: t1,
      final: { px: x, py: y, pz: z, s: 1, rx: 0, ry: 0, rz: 0 },
      start: { px: x, py: y, pz: z, s: 0.7, rx: 0, ry: 0, rz: 0 } });
  }

  var wallW = wallCols * STEP - GAP, floorD = floorRows * STEP - GAP;
  var x0 = -wallW / 2;

  // 1) Substrate (cement board behind wall + under floor)
  panel(wallW + 0.4, wallRows * STEP + 0.2, 0.12, 0, WALL_H / 2, -0.02, SUB, 0.00, 0.10);
  panel(wallW + 0.4, 0.12, floorD + 0.4, 0, -0.02, floorD / 2, SUB, 0.03, 0.12);

  // 2) Floor tiles — lay back (near wall) to front
  for (var fr = 0; fr < floorRows; fr++) {
    for (var fc = 0; fc < floorCols; fc++) {
      var fx = x0 + fc * STEP + TILE / 2;
      var fz = fr * STEP + TILE / 2;
      var order = (fr * floorCols + fc) / (floorRows * floorCols);
      var t0 = 0.10 + 0.30 * order;
      tile(pick(TRAV), fx, THK / 2, fz, { x: -Math.PI / 2, y: 0, z: 0 }, t0, t0 + 0.10, { x: 0, y: 1, z: 0 });
    }
  }

  // 3) Wall tiles — set bottom-up
  for (var wr = 0; wr < wallRows; wr++) {
    for (var wc = 0; wc < wallCols; wc++) {
      var wx = x0 + wc * STEP + TILE / 2;
      var wy = wr * STEP + TILE / 2;
      var isAccent = wr === accentRow;
      var col = isAccent ? (Math.random() < 0.25 ? OX : pick(CHAMP)) : pick(STONE);
      var rowOrder = wr / wallRows;
      var t0w = isAccent ? 0.72 : 0.36 + 0.34 * rowOrder + (wc / wallCols) * 0.03;
      var t1w = t0w + (isAccent ? 0.13 : 0.10);
      tile(col, wx, wy, THK / 2, { x: 0, y: 0, z: 0 }, t0w, t1w, { x: 0, y: 0, z: 1 });
    }
  }

  // Center group & fit camera (use final transforms)
  group.updateMatrixWorld(true);
  var box = new THREE.Box3().setFromObject(group);
  var size = box.getSize(new THREE.Vector3());
  var center = box.getCenter(new THREE.Vector3());
  group.position.set(-center.x, -center.y, -center.z);
  var FIT = { x: size.x, y: size.y };

  function fit() {
    var w = canvas.clientWidth || section.clientWidth || window.innerWidth;
    var h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    var vfov = FOV * Math.PI / 180;
    var zH = (FIT.y * 1.2 / 2) / Math.tan(vfov / 2);
    var zW = (FIT.x * 1.12 / 2) / (Math.tan(vfov / 2) * camera.aspect);
    camera.position.set(0, 0, Math.max(zH, zW));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }

  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function lerp(a, b, e) { return a + (b - a) * e; }
  var progress = reduce ? 1 : 0, target = progress;

  function sectionProgress() {
    var rect = section.getBoundingClientRect();
    var denom = rect.height - window.innerHeight;
    return denom > 0 ? Math.min(1, Math.max(0, -rect.top / denom)) : 0;
  }

  function render() {
    progress += (target - progress) * 0.12;
    for (var i = 0; i < parts.length; i++) {
      var o = parts[i], m = o.mesh, s = o.start, f = o.final;
      var lp = (progress - o.t0) / (o.t1 - o.t0);
      lp = Math.min(1, Math.max(0, lp));
      var e = ease(lp);
      m.position.set(lerp(s.px, f.px, e), lerp(s.py, f.py, e), lerp(s.pz, f.pz, e));
      m.rotation.set(lerp(s.rx, f.rx, e), lerp(s.ry, f.ry, e), lerp(s.rz, f.rz, e));
      var sc = lerp(s.s, f.s, e); m.scale.setScalar(sc);
      if (e >= 0.999) { if (m.material.transparent) { m.material.transparent = false; m.material.opacity = 1; } }
      else { m.material.transparent = true; m.material.opacity = Math.min(1, e * 1.6); }
    }
    if (!reduce) {
      group.rotation.y = BASE_ROT_Y + (progress - 0.5) * 0.2;
      group.rotation.x = BASE_ROT_X - Math.sin(progress * Math.PI) * 0.03;
    }
    renderer.render(scene, camera);
  }

  var running = false;
  function loop() { if (!running) return; target = sectionProgress(); render(); requestAnimationFrame(loop); }

  fit();
  render();

  if (reduce) {
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
  } else { running = true; loop(); }
})();
