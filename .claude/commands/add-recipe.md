---
description: Add a new recipe to Recipe Vault
allowed-tools: Read, Write, Edit, Bash
---

Add a new recipe to Recipe Vault.

⚠ FOUNDATION PHASE (see CLAUDE.md): do not add recipes until the user says the
foundation is finished. If asked anyway, confirm first.

1. Read the schema at the top of `tools/validate-recipes.js` — it is the
   single definition of a valid recipe (fields, allowed values, placeholders).
2. Find the next number: `grep -o "displayNum: [0-9]*" recipes-archive.js | sort -t' ' -k2 -n | tail -1`
3. Add BOTH entries to `recipes-archive.js` (never to the generated `recipes.js`):
   - a card in `const R` (id, displayNum, protein, carb, mealType, time, title,
     desc, tags, flavor, hint, optional sideEgg)
   - details in `const RECIPE_DETAILS` under the same id (video, ingredients,
     steps, hacks, notes)
   The adjustable base is written with placeholders: `{{proteinG}}g raw` for
   the protein (`{{eggCount}} pieces` for egg recipes) and `{{carbG}}g` for the
   carb — exactly one each, never also as a fixed amount.
4. Run `node tools/check.js` — it must end with "All checks passed". Read the
   macro plausibility flags for the new recipe.
5. Run `node tools/build-testset.js` (add the id to TESTSET_IDS there if it
   should be visible during the foundation phase).
6. Commit: "Add recipe #[displayNum] [title]"

Recipe details: $ARGUMENTS
