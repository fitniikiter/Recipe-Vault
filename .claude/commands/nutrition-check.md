---
description: Check if all ingredients of a recipe exist in the nutrition database
allowed-tools: Read, Write
---
Check nutrition coverage for a recipe in Recipe Vault.

1. Read config.json — find all known ingredients/nutrition data
2. Read recipes.json — find the recipe matching $ARGUMENTS
3. Compare every ingredient in ing[] against config.json
4. Report:
   - ✅ ingredients found in DB
   - ❌ ingredients MISSING from DB
   - Suggested macros for missing ones (use USDA FoodData Central values per 100g)
5. If missing ingredients found:
   - Add them to config.json with correct values
   - Commit: "feat: add nutrition data for [ingredient]"

Recipe name or ID: $ARGUMENTS
