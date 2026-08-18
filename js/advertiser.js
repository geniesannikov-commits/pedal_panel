/**
 * Advertiser page interactions:
 * 1. City-wide repetition map — generates a field of small pink dots over
 *    the wireframe and twinkles them (randomized per-dot duration/delay
 *    for an asynchronous starfield look), gated behind IntersectionObserver
 *    so it only animates once scrolled into view.
 * 2. Budget tabs — trivial text swap, no external technique needed.
 */
(function () {
  var repeatMap = document.getElementById("repeat-map");
  if (repeatMap) {
    var dotsGroup = document.getElementById("repeat-map-dots");
    var SVG_NS = "http://www.w3.org/2000/svg";
    var DOT_COUNT = 190;
    var W = 760;
    var H = 340;

    for (var i = 0; i < DOT_COUNT; i++) {
      var cx = 30 + Math.random() * (W - 60);
      var cy = 20 + Math.random() * (H - 40);
      var r = 1.4 + Math.random() * 1.3;
      var dot = document.createElementNS(SVG_NS, "circle");
      dot.setAttribute("cx", cx.toFixed(1));
      dot.setAttribute("cy", cy.toFixed(1));
      dot.setAttribute("r", r.toFixed(1));
      dot.setAttribute("class", "repeat-dot");
      dot.style.animationDuration = (1.6 + Math.random() * 2.2).toFixed(2) + "s";
      dot.style.animationDelay = (Math.random() * 3.5).toFixed(2) + "s";
      dotsGroup.appendChild(dot);
    }

    var activate = function () {
      repeatMap.classList.add("is-active");
    };

    if ("IntersectionObserver" in window) {
      var mapObs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              activate();
              mapObs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.25 }
      );
      mapObs.observe(repeatMap);
    } else {
      activate();
    }
  }

  var costPreview = document.getElementById("cost-preview");
  if (costPreview) {
    var costBars = costPreview.querySelectorAll(".cost-bar");
    var growBars = function () {
      costBars.forEach(function (bar) {
        bar.style.width = bar.dataset.w;
      });
    };

    if ("IntersectionObserver" in window) {
      var costObs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              growBars();
              costObs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      costObs.observe(costPreview);
    } else {
      growBars();
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
