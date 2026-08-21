/**
 * Advertiser page interactions:
 * 1. Cost-preview bars (Why this is different) — grow in on scroll.
 * 2. Budget tabs — trivial text swap, no external technique needed.
 * 3. Comparison-card carousel (mobile) — active dot follows scroll
 *    position, rAF-throttled so it doesn't run a handler on every scroll
 *    event. Native scroll-snap does all the actual dragging/settling.
 */
(function () {

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

  var track = document.getElementById("compare-cards-track");
  var dots = document.getElementById("compare-cards-dots");
  if (track && dots) {
    var dotEls = dots.querySelectorAll("span");
    var ticking = false;

    var updateActiveDot = function () {
      ticking = false;
      var cards = track.querySelectorAll(".compare-card");
      var trackCenter = track.scrollLeft + track.clientWidth / 2;
      var closest = 0;
      var closestDist = Infinity;
      cards.forEach(function (card, i) {
        var cardCenter = card.offsetLeft + card.offsetWidth / 2;
        var dist = Math.abs(cardCenter - trackCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });
      dotEls.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === closest);
      });
    };

    track.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateActiveDot);
      }
    });
  }
})();
