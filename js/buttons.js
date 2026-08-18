/**
 * Subtle magnetic + cursor-follow fill for primary/ghost buttons.
 * Technique adapted from Codrops' magnetic-button family
 * (tympanus.net/codrops/2020/08/05/magnetic-buttons/): translate the
 * button a few px toward the pointer and move a radial-gradient fill to
 * the cursor position via CSS custom properties. Clamped small so it
 * reads as "considered" rather than gimmicky; no external library.
 */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  var MAX_PULL = 8;

  document.querySelectorAll(".btn").forEach(function (btn) {
    btn.addEventListener("mousemove", function (e) {
      var rect = btn.getBoundingClientRect();
      var mx = e.clientX - rect.left;
      var my = e.clientY - rect.top;
      var relX = mx / rect.width - 0.5;
      var relY = my / rect.height - 0.5;

      btn.style.setProperty("--mx", mx + "px");
      btn.style.setProperty("--my", my + "px");
      btn.style.setProperty("--tx", (relX * MAX_PULL * 2).toFixed(1) + "px");
      btn.style.setProperty("--ty", (relY * MAX_PULL * 2).toFixed(1) + "px");
    });

    btn.addEventListener("mouseleave", function () {
      btn.style.setProperty("--tx", "0px");
      btn.style.setProperty("--ty", "0px");
    });
  });
})();
