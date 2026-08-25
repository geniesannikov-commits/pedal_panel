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
  advertiser.css      Advertiser-only styles (hero mock, street-loop, reach/cost strip, zone map placeholder, pricing, comparison table)
  shop.css             Shop-only styles (3-step flow, financial slider, transparency card)
js/
  reveal.js         Shared IntersectionObserver scroll-reveal
  buttons.js        Shared magnetic/cursor-fill CTA hover
  lead-form.js        "Book a call" dialog — submits via Web3Forms (see below)
  advertiser.js       Diagram interactions, budget tabs
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

## Lead-capture form

"Book a call" opens an on-site dialog (`.lead-dialog` in `advertiser.html`
and `shop.html`) instead of a mailto: link. `js/lead-form.js` tries a
submission path in priority order — see the comment at the top of that
file for the current status of each:

1. **Web3Forms** (active once configured) — the browser POSTs straight to
   Web3Forms' API, which emails the submission to `admin@pedalpanel.com`
   server-side. To the visitor this looks like an ordinary form submit —
   no mail client opens, they never leave the page. Free tier (250
   submissions/month), no backend or database of our own.

   **Setup (~2 min):** go to [web3forms.com](https://web3forms.com),
   enter `admin@pedalpanel.com`, and it emails you a free **Access Key**
   instantly (no account needed). Paste it into `WEB3FORMS_ACCESS_KEY` at
   the top of `js/lead-form.js`, commit, and push.

2. **Supabase** (currently disabled, `SUPABASE_ENABLED = false`) — inserts
   a row directly into a Postgres table instead of sending an email. The
   table + RLS policy are correct (verified directly in Postgres), but
   this project's REST/Data API gateway is rejecting the same insert
   regardless of key type — a platform-side issue, not a config problem
   here. Flip `SUPABASE_ENABLED` to `true` once that's resolved with
   Supabase; the table/policy SQL that was run is:

   ```sql
   create table public.leads (
     id uuid primary key default gen_random_uuid(),
     created_at timestamptz not null default now(),
     audience text not null check (audience in ('advertiser', 'shop')),
     page text,
     name text not null,
     email text not null,
     phone text,
     message text
   );

   alter table public.leads enable row level security;

   create policy "Public can submit leads"
   on public.leads
   for insert
   to anon
   with check (true);
   ```

3. **mailto** (last resort) — if neither of the above is configured, the
   CTA falls back to a pre-filled mailto to `admin@pedalpanel.com` so it
   always does *something* even with zero setup.

**Spam:** the form has a hidden honeypot field (`#lead-hp`) — real users
never see or fill it, so a filled honeypot is treated as a bot and
silently dropped client-side without hitting any of the above. Web3Forms
also has its own spam filtering (hCaptcha, etc.) available on their
dashboard if needed later.

## Deployment

Deployed on Render's free Static Site tier via `render.yaml`, auto-deploying
from the `claude/pedalpanel-marketing-site-eo2fhe` branch.
