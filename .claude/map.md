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
| `recipes.js` | ~48KB | GENERATED 16-recipe test set: `const R` + `const RECIPE_DETAILS`. |
| `recipes-archive.js` | ~600KB | Full 198-recipe catalog, not loaded by the site. Edit recipes here, then `node tools/build-testset.js`. |
| `nutrition.js` | ~46KB | `NUTRITION_DB`, `NUTRITION_DISPLAY`, `NUTRITION_CARBS`. |

## Where is X? (grep these)

- **Recipe card grid render** → `app.js` `function buildAllCards` (and
  `updateCardMacros` recomputes the macro numbers on each card).
- **Search + filter (show/hide cards)** → `app.js` `function filterRecipes`.
  Filter state lives in `macroFilter`, `carbEnabled`, `proteinEnabled`,
  `flavorFilter`, `activeDietary`, etc. Dietary rules are data
  (`DIETARY_FILTERS`) evaluated by `dietBlocks(recipe)`; `pantryBlocks` is the
  (switched-off) pantry. `doResetAll` resets everything.
- **Macro math** → `app.js`, block "Macro engine (single source of truth)":
  `recipeMacros(recipe)` is the ONLY place recipe macros come from (card,
  filter, modal header, modal total bar, Randomizer). `portionFor` decides the
  per-portion grams, `macrosForPortion` does the arithmetic, `fixedMacros` is
  sauce + side egg, `proteinKeyFor` picks the recipe's own protein.
  `baseMacros`/`macrosWith` are legacy — don't use them for recipes.
- **Auto-weight (per-recipe solver)** → `app.js` `function solveAutoWeight`,
  `computeAllAutoWeights`, `autoGramsPerServing`. Rounding checkbox: `chkRound5`.
- **Recipe modal (popup)** → `app.js` `function openModal`,
  `buildIngredientsTab`, `buildRecipeTab`, `updateModalMacros`,
  `selectModalVariant` (Thigh/Breast, 20%/5%).
- **Calorie calculator (TDEE page)** → `app.js` `function runCalc`, `setGoal`,
  `setGender`, `setActivity`; `calcToRandomizer` hands the plan to the Randomizer.
- **Randomizer** → `app.js` `renderRandomizer`, `randPickOne`,
  `randSolveRecipeAtShare` (portion per slot), `randOpen` (opens the modal with
  that portion), `randAdjustShare`.
- **Protein selection / native protein** → `activeProtein` (global), variants in
  `const PROTEIN_DEFS`, `_nativeVariant(recipe)`.
- **Share link / OG** → `app.js` `function shareRecipe`; per-recipe preview
  stubs live in `/r/<id>/index.html`, their images in `/og/<id>.png`.
- **Recipe schema + checks** → `tools/validate-recipes.js` (schema in its
  header), `tools/check.js` runs it plus ingredient coverage and macro
  plausibility. `tools/build-testset.js` generates `recipes.js`.
- **Randomizer meal slots** → card field `mealType` (array); `recipeIsMealType(r, type)` reads it.
- **Navigation / Back button** → `app.js` `switchTab` (tab lives in the URL
  hash), `overlayOpened` / `overlayClosed` + the `popstate` listener (every
  overlay adds one history entry so Back closes it).
- **Favorites** → `favorites`, `toggleFavorite`, `toggleFavOnly`, `syncFavButtons`.
- **Sorting** → `RECIPE_SORTS`, `setRecipeSort`, `applyRecipeSort` (CSS `order`).
- **Cook mode** → `openCookMode`, `cookStep`, `closeCookMode` (`#cookOverlay`).
- **Shopping list** → `buildShoppingList`, `openShoppingList` (`#shopOverlay`).
- **Saved / shared Randomizer day** → `randSaveDay`, `randRestoreDay`, `randShareDay`
  (link format `#randomizer/d=…&s=…&t=…&g=…`).
- **Reference data** →
  - `app.js`: `const NUT`, `INGREDIENT_DB`, `CARB_RATIOS`, `DIETARY_FILTERS`,
    `PANTRY_ITEMS`, `ING_NAME_MAP`, `CARB_COMPARE`, `PROTEIN_DEFS`.
  - `recipes.js`: `const R` (cards), `const RECIPE_DETAILS` (details) — same `id`.
  - `nutrition.js`: `NUTRITION_DB` etc.
- **Any styling** → `style.css`, grep the selector (e.g. `.card`,
  `.serving-stepper`, `.modal-variant-btn.active`). Light-mode overrides are
  `html.light ...`; theme tokens are CSS vars on `:root` / `html.light`.
- **HTML structure** → `index.html`. Pages: `#page-recipes`, `#page-calc`,
  `#page-nutrition` (two views: `#nutview-compare` + `#nutview-db`, switched by
  `switchNutView`), `#page-randomizer`, `#page-pantry` (switched OFF via the
  `pantry-off` class on `<html>`; `PANTRY_ENABLED` in `app.js` reads it).
  Dietary filters live in the recipe filter panel (`#dietaryGrid`). Modals: `#recipeModal`,
  `#hiwOverlay`.
- **PWA / offline** → `manifest.json`, `sw.js` (precache list + fetch strategy),
  `icon-192.png` / `icon-512.png`.
- **Fonts** → self-hosted in `/fonts` + `fonts.css` (no Google Fonts at runtime).

## Notes
- There is **no** `config.json` and **no** `recipes.json` (older docs were wrong).
- No build step: files are served as-is by GitHub Pages / Cloudflare Pages.
- `app.js` and `style.css` were extracted from `index.html` to cut token cost;
  keep them external. Cache-busting via `?v=YYYYMMDD` on the `<link>`/`<script>`.
