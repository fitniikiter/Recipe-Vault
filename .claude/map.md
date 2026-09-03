# Recipe Vault — code map

Static SPA, no backend, no build step. `index.html` loads four files:
`style.css`, `app.js`, `recipes.js`, `nutrition.js`. To keep AI sessions cheap,
read **only the file that owns what you're changing** — don't open `app.js`
for a CSS tweak, etc. Grep the anchors below.

| File | Size | What lives here |
|------|------|-----------------|
| `index.html` | ~57KB | HTML skeleton: nav, the 5 pages, modals. 2 tiny inline scripts (scroll-top, SW register). |
| `style.css` | ~135KB | ALL CSS. |
| `app.js` | ~236KB | ALL app logic + inline reference data. |
| `recipes.js` | ~590KB | Recipe content: `const R` + `const RECIPE_DETAILS`. |
| `nutrition.js` | ~46KB | `NUTRITION_DB`, `NUTRITION_DISPLAY`, `NUTRITION_CARBS`. |

## Where is X? (grep these)

- **Recipe card grid render** → `app.js` `function buildAllCards` (and
  `updateCardMacros` recomputes the macro numbers on each card).
- **Search + filter (show/hide cards)** → `app.js` `function filterRecipes`.
  Filter state lives in `macroFilter`, `carbEnabled`, `proteinEnabled`,
  `flavorFilter`, etc.
- **Macro math** → `app.js` `function baseMacros` (global weights) and
  `function macrosWith` (explicit grams). Sauce macros: `calcSauceMacros`.
- **Auto-weight (per-recipe solver)** → `app.js` `function solveAutoWeight`,
  `computeAllAutoWeights`, `autoGramsPerServing`. Rounding checkbox: `chkRound5`.
- **Recipe modal (popup)** → `app.js` `function openModal`,
  `buildIngredientsTab`, `buildRecipeTab`, `updateModalMacros`,
  `selectModalVariant` (Thigh/Breast, 20%/5%).
- **Calorie calculator (TDEE page)** → `app.js` `function runCalc`,
  `updateCalcDisplay`, `setGoal`, `setGender`.
- **Protein selection / native protein** → `activeProtein` (global), variants in
  `const PROTEIN_DEFS`, `_nativeVariant(recipe)`.
- **Share link / OG** → `app.js` `function shareRecipe`; per-recipe preview
  stubs live in `/r/<id>/index.html`, their images in `/og/<id>.png`.
- **Reference data** →
  - `app.js`: `const NUT`, `INGREDIENT_DB`, `CARB_RATIOS`, `DIETARY_FILTERS`,
    `PANTRY_ITEMS`, `ING_NAME_MAP`, `CARB_COMPARE`, `PROTEIN_DEFS`.
  - `recipes.js`: `const R` (cards), `const RECIPE_DETAILS` (details) — same `id`.
  - `nutrition.js`: `NUTRITION_DB` etc.
- **Any styling** → `style.css`, grep the selector (e.g. `.card`,
  `.serving-stepper`, `.modal-variant-btn.active`). Light-mode overrides are
  `html.light ...`; theme tokens are CSS vars on `:root` / `html.light`.
- **HTML structure** → `index.html`. Pages: `#page-recipes`, `#page-calc`,
  `#page-nutrition`, `#page-compare`, `#page-pantry`. Modals: `#recipeModal`,
  `#hiwOverlay`.
- **PWA / offline** → `manifest.json`, `sw.js` (precache list + fetch strategy),
  `icon-192.png` / `icon-512.png`.
- **Fonts** → self-hosted in `/fonts` + `fonts.css` (no Google Fonts at runtime).

## Notes
- There is **no** `config.json` and **no** `recipes.json` (older docs were wrong).
- No build step: files are served as-is by GitHub Pages / Cloudflare Pages.
- `app.js` and `style.css` were extracted from `index.html` to cut token cost;
  keep them external. Cache-busting via `?v=YYYYMMDD` on the `<link>`/`<script>`.
