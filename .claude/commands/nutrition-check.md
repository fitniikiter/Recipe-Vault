---
description: Check ingredient coverage and macro sanity across Recipe Vault
allowed-tools: Read, Bash, Edit
---
Run Recipe Vault's two standing nutrition-data checks and act on what they find.

1. Run `node tools/check-ingredient-coverage.js` — flags any recipe ingredient
   line that silently fails to resolve to a `NUTRITION_DB` entry (its macros
   are dropped from the recipe's total with no error shown anywhere) or
   resolves but fails to parse its amount.
2. Run `node tools/check-recipe-macros.js` — computes every recipe's macros
   at default weights using the real calculation path and flags totals
   outside a sane per-portion range, or where sauce/spice/veg macros
   dominate over the protein+carb base (usually a sign a unit or ID got
   mismapped).
3. For each flag:
   - Coverage gaps: find the closest matching `NUTRITION_DB` entry in
     nutrition.js and add an alias in `ING_NAME_MAP` (app.js) for the exact
     ingredient text. Only add a new `NUTRITION_DB` entry if nothing existing
     is a reasonable proxy.
   - Sanity flags: read the flagged recipe's ingredient list in recipes.js
     and check each amount/unit against its resolved `NUTRITION_DB` entry's
     `unit_g`. A flag is a real bug (wrong ID, missing unit conversion
     falling back to a bad default) more often than a "this dish is just
     rich" false positive — verify before dismissing it.
4. Re-run both scripts after any fix to confirm it's resolved and nothing
   else regressed.

Optional argument ($ARGUMENTS): a recipe id or title to focus the review on,
if given — otherwise review every flag from both scripts.
