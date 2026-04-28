# Recipe Vault — FIT NIIKITER Agent Brain

## Project
Static single-page app. GitHub Pages + Cloudflare custom domain.
NO backend. NO framework. NO external dependencies. Always free.

## Files
- index.html (~52KB net) — HTML skeleton only; link/script tags reference external files
- style.css (~94KB) — all CSS
- app.js (~186KB) — all JS logic + data blocks (NUT, INGREDIENT_DB, DIETARY_FILTERS, PANTRY_ITEMS, etc.)
- recipes.js (~439KB) — all recipe cards (R[]) + full recipe details (RECIPE_DETAILS)
- nutrition.js (~39KB) — USDA nutrition database per 100g

## Task Guide (read only what you need)
- Fix style/layout bug → style.css only
- Fix JS/filter bug    → app.js only
- Add or edit recipe   → recipes.js only
- Change HTML layout   → index.html only
- Nutrition data       → nutrition.js only

## Rules — ALWAYS FOLLOW
- Never push directly to main — always create branch first
- All code comments in English
- All recipe content in English (brand names in parentheses ok)
- No external dependencies ever
- Current recipe count: 148 — next displayNum is 149

## Recipe Structure (recipes.js)
{ id, displayNum, carb, time, title, desc, tags[], flavor,
  proteinOpts{}, carbs{}, sauce{}, ing[], steps[], hacks[], notes }

## Creator
FIT NIIKITER — TikTok + YouTube food content creator
