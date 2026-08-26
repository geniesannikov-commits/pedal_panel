# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two primary audiences of equal priority, reached through a fork on the landing
page. Neither page is subordinate to the other.

- **Local Sydney advertisers** — owners and marketers at neighbourhood
  businesses who want physical, repeated visibility near their customers but
  cannot justify a billboard contract or an agency retainer. Their alternative
  today is a modest social campaign, a letterbox drop, or nothing.
- **E-bike rental shop owners** — Sydney shops renting e-bikes to delivery
  riders, looking for a second income stream from a fleet that is already on
  the road, without adding a product to sell or a service to manage.

Delivery riders are affected but are not the customer. They work for Uber Eats,
DoorDash and similar platforms, and PedalPanel does not change how they work.

## Product Purpose

PedalPanel puts a small LED advertising screen on the delivery bags already
carried by working e-bike riders, turning existing delivery traffic into a
moving advertising network across Sydney. Advertisers buy repeated local
exposure; rental shops earn a share of that advertising revenue on hours their
fleet is already riding.

The site's job is to explain the mechanism to each audience and book a
conversation. Success is a submitted "Book a call" enquiry, not a self-serve
signup — there is no purchase flow.

## Positioning

Physical advertising has never scaled city-wide affordably; only digital has.
PedalPanel is the claim that those two things are no longer a trade-off:
physical, moving, repeated presence across a whole city at a cost closer to a
modest social campaign than a billboard network.

The mechanism a neighbouring product could not truthfully copy: PedalPanel does
not add riders, bikes, or routes. It equips bags already in motion — a five-minute
swap on a rider's existing bag — and funds the fleet side by revenue-sharing with
the rental shops that own the bikes, which lets those shops offer riders a
cheaper rental tier funded by advertisers rather than their own margin.

## Operating Context

- Riders do ordinary delivery runs; the screen rotates ads for the whole ride.
- Bag swap takes about five minutes — same insulation, same size, same rider
  experience.
- **Advertiser side:** the advertiser sets a daily budget and nothing else.
  Spend is paced across the day and weighted toward lunch and evening. Ads run
  in continuous rotation alongside a small number of other advertisers. Billing
  covers only time the ad is verifiably live and moving, tracked from the
  screen's own GPS; unused budget is not charged.
- **Targeting:** city-wide by default, with campaigns pointable at zones. Today
  those zones are four broad districts — North Sydney + Chatswood, CBD through
  Darling Harbour to Central, Kings Cross + the east, and the south. Zone
  precision follows fleet density and is expected to split finer as the fleet
  grows.
- **Shop side:** advertising revenue is pooled across the fleet and paid out on
  hours actually ridden. An idle bike earns nothing and costs nothing.
  PedalPanel handles advertiser sales, campaigns, and billing. Shops start with
  a small trial on a handful of bikes rather than committing a whole fleet.

## Capabilities and Constraints

- Three-page static site: landing fork, advertiser, rental shop. Plain
  HTML/CSS/JS — no framework, no build step. This is a durable constraint, not
  an accident of stage.
- Deployed on Render's free static tier via `render.yaml`, auto-deploying from
  `claude/pedalpanel-marketing-site-eo2fhe`, serving `pedalpanel.com` and
  `www.pedalpanel.com`, with rewrites for `/advertiser` and `/shop`.
- Pricing model constants are locked in `js/advertiser.js`: $2 per slot-hour and
  120 plays per slot-hour, with budget tiers of $20/$40/$80 per day. Plays-per-day
  is derived from those constants, never hand-typed, so the figure stays correct
  if tiers change.
- The shop revenue split is a negotiated spectrum, not a fixed rate. Its two
  named endpoints: the shop buys the screens upfront and keeps the larger share,
  or PedalPanel supplies the screens and keeps the larger share. The exact split
  is deliberately undecided and settled per shop.
- No fixed dollar figure is promised to shops. What is guaranteed is the payout
  calculation and full visibility into the shop's own fleet data — hours ridden,
  revenue generated, rate paid — checkable against their records.
- Lead capture is an on-site dialog, not a mailto link. `js/lead-form.js` tries
  Web3Forms first (active once `WEB3FORMS_ACCESS_KEY` is set), then Supabase
  (disabled — `SUPABASE_ENABLED = false`, blocked by a platform-side REST gateway
  issue, table and RLS policy already verified), then a pre-filled mailto to
  `admin@pedalpanel.com` as last resort. A hidden honeypot (`#lead-hp`) drops
  bot submissions client-side.
- The interactive zone map does not exist yet. Its slot is an intentionally
  unfinished placeholder holding a 4:3 / 340px-min box so the page will not
  reflow when the real component lands.
- The hero on both inner pages is a three.js e-bike with the triple-screen bag,
  lazy-gated behind an IntersectionObserver so three.js is not fetched until it
  scrolls near-viewport.
- Undecided product facts: launch date, fleet size, screen hardware supplier,
  first shop partners, and advertiser roster.

## Brand Commitments

- Name: **PedalPanel**, a Leddrive Media company. Contact `admin@pedalpanel.com`,
  domain `pedalpanel.com`.
- Australian English throughout (neighbourhood, centre). Sydney-scoped — never
  imply national coverage the fleet does not have.
- Voice is plain, concrete, and unhyped. The site consistently names its own
  limits in its own headings: "Full transparency, no guarantees", "Hyper-local —
  on the way", "Interactive zone map — component pending". Preserve that habit;
  it is the brand's credibility mechanism, not a placeholder for confidence.
- Assets on hand: `assets/logo.svg`, `assets/logo.png`, `assets/favicon.svg`,
  `assets/favicon.png`.
- Interaction techniques are credited to Codrops in the README and at each usage
  site. Keep attributing borrowed technique.

## Evidence on Hand

Real and usable: the mechanism description, the pricing model and its constants,
the four zone district names, the revenue-share structure, contact details, and
the logo and favicon assets.

Deliberately absent — future work must not fabricate these:

- No customers, no testimonials, no case studies, no press, no partner logos.
- No performance data, no fleet-size numbers, no impression or reach counts.
- No earnings figures for shops and no results figures for advertisers.

Every number currently shown is labelled as illustrative, and cost comparisons
are symbolic ($–$$$$) specifically to avoid inventing dollar figures. The
"was $59 → $45 per week" rental example and the 50%/53% slider readout are
illustrations of a structure, not quoted rates.

PedalPanel is **pre-launch**: no screens are on the road yet. Copy may describe
how the product works and what is being built, but must not describe it as
operating.

## Product Principles

1. **Never invent proof.** Where evidence does not exist, state the absence or
   show the structure symbolically. An empty slot is more credible than a
   plausible fiction.
2. **Both sides are peers.** Advertiser and shop are equally the bottleneck
   pre-launch; neither page gets designed as the secondary one.
3. **Equip what already moves.** No new riders, no new bikes, no change to how
   a rider works — the product's whole economics depend on this and the copy
   should keep saying it plainly.
4. **Hedge claims deliberately.** Reach and earnings talk carries advertising
   and consumer-law exposure. Conservative, verifiable framing is a
   requirement, not timidity.
5. **Show the unfinished edges.** A visible placeholder, a named limitation, or
   a "still being drawn" admission is the house style and earns more trust than
   polish over a gap.
