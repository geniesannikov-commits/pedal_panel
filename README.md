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
  lead-form.js        "Book a call" dialog — submits to Supabase (see below)
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

## Lead-capture form (Supabase)

"Book a call" opens an on-site dialog (`.lead-dialog` in `advertiser.html`
and `shop.html`) instead of a mailto: link. Submissions insert a row
directly into a Supabase (Postgres) table from the browser — no backend
server needed. Until it's configured, the form quietly falls back to the
old pre-filled mailto so the CTA still works.

**One-time setup:**

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, open **SQL Editor** and run:

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

   This intentionally creates an *insert-only* policy for the public
   `anon` role — the public key can add rows but can never read, edit,
   or delete them. You view submissions yourself via the Supabase
   dashboard's **Table Editor** (or Authentication + a proper SELECT
   policy, later, if you want an in-app admin view).

3. In **Project Settings → API**, copy the **Project URL** and the
   **anon / public** key (not the `service_role` key — that one must
   never appear in client-side code).
4. Paste both into the two constants at the top of `js/lead-form.js`
   (`SUPABASE_URL`, `SUPABASE_ANON_KEY`), commit, and push.

**Spam:** the form has a hidden honeypot field (`#lead-hp`) — real users
never see or fill it, so a filled honeypot is treated as a bot and
silently dropped client-side without hitting Supabase. If spam becomes a
real problem later, the next step up is a Supabase Edge Function that
checks a CAPTCHA token (e.g. Cloudflare Turnstile, free) before
inserting.

**Free-tier note:** Supabase pauses a free project after ~1 week with no
API activity — a quiet site could need a manual "restore" click in the
dashboard the first time. Real traffic hitting the form (or anyone
visiting the site, once analytics/other calls exist) keeps it awake.

## Deployment

Deployed on Render's free Static Site tier via `render.yaml`, auto-deploying
from the `claude/pedalpanel-marketing-site-eo2fhe` branch.
