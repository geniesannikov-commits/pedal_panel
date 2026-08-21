/**
 * Triple-screen box — 3D hero visual (Three.js)
 *
 * Extracted from a standalone demo (pedalpanel-3d-box.html): a rotating
 * delivery-bag box with a modeled top-opening lid, rim trim, velcro tabs
 * and shoulder straps, three of its faces textured as independent ad
 * screens whose "Your ad here" creative cycles through a few brand
 * variants on a canvas texture.
 *
 * This module owns the Three.js scene only — it does not decide *when*
 * to load or render. Callers (js/hero-3d.js) gate the dynamic import and
 * the call to init() behind an IntersectionObserver, same spirit as
 * js/reveal.js gating its fade-ins, so the ~600KB three.js module and the
 * WebGL context never get created until the hero is actually about to be
 * seen.
 *
 * Three.js itself is loaded from a CDN (esm.sh) rather than vendored into
 * assets/ — this site has no bundler/build step to dedupe or tree-shake a
 * local copy, and every other third-party dependency here (the Google
 * Fonts stylesheet) is already CDN-loaded rather than self-hosted, so
 * this follows the existing pattern.
 */

var THREE_CDN = "https://esm.sh/three@0.128.0";

var INK = 0x14141a;
var BACK_FACE = 0x0a1a21;
var TRIM = 0xc9c7bd;
var PINK_HEX = 0xe11359;

var AD_VARIANTS = [
  { bg: "#102731", text: "#FFFFFF", accent: "#E11359", font: "700 54px Arial, sans-serif", letterSpacing: 0 },
  { bg: "#E11359", text: "#FFFFFF", accent: "#FFFFFF", font: "700 50px 'Courier New', monospace", letterSpacing: 2 },
  { bg: "#033FAB", text: "#FFFFFF", accent: "#9FC1F5", font: "italic 600 52px Georgia, serif", letterSpacing: 0 },
  { bg: "#0E8F6B", text: "#F3FBF7", accent: "#F3FBF7", font: "700 42px Arial, sans-serif", letterSpacing: 6 }
];

function drawFace(ctx, w, h, variantIdx, activeDot) {
  var v = AD_VARIANTS[variantIdx % AD_VARIANTS.length];
  ctx.clearRect(0, 0, w, h);

  var bezel = w * 0.055;
  ctx.fillStyle = "#0B0B0F";
  ctx.fillRect(0, 0, w, h);

  var ix = bezel, iy = bezel, iw = w - bezel * 2, ih = h - bezel * 2;
  ctx.fillStyle = v.bg;
  ctx.fillRect(ix, iy, iw, ih);

  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = w * 0.006;
  ctx.strokeRect(ix, iy, iw, ih);

  for (var i = 0; i < 9; i++) {
    var y = iy + ih * (0.66 + i * 0.028);
    ctx.strokeStyle = "rgba(0,0,0,0.14)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ix + iw * 0.08, y);
    ctx.lineTo(ix + iw * 0.92, y);
    ctx.stroke();
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = v.font;
  ctx.fillStyle = v.text;
  if (ctx.letterSpacing !== undefined) ctx.letterSpacing = v.letterSpacing + "px";
  var label = v.letterSpacing ? "YOUR AD HERE" : "Your ad here";
  ctx.fillText(label, ix + iw / 2, iy + ih * 0.4);

  ctx.strokeStyle = v.accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(ix + iw * 0.36, iy + ih * 0.5);
  ctx.lineTo(ix + iw * 0.64, iy + ih * 0.5);
  ctx.stroke();

  for (var d = 0; d < 5; d++) {
    var x = ix + iw * (0.13 + d * 0.155);
    var yy = iy + ih * 0.83;
    ctx.beginPath();
    ctx.arc(x, yy, iw * 0.011, 0, Math.PI * 2);
    ctx.fillStyle = d === activeDot % 5 ? v.accent : "rgba(255,255,255,0.28)";
    ctx.fill();
  }
}

function makeStrapSet(THREE, W, D, bodyTop, bodyBottom) {
  var group = new THREE.Group();
  var strapMat = new THREE.MeshStandardMaterial({ color: 0x1c1c22, roughness: 0.8 });
  var strapW = W * 0.16;
  var strapThick = 0.045;
  var strapH = bodyTop - bodyBottom + 0.12;
  var z = -D / 2 - strapThick / 2 + 0.01;

  [-1, 1].forEach(function (side) {
    var strap = new THREE.Mesh(new THREE.BoxGeometry(strapW, strapH, strapThick), strapMat);
    strap.position.set(side * W * 0.24, (bodyTop + bodyBottom) / 2, z);
    group.add(strap);

    var buckle = new THREE.Mesh(
      new THREE.BoxGeometry(strapW * 1.15, strapW * 0.65, strapThick * 1.4),
      new THREE.MeshStandardMaterial({ color: 0x2a2a30, roughness: 0.5, metalness: 0.2 })
    );
    buckle.position.set(side * W * 0.24, bodyTop - 0.16, z - 0.005);
    group.add(buckle);
  });

  var yoke = new THREE.Mesh(new THREE.BoxGeometry(W * 0.64, strapThick * 0.8, strapThick), strapMat);
  yoke.position.set(0, bodyTop + 0.02, z);
  group.add(yoke);

  return group;
}

function build(THREE, mount) {
  var reduceMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var width = mount.clientWidth || 380;
  var height = mount.clientHeight || 285;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
  camera.position.set(4.6, 3.1, 6.2);
  camera.lookAt(0, 0.15, 0);

  var renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.className = "hero-3d-canvas";
  mount.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.75));
  var key = new THREE.DirectionalLight(0xffffff, 0.9);
  key.position.set(5, 8, 4);
  scene.add(key);
  var fillLight = new THREE.DirectionalLight(0xffffff, 0.35);
  fillLight.position.set(-4, 2, -3);
  scene.add(fillLight);

  var shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = 256;
  shadowCanvas.height = 256;
  var sctx = shadowCanvas.getContext("2d");
  var grad = sctx.createRadialGradient(128, 128, 10, 128, 128, 128);
  grad.addColorStop(0, "rgba(20,20,26,0.38)");
  grad.addColorStop(0.6, "rgba(20,20,26,0.18)");
  grad.addColorStop(1, "rgba(20,20,26,0)");
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, 256, 256);
  var shadowTex = new THREE.CanvasTexture(shadowCanvas);

  var W = 1.9, D = 1.9, bodyH = 1.95;
  var lidH = 0.17;
  var rig = new THREE.Group();
  scene.add(rig);
  rig.rotation.y = Math.PI * -0.12;

  var shadowMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 4.2),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
  );
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = -lidH / 2 - bodyH / 2 - 0.005;
  scene.add(shadowMesh);

  var bodyGeo = new THREE.BoxGeometry(W, bodyH, D);

  function makeCanvas() {
    var c = document.createElement("canvas");
    c.width = 512;
    c.height = 630;
    return c;
  }
  var faces = [{ canvas: makeCanvas() }, { canvas: makeCanvas() }, { canvas: makeCanvas() }];
  var shared = { idx: 0, t: 0, period: 2.8 };
  var textures = faces.map(function (f) {
    drawFace(f.canvas.getContext("2d"), 512, 630, shared.idx, shared.idx);
    var t = new THREE.CanvasTexture(f.canvas);
    t.needsUpdate = true;
    return t;
  });

  var matScreen1 = new THREE.MeshStandardMaterial({ map: textures[0], roughness: 0.85 });
  var matScreen2 = new THREE.MeshStandardMaterial({ map: textures[1], roughness: 0.85 });
  var matScreen3 = new THREE.MeshStandardMaterial({ map: textures[2], roughness: 0.85 });
  var matBack = new THREE.MeshStandardMaterial({ color: BACK_FACE, roughness: 0.9 });
  var matCap = new THREE.MeshStandardMaterial({ color: 0x0a0a0d, roughness: 0.9 });

  var bodyMaterials = [matScreen1, matScreen2, matCap, matCap, matScreen3, matBack];
  var body = new THREE.Mesh(bodyGeo, bodyMaterials);
  body.position.y = -lidH / 2;
  rig.add(body);

  var bodyTopY = body.position.y + bodyH / 2;
  var bodyBottomY = body.position.y - bodyH / 2;
  var straps = makeStrapSet(THREE, W, D, bodyTopY, bodyBottomY);
  rig.add(straps);

  var rimGeo = new THREE.BoxGeometry(W * 1.015, 0.07, D * 1.015);
  var rimMat = new THREE.MeshStandardMaterial({ color: TRIM, roughness: 0.7 });
  var rim = new THREE.Mesh(rimGeo, rimMat);
  rim.position.y = bodyH / 2 - lidH / 2 - 0.02;
  rig.add(rim);

  function makeTab(w, h, thick) {
    var g = new THREE.BoxGeometry(w, h, thick);
    return new THREE.Mesh(g, rimMat);
  }
  var tabW = W * 0.34, tabH = 0.16, tabT = 0.03;
  var tabFront = makeTab(tabW, tabH, tabT);
  tabFront.position.set(0, rim.position.y - 0.06, D / 2 + tabT / 2 - 0.01);
  rig.add(tabFront);
  var tabBack = makeTab(tabW, tabH, tabT);
  tabBack.position.set(0, rim.position.y - 0.06, -(D / 2 + tabT / 2 - 0.01));
  rig.add(tabBack);
  var tabLeft = makeTab(tabT, tabH, D * 0.34);
  tabLeft.position.set(-(W / 2 + tabT / 2 - 0.01), rim.position.y - 0.06, 0);
  rig.add(tabLeft);
  var tabRight = makeTab(tabT, tabH, D * 0.34);
  tabRight.position.set(W / 2 + tabT / 2 - 0.01, rim.position.y - 0.06, 0);
  rig.add(tabRight);

  var lidPivot = new THREE.Group();
  lidPivot.position.set(0, bodyH / 2, 0);
  rig.add(lidPivot);

  var lidGeo = new THREE.BoxGeometry(W * 1.02, lidH, D * 1.02);
  var lidMat = new THREE.MeshStandardMaterial({ color: INK, roughness: 0.6 });
  var lid = new THREE.Mesh(lidGeo, lidMat);
  lid.position.set(0, 0, 0);
  lidPivot.add(lid);

  var stripGeo = new THREE.BoxGeometry(W * 0.6, 0.03, 0.1);
  var strip = new THREE.Mesh(stripGeo, new THREE.MeshStandardMaterial({ color: PINK_HEX, roughness: 0.5 }));
  strip.position.set(0, lidH / 2 + 0.001, 0);
  lidPivot.add(strip);

  var bodyEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(bodyGeo),
    new THREE.LineBasicMaterial({ color: 0x14141a, transparent: true, opacity: 0.45 })
  );
  bodyEdges.position.copy(body.position);
  rig.add(bodyEdges);

  var lidEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(lidGeo),
    new THREE.LineBasicMaterial({ color: 0x14141a, transparent: true, opacity: 0.45 })
  );
  lid.add(lidEdges);

  // Reduced motion: render a single static frame and stop — no rig
  // rotation, no ad-face cycling, no rAF loop at all. base.css's blanket
  // prefers-reduced-motion rule only zeroes CSS animation/transition
  // durations, which has no effect on a canvas render loop, so this has
  // to be checked explicitly here (mirrors how .ad-slide used to force
  // its own reduced-motion fallback frame in css/advertiser.css).
  if (reduceMotion) {
    renderer.render(scene, camera);
  } else {
    var last = performance.now();
    var animate = function (now) {
      var dt = (now - last) / 1000;
      last = now;

      rig.rotation.y += dt * 0.4;

      shared.t += dt;
      if (shared.t > shared.period) {
        shared.t = 0;
        shared.idx = (shared.idx + 1) % AD_VARIANTS.length;
        faces.forEach(function (f, i) {
          drawFace(f.canvas.getContext("2d"), 512, 630, shared.idx, shared.idx);
          textures[i].needsUpdate = true;
        });
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  var handleResize = function () {
    var w = mount.clientWidth;
    var h = mount.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    if (reduceMotion) {
      renderer.render(scene, camera);
    }
  };
  if (window.ResizeObserver) {
    new ResizeObserver(handleResize).observe(mount);
  } else {
    window.addEventListener("resize", handleResize);
  }
}

/**
 * Builds the scene inside `container` (any element with a defined
 * width/height — see .hero-3d in css/base.css). Loads Three.js from the
 * CDN on first call. Returns a promise that resolves once the first
 * frame has been requested.
 */
export function init(container) {
  return import(THREE_CDN).then(function (THREE) {
    build(THREE, container);
  });
}
