---
name: PedalPanel
description: Sydney's e-bike ad network — one signal colour cutting through paper-white.
colors:
  pink: "#ff2c68"
  pink-deep: "#e01259"
  pink-tint: "#ffe4ee"
  pink-tint-2: "#fff0f5"
  ink: "#14141a"
  ink-soft: "#4a4a56"
  ink-faint: "#8b8b98"
  paper: "#ffffff"
  paper-alt: "#faf9fb"
  paper-line: "#ebe9ef"
  dark: "#121218"
  dark-line: "#2a2a34"
  dark-text: "#d7d7de"
  dark-text-soft: "#9a9aa6"
typography:
  display:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 4.6vw, 3.4rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "clamp(1.6rem, 3vw, 2.1rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "clamp(1.15rem, 2.1vw, 1.4rem)"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1.02rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  label:
    fontFamily: "JetBrains Mono, SFMono-Regular, Menlo, monospace"
    fontSize: "0.78rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.08em"
  caption:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "8px"
  md: "14px"
  lg: "22px"
  pill: "100px"
components:
  button-primary:
    backgroundColor: "{colors.pink}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "14px 26px"
  button-primary-hover:
    backgroundColor: "{colors.pink-deep}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "14px 26px"
  button-ghost-hover:
    backgroundColor: "{colors.ink}"
    textColor: "#ffffff"
  button-lg:
    padding: "17px 32px"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "26px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "11px 14px"
  audience-pill:
    backgroundColor: "transparent"
    textColor: "{colors.ink-faint}"
    rounded: "{rounded.pill}"
    padding: "5px 10px"
---

# Design System: PedalPanel

## Overview

**Creative North Star: "Street Signal"**

The product is a screen that glows as it moves through a grey city, and the
site is built the same way: near-white paper, near-black ink, and one
high-voltage pink that behaves like a signal rather than a brand wash. Almost
every surface is uncoloured. What carries colour is what wants your eye — the
thing you can click, the thing that starts a thought, the thing that just
changed state.

The craft register is precise rather than soft. Borders are hairlines, the
easing curve is a single deliberate `cubic-bezier(0.16, 1, 0.3, 1)` shared
across every transition, and the interaction detail is tightly controlled: the
buttons lean toward the cursor on a ±10px clamp and fill with a radial sweep
that originates at the pointer. It should feel like a well-machined instrument
that happens to be friendly, not a soft consumer app.

Because the product is pre-launch, the system also has to be able to show its
own unfinished edges without looking broken. The dashed, hatched zone-map
placeholder is a design element, not a defect — a deliberately unfinished box
that holds its layout slot and says so. That honesty is load-bearing: the
copy's credibility comes from naming limits, and the visual system has to be
able to render a limit without embarrassment.

**Key Characteristics:**

- One accent colour, used as signal rather than decoration
- Paper-white default; dark tone reserved for the footer
- Hairline borders (1px `#ebe9ef`) instead of heavy dividers or fills
- Long, soft, downward shadows that lift objects rather than layering them
- Mono type for labels and eyebrows; geometric sans for display
- A single shared easing curve across every transition on the site

## Colors

A near-monochrome paper-and-ink base with exactly one chromatic voice, plus two
tints of that voice for fields and focus states.

### Primary

- **Signal Pink** (`#ff2c68`): The one chromatic voice. It marks what you can
  act on (primary CTAs), what begins a thought (the eyebrow's 6px dot, the
  statement rule's 3px left border), and what just responded (card hover
  borders, footer link hover). Never a large decorative fill in the current
  implementation.
- **Signal Pink Deep** (`#e01259`): The pressed/deepened partner. It is the
  origin colour of the button's radial fill sweep, the colour of eyebrow
  label text, and the colour of inline emphasis (`.text-pink`) and error text.
- **Signal Pink Tint** (`#ffe4ee`): Focus-ring colour. Used only as a 3px ring
  on focused inputs, where a full-strength pink would be too loud.
- **Signal Pink Tint 2** (`#fff0f5`): The lightest wash, for tinted fields
  where pink needs to be present as an area rather than a mark.

### Neutral

- **Ink** (`#14141a`): Primary text and the ghost button's hover fill. A
  near-black with a faint blue cast, never pure `#000`.
- **Ink Soft** (`#4a4a56`): Body copy inside anchor sections, ledes, and
  inactive nav links. The default reading colour for anything that is not a
  heading.
- **Ink Faint** (`#8b8b98`): Small labels, the audience pill, optional-field
  hints, and swap-card captions. The quietest legible tier.
- **Paper** (`#ffffff`): The default page and card background.
- **Paper Alt** (`#faf9fb`): The barely-there alternate surface — icon wells,
  hover backgrounds on the dialog close button. A tonal shift, not a colour.
- **Paper Line** (`#ebe9ef`): Every hairline border, divider, and input stroke.
- **Dark** (`#121218`) and **Dark Line** (`#2a2a34`): The footer's ground and
  its top border. This is the only dark region in the system.
- **Dark Text** (`#d7d7de`) and **Dark Text Soft** (`#9a9aa6`): Text on the
  dark ground — the near-white/near-Paper pairing that mirrors Ink/Ink Soft's
  role, but tuned for `#121218` instead of white. Dark Text is footer links
  and the transparency card's lede; Dark Text Soft is the footer's own body
  copy. Never pure white on the dark ground, for the same reason Ink is never
  pure black.

### Named Rules

**The Signal Rule.** Pink means *act, begin, or respond*. If a pink element is
none of those three, it is decoration and should be reconsidered. This is why
the eyebrow dot and the statement rule earn colour while section backgrounds
do not.

**The Never-Black Rule.** Text is `#14141a`, not `#000000`; surfaces are
`#ffffff` and `#faf9fb`, and dark regions are `#121218`. The near-blacks carry
a blue cast that keeps the paper from reading as a harsh scan.

**The Tint Escalation Rule.** When pink needs to occupy an area rather than a
mark, escalate down to `pink-tint-2` (`#fff0f5`) or `pink-tint` (`#ffe4ee`) —
never a reduced-opacity full-strength pink, which drifts the hue against the
paper.

## Typography

**Display Font:** Space Grotesk (500/600/700, with Inter and system-ui fallback)
**Body Font:** Inter (400/500/600/700, with system-ui and -apple-system fallback)
**Label/Mono Font:** JetBrains Mono (400/500, with SFMono-Regular and Menlo fallback)

**Character:** Space Grotesk's slightly quirky geometric forms carry the display
voice at tight negative tracking (-0.02em) and near-solid leading (1.08), so
headlines read as compact blocks rather than airy lines. Inter does all the
reading work at generous 1.5–1.65 leading. JetBrains Mono appears only in small
uppercase labels, where it signals "this is a machine-readable marker, not
prose" — the eyebrows and the audience pill.

All three load from Google Fonts with `display=swap` behind a `preconnect` pair.

### Hierarchy

- **Display** (600, `clamp(2.1rem, 4.6vw, 3.4rem)`, 1.08, -0.02em): Page heroes
  only. The shop hero runs a slightly tighter cap (`clamp(2.1rem, 5vw, 2.85rem)`)
  because its headline is longer.
- **Headline** (600, `clamp(1.6rem, 3vw, 2.1rem)`, 1.08, -0.02em): Major section
  headings, established by the closing-grid pattern.
- **Title** (600, `clamp(1.15rem, 2.1vw, 1.4rem)`, 1.4, -0.02em): The
  `.statement` line — the bold scannable sentence inside anchor sections, set
  against a 3px pink left rule at a 34ch maximum.
- **Body** (400, `1.02rem`, 1.65): Anchor-section paragraphs, capped at 46ch.
  The lede variant runs slightly larger (`1.08rem`, 1.6) in Ink Soft.
- **Caption** (400, `0.95rem`, 1.5): The step this system was missing — UI
  chrome and secondary text that reads as interface, not prose: button
  labels, form inputs, card sub-copy that sits under a heading rather than
  carrying the paragraph. This is the reading colour default only when it
  is not already Ink Soft by context.
- **Label** (500, `0.78rem`, 0.08em, uppercase): Eyebrows in Signal Pink Deep,
  preceded by a 6px pink dot. The audience pill runs a smaller cut
  (`0.72rem`, 0.04em) in Ink Faint.

### Named Rules

**The Caption Step Rule.** Text smaller than body but not a mono label uses
the Caption step (`0.95rem`) as its anchor. A handful of components tune
±0.03–0.07rem off that anchor for local rhythm (form error text at
`0.86rem`, input field labels at `0.82rem`) — that is expected local tuning,
not drift, as long as it stays within roughly 0.8–0.98rem of the Caption
anchor and does not invent a size outside that band.

**The Measure Rule.** Reading columns are capped in characters, not pixels:
46ch for body paragraphs, 34ch for statement lines and the landing tagline.
A paragraph that runs wider than its `ch` cap is a bug regardless of viewport.

**The Mono-Means-Marker Rule.** JetBrains Mono is never used for prose. It
appears only in short uppercase labels with positive tracking, where its job is
to look like a tag rather than a sentence.

## Layout

A single centred column, `1160px` maximum, with `24px` inline padding that opens
to `40px` at 700px and up. Vertical rhythm is one fluid value applied to every
section: `clamp(56px, 9vw, 108px)` of block padding, which is what keeps the
long marketing pages breathing consistently without a spacing scale.

There is deliberately **no numeric spacing token scale** in this system. Internal
spacing is set per component (cards at `26px`, fork cards at `30px 26px`, inputs
at `11px 14px`). Future work should follow the component it sits next to rather
than inventing a global scale, unless a scale is introduced deliberately.

The recurring composition is the **anchor grid**: a narrow text column (46ch)
paired with a small supporting diagram card, over a subtle dot-grid and soft
radial glow. It alternates side per section via a reverse modifier so that
consecutive sections do not repeat the same copy-left arrangement.

One section — advertiser.html's zones/geofencing beat — swaps the dot-grid
for a masked **line-grid** backdrop (`.zones-bg`): the same `paper-line`
token, at a coarser 68px pitch, reading as map graph paper rather than a
texture. This is a deliberate, sanctioned variant for content that is
literally about geography, not drift — it never appears outside that one
section, and it stays inside the palette (no new hue, no gradient).

Breakpoints in use, in order of weight: `900px` (the main one-to-two-column
switch, 8 uses), `640px` and below (mobile nav reduction — the audience pill and
cross-link drop out entirely), `700px` (container padding and the landing fork's
two-up), then `760px`, `800px`, and `1024px` for individual components. Mobile
is not a squeezed desktop: the comparison table becomes a scroll-snap card
carousel, and the zone chips become an edge-to-edge swipe strip.

### Named Rules

**The Recomposition Rule.** When a layout does not fit a small screen, change
its composition rather than shrinking it. The precedent is set twice already —
the comparison table becomes a swipeable card per competitor, and the zone chip
row becomes a horizontal strip.

## Elevation & Depth

Surfaces are **flat at rest**. Depth is not used to encode hierarchy or to make
cards permanently float; it appears when an object needs to read as separable
from the page, or as a response to interaction. Every shadow in the system is
long, soft, downward, and low-opacity, with a large negative spread that pulls
the penumbra in tight — never a tight dark drop shadow.

### Shadow Vocabulary

- **Card lift** (`box-shadow: 0 24px 48px -32px rgba(20, 20, 26, 0.25)`): The
  default for diagram cards and swap cards that need to sit above the dot-grid
  background.
- **Nav float** (`box-shadow: 0 24px 48px -30px rgba(20, 20, 26, 0.28)`): The
  sticky navigation's separation from content scrolling beneath it.
- **Hover lift, pink** (`box-shadow: 0 20px 40px -22px rgba(255, 44, 104, 0.35)`):
  The landing fork card's hover, paired with a `-4px` translate and a pink
  border. The only tinted shadow in the system, and the canonical example of
  depth as a *response*.
- **Dialog** (`box-shadow: 0 40px 80px -30px rgba(20, 20, 26, 0.45)`): The
  lead-capture dialog, the deepest shadow in the system.
- **Chip** (`box-shadow: 0 4px 10px rgba(20, 20, 26, 0.18)`): The one short
  shadow, for small elements riding on top of a diagram.
- **Focus ring** (`box-shadow: 0 0 0 3px var(--pink-tint)`): Not depth — a ring
  drawn with the shadow property, paired with a pink border on focused inputs.

### Named Rules

**The Flat-At-Rest Rule.** A surface earns a shadow by being interactive or by
sitting on a textured background. A card on plain paper takes a hairline border
instead.

## Shapes

Three radii carry the whole system, plus a pill. Corners are generous but never
fully soft: `8px` (small — inputs, tight elements), `14px` (medium), and `22px`
(large — the standard card, and the dominant shape on the page). Interactive
pills use `100px`: every button, and the nav audience tag.

Icon wells are the exception that proves the rule — the fork card's icon sits in
a `48px` square at `12px` radius, and the wordmark mark is `38px` at `10px`, so
small square elements stay noticeably crisper than the cards containing them.
The flow-step icon well (`40px` at `10px`) on the how-it-works sections follows
the same exception at its own size.

Progress/fill-bar tracks are a second small-scale exception, at `6px`: the
reach-scale bars on advertiser.html, and the meter-strip and revenue-split
bars on shop.html. All three converged on the same value independently
because an 8–10px-tall bar reads better with a tighter radius than the `8px`
small-scale token gives it — treat `6px` as the bar-track radius, not a value
to round up to `8px`.

Borders are hairlines: `1px solid #ebe9ef` almost everywhere, thickening to
`1.5px` only on the landing fork cards, which are the page's primary action.
The unfinished-component treatment is a dashed border over a hatched muted fill,
holding a `4:3` box with a `340px` minimum.

### Named Rules

**The Hairline Rule.** Structure is drawn with 1px `paper-line`, not with fills
or heavy rules. If a boundary needs more presence than a hairline, the fix is
usually spacing or a shadow, not a thicker border.

## Components

### Buttons

- **Shape:** Full pill (`100px`), `14px 26px` padding, `0.95rem` at weight 600
  in the body font. The large variant runs `17px 32px` at `1rem`.
- **Primary:** Signal Pink ground with white text. Its fill is a radial gradient
  from Signal Pink Deep at the pointer position out to Signal Pink at 60%,
  rendered on a `::before` at `z-index: -1`.
- **Ghost:** Transparent with a `paper-line` border and Ink text; on hover the
  ink fill sweeps in and the text goes white.
- **Hover / Focus:** Both variants translate toward the cursor via `--tx`/`--ty`
  custom properties set in JS (clamped to ±10px), and the fill scales to 1.15.
  Transitions run `0.35s`–`0.45s` on the shared easing curve.

### Cards / Containers

- **Corner Style:** `22px` (large radius).
- **Background:** Paper, on a dot-grid or plain section ground.
- **Shadow Strategy:** Card lift only when sitting on a textured background;
  otherwise the hairline border carries the edge. See Elevation & Depth.
- **Border:** `1px solid #ebe9ef`, or `1.5px` on the landing fork cards.
- **Internal Padding:** `26px` standard; `30px 26px` on fork cards.

### Inputs / Fields

- **Style:** Paper ground, `1px paper-line` stroke, `8px` radius, `11px 14px`
  padding, inheriting the body font at `0.95rem`. Labels sit above at
  `0.82rem` weight 600 in Ink, with optional-field hints in Ink Faint.
- **Focus:** Border shifts to Signal Pink and a `3px` Signal Pink Tint ring is
  drawn via box-shadow. The native outline is removed, so this ring is the only
  focus affordance and must never be dropped.
- **Error:** `0.86rem` in Signal Pink Deep, below the field group.

### Navigation

- **Style:** Sticky, with the nav-float shadow. Links are `0.92rem` in Ink Soft,
  going to Ink on hover over `0.2s`. The audience tag is a mono uppercase pill
  in Ink Faint with a hairline border.
- **Mobile (≤640px):** The audience pill and the secondary cross-link are
  removed outright, leaving wordmark plus primary CTA; the CTA shrinks to
  `10px 18px` at `0.88rem`.

### Eyebrow

The system's most repeated small element: a mono uppercase label at `0.78rem`
with `0.08em` tracking in Signal Pink Deep, preceded by a `6px` pink dot with an
`8px` gap. It opens nearly every section and is the main place the accent colour
appears in body flow.

### Statement

The bold scannable line inside anchor sections: display font at title size, in
Ink, against a `3px` Signal Pink left border with `16px` of padding, capped at
34ch. It is the bridge between a section's eyebrow and its paragraphs.

### Reveal (motion utility)

One shared scroll-reveal, not a bespoke animation per section: `opacity 0` and
`translateY(18px)` resolving over `0.7s` on the shared easing curve, with a
stagger variant at `14px`/`0.6s` and delays from `0.03s` to `0.27s` across five
children. Reduced-motion is honoured in six separate places across the
stylesheets; any new motion must do the same.

### Tinted callout

A sanctioned extension of the Provisional tint-panel allowance: a
`pink-tint-2` ground with a `pink-tint` border and the `.statement` left-rule
motif (`3px solid` Signal Pink) reused as a callout accent rather than a
typographic bridge. Used once — `.zones-founding` on advertiser.html, for the
one piece of copy in a section that needs to visually interrupt the reading
flow ("founding advertiser" pricing note). Follows the Signal Rule: the pink
marks that this callout *begins* a distinct, time-sensitive offer.

### Unfinished-component placeholder

A dashed border over a hatched muted fill, labelled with what is missing
("Interactive zone map — component pending"), holding the real component's
layout box so nothing reflows when it lands. This is a first-class component in
this system, not a temporary hack.

## Do's and Don'ts

### Do:

- **Do** use Signal Pink for action, initiation, or response — CTAs, eyebrow
  dots, statement rules, hover states.
- **Do** draw structure with 1px `#ebe9ef` hairlines before reaching for fills
  or shadows.
- **Do** use the shared `cubic-bezier(0.16, 1, 0.3, 1)` easing for every new
  transition, so motion across the site stays one voice.
- **Do** cap reading columns in `ch` (46ch body, 34ch statements).
- **Do** recompose layouts for small screens rather than shrinking them, as the
  comparison table and zone chips already do.
- **Do** honour `prefers-reduced-motion` for any new motion.
- **Do** render an unfinished feature as a labelled dashed placeholder that
  holds its layout box.

### Don't:

- **Don't** introduce a second accent hue. The system's whole premise is one
  chromatic voice against paper and ink.
- **Don't** drift toward generic SaaS visual language — purple-blue mesh
  gradients, glassmorphism, or floating 3D blobs. Confirmed anti-reference.
- **Don't** adopt outdoor-advertising corporate styling — stock photography,
  heavy sans caps, a blue corporate palette. The product positions *against*
  that industry.
- **Don't** build dark-mode dashboard surfaces with neon accents and data-viz
  chrome. This site is paper-white; the dark tone is footer-only. Confirmed
  anti-reference.
- **Don't** use pure `#000000` or pure-grey neutrals; the palette's near-blacks
  carry a blue cast.
- **Don't** remove the input focus ring — the native outline is already
  suppressed, so the `3px` tint ring is the only focus affordance.
- **Don't** rely on the browser's default `h2` size. Section headings without an
  explicit size fall back to the UA default and flatten the type hierarchy;
  set the headline token instead.
- **Don't** add a per-section bespoke scroll animation. The shared reveal
  utility is the site's motion vocabulary.

### Provisional

The accent may be rationed more freely than the current implementation shows:
tinted section grounds and pink panels drawn from `pink-tint` and `pink-tint-2`
are permitted as the brand matures. This is a deliberate expansion beyond
today's code, not a description of it — the Signal Rule still governs
full-strength `#ff2c68`.
