/**
 * Scroll-reveal utility.
 * Adapted from the IntersectionObserver-driven reveal pattern used across
 * Codrops' scroll-effects demos (tympanus.net/codrops/tag/scroll/) —
 * toggle a class when an element enters the viewport, let CSS transitions
 * do the rest. Deliberately restrained: one fade/slide, reused everywhere.
 */
(function () {
  var targets = document.querySelectorAll(".reveal, .reveal-stagger");
  if (!targets.length) return;

  if (!("IntersectionObserver" in window)) {
    targets.forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
  );

  targets.forEach(function (el) {
    observer.observe(el);
  });
})();
