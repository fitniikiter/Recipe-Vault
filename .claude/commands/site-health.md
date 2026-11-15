---
description: Check Recipe Vault for broken things
allowed-tools: Read, Bash, Grep
---

Audit Recipe Vault health:

1. Syntax: `node --check app.js recipes.js recipes-archive.js nutrition.js sw.js`
2. Recipe data: `node tools/check.js` — schema, ingredient coverage and macro
   plausibility for the full catalog (recipes-archive.js) and the live test
   set (recipes.js). Must end with "All checks passed".
3. Count recipes — report catalog total and how many are live
4. Find any TODO/FIXME comments
5. Load the site in a headless browser (mobile + desktop, light + dark):
   every tab, every recipe modal, the Randomizer — report JS errors and any
   place where card, modal and Randomizer show different macros.

Report: what works, what is broken, what is missing.
