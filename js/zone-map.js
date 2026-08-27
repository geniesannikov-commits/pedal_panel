/**
 * Interactive zone map — advertiser.html's "Precision" section.
 *
 * Same IntersectionObserver-gated load as js/hero-3d.js: nothing fetches
 * MapLibre GL (~800KB) or assets/zones.geojson until #zone-map is about
 * to scroll into view. The static .zone-map box (css/advertiser.css)
 * holds the exact layout slot the old placeholder held, so nothing
 * reflows while it loads — and if MapLibre, the tiles, or the fetch
 * fail, the dark panel with its "live zones" tag alone still reads as a
 * finished element, same no-visible-failure contract as the hero visual.
 *
 * MapLibre GL is loaded from esm.sh (a pinned version), the same CDN and
 * pattern js/triple-screen-bike.js already uses for three.js, rather
 * than vendored — one loading convention for every heavy third-party lib
 * this site pulls in.
 *
 * Display-only, per the "Street Signal" language in DESIGN.md: zones sit
 * near-invisible at rest (a hairline outline, a hint of fill) and lift to
 * Signal Pink on hover with a fading/scaling name label. No
 * click-to-assign here — drawing and locking zones is a one-time
 * production step done with the standalone zone-drawing tool, not
 * something a site visitor does; this just displays the current result.
 */
(function () {
  var MAPLIBRE_JS_URL = "https://esm.sh/maplibre-gl@4.7.1";
  var MAPLIBRE_CSS_URL = "https://esm.sh/maplibre-gl@4.7.1/dist/maplibre-gl.css";
  var ZONES_URL = "assets/zones.geojson";
  var OPENFREEMAP_STYLE_URL = "https://tiles.openfreemap.org/styles/dark";
  var PROBE_TIMEOUT_MS = 4000;
  var BBOX_PADDING_DEG = 0.03;

  var container = document.getElementById("zone-map");
  if (!container) return;
  var canvas = document.getElementById("zone-map-canvas");
  var labelEl = document.getElementById("zone-map-label");
  var labelTextEl = document.getElementById("zone-map-label-text");

  var REDUCE_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var PAINT_TRANSITION = { duration: REDUCE_MOTION ? 0 : 140 };

  var FALLBACK_STYLE = {
    version: 8,
    name: "Flat Dark Fallback",
    sources: {},
    layers: [
      { id: "background", type: "background", paint: { "background-color": "#121218" } },
    ],
  };

  function loadCss(href) {
    return new Promise(function (resolve) {
      if (document.querySelector('link[href="' + href + '"]')) {
        resolve();
        return;
      }
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      // Degrade quietly on either outcome — a missing stylesheet shouldn't
      // block the map from attempting to render.
      link.onload = resolve;
      link.onerror = resolve;
      document.head.appendChild(link);
    });
  }

  function probeOpenFreeMap(url, timeoutMs) {
    var controller = new AbortController();
    var timer = setTimeout(function () {
      controller.abort();
    }, timeoutMs);
    return fetch(url, { method: "HEAD", mode: "cors", signal: controller.signal })
      .then(function (res) {
        return res.ok;
      })
      .catch(function () {
        return false;
      })
      .finally(function () {
        clearTimeout(timer);
      });
  }

  // -----------------------------------------------------------------------
  // Polygon centroid (shoelace formula) — just enough geometry to anchor
  // the hover label without pulling in a full geometry library for it.
  // -----------------------------------------------------------------------

  function ringArea(ring) {
    var sum = 0;
    for (var i = 0; i < ring.length - 1; i++) {
      sum += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
    }
    return sum / 2;
  }

  function ringCentroid(ring) {
    var area = ringArea(ring);
    if (Math.abs(area) < 1e-12) {
      var n = ring.length - 1;
      var sx = 0, sy = 0;
      for (var i = 0; i < n; i++) {
        sx += ring[i][0];
        sy += ring[i][1];
      }
      return [sx / n, sy / n];
    }
    var cx = 0, cy = 0;
    for (var i = 0; i < ring.length - 1; i++) {
      var x0 = ring[i][0], y0 = ring[i][1], x1 = ring[i + 1][0], y1 = ring[i + 1][1];
      var cross = x0 * y1 - x1 * y0;
      cx += (x0 + x1) * cross;
      cy += (y0 + y1) * cross;
    }
    var factor = 1 / (6 * area);
    return [cx * factor, cy * factor];
  }

  function geometryCentroid(geom) {
    if (geom.type === "Polygon") return ringCentroid(geom.coordinates[0]);
    if (geom.type === "MultiPolygon") {
      var best = null, bestArea = -Infinity;
      geom.coordinates.forEach(function (poly) {
        var area = Math.abs(ringArea(poly[0]));
        if (area > bestArea) {
          bestArea = area;
          best = poly[0];
        }
      });
      return best ? ringCentroid(best) : null;
    }
    return null;
  }

  function geometryBBox(geom, bbox) {
    (function walk(coords) {
      if (typeof coords[0] === "number") {
        bbox[0] = Math.min(bbox[0], coords[0]);
        bbox[1] = Math.min(bbox[1], coords[1]);
        bbox[2] = Math.max(bbox[2], coords[0]);
        bbox[3] = Math.max(bbox[3], coords[1]);
      } else {
        coords.forEach(walk);
      }
    })(geom.coordinates);
  }

  // -----------------------------------------------------------------------
  // Map init
  // -----------------------------------------------------------------------

  function initMap(maplibregl, zonesData) {
    var zoneCentroids = {};
    var bbox = [Infinity, Infinity, -Infinity, -Infinity];
    zonesData.features.forEach(function (f) {
      f.id = f.properties.zoneId;
      zoneCentroids[f.id] = geometryCentroid(f.geometry);
      geometryBBox(f.geometry, bbox);
    });

    var maxBounds = [
      [bbox[0] - BBOX_PADDING_DEG, bbox[1] - BBOX_PADDING_DEG],
      [bbox[2] + BBOX_PADDING_DEG, bbox[3] + BBOX_PADDING_DEG],
    ];
    var center = [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2];

    probeOpenFreeMap(OPENFREEMAP_STYLE_URL, PROBE_TIMEOUT_MS).then(function (useOpenFreeMap) {
      var map = new maplibregl.Map({
        container: canvas,
        style: useOpenFreeMap ? OPENFREEMAP_STYLE_URL : FALLBACK_STYLE,
        center: center,
        zoom: 12,
        minZoom: 10,
        maxZoom: 16,
        maxBounds: maxBounds,
        attributionControl: true,
        // The map sits inside a normally-scrolling page, not a fullscreen
        // view — cooperative gestures stop an incidental scroll or one-
        // finger touch from getting caught zooming/panning the map.
        cooperativeGestures: true,
      });

      var hoveredZoneId = null;

      function updateLabelPosition() {
        if (hoveredZoneId === null) return;
        var c = zoneCentroids[hoveredZoneId];
        if (!c) return;
        var px = map.project(c);
        labelEl.style.left = px.x + "px";
        labelEl.style.top = px.y + "px";
      }

      function showLabel(feature) {
        labelTextEl.textContent = feature.properties.name;
        labelEl.classList.add("is-visible");
        updateLabelPosition();
      }

      function hideLabel() {
        labelEl.classList.remove("is-visible");
      }

      map.on("load", function () {
        map.addSource("zones", { type: "geojson", data: zonesData });

        // Soft outer glow — the "screen that glows" cue from DESIGN.md's
        // north star, only visible on hover.
        map.addLayer({
          id: "zones-glow",
          type: "line",
          source: "zones",
          paint: {
            "line-color": "#ff2c68",
            "line-width": ["case", ["boolean", ["feature-state", "hover"], false], 12, 0],
            "line-blur": ["case", ["boolean", ["feature-state", "hover"], false], 8, 0],
            "line-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.25, 0],
            "line-width-transition": PAINT_TRANSITION,
            "line-blur-transition": PAINT_TRANSITION,
            "line-opacity-transition": PAINT_TRANSITION,
          },
        });

        // Fill: near-invisible at rest, a quiet presence rather than
        // none, so the zone still reads as a shape before it's touched.
        map.addLayer({
          id: "zones-fill",
          type: "fill",
          source: "zones",
          paint: {
            "fill-color": "#ff2c68",
            "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.22, 0.05],
            "fill-opacity-transition": PAINT_TRANSITION,
          },
        });

        // Outline: a hairline in --dark-line at rest, solid Signal Pink
        // on hover.
        map.addLayer({
          id: "zones-outline",
          type: "line",
          source: "zones",
          paint: {
            "line-color": ["case", ["boolean", ["feature-state", "hover"], false], "#ff2c68", "#2a2a34"],
            "line-width": ["case", ["boolean", ["feature-state", "hover"], false], 2, 1],
            "line-color-transition": PAINT_TRANSITION,
            "line-width-transition": PAINT_TRANSITION,
          },
        });

        map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], { padding: 40, duration: 0 });
        container.classList.add("is-ready");
      });

      map.on("mousemove", "zones-fill", function (e) {
        var feature = e.features && e.features[0];
        if (!feature) return;
        if (feature.id === hoveredZoneId) {
          updateLabelPosition();
          return;
        }
        if (hoveredZoneId !== null) {
          map.setFeatureState({ source: "zones", id: hoveredZoneId }, { hover: false });
        }
        hoveredZoneId = feature.id;
        map.setFeatureState({ source: "zones", id: hoveredZoneId }, { hover: true });
        showLabel(feature);
      });

      map.on("mouseleave", "zones-fill", function () {
        if (hoveredZoneId !== null) {
          map.setFeatureState({ source: "zones", id: hoveredZoneId }, { hover: false });
        }
        hoveredZoneId = null;
        hideLabel();
      });

      map.on("move", function () {
        updateLabelPosition();
      });

      map.on("error", function (e) {
        console.error("PedalPanel: zone map style error", e && e.error);
      });
    });
  }

  function load() {
    Promise.all([
      loadCss(MAPLIBRE_CSS_URL),
      import(/* webpackIgnore: true */ MAPLIBRE_JS_URL),
      fetch(ZONES_URL).then(function (res) {
        if (!res.ok) throw new Error("zones.geojson: HTTP " + res.status);
        return res.json();
      }),
    ])
      .then(function (results) {
        var maplibreModule = results[1];
        var maplibregl = maplibreModule.default || maplibreModule;
        initMap(maplibregl, results[2]);
      })
      .catch(function (err) {
        // Leave the static dark panel + tag in place — no visible
        // failure, same contract as js/hero-3d.js.
        console.error("PedalPanel: zone map failed to load", err);
      });
  }

  if (!("IntersectionObserver" in window)) {
    load();
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          load();
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "200px 0px" }
  );
  observer.observe(container);
})();
