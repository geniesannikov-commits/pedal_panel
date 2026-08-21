/**
 * Hero 3D loading gate.
 * Same IntersectionObserver-first-then-act shape as js/reveal.js, but
 * gating a dynamic import() + WebGL scene construction instead of a CSS
 * class toggle: nothing under [data-hero-3d] fetches three.js or creates
 * a renderer until the container is about to scroll into view. Each
 * container already holds a static .hero-3d-placeholder box (see
 * css/base.css); the canvas js/triple-screen-box.js appends stacks on
 * top of it once ready, so there's no layout shift and a harmless
 * placeholder stays visible if the module fails to load.
 */
(function () {
  var containers = document.querySelectorAll("[data-hero-3d]");
  if (!containers.length) return;

  var load = function (el) {
    import("./triple-screen-box.js")
      .then(function (mod) {
        return mod.init(el);
      })
      .catch(function (err) {
        // Leave the static placeholder in place — no visible failure.
        console.error("PedalPanel: hero 3D visual failed to load", err);
      });
  };

  if (!("IntersectionObserver" in window)) {
    containers.forEach(load);
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          load(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "200px 0px", threshold: 0.1 }
  );

  containers.forEach(function (el) {
    observer.observe(el);
  });
})();
