# Recipe Vault — FIT NIIKITER Agent Brain

## Project
Static single-page app. GitHub Pages + Cloudflare custom domain (fitniikiter.com).
NO backend. NO framework. NO external code dependencies. Always free.

## Files (see .claude/map.md for a "where is X" guide)
- index.html (~57KB) — HTML skeleton only: nav, the 5 pages, modals. Loads the
  four files below. Two tiny inline scripts remain (scroll-top, SW register).
- style.css (~135KB) — ALL CSS. Light-mode overrides use `html.light ...`.
- app.js (~236KB) — ALL app logic + inline reference data (NUT, INGREDIENT_DB,
  CARB_RATIOS, DIETARY_FILTERS, PANTRY_ITEMS, ING_NAME_MAP, CARB_COMPARE,
  PROTEIN_DEFS). Grep the function/const name.
- recipes.js (~590KB) — ALL recipe content: `const R` (recipe cards) and
  `const RECIPE_DETAILS` (full details). This is where recipes live.
- nutrition.js (~46KB) — nutrition lookup DB (NUTRITION_DB, NUTRITION_DISPLAY,
  NUTRITION_CARBS) used by the calculator / nutrition checks.
- manifest.json + sw.js + icon-192.png + icon-512.png + og-image.png + avatar.jpg
  — PWA + social assets. /fonts + fonts.css = self-hosted fonts.
- Per-recipe share previews: /r/<id>/index.html stubs + /og/<id>.png images.
- Standalone pages (not part of the SPA): fat-loss-guide.html, trainingsplan.html,
  model.html.

To edit: UI/style → style.css · app logic → app.js · recipes → recipes.js.
Read only the file you need — that's the whole point of the split.

## Rules — ALWAYS FOLLOW
- Always push directly to main after every change automatically
- All code comments in English
- All recipe content in English (brand names in parentheses ok)
- No external code dependencies ever (fonts/images are hosted content, not code deps)
- Current recipe count: 198 — displayNum runs 1–198 with no gaps, next new one is 199

## Recipe Structure
Split across two objects in recipes.js, both keyed/matched by the same `id`:

R (card, in `const R = [...]`):
{ id, protein, displayNum, carb, time, title, desc, tags[], flavor, hint,
  sideEgg? }

RECIPE_DETAILS (detail, in `const RECIPE_DETAILS = { <id>: {...} }`):
{ image, video, ingredients[{section, items[{name, amt}]}], steps[], hacks[], notes }

⚠ To add/edit a recipe, update BOTH R and RECIPE_DETAILS in recipes.js.

## Creator
FIT NIIKITER — TikTok + YouTube food content creator
