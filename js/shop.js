/**
 * Rental shop page interactions:
 * 1. 3-step flow connector — draws once on scroll-in, same
 *    stroke-dasharray/dashoffset technique as the advertiser page's
 *    street-loop route (Codrops SVG line-draw family), just without the
 *    loop since this is a single mechanism, not a repeating route.
 * 2. Financial-structure slider — one range input driving two linked
 *    fill bars (cost covered / revenue kept). Plain styled
 *    input[type=range], per the brief's fallback where no specific
 *    Codrops range-slider demo was a clean fit.
 */
(function () {
  var flow = document.getElementById("flow-diagram");
  if (flow) {
    var line = flow.querySelector(".flow-line");
    var len = line.getTotalLength();
    line.style.strokeDasharray = len;
    line.style.strokeDashoffset = len;

    var draw = function () {
      line.getBoundingClientRect();
      line.style.strokeDashoffset = "0";
    };

    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              draw();
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );
      obs.observe(flow);
    } else {
      draw();
    }
  }

  var range = document.getElementById("split-range");
  if (range) {
    var costFill = document.getElementById("split-cost-fill");
    var revFill = document.getElementById("split-rev-fill");
    var costValue = document.getElementById("split-cost-value");
    var revValue = document.getElementById("split-rev-value");

    var REV_MIN = 35; // revenue share kept at 0% cost covered ("we supply")
    var REV_MAX = 70; // revenue share kept at 100% cost covered ("you buy")

    var update = function () {
      var cost = Number(range.value);
      var revenue = Math.round(REV_MIN + (cost / 100) * (REV_MAX - REV_MIN));

      range.style.setProperty("--pct", cost + "%");
      costFill.style.width = cost + "%";
      revFill.style.width = revenue + "%";
      costValue.textContent = cost + "%";
      revValue.textContent = revenue + "%";
    };

    range.addEventListener("input", update);
    update();
  }
})();
