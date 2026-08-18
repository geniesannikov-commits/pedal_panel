/**
 * Advertiser page interactions:
 * 1. Street-loop diagram — draws the route in on scroll (stroke-dasharray/
 *    dashoffset, per Jake Archibald's SVG line-draw technique referenced
 *    from Codrops' SVG tag demos) then starts the CSS motion-path loop.
 * 2. Budget tabs — trivial text swap, no external technique needed.
 */
(function () {
  var diagram = document.getElementById("loop-diagram");
  if (diagram) {
    var route = diagram.querySelector(".loop-route");
    var len = route.getTotalLength();
    route.style.strokeDasharray = len;
    route.style.strokeDashoffset = len;

    var start = function () {
      // Force reflow so the transition actually runs.
      route.getBoundingClientRect();
      route.style.strokeDashoffset = "0";
      window.setTimeout(function () {
        diagram.classList.add("is-looping");
      }, 900);
    };

    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              start();
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.35 }
      );
      obs.observe(diagram);
    } else {
      start();
    }
  }

  var tabs = document.querySelectorAll(".budget-tab");
  var amountEl = document.getElementById("budget-amount");
  var lowEl = document.getElementById("budget-low");
  var highEl = document.getElementById("budget-high");

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("is-active");
      });
      tab.classList.add("is-active");
      amountEl.textContent = tab.dataset.budget;
      lowEl.textContent = tab.dataset.low;
      highEl.textContent = tab.dataset.high;
    });
  });
})();
