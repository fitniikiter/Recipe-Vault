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
- recipes.js (~48KB) — GENERATED test set (16 recipes) that the site loads:
  `const R` (recipe cards) and `const RECIPE_DETAILS` (full details).
- recipes-archive.js (~600KB) — the FULL catalog (198 recipes), NOT loaded by the
  site. Source of truth for recipe content. `node tools/build-testset.js`
  rebuilds recipes.js from it (`--all` restores the full catalog).
- nutrition.js (~46KB) — nutrition lookup DB (NUTRITION_DB, NUTRITION_DISPLAY,
  NUTRITION_CARBS) used by the calculator / nutrition checks.
- manifest.json + sw.js + icon-192.png + icon-512.png + og-image.png + avatar.jpg
  — PWA + social assets. /fonts + fonts.css = self-hosted fonts.
- Per-recipe share previews: /r/<id>/index.html stubs + /og/<id>.png images.
- Standalone pages (not part of the SPA): fat-loss-guide.html, trainingsplan.html,
  model.html.

To edit: UI/style → style.css · app logic → app.js · recipes → recipes-archive.js.
Read only the file you need — that's the whole point of the split.

## Tabs
Recipes · Calorie Calculator · Nutrition (compare view + ingredient database) ·
Randomizer. My Pantry is switched OFF (not deleted): remove the `pantry-off`
class on `<html>` in index.html to bring it back.

## Rules — ALWAYS FOLLOW
- Always push directly to main after every change automatically
- All code comments in English
- All recipe content in English (brand names in parentheses ok)
- No external code dependencies ever (fonts/images are hosted content, not code deps)
- FOUNDATION PHASE: the site runs on a 16-recipe test set until macro logic,
  data format, pages and design are finished. Do NOT add new recipes yet.
- Archive recipe count: 198 — displayNum runs 1–198 with no gaps, next new one is 199
  (the test set keeps the original displayNum, so it has gaps on screen)

## Recipe Structure
The schema is defined (and enforced) in `tools/validate-recipes.js` — read its
header before touching recipe data. Two objects, matched by the same `id`:

R (card, in `const R = [...]`):
{ id, protein, displayNum, carb, mealType, time, title, desc, tags[], flavor,
  hint, sideEgg? }
  protein: chicken|beef|eggs|fish|tofu|none · carb: rice|potato|noodle|bread|none
  mealType: array of breakfast|main|snack|dip, e.g. ["breakfast", "main"] · flavor: savory|sweet

RECIPE_DETAILS (detail, in `const RECIPE_DETAILS = { <id>: {...} }`):
{ image, video, ingredients[{section, items[{name, amt}]}], steps[], hacks[], notes }

The adjustable base uses placeholders in `amt`, exactly one each:
`{{proteinG}}g raw` (or `{{eggCount}} pieces` for egg recipes) and `{{carbG}}g`.
The macro engine adds them — never also write the base as a fixed amount.

⚠ To add/edit a recipe, update BOTH R and RECIPE_DETAILS in recipes-archive.js,
run `node tools/check.js` (must pass), then `node tools/build-testset.js`
(recipes.js is generated — never edit it by hand).

## Later — after the foundation is finished (agreed with Nick, do not start early)
- Orphaned recipe data: `thai-basil-chicken-rice` has RECIPE_DETAILS but no card
  (validator warning). Decide: delete or add a card.
- Review the recipes flagged by `node tools/check-recipe-macros.js recipes-archive.js`
  (17 flagged — mostly "extras dominate": the sauce has more kcal than protein + carb).
- Review mealType assignments (auto-assigned; most egg dishes are ["breakfast", "main"]).

## Creator
FIT NIIKITER — TikTok + YouTube food content creator
