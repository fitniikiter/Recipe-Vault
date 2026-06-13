---
name: nutrition-audit
description: Audit calculated nutrition across ALL recipes to find wrong/incomplete
  macros. Use when asked to check nutrition values, find recipes with wrong macros,
  verify calories/protein add up, or see which ingredients aren't being counted.
  Runs the real macro engine from index.html over every recipe and reports the
  ingredients it silently drops (the #1 cause of macros that look too low).
allowed-tools: Read, Edit, Bash
---

# Nutrition Audit — find recipes whose macros are wrong

The app already computes recipe macros from ingredients (`calcSauceMacros` +
`baseMacros` in index.html, using `INGREDIENT_DB` + `ING_NAME_MAP`). The catch:
when an ingredient name doesn't resolve to a DB entry, the engine **silently
skips it** (`if (!a) return;`). The recipe's calories/protein then come out too
low — and nothing on the page warns about it. That is why some recipes are wrong.

`tools/nutrition-audit.js` runs that exact engine offline over all recipes and
surfaces every dropped or unparseable ingredient.

## How to run it

```
node tools/nutrition-audit.js            # vault summary + dropped-ingredient tally
node tools/nutrition-audit.js --full     # every flagged recipe, line by line
node tools/nutrition-audit.js <recipeId> # deep-dive one recipe (resolved vs dropped)
```

The tool reads `index.html` and `recipes.js` directly, so it always matches what
the live site calculates — no copy of the engine to keep in sync.

## Reading the output
- **DROPPED ingredients tally** — names sorted by how many recipes they break.
  These need to be added so they get counted.
- **Top recipes with uncounted ingredients** — worst offenders first.
- A 300g "Silken tofu" or "yoghurt" being dropped means hundreds of kcal and
  tens of grams of protein are missing from that recipe's total.

## Fixing a dropped ingredient
For each ingredient the audit drops, there are two cases:

1. **Spelling / synonym** of something already in the DB (e.g. `yoghurt` vs
   `yogurt`, `waxy potatoes` vs `potato`). Fix = add a line to `ING_NAME_MAP`
   in index.html mapping the name → the existing INGREDIENT_DB id.

2. **Genuinely missing** ingredient (e.g. `doubanjiang`, `silken tofu`,
   `tomatillos`). Fix = add an entry to `INGREDIENT_DB` in index.html with
   per-100g values (kcal/p/c/f, plus `unit_g`/`typical_g` if it's measured in
   tbsp/tsp/pieces), then map its name(s) in `ING_NAME_MAP`.
   - Use USDA FoodData Central values (per 100g) for accuracy — same source as
     `nutrition.js`.
   - `INGREDIENT_DB` lives near line 5858 in index.html; `ING_NAME_MAP` near 9063.

After editing, re-run `node tools/nutrition-audit.js` and confirm the recipe is
no longer flagged and its computed total looks right. Then commit.

## Rules
- Never hardcode a recipe's macros to "fix" it — fix the ingredient data so the
  number is *calculated* correctly. Hardcoding hides the real bug.
- Keep nutrition values realistic (USDA per 100g). Flag guesses.
- `findIngredientId` matches by exact name first, then longest substring — so a
  too-generic map key (e.g. mapping `"oil"`) can mis-tag many recipes. Prefer
  specific keys.
