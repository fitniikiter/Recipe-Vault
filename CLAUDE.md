# Recipe Vault — FIT NIIKITER Agent Brain

## Project
Static single-page app. GitHub Pages + Cloudflare custom domain.
NO backend. NO framework. NO external dependencies. Always free.

## Files
- index.html (911KB) — all app logic, CSS, HTML
- recipes.json (58KB) — all 148 recipes
- config.json (5.6KB) — protein defs, dietary filters

## Rules — ALWAYS FOLLOW
- Never push directly to main — always create branch first
- All code comments in English
- All recipe content in English (brand names in parentheses ok)
- No external dependencies ever
- Current recipe count: 148 — next displayNum is 149

## Recipe Structure (recipes.json)
{ id, displayNum, carb, time, title, desc, tags[], flavor,
  proteinOpts{}, carbs{}, sauce{}, ing[], steps[], hacks[], notes }

## Creator
FIT NIIKITER — TikTok + YouTube food content creator
