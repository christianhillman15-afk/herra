/* =========================================================
   Herrera's Tile — self-building house frame (3D)
   A house constructs itself in real order as you scroll:
   foundation -> floor joists -> wall studs -> top plates
   -> ridge -> roof rafters. Driven by a CSS-sticky section
   (no scroll pin, so it stays smooth). Degrades gracefully.
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
  scene.add(new THREE.AmbientLight(0x4a3a29, 0.95));
  var key = new THREE.DirectionalLight(0xffe0b0, 1.5); key.position.set(7, 12, 10); scene.add(key);
  var fill = new THREE.DirectionalLight(0x6a4a30, 0.5); fill.position.set(-8, 4, -6); scene.add(fill);
  var ember = new THREE.PointLight(0xc15a2e, 1.4, 80); ember.position.set(-9, 1, 12); scene.add(ember);
  var champ = new THREE.PointLight(0xecd598, 0.8, 80); champ.position.set(10, 9, 8); scene.add(champ);

  // --- House geometry (procedural framing) ---
  var group = new THREE.Group();
  var BASE_ROT_Y = -0.55, BASE_ROT_X = 0.05;
  group.rotation.set(BASE_ROT_X, BASE_ROT_Y, 0);
  scene.add(group);

  var WX = 8.4, DZ = 5.4, WH = 3.3, RH = 2.3;
  var slabH = 0.45, studT = 0.18, plateT = 0.22, rafterT = 0.17, joistT = 0.16;
  var slabTop = slabH;
  var wallTop = slabTop + WH;
  var ridgeY = wallTop + RH;

  var WOODS = [0xC79A5E, 0xB98A54, 0xD3B07E, 0xC08F52];
  var CONCRETE = 0x8A8074;
  var CHAMP = 0xC9A24A;

  function wood() { return WOODS[Math.floor(Math.random() * WOODS.length)]; }

  var parts = [];
  function addPart(o) { parts.push(o); }

  // 1) Foundation slab
  addPart({ w: WX + 0.9, h: slabH, d: DZ + 0.9, pos: { x: 0, y: slabH / 2, z: 0 }, color: CONCRETE, rough: 0.92, metal: 0.02, grow: "y", t0: 0.00, t1: 0.09 });

  // 2) Floor joists (span width, spaced along depth)
  var joistN = 5;
  for (var jz = 0; jz < joistN; jz++) {
    var zc = -DZ / 2 + (jz + 0.5) * (DZ / joistN);
    var jt0 = 0.07 + 0.10 * (jz / joistN);
    addPart({ w: WX, h: joistT, d: joistT, pos: { x: 0, y: slabTop + joistT / 2, z: zc }, color: wood(), rough: 0.7, metal: 0.05, grow: "x", t0: jt0, t1: jt0 + 0.09 });
  }

  // 3) Wall studs (perimeter) — rise up from the plate
  var studList = [];
  var nX = 8; // studs across width
  for (var i = 0; i <= nX; i++) {
    var x = -WX / 2 + i * (WX / nX);
    studList.push({ x: x, z: DZ / 2 });
    studList.push({ x: x, z: -DZ / 2 });
  }
  var nZ = 5; // studs along depth (skip shared corners)
  for (var k = 1; k < nZ; k++) {
    var z = -DZ / 2 + k * (DZ / nZ);
    studList.push({ x: WX / 2, z: z });
    studList.push({ x: -WX / 2, z: z });
  }
  studList.forEach(function (s, idx) {
    var frac = idx / studList.length;
    var t0 = 0.17 + 0.30 * frac;
    addPart({ w: studT, h: WH, d: studT, pos: { x: s.x, y: slabTop + WH / 2, z: s.z }, color: wood(), rough: 0.7, metal: 0.05, grow: "y", t0: t0, t1: t0 + 0.11 });
  });

  // 4) Top plates (cap the walls)
  addPart({ w: WX + studT, h: plateT, d: plateT, pos: { x: 0, y: wallTop + plateT / 2, z: DZ / 2 }, color: wood(), rough: 0.7, metal: 0.05, grow: "x", t0: 0.48, t1: 0.58 });
  addPart({ w: WX + studT, h: plateT, d: plateT, pos: { x: 0, y: wallTop + plateT / 2, z: -DZ / 2 }, color: wood(), rough: 0.7, metal: 0.05, grow: "x", t0: 0.50, t1: 0.60 });
  addPart({ w: plateT, h: plateT, d: DZ, pos: { x: WX / 2, y: wallTop + plateT / 2, z: 0 }, color: wood(), rough: 0.7, metal: 0.05, grow: "z", t0: 0.49, t1: 0.59 });
  addPart({ w: plateT, h: plateT, d: DZ, pos: { x: -WX / 2, y: wallTop + plateT / 2, z: 0 }, color: wood(), rough: 0.7, metal: 0.05, grow: "z", t0: 0.51, t1: 0.61 });

  // 5) Ridge beam (champagne accent)
  addPart({ w: 0.22, h: 0.22, d: DZ, pos: { x: 0, y: ridgeY, z: 0 }, color: CHAMP, rough: 0.4, metal: 0.55, emissive: 0.16, grow: "z", t0: 0.58, t1: 0.68 });

  // 6) Roof rafters (pairs forming the gable), rise + settle
  var rLen = Math.sqrt((WX / 2) * (WX / 2) + RH * RH);
  var rAng = Math.atan2(RH, WX / 2);
  var rafterZ = [-DZ / 2, -DZ / 4, 0, DZ / 4, DZ / 2];
  rafterZ.forEach(function (rz, ri) {
    var t0 = 0.62 + 0.26 * (ri / rafterZ.length);
    addPart({ w: rLen, h: rafterT, d: rafterT, pos: { x: -WX / 4, y: wallTop + RH / 2, z: rz }, rot: { x: 0, y: 0, z: rAng }, color: wood(), rough: 0.7, metal: 0.05, grow: "none", t0: t0, t1: t0 + 0.14 });
    addPart({ w: rLen, h: rafterT, d: rafterT, pos: { x: WX / 4, y: wallTop + RH / 2, z: rz }, rot: { x: 0, y: 0, z: -rAng }, color: wood(), rough: 0.7, metal: 0.05, grow: "none", t0: t0 + 0.01, t1: t0 + 0.15 });
  });

  // --- Build the meshes (at final transform for bounds) ---
  parts.forEach(function (o) {
    var g = new THREE.BoxGeometry(o.w, o.h, o.d);
    if (o.grow === "y") g.translate(0, o.h / 2, 0);
    else if (o.grow === "x") g.translate(o.w / 2, 0, 0);
    else if (o.grow === "z") g.translate(0, 0, o.d / 2);
    var mat = new THREE.MeshStandardMaterial({ color: o.color, roughness: o.rough, metalness: o.metal, transparent: true, opacity: 1 });
    if (o.emissive) mat.emissive = new THREE.Color(o.color).multiplyScalar(o.emissive);
    var m = new THREE.Mesh(g, mat);
    if (o.rot) m.rotation.set(o.rot.x, o.rot.y, o.rot.z);
    // base position (accounting for grow pivot offset)
    var bx = o.pos.x, by = o.pos.y, bz = o.pos.z;
    if (o.grow === "y") by = o.pos.y - o.h / 2;
    else if (o.grow === "x") bx = o.pos.x - o.w / 2;
    else if (o.grow === "z") bz = o.pos.z - o.d / 2;
    m.position.set(bx, by, bz);
    o.basePos = { x: bx, y: by, z: bz };
    o.mesh = m;
    group.add(m);
  });

  // Center group & fit camera
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
    var zH = (FIT.y * 1.18 / 2) / Math.tan(vfov / 2);
    var zW = (FIT.x * 1.12 / 2) / (Math.tan(vfov / 2) * camera.aspect);
    camera.position.set(0, 0, Math.max(zH, zW));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }

  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  var progress = reduce ? 1 : 0, target = progress;

  function sectionProgress() {
    var rect = section.getBoundingClientRect();
    var denom = rect.height - window.innerHeight;
    return denom > 0 ? Math.min(1, Math.max(0, -rect.top / denom)) : 0;
  }

  function render() {
    progress += (target - progress) * 0.12;
    for (var i = 0; i < parts.length; i++) {
      var o = parts[i], m = o.mesh;
      var lp = (progress - o.t0) / (o.t1 - o.t0);
      lp = Math.min(1, Math.max(0, lp));
      var e = ease(lp);
      if (o.grow === "y") { m.scale.set(1, Math.max(0.001, e), 1); }
      else if (o.grow === "x") { m.scale.set(Math.max(0.001, e), 1, 1); }
      else if (o.grow === "z") { m.scale.set(1, 1, Math.max(0.001, e)); }
      else { var s = 0.35 + 0.65 * e; m.scale.setScalar(s); m.position.y = o.basePos.y - (1 - e) * 1.8; }
      if (e >= 0.999) { if (m.material.transparent) { m.material.transparent = false; m.material.opacity = 1; } }
      else { m.material.transparent = true; m.material.opacity = Math.min(1, e * 1.5); }
    }
    if (!reduce) {
      group.rotation.y = BASE_ROT_Y + (progress - 0.5) * 0.22;
      group.rotation.x = BASE_ROT_X + Math.sin(progress * Math.PI) * 0.025;
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
