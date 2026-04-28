# Recipe Vault — FIT NIIKITER Agent Brain

## Project
Static single-page app. GitHub Pages + Cloudflare custom domain.
NO backend. NO framework. NO external dependencies. Always free.

## Files
- index.html (~750KB) — all app logic, CSS, HTML, inline recipe data
- recipes.js (~231KB) — R[] recipe cards + RECIPE_DETAILS
- nutrition.js (~34KB) — USDA nutrient DB (values per 100g)

## Rules — ALWAYS FOLLOW
- Never push directly to main — always create branch first
- When changing recipes: BOTH index.html AND recipes.js must be updated together
- All code comments in English
- All recipe content in English (brand names in parentheses allowed)
- No external dependencies ever
- Last recipe ID: #085 — next recipe starts at #086

## Key Line References (index.html)
- CSS: Line 15–4353
- filterRecipes(): ~8211
- RECIPE_DETAILS: ~8585
- runCalc(): ~16324

## Recipe Card Structure (R[] in recipes.js)
{ id, displayNum, carb, time, title, desc, tags[], flavor, sauce_kcal, sauce_p, sauce_c, sauce_f }

## Special Recipe Rules
- protein:"none" + carb:"none" = hide protein/carb UI, no divide sauce by servings
- proteinG/carbG always show full batch amounts regardless of servings
- Sauce macro cache: invalidate BEFORE resetting weights.servings

## Creator
FIT NIIKITER — TikTok + YouTube food content creator
