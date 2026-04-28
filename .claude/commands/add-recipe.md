---
description: Add a new recipe to Recipe Vault
allowed-tools: Read, Write, Bash
---

Add a new recipe to Recipe Vault.

1. Read recipes.json — find highest displayNum
2. Create new recipe entry (displayNum +1)
3. Use structure: id, displayNum, carb, time, title, desc,
   tags, flavor, proteinOpts, carbs, sauce, ing, steps, hacks, notes
4. Validate JSON syntax
5. Save recipes.json
6. Create branch: recipe/add-[recipe-name]
7. Commit with message: "feat: add recipe #[ID] [title]"

Recipe details: $ARGUMENTS
