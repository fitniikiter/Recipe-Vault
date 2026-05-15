# Recipe Vault — FIT NIIKITER Agent Brain

## Project
Static single-page app. GitHub Pages + Cloudflare custom domain.
NO backend. NO framework. NO external dependencies. Always free.

## Files
- index.html (~55KB) — HTML skeleton only (nav, modals, UI structure)
- style.css (~132KB) — all CSS
- app.js (~220KB) — all app logic + inline data (NUT, DIETARY_FILTERS, etc.)
- recipes.js (~589KB) — recipe card data (R[]) + full recipe details (RECIPE_DETAILS)
- nutrition.js (~46KB) — USDA nutrition DB per 100g
- logo.png — header avatar image

See .claude/map.md for full code map (functions, line numbers, data blocks).

## Rules — ALWAYS FOLLOW
- Always push directly to main after every change automatically
- All code comments in English
- All recipe content in English (brand names in parentheses ok)
- No external dependencies ever
- Current recipe count: 148 — next displayNum is 149

## Recipe Structure (recipes.js → R[])
{ id, displayNum, carb, time, title, desc, tags[], flavor,
  proteinOpts{}, carbs{}, sauce{}, ing[], steps[], hacks[], notes }

## Creator
FIT NIIKITER — TikTok + YouTube food content creator
