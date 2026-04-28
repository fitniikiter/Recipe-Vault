---
description: Check Recipe Vault for broken things
allowed-tools: Read, Bash, WebSearch
---

Audit Recipe Vault health:

1. Read index.html — check for JS syntax errors
2. Read recipes.js — verify all R[] entries have matching RECIPE_DETAILS
3. Check nutrition.js — find any ingredients in recipes not in DB
4. Count recipes — report current total
5. Find any TODO/FIXME comments
6. Check if known pending bug is still present:
   changeModalServings() cache invalidation for none/none recipes (~line 7143)

Report: what works, what broken, what missing.
