/**
 * Triple-screen bike+bag — 3D hero visual (Three.js)
 *
 * Extracted from a standalone demo (pedalpanel-bike-with-bag.html): a
 * simplified e-bike (frame, wheels/spokes, fork, cockpit, crank/pedals,
 * rear rack) carrying the same rotating triple-screen delivery bag used
 * in the previous bag-only visual (js/triple-screen-box.js, now retired —
 * both the advertiser and shop pages point here instead). Same "Your ad
 * here" canvas-textured screens, modeled lid, rim trim, velcro tabs and
 * straps as before; now mounted on the bike's rear rack so it reads as a
 * physical object riding through the street, not a floating box.
 *
 * Loading/gating/reduced-motion contract is unchanged from the bag-only
 * module — see js/hero-3d.js for the IntersectionObserver gate, and the
 * reduced-motion branch below for the single-static-frame behavior.
 * Three.js is still loaded from esm.sh, same pinned version.
 *
 * Camera framing: unlike the bag (symmetric in X/Z, so any Y-rotation
 * kept the same apparent width), the bike is long along X and narrow
 * along Z — its on-screen silhouette width changes a lot over a full
 * spin (widest side-on, narrowest nose-on). fitCameraToRig() below
 * accounts for that by sampling the rig's world-space bounding box across
 * a full rotation sweep and framing for the *worst-case* (widest) extent
 * in each axis, so nothing clips at any point in the spin — then backs
 * the camera off by a small, fixed margin factor rather than leaving
 * generic empty space. This replaces the demo's hand-placed fixed camera
 * position, which was tuned for its own 820x560 preview canvas and would
 * under- or over-fill this site's differently-sized/shaped hero slot.
 */

var THREE_CDN = "https://esm.sh/three@0.128.0";

var FRAME_COLOR = 0xdadad6;
var BLACK = 0x16161a;
var DARKGREY = 0x2b2b30;

var PP_INK = 0x14141a;
var PP_BACK_FACE = 0x0a1a21;
var PP_TRIM = 0xc9c7bd;
var PP_PINK_HEX = 0xe11359;

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

function makeTubeBetween(THREE, p1, p2, radius, mat) {
  var dir = new THREE.Vector3().subVectors(p2, p1);
  var len = dir.length();
  var geo = new THREE.CylinderGeometry(radius, radius, len, 12);
  var mesh = new THREE.Mesh(geo, mat);
  var mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
  mesh.position.copy(mid);
  var axis = new THREE.Vector3(0, 1, 0);
  var dirNorm = dir.clone().normalize();
  var quat = new THREE.Quaternion().setFromUnitVectors(axis, dirNorm);
  mesh.quaternion.copy(quat);
  return mesh;
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

function buildBike(THREE) {
  var group = new THREE.Group();
  var frameMat = new THREE.MeshStandardMaterial({ color: FRAME_COLOR, roughness: 0.45, metalness: 0.1 });
  var blackMat = new THREE.MeshStandardMaterial({ color: BLACK, roughness: 0.8 });
  var darkMat = new THREE.MeshStandardMaterial({ color: DARKGREY, roughness: 0.5, metalness: 0.3 });
  var tireMat = new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.9 });

  var wheelR = 0.35;

  var rearAxle = new THREE.Vector3(0, 0.341, 0);
  var frontAxle = new THREE.Vector3(1.325, 0.359, 0);
  var bb = new THREE.Vector3(0.539, 0.310, 0);
  var seatTop = new THREE.Vector3(0.3325, 0.9275, 0);
  var seatTubeBottom = new THREE.Vector3(0.3675, 0.42, 0);
  var headTop = new THREE.Vector3(1.0465, 0.945, 0);
  var headBottom = new THREE.Vector3(1.085, 0.656, 0);
  var rackFrontMount = new THREE.Vector3(0.1925, 0.814, 0);
  var rackRearMount = new THREE.Vector3(-0.271, 0.787, 0);

  [rearAxle, frontAxle].forEach(function (axle, i) {
    var tire = new THREE.Mesh(new THREE.TorusGeometry(wheelR, 0.03, 10, 36), tireMat);
    tire.position.copy(axle);
    group.add(tire);
    var spokeMat = new THREE.MeshStandardMaterial({ color: 0xb9b9bc, metalness: 0.6, roughness: 0.4 });
    var hubSize = i === 1 ? 0.05 : 0.035;
    var spokeCount = 10;
    for (var s = 0; s < spokeCount; s++) {
      var ang = (s / spokeCount) * Math.PI * 2;
      var inner = new THREE.Vector3(axle.x + Math.cos(ang) * hubSize, axle.y + Math.sin(ang) * hubSize, axle.z);
      var outer = new THREE.Vector3(axle.x + Math.cos(ang) * (wheelR - 0.03), axle.y + Math.sin(ang) * (wheelR - 0.03), axle.z);
      group.add(makeTubeBetween(THREE, inner, outer, 0.003, spokeMat));
    }
    var hub = new THREE.Mesh(new THREE.CylinderGeometry(hubSize, hubSize, 0.05, 12), blackMat);
    hub.rotation.x = Math.PI / 2;
    hub.position.copy(axle);
    group.add(hub);
    var rotor = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.006, 6, 20), new THREE.MeshStandardMaterial({ color: 0x9a9a9a, metalness: 0.6, roughness: 0.4 }));
    rotor.position.set(axle.x, axle.y, axle.z - 0.03);
    group.add(rotor);
  });

  var spine = makeTubeBetween(THREE, headBottom, bb, 0.052, frameMat);
  group.add(spine);
  var battery = makeTubeBetween(
    THREE,
    new THREE.Vector3().lerpVectors(headBottom, bb, 0.12),
    new THREE.Vector3().lerpVectors(headBottom, bb, 0.85),
    0.056, darkMat
  );
  group.add(battery);

  group.add(makeTubeBetween(THREE, rearAxle, seatTubeBottom, 0.02, frameMat));
  group.add(makeTubeBetween(THREE, rearAxle, bb, 0.02, frameMat));

  group.add(makeTubeBetween(THREE, headTop, headBottom, 0.028, frameMat));
  group.add(makeTubeBetween(THREE, headBottom, frontAxle, 0.024, frameMat));

  group.add(makeTubeBetween(THREE, seatTubeBottom, seatTop, 0.017, blackMat));
  var saddle = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.045, 0.14), blackMat);
  saddle.position.set(seatTop.x - 0.04, seatTop.y + 0.02, 0);
  saddle.rotation.z = -0.05;
  group.add(saddle);

  var stemTop = new THREE.Vector3(headTop.x - 0.01, headTop.y + 0.10, 0);
  group.add(makeTubeBetween(THREE, headTop, stemTop, 0.018, blackMat));
  var barL = new THREE.Vector3(stemTop.x - 0.02, stemTop.y + 0.01, -0.22);
  var barR = new THREE.Vector3(stemTop.x - 0.02, stemTop.y + 0.01, 0.22);
  group.add(makeTubeBetween(THREE, barL, barR, 0.014, blackMat));
  [barL, barR].forEach(function (p) {
    var grip = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.075, 10), blackMat);
    grip.rotation.x = Math.PI / 2;
    grip.position.copy(p);
    group.add(grip);
    var cluster = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.035, 0.045), blackMat);
    cluster.position.set(p.x + 0.02, p.y + 0.015, p.z * 0.82);
    group.add(cluster);
  });
  var headlight = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 10), new THREE.MeshStandardMaterial({ color: 0xe8e8e0, roughness: 0.3 }));
  headlight.position.set(headTop.x + 0.025, headTop.y - 0.03, 0);
  group.add(headlight);

  var chainguard = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 20), blackMat);
  chainguard.rotation.x = Math.PI / 2;
  chainguard.position.set(bb.x, bb.y, bb.z + 0.06);
  group.add(chainguard);
  var pedalAxle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.28, 10), blackMat);
  pedalAxle.rotation.x = Math.PI / 2;
  pedalAxle.position.copy(bb);
  group.add(pedalAxle);
  [-1, 1].forEach(function (s) {
    var vertDir = s;
    var armStart = new THREE.Vector3(bb.x, bb.y, bb.z + s * 0.11);
    var armEnd = new THREE.Vector3(bb.x + s * 0.04, bb.y + vertDir * 0.24, bb.z + s * 0.11);
    group.add(makeTubeBetween(THREE, armStart, armEnd, 0.015, blackMat));
    var pedal = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.018, 0.06), blackMat);
    pedal.position.copy(armEnd);
    pedal.position.y += vertDir * -0.012;
    group.add(pedal);
  });

  var rackTopY = 0.834;
  var rackFrontX = -0.29;
  var rackBackX = 0.19;
  var deckMat = new THREE.MeshStandardMaterial({ color: 0xcfa76a, roughness: 0.7 });
  var railMat = new THREE.MeshStandardMaterial({ color: 0xd8d8d4, roughness: 0.5, metalness: 0.4 });

  var deck = new THREE.Mesh(new THREE.BoxGeometry(rackBackX - rackFrontX, 0.012, 0.24), deckMat);
  deck.position.set((rackFrontX + rackBackX) / 2, rackTopY, 0);
  group.add(deck);
  [-1, 1].forEach(function (s) {
    var rail = makeTubeBetween(
      THREE,
      new THREE.Vector3(rackFrontX, rackTopY + 0.008, s * 0.12),
      new THREE.Vector3(rackBackX, rackTopY + 0.008, s * 0.12),
      0.006, railMat
    );
    group.add(rail);
  });
  group.add(makeTubeBetween(THREE, new THREE.Vector3(rackFrontX, rackTopY, 0), rackFrontMount, 0.012, railMat));
  group.add(makeTubeBetween(THREE, new THREE.Vector3(rackBackX, rackTopY, 0), rearAxle, 0.012, railMat));
  group.add(makeTubeBetween(THREE, new THREE.Vector3(rackFrontX, rackTopY, 0.1), rearAxle, 0.01, railMat));
  group.add(makeTubeBetween(THREE, new THREE.Vector3(rackFrontX, rackTopY, -0.1), rearAxle, 0.01, railMat));

  group.userData.rackTopY = rackTopY;
  group.userData.rackCenterX = (rackFrontX + rackBackX) / 2;
  return group;
}

// Returns { group, update(dt) } — group is the bag ready to be positioned/
// scaled by the caller; update(dt) advances the shared ad-rotation timer.
function buildBag(THREE) {
  var group = new THREE.Group();
  var W = 1.9, D = 1.9, bodyH = 1.95;
  var lidH = 0.17;

  var bodyGeo = new THREE.BoxGeometry(W, bodyH, D);

  function makeCanvas() {
    var c = document.createElement("canvas");
    c.width = 512;
    c.height = 630;
    return c;
  }
  var faces = [{ canvas: makeCanvas() }, { canvas: makeCanvas() }, { canvas: makeCanvas() }];
  var shared = { idx: 1, t: 0, period: 2.8 };
  var textures = faces.map(function (f) {
    drawFace(f.canvas.getContext("2d"), 512, 630, shared.idx, shared.idx);
    var t = new THREE.CanvasTexture(f.canvas);
    t.needsUpdate = true;
    return t;
  });

  var matScreen1 = new THREE.MeshStandardMaterial({ map: textures[0], roughness: 0.85 });
  var matScreen2 = new THREE.MeshStandardMaterial({ map: textures[1], roughness: 0.85 });
  var matScreen3 = new THREE.MeshStandardMaterial({ map: textures[2], roughness: 0.85 });
  var matBack = new THREE.MeshStandardMaterial({ color: PP_BACK_FACE, roughness: 0.9 });
  var matCap = new THREE.MeshStandardMaterial({ color: 0x0a0a0d, roughness: 0.9 });

  var bodyMaterials = [matScreen1, matScreen2, matCap, matCap, matScreen3, matBack];
  var body = new THREE.Mesh(bodyGeo, bodyMaterials);
  body.position.y = -lidH / 2;
  group.add(body);

  var bodyTopY = body.position.y + bodyH / 2;
  var bodyBottomY = body.position.y - bodyH / 2;
  group.add(makeStrapSet(THREE, W, D, bodyTopY, bodyBottomY));

  var rimGeo = new THREE.BoxGeometry(W * 1.015, 0.07, D * 1.015);
  var rimMat = new THREE.MeshStandardMaterial({ color: PP_TRIM, roughness: 0.7 });
  var rim = new THREE.Mesh(rimGeo, rimMat);
  rim.position.y = bodyH / 2 - lidH / 2 - 0.02;
  group.add(rim);

  function makeTab(w, h, thick) {
    return new THREE.Mesh(new THREE.BoxGeometry(w, h, thick), rimMat);
  }
  var tabW = W * 0.34, tabH = 0.16, tabT = 0.03;
  var tabFront = makeTab(tabW, tabH, tabT);
  tabFront.position.set(0, rim.position.y - 0.06, D / 2 + tabT / 2 - 0.01);
  group.add(tabFront);
  var tabBack = makeTab(tabW, tabH, tabT);
  tabBack.position.set(0, rim.position.y - 0.06, -(D / 2 + tabT / 2 - 0.01));
  group.add(tabBack);
  var tabLeft = makeTab(tabT, tabH, D * 0.34);
  tabLeft.position.set(-(W / 2 + tabT / 2 - 0.01), rim.position.y - 0.06, 0);
  group.add(tabLeft);
  var tabRight = makeTab(tabT, tabH, D * 0.34);
  tabRight.position.set(W / 2 + tabT / 2 - 0.01, rim.position.y - 0.06, 0);
  group.add(tabRight);

  var lidGeo = new THREE.BoxGeometry(W * 1.02, lidH, D * 1.02);
  var lidMat = new THREE.MeshStandardMaterial({ color: PP_INK, roughness: 0.6 });
  var lid = new THREE.Mesh(lidGeo, lidMat);
  lid.position.set(0, bodyH / 2, 0);
  group.add(lid);

  var stripGeo = new THREE.BoxGeometry(W * 0.6, 0.03, 0.1);
  var strip = new THREE.Mesh(stripGeo, new THREE.MeshStandardMaterial({ color: PP_PINK_HEX, roughness: 0.5 }));
  strip.position.set(0, bodyH / 2 + lidH / 2 + 0.001, 0);
  group.add(strip);

  var bodyEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(bodyGeo),
    new THREE.LineBasicMaterial({ color: 0x14141a, transparent: true, opacity: 0.45 })
  );
  bodyEdges.position.copy(body.position);
  group.add(bodyEdges);
  var lidEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(lidGeo),
    new THREE.LineBasicMaterial({ color: 0x14141a, transparent: true, opacity: 0.45 })
  );
  lidEdges.position.copy(lid.position);
  group.add(lidEdges);

  function update(dt) {
    shared.t += dt;
    if (shared.t > shared.period) {
      shared.t = 0;
      shared.idx = (shared.idx + 1) % AD_VARIANTS.length;
      faces.forEach(function (f, i) {
        drawFace(f.canvas.getContext("2d"), 512, 630, shared.idx, shared.idx);
        textures[i].needsUpdate = true;
      });
    }
  }

  return { group: group, update: update };
}

/**
 * Frames `camera` on `rig` tightly with a small fixed margin, safe against
 * clipping at any point in a full 360° spin around the Y axis.
 *
 * A simpler first version of this compared the rig's world-space
 * axis-aligned bounding box width/height directly against the camera's
 * horizontal/vertical FOV tangents. That undersells how much distance is
 * actually needed: the camera sits off-axis (elevated, offset in Z), so
 * points far from the rotation axis change *depth* as the rig spins, and
 * under perspective a point looming closer reads larger on screen than
 * its plain world-space Y/X extent implies — measured directly against
 * real renders, that mismatch left the model touching the frame edges at
 * several rotation angles instead of holding the intended margin.
 *
 * This version instead projects the actual bounding-box corners (8 per
 * sampled rotation angle) into camera-local space and binary-searches the
 * minimum distance, along the fixed viewing direction, at which every
 * corner's required tangent (|x|/-z and |y|/-z) still sits inside the
 * camera's actual FOV tangent — the same test the GPU's own frustum
 * culling does, just solved for distance instead of applied per-frame.
 * `marginFactor` then scales that exact-fit distance by a known,
 * predictable amount (1.1 ≈ 91% fill on the tightest axis at the worst
 * rotation angle) instead of an amount that only held on paper.
 */
function fitCameraToRig(THREE, camera, rig, marginFactor) {
  var originalRotY = rig.rotation.y;
  var box = new THREE.Box3();
  var sampleCount = 48;
  var corners = [];

  for (var i = 0; i < sampleCount; i++) {
    rig.rotation.y = (i / sampleCount) * Math.PI * 2;
    rig.updateMatrixWorld(true);
    box.setFromObject(rig);
    var min = box.min, max = box.max;
    for (var cx = 0; cx < 2; cx++) {
      for (var cy = 0; cy < 2; cy++) {
        for (var cz = 0; cz < 2; cz++) {
          corners.push(new THREE.Vector3(
            cx ? max.x : min.x,
            cy ? max.y : min.y,
            cz ? max.z : min.z
          ));
        }
      }
    }
  }

  // Center reference taken at the original (rotation 0) pose — recentering
  // already done by the caller means this sits close to the rig's own
  // origin regardless of rotation, so using one sample is enough for the
  // lookAt target.
  rig.rotation.y = originalRotY;
  rig.updateMatrixWorld(true);
  box.setFromObject(rig);
  var center = box.getCenter(new THREE.Vector3());

  // Same viewing direction as the original demo's hand-placed camera
  // (slightly elevated, mostly frontal) — only the distance is data-driven.
  var direction = new THREE.Vector3(0, 0.2, 5.6).normalize();

  var vFov = camera.fov * (Math.PI / 180);
  var hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
  var tanV = Math.tan(vFov / 2);
  var tanH = Math.tan(hFov / 2);

  var up = new THREE.Vector3(0, 1, 0);
  var viewMatrix = new THREE.Matrix4();
  var camPos = new THREE.Vector3();
  var rel = new THREE.Vector3();

  function fitsAtDistance(distance) {
    camPos.copy(center).addScaledVector(direction, distance);
    viewMatrix.lookAt(camPos, center, up);
    var quat = new THREE.Quaternion().setFromRotationMatrix(viewMatrix);
    var invQuat = quat.clone().invert();

    for (var k = 0; k < corners.length; k++) {
      rel.copy(corners[k]).sub(camPos).applyQuaternion(invQuat);
      var negZ = Math.max(-rel.z, 0.001);
      if (Math.abs(rel.x) / negZ > tanH) return false;
      if (Math.abs(rel.y) / negZ > tanV) return false;
    }
    return true;
  }

  // Binary search: fitsAtDistance() is monotonic (more distance never
  // makes it fit worse), so a fixed iteration count converges reliably
  // without needing an analytic starting bound.
  var lo = 0.1;
  var hi = 100;
  for (var iter = 0; iter < 40; iter++) {
    var mid = (lo + hi) / 2;
    if (fitsAtDistance(mid)) {
      hi = mid;
    } else {
      lo = mid;
    }
  }
  var distance = hi * marginFactor;

  camera.position.copy(center).addScaledVector(direction, distance);
  camera.lookAt(center);

  return { center: center, distance: distance };
}

function build(THREE, mount) {
  var reduceMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var width = mount.clientWidth || 380;
  var height = mount.clientHeight || 285;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 100);

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

  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  var key = new THREE.DirectionalLight(0xffffff, 0.8);
  key.position.set(5, 8, 4);
  scene.add(key);
  var fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
  fillLight.position.set(-4, 2, -3);
  scene.add(fillLight);

  // No ground-shadow plane here (the demo had one, sized 6.5x4 units for
  // its own looser camera). With fitCameraToRig()'s much tighter framing,
  // that plane's edge fell inside the visible frame before its gradient
  // faded to alpha 0 — instead of a soft contact shadow it read as a
  // faint grey rectangle across the bottom of the canvas, visibly
  // mismatched against the page's white background (confirmed by
  // compositing the render over a contrasting color: a solid ~15-35
  // alpha band ran the full width of the bottom edge). Retuning the
  // plane's size to this specific camera fit would just as easily break
  // again on the next framing change, so the scene renders on true
  // transparency instead — nothing here to fall out of sync with the
  // page background.

  var rig = new THREE.Group();
  var bike = buildBike(THREE);
  bike.position.x = -0.6625; // recenter so the bike spins around its own middle, not the rear axle
  rig.add(bike);
  rig.position.x = 0.6625;
  scene.add(rig);

  var BAG_SCALE = 0.30;
  var bagResult = buildBag(THREE);
  var bagGroup = bagResult.group;
  bagGroup.scale.set(BAG_SCALE, BAG_SCALE, BAG_SCALE);
  bagGroup.rotation.y = -Math.PI / 2; // straps face the seat/rider, screens face outward

  var localBottom = -0.17 / 2 - 1.95 / 2; // matches lidH/bodyH inside buildBag
  bagGroup.position.set(
    bike.userData.rackCenterX - 0.08,
    bike.userData.rackTopY + (-localBottom) * BAG_SCALE,
    0
  );
  bike.add(bagGroup);

  // Tight, rotation-safe framing instead of the demo's fixed camera
  // position (tuned for its own preview canvas) — see fitCameraToRig().
  // 1.02 is a small safety buffer above the exact-fit distance the
  // binary search finds, not a deliberate breathing-room margin: this
  // geometry's single farthest-flung point at its worst rotation angle
  // (a spoke tip, pedal corner — not the bike's visual mass) already
  // defines a fairly tight frame at the exact fit, and anything looser
  // than ~1.0 here measurably clips that point at some angle in the
  // spin. The bike's bulk sits well inside that boundary throughout the
  // rotation; only a couple of thin extremities ever reach it.
  fitCameraToRig(THREE, camera, rig, 1.02);

  if (reduceMotion) {
    renderer.render(scene, camera);
  } else {
    var last = performance.now();
    var animate = function (now) {
      var dt = (now - last) / 1000;
      last = now;
      rig.rotation.y += dt * 0.4;
      bagResult.update(dt);
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
