# Recipe Vault — Code Map

Quick reference for Claude Code. Read this instead of scanning full files.

## Files

| File | Size | Purpose |
|------|------|---------|
| `index.html` | ~55KB / 950 lines | HTML skeleton only — nav, modals, UI structure |
| `style.css` | ~132KB / 5093 lines | All CSS |
| `app.js` | ~220KB / 4466 lines | All app logic (data + functions) |
| `recipes.js` | ~589KB / 11094 lines | Recipe card data (R[]) + RECIPE_DETAILS |
| `nutrition.js` | ~46KB / 1064 lines | USDA nutrition database per 100g |
| `logo.png` | ~320KB | Header avatar image |

## Data Blocks

### In `app.js`
| Variable | Line | Description |
|----------|------|-------------|
| `NUT` | 1 | Protein macro values per 100g (chicken, beef, eggs, salmon…) |
| `INGREDIENT_DB` | 15 | Sauce/ingredient macro DB (soy_sauce, gochujang…) |
| `CARB_RATIOS` | 333 | Raw→cooked conversion factors (rice: 0.33, potato: 1.25…) |
| `DIETARY_FILTERS` | 863 | Lactose-free, gluten-free, no-pork definitions |
| `PANTRY_ITEMS` | 2391 | All pantry ingredient categories |
| `CARB_COMPARE` | 3975 | Carb comparison table data |
| `PROTEIN_COMPARE` | 4112 | Protein comparison table data |

### In `recipes.js`
| Variable | Line | Description |
|----------|------|-------------|
| `R[]` | 366 | Recipe card data — id, title, desc, tags, carb, time, displayNum |
| `RECIPE_DETAILS` | 2801 | Full recipe data — ingredients, steps, hacks, notes, video |

### In `nutrition.js`
Full USDA nutrition DB. All values per 100g raw.

## Key Functions in `app.js`

### Filter & Display
| Function | Line | Description |
|----------|------|-------------|
| `filterRecipes()` | 1356 | Main filter logic — applies all active filters |
| `buildAllCards()` | 1266 | Renders all recipe cards to DOM |
| `updateCardMacros()` | 1290 | Recalculates macros shown on cards |
| `updatePillStates()` | 544 | Updates filter pill active states |
| `applyMacroFilter()` | 1481 | Applies macro slider filters |
| `setFilter(e, a)` | 1426 | Sets a filter value and re-renders |

### Recipe Detail Modal
| Function | Line | Description |
|----------|------|-------------|
| `buildIngredientsTab(e, a)` | 2040 | Builds ingredients tab in modal |
| `buildRecipeTab(e)` | 2271 | Builds steps tab in modal |
| `buildVideoTab(e)` | 2384 | Builds video tab in modal |
| `scaleAmt(e, a)` | 1937 | Scales ingredient amounts by serving size |

### Macro Calculator
| Function | Line | Description |
|----------|------|-------------|
| `baseMacros(e)` | 379 | Calculates base macros for a recipe |
| `calcIngredientMacros(e, a)` | 297 | Calculates macros for single ingredient |
| `autoCalcCarbs()` | 364 | Auto-calculates carb amount from weight |
| `runCalc()` | 3097 | Runs the TDEE/macro calculator |
| `calcSauceMacros(e)` | 3183 | Calculates sauce macro totals |

### Protein & Variant Selection
| Function | Line | Description |
|----------|------|-------------|
| `selectProtein(e)` | 418 | Selects active protein type |
| `selectVariant(e, a)` | 452 | Selects recipe variant |
| `getRecipeProtein(e)` | 480 | Gets protein data for a recipe |

### Pantry
| Function | Line | Description |
|----------|------|-------------|
| `renderPantry()` | 2591 | Renders pantry ingredient list |
| `toggleIngredient(e, a)` | 2616 | Toggles pantry ingredient on/off |
| `savePantry()` | 2575 | Saves pantry state to localStorage |

### Dietary Filters
| Function | Line | Description |
|----------|------|-------------|
| `toggleDietary(e)` | 1043 | Toggles a dietary filter |
| `applyDietaryToProteinFilters()` | 1120 | Syncs dietary filters to protein filter buttons |
| `buildDietaryGrid()` | 1027 | Renders dietary filter grid |

### Admin Panel
| Function | Line | Description |
|----------|------|-------------|
| `activateAdmin()` | 2799 | Unlocks admin mode (password-gated) |
| `openAdminEdit(e)` | 2858 | Opens admin edit modal for a recipe |
| `saveAdminEdit()` | 2987 | Saves admin edits to RECIPE_DETAILS override |
| `exportAdminHTML()` | 3064 | Exports modified HTML for download |

### Comparison Tables
| Function | Line | Description |
|----------|------|-------------|
| `buildCompareTable()` | 4330 | Builds carb/protein comparison table |
| `setCompareSort(e)` | 3958 | Sets sort column for comparison |

### Navigation
| Function | Line | Description |
|----------|------|-------------|
| `switchTab(e, a)` | 2692 | Switches between main tabs (recipes/pantry/nutrition/compare) |
| `toggleFilterPanel()` | 500 | Toggles filter sidebar open/close |
| `toggleTheme()` | 4391 | Toggles dark/light mode |

## What config.json Controls
> Note: config.json does not exist as a separate file. Config data is inline in `app.js`:
- **Protein definitions** → `NUT` (app.js:1) and `INGREDIENT_DB` (app.js:15)
- **Dietary filters** → `DIETARY_FILTERS` (app.js:863)
- **Carb ratios** → `CARB_RATIOS` (app.js:333)

## Common Tasks — Where to Look

| Task | File(s) to read |
|------|----------------|
| Fix UI/layout bug | `style.css` only |
| Fix filter logic | `app.js` lines 1356–1500 |
| Fix macro calculator | `app.js` lines 297–500 |
| Add/edit recipe card | `recipes.js` — find in `R[]` at line 366 |
| Add/edit recipe details | `recipes.js` — find in `RECIPE_DETAILS` at line 2801 |
| Change protein macros | `app.js:1` (`NUT`) |
| Change sauce DB | `app.js:15` (`INGREDIENT_DB`) |
| Fix pantry feature | `app.js` lines 2391–2700 |
| Fix recipe modal | `app.js` lines 2040–2390 |
| Fix nutrition DB | `nutrition.js` |
| Change admin logic | `app.js` lines 2774–3080 |
