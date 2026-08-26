/**
 * Hero frame line — draws itself in on page load.
 * Same stroke-dasharray/dashoffset technique as the shop page's flow-line
 * and the advertiser page's street-loop (Codrops SVG line-draw family),
 * just triggered on load instead of scroll-in, since the hero is already
 * in view when the page opens.
 *
 * The path itself is built here rather than hand-written in the markup:
 * .hero-frame's box (see css/base.css) is tall and non-square, and any
 * fixed viewBox stretched to fit it non-uniformly turns a circular corner
 * into a flattened ellipse. Measuring the real rendered box and setting
 * the viewBox to those exact pixel dimensions keeps 1 unit = 1px, so the
 * arc command below is always a genuine circle regardless of the hero's
 * height at any given breakpoint or headline length.
 */
(function () {
  var svgs = document.querySelectorAll(".hero-frame");
  if (!svgs.length) return;

  var TOP_INSET = 0.03; // fraction of height, matches the hand-drawn reference
  var RIGHT_INSET = 0.03; // fraction of width
  var BOTTOM_INSET = 0.03; // fraction of height
  var LEFT_END = 0.45; // fraction of width — how far left the bottom run reaches
  var MIN_RADIUS = 24;
  var MAX_RADIUS = 56;

  var reduceMotion =
    "matchMedia" in window &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var build = function (svg) {
    var path = svg.querySelector(".hero-frame-path");
    var rect = svg.getBoundingClientRect();
    var w = rect.width;
    var h = rect.height;
    if (!path || !w || !h) return null;

    svg.setAttribute("viewBox", "0 0 " + w + " " + h);

    var insetX = w * RIGHT_INSET;
    var insetY = h * TOP_INSET;
    var bottomInsetY = h * BOTTOM_INSET;
    var rightX = w - insetX;
    var topY = insetY;
    var bottomY = h - bottomInsetY;
    var leftEndX = w * LEFT_END;

    // Radius scaled with viewport width (matches the clamp(24px, 4vw,
    // 56px) the border-radius version used), then capped so it never
    // outgrows the straight runs on either side of the corner.
    var radius = Math.min(
      MAX_RADIUS,
      Math.max(MIN_RADIUS, window.innerWidth * 0.04)
    );
    radius = Math.min(radius, bottomY - topY, rightX - leftEndX);
    if (radius < 0) radius = 0;

    var cornerStartY = bottomY - radius;
    var cornerEndX = rightX - radius;

    var d =
      "M " + rightX + " " + topY +
      " L " + rightX + " " + cornerStartY +
      " A " + radius + " " + radius + " 0 0 1 " + cornerEndX + " " + bottomY +
      " L " + leftEndX + " " + bottomY;

    path.setAttribute("d", d);
    return path;
  };

  var paths = [];
  svgs.forEach(function (svg) {
    var path = build(svg);
    if (path) paths.push(path);
  });

  var arm = function () {
    paths.forEach(function (path) {
      var len = path.getTotalLength();
      if (reduceMotion) {
        // Fully drawn immediately, no animated reveal.
        path.style.setProperty("--hero-frame-len", "0");
        return;
      }
      // Sets the custom property the CSS @keyframes reads its 0% state
      // from (see .hero-frame-path in css/base.css) — stroke-dasharray
      // and the pre-animation stroke-dashoffset both key off the same
      // variable, so the line starts fully hidden.
      path.style.setProperty("--hero-frame-len", len);
    });
  };

  var draw = function () {
    if (reduceMotion) return;
    paths.forEach(function (path) {
      path.classList.add("is-drawing");
    });
  };

  arm();

  if (document.readyState === "complete") {
    draw();
  } else {
    window.addEventListener("load", draw);
  }

  // The hero's height can change after load (font swap, a resized
  // window) — rebuild the path geometry and re-measure its length so
  // stroke-dasharray keeps matching, without touching .is-drawing: the
  // animation's forwards fill already pins stroke-dashoffset at 0 for a
  // hero that's finished revealing, and one that hasn't yet just picks
  // up the new length whenever draw() does fire.
  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      svgs.forEach(function (svg, i) {
        var path = build(svg);
        if (!path) return;
        paths[i] = path;
        path.style.setProperty(
          "--hero-frame-len",
          reduceMotion ? "0" : path.getTotalLength()
        );
      });
    }, 150);
  });
})();
