# Recipe Vault — FIT NIIKITER Agent Brain

## Project
Static single-page app. GitHub Pages + Cloudflare custom domain.
NO backend. NO framework. NO external dependencies. Always free.

## Files
- index.html (~830KB) — all app logic, CSS, HTML (data loaded via <script> tags)
- recipes.js (~593KB) — all 199 recipes (R[] cards + RECIPE_DETAILS{})
- nutrition.js (~45KB) — USDA nutrition database (per 100g) + ING_NAME_MAP
- trainingsplan.html (~36KB) — standalone training plan page

## Rules — ALWAYS FOLLOW
- Always push directly to main after every change automatically
- All code comments in English
- All recipe content in English (brand names in parentheses ok)
- No external dependencies ever
- Current recipe count: 199 — next displayNum is 225 (numbering has gaps; use max+1)

## Recipe Data Model (recipes.js)
Each recipe lives in TWO places, keyed by the same `id`:

1. `R[]` — lightweight CARD (shown on the main grid):
   { id, protein, displayNum, carb, time, title, desc, tags[], flavor, hint, sideEgg? }

2. `RECIPE_DETAILS{}` — full DETAIL (loaded when a card is opened):
   { image, video, ingredients[{section, items[{name, amt}]}], steps[], hacks[{title,text}], notes }

When adding/removing a recipe, update BOTH. Keep card ids and detail keys in sync
(no orphans, no card without a detail).

### `video` field — YouTube sync
- `video` is the YouTube video ID (e.g. "OlTOf0YZdMA"), NOT a full URL.
- index.html renders the card thumbnail from `img.youtube.com/vi/<id>/...`
  and embeds `youtube.com/embed/<id>` in the Video tab.
- `""` (empty) = recipe published but no video linked yet.
- `null` = no video.
- Each video ID should map to exactly ONE recipe (no duplicates).

### Amount placeholders
Ingredient amounts may use `{{proteinG}}` / `{{carbG}}` — these scale with the
serving/protein stepper in the UI. Keep them when the protein/carb is adjustable.

## Keeping recipes in sync with YouTube
Use the `/sync-videos` skill. It pulls the Fit Niikiter channel
(channelId UCRC8tptJsWqPJBcdKhH8ndg) via the vidIQ tools, matches video titles
to recipes, fills in missing `video` IDs, and flags ingredient/macro mismatches
between a recipe and its video description.

## Creator
FIT NIIKITER — TikTok + YouTube food content creator (@fitniikiter)
