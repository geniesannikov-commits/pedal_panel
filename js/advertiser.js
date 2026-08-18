/**
 * Advertiser page interactions:
 * 1. Cost-preview bars (Why this is different) — grow in on scroll.
 * 2. Budget tabs — trivial text swap, no external technique needed.
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
})();
