# PedalPanel marketing site

Three-page B2B marketing site for PedalPanel (Sydney) — LED ad screens on
e-bike delivery bags. Plain HTML/CSS/JS, no framework, no build step.

## Structure

```
index.html         Landing — fork point (Advertiser / Rental shop)
advertiser.html     For local advertisers
shop.html           For e-bike rental shop owners
css/
  base.css          Shared tokens, type, nav, buttons, reveal utility, footer
  landing.css        Landing-only styles
  advertiser.css      Advertiser-only styles (hero mock, street-loop, coverage map, pricing, comparison table)
  shop.css             Shop-only styles (3-step flow, financial slider, transparency card)
js/
  reveal.js         Shared IntersectionObserver scroll-reveal
  buttons.js        Shared magnetic/cursor-fill CTA hover
  advertiser.js       Street-loop line-draw + loop trigger, budget tabs
  shop.js              3-step flow line-draw, financial-structure slider
assets/
  favicon.svg
render.yaml         Render Static Site blueprint (auto-deploy from this branch)
```

## Local preview

No build step — just serve the directory:

```
python3 -m http.server 8420
# then open http://localhost:8420/index.html
```

## Animation credits

Interaction techniques were sourced from / inspired by Codrops
(tympanus.net/codrops) rather than written from scratch — see the code
comments at each usage site for the specific reference:

- Scroll reveals — IntersectionObserver pattern from Codrops' `scroll` tag demos.
- CTA button hover — magnetic pointer-follow + fill-sweep, adapted from
  Codrops' "Magnetic Buttons" (2020) and button-hover-effects roundups.
- Street-loop diagram (advertiser page) — route line-draw via the classic
  stroke-dasharray/dashoffset technique referenced across Codrops' `svg`
  tag, and the looping bike marker via native CSS `offset-path` /
  `offset-distance`, in the spirit of Codrops' "Animate Anything Along an
  SVG Path" (2022) but without a JS/GSAP dependency.
- 3-step flow (shop page) — same line-draw technique, run once rather than
  looped.
- Financial-structure slider (shop page) — no specific Codrops range-slider
  demo was a clean fit, so per the project brief this is a plain styled
  `input[type=range]` driving two linked fill bars.

## Deployment

Deployed on Render's free Static Site tier via `render.yaml`, auto-deploying
from the `claude/pedalpanel-marketing-site-eo2fhe` branch.
