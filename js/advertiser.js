/**
 * Advertiser page interactions:
 * 1. Bar visuals — the reach/cost strip (City-wide, like never before)
 *    and the cost preview (Why this is different) both grow their bars
 *    in from zero when they scroll into view. Same helper drives both.
 * 2. Budget tabs — trivial text swap, no external technique needed.
 * 3. Comparison-card carousel (mobile) — active dot follows scroll
 *    position, rAF-throttled so it doesn't run a handler on every scroll
 *    event. Native scroll-snap does all the actual dragging/settling.
 */
(function () {

  // Bars sit at width:0 in CSS and animate to their data-w on first
  // sight; without IntersectionObserver they're just set immediately.
  var growBarsOnScroll = function (containerId, barSelector) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var bars = container.querySelectorAll(barSelector);
    var growBars = function () {
      bars.forEach(function (bar) {
        bar.style.width = bar.dataset.w;
      });
    };

    if (!("IntersectionObserver" in window)) {
      growBars();
      return;
    }

    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            growBars();
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    obs.observe(container);
  };

  growBarsOnScroll("reach-scale", ".scale-bar");
  growBarsOnScroll("cost-preview", ".cost-bar");

  // Locked pricing spec: $2 per slot-hour, 120 plays per slot-hour
  // (6-second slots, 5 slots per loop). Plays/day = (budget / SLOT_HOUR_RATE)
  // * PLAYS_PER_SLOT_HOUR — computed here rather than hand-typed per tab, so
  // it stays correct if the $20/$40/$80 tiers below ever change.
  var SLOT_HOUR_RATE = 2;
  var PLAYS_PER_SLOT_HOUR = 120;

  var tabs = document.querySelectorAll(".budget-tab");
  var amountEl = document.getElementById("budget-amount");
  var playsEl = document.getElementById("budget-plays");

  var playsForBudget = function (budget) {
    var slotHours = budget / SLOT_HOUR_RATE;
    return Math.round(slotHours * PLAYS_PER_SLOT_HOUR);
  };

  var formatPlays = function (n) {
    return n.toLocaleString("en-AU");
  };

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("is-active");
      });
      tab.classList.add("is-active");
      var budget = Number(tab.dataset.budget);
      amountEl.textContent = budget;
      playsEl.textContent = formatPlays(playsForBudget(budget));
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
