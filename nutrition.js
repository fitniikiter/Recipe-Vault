// ============================================================
//  nutrition.js — FIT NIIKITER'S RECIPE VAULT
//  Single canonical ingredient nutrition database. Every ingredient the
//  site uses — base proteins/carbs, sauces, spices, produce, dairy, pantry
//  staples — lives here ONCE. app.js reads macros from this file only
//  (baseMacros/macrosWith for the protein+carb build-your-own calculator,
//  calcIngredientMacros for extra ingredients); nothing else defines its
//  own copy of an ingredient's numbers, so a given ingredient can't have
//  two different macro values in two different places anymore.
//  Source: fdc.nal.usda.gov | All values per 100g raw/uncooked unless noted
//  Energy: Atwater Specific Factors where available, else General
//  null = data not available in USDA source
// ============================================================
//
//  FIELDS (all per 100g, all optional except kcal/p/c/f/category):
//  kcal        — Energy kcal (Atwater Specific if available)
//  p           — Protein (g)
//  c           — Carbohydrate by difference (g)
//  f           — Total lipid/fat (g)
//  fiber       — Dietary fiber (g)
//  sugar       — Total sugars (g)
//  sat_fat     — Saturated fatty acids (g)
//  mono_fat    — Monounsaturated fatty acids (g)
//  poly_fat    — Polyunsaturated fatty acids (g)
//  trans_fat   — Trans fatty acids (g)
//  omega3      — Total omega-3 (EPA+DHA+ALA+DPA) (g)
//  cholesterol — Cholesterol (mg)
//  sodium      — Sodium Na (mg)
//  potassium   — Potassium K (mg)
//  calcium     — Calcium Ca (mg)
//  iron        — Iron Fe (mg)
//  magnesium   — Magnesium Mg (mg)
//  phosphorus  — Phosphorus P (mg)
//  zinc        — Zinc Zn (mg)
//  selenium    — Selenium Se (µg)
//  iodine      — Iodine I (µg)
//  copper      — Copper Cu (mg)
//  vitamin_a   — Vitamin A RAE (µg)
//  vitamin_c   — Vitamin C (mg)
//  vitamin_d   — Vitamin D D2+D3 (µg)
//  vitamin_b1  — Thiamin B1 (mg)
//  vitamin_b2  — Riboflavin B2 (mg)
//  vitamin_b3  — Niacin B3 (mg)
//  vitamin_b5  — Pantothenic acid B5 (mg)
//  vitamin_b6  — Vitamin B6 (mg)
//  vitamin_b12 — Vitamin B12 (µg)
//  folate      — Folate total (µg)
//  choline     — Choline total (mg)
//  fdc_id      — USDA FoodData Central ID
//  data_type   — Foundation / SR Legacy / Estimated
//  notes       — Relevant notes
//  unit_g      — { unitName: grams } — serving-unit conversions for the
//                ingredient-amount parser (e.g. { tbsp: 15, tsp: 5 })
//  typical_g   — default grams used when no amount is given
//  emoji       — icon used in the Pantry tab
//  category    — one of: proteins, dairy, carbs, fresh, sauces, spices,
//                staples — same 7 buckets the Pantry tab already groups by;
//                drives the Nutrition DB tab's category filter
// ============================================================

const NUTRITION_DB = {

  // ──────────────────────────────────────────────────────────
  //  PROTEINS (meat, fish, eggs, plant-based, supplements)
  // ──────────────────────────────────────────────────────────

  beef_lean: {
    kcal: 137, p: 21.4, c: 0, f: 5,
    fiber: 0, sugar: 0, sat_fat: 2.18, mono_fat: 1.99,
    poly_fat: 0.257, trans_fat: 0.22, omega3: 0.029, cholesterol: 62,
    sodium: 66, potassium: 346, calcium: 9, iron: 2.38,
    magnesium: 22, phosphorus: 198, zinc: 5.09, selenium: 17.4,
    iodine: null, copper: 0.078, vitamin_a: 4, vitamin_c: 0,
    vitamin_d: 0.1, vitamin_b1: 0.041, vitamin_b2: 0.151, vitamin_b3: 5.49,
    vitamin_b5: 0.652, vitamin_b6: 0.392, vitamin_b12: 2.24, folate: 5,
    choline: 70.9, fdc_id: "171790", data_type: "SR Legacy", notes: "Ground beef 95% lean / 5% fat, raw",
    unit_g: {"g":1}, typical_g: 150, emoji: "🥩", category: "proteins",
  },
  beef_regular: {
    kcal: 248, p: 17.5, c: 0, f: 19.4,
    fiber: 0, sugar: 0, sat_fat: 6.84, mono_fat: 7.25,
    poly_fat: 0.485, trans_fat: 0.7, omega3: null, cholesterol: 68,
    sodium: 55, potassium: 273, calcium: 7, iron: 1.96,
    magnesium: 16.4, phosphorus: 144, zinc: 3.85, selenium: null,
    iodine: null, copper: 0.055, vitamin_a: null, vitamin_c: null,
    vitamin_d: null, vitamin_b1: null, vitamin_b2: null, vitamin_b3: null,
    vitamin_b5: null, vitamin_b6: null, vitamin_b12: null, folate: null,
    choline: null, fdc_id: "2514744", data_type: "Foundation", notes: "Ground beef 80% lean / 20% fat, raw",
    unit_g: {"g":1}, typical_g: 150, emoji: "🥩", category: "proteins",
  },
  bison: {
    kcal: 164, p: 19.9, c: 0, f: 8.88,
    fiber: 0, sugar: 0, sat_fat: null, mono_fat: null,
    poly_fat: null, trans_fat: null, omega3: null, cholesterol: 65,
    sodium: 56, potassium: 301, calcium: 7, iron: 2.17,
    magnesium: 18.5, phosphorus: 166, zinc: 3.76, selenium: null,
    iodine: null, copper: 0.078, vitamin_a: null, vitamin_c: null,
    vitamin_d: null, vitamin_b1: null, vitamin_b2: null, vitamin_b3: null,
    vitamin_b5: null, vitamin_b6: null, vitamin_b12: null, folate: null,
    choline: null, fdc_id: "2727571", data_type: "Foundation", notes: "Bison, ground, raw",
    category: "proteins",
  },
  chicken_breast: {
    kcal: 112, p: 22.5, c: 0, f: 1.93,
    fiber: 0, sugar: 0, sat_fat: 0.349, mono_fat: 0.369,
    poly_fat: 0.296, trans_fat: 0.009, omega3: null, cholesterol: 73,
    sodium: 66, potassium: 330, calcium: 4, iron: 0.35,
    magnesium: 26.2, phosphorus: 215, zinc: 0.65, selenium: null,
    iodine: null, copper: 0.004, vitamin_a: null, vitamin_c: null,
    vitamin_d: null, vitamin_b1: null, vitamin_b2: null, vitamin_b3: null,
    vitamin_b5: null, vitamin_b6: null, vitamin_b12: null, folate: null,
    choline: null, fdc_id: "2646170", data_type: "Foundation", notes: "Boneless, skinless, raw",
    unit_g: {"g":1}, typical_g: 150, emoji: "🍗", category: "proteins",
  },
  chicken_sausage: {
    kcal: 195, p: 14.8, c: 2.1, f: 14.5,
    fiber: 0, sugar: 0.8, sat_fat: 4.1, mono_fat: 6.2,
    poly_fat: 3.1, trans_fat: 0, omega3: null, cholesterol: 75,
    sodium: 680, potassium: 220, calcium: 18, iron: 0.9,
    magnesium: 18, phosphorus: 145, zinc: 1.2, selenium: 14,
    iodine: null, copper: 0.07, vitamin_a: null, vitamin_c: null,
    vitamin_d: null, vitamin_b1: null, vitamin_b2: null, vitamin_b3: null,
    vitamin_b5: null, vitamin_b6: null, vitamin_b12: null, folate: null,
    choline: null, fdc_id: null, data_type: "Estimated", notes: "Chicken/poultry sausage, cooked (Geflügelwurst / Geflügel-Nürnberger). Values estimated from USDA poultry sausage composites.",
    unit_g: { piece: 75 }, typical_g: 150,
    category: "proteins",
  },
  chicken_thigh: {
    kcal: 149, p: 18.6, c: 0, f: 7.92,
    fiber: 0, sugar: 0, sat_fat: 1.66, mono_fat: 2.24,
    poly_fat: 1.42, trans_fat: 0.024, omega3: null, cholesterol: 92,
    sodium: 62, potassium: 272, calcium: 6, iron: 0.6,
    magnesium: 21.8, phosphorus: 178, zinc: 1.35, selenium: null,
    iodine: null, copper: 0.042, vitamin_a: null, vitamin_c: null,
    vitamin_d: null, vitamin_b1: null, vitamin_b2: null, vitamin_b3: null,
    vitamin_b5: null, vitamin_b6: null, vitamin_b12: null, folate: null,
    choline: null, fdc_id: "2646171", data_type: "Foundation", notes: "Boneless, skinless, raw",
    unit_g: {"g":1}, typical_g: 150, emoji: "🍗", category: "proteins",
  },
  cod: {
    kcal: 82, p: 17.8, c: 0, f: 0.67,
    fiber: 0, sugar: 0, sat_fat: 0.131, mono_fat: 0.094,
    poly_fat: 0.231, trans_fat: null, omega3: 0.194, cholesterol: 43,
    sodium: 54, potassium: 413, calcium: 16, iron: 0.38,
    magnesium: 32, phosphorus: 203, zinc: 0.45, selenium: 33.1,
    iodine: null, copper: 0.028, vitamin_a: 12, vitamin_c: 1,
    vitamin_d: 0.9, vitamin_b1: 0.076, vitamin_b2: 0.065, vitamin_b3: 2.06,
    vitamin_b5: 0.153, vitamin_b6: 0.245, vitamin_b12: 0.91, folate: 7,
    choline: 65.2, fdc_id: "171955", data_type: "SR Legacy", notes: "Fish, cod, Atlantic, raw",
    unit_g: {"g":1}, typical_g: 150, emoji: "🐟", category: "proteins",
  },
  duck_breast: {
    kcal: 123, p: 19.8, c: 0, f: 4.25,
    fiber: 0, sugar: null, sat_fat: 1.32, mono_fat: 1.21,
    poly_fat: 0.58, trans_fat: null, omega3: 0.07, cholesterol: 77,
    sodium: 57, potassium: 268, calcium: 3, iron: 4.51,
    magnesium: 22, phosphorus: 186, zinc: 0.74, selenium: 13.9,
    iodine: null, copper: 0.33, vitamin_a: 16, vitamin_c: 6.2,
    vitamin_d: null, vitamin_b1: 0.416, vitamin_b2: 0.31, vitamin_b3: 3.44,
    vitamin_b5: 0.77, vitamin_b6: 0.63, vitamin_b12: 0.76, folate: 25,
    choline: null, fdc_id: "174491", data_type: "SR Legacy", notes: "Duck breast, meat only, raw",
    category: "proteins",
  },
  edamame: {
    kcal: 109, p: 11.2, c: 7.61, f: 4.73,
    fiber: 4.8, sugar: 2.48, sat_fat: null, mono_fat: null,
    poly_fat: null, trans_fat: 0, omega3: null, cholesterol: 0,
    sodium: 6, potassium: 482, calcium: 60, iron: 2.11,
    magnesium: 61, phosphorus: 161, zinc: 1.32, selenium: null,
    iodine: null, copper: 0.324, vitamin_a: null, vitamin_c: 9.7,
    vitamin_d: null, vitamin_b1: 0.15, vitamin_b2: 0.265, vitamin_b3: 0.925,
    vitamin_b5: 0.535, vitamin_b6: 0.135, vitamin_b12: 0, folate: 303,
    choline: 56, fdc_id: "168410", data_type: "SR Legacy", notes: "Edamame, frozen, unprepared",
    unit_g: {"tbsp":20}, typical_g: 80, emoji: "🫘", category: "proteins",
  },
  eggs: {
    kcal: 147, p: 12.4, c: 0.96, f: 9.96,
    fiber: 0, sugar: 0.2, sat_fat: 3.2, mono_fat: 3.63,
    poly_fat: 1.82, trans_fat: null, omega3: null, cholesterol: 411,
    sodium: 129, potassium: 132, calcium: 48, iron: 1.67,
    magnesium: 11.4, phosphorus: 184, zinc: 1.24, selenium: 31.1,
    iodine: 49.1, copper: null, vitamin_a: 180, vitamin_c: null,
    vitamin_d: 2.46, vitamin_b1: 0.077, vitamin_b2: 0.419, vitamin_b3: null,
    vitamin_b5: null, vitamin_b6: 0.063, vitamin_b12: 1.02, folate: 71,
    choline: 335, fdc_id: "748967", data_type: "Foundation", notes: "Grade A Large, whole egg, raw",
    unit_g: {"whole":58}, typical_g: 58, emoji: "🥚", category: "proteins",
  },
  lamb_mince: {
    kcal: 282, p: 16.6, c: 0, f: 23.4,
    fiber: 0, sugar: 0, sat_fat: 10.2, mono_fat: 9.6,
    poly_fat: 1.85, trans_fat: null, omega3: 0.42, cholesterol: 73,
    sodium: 59, potassium: 222, calcium: 16, iron: 1.55,
    magnesium: 21, phosphorus: 157, zinc: 3.41, selenium: 18.8,
    iodine: null, copper: 0.101, vitamin_a: 0, vitamin_c: 0,
    vitamin_d: 0.1, vitamin_b1: 0.11, vitamin_b2: 0.21, vitamin_b3: 5.96,
    vitamin_b5: 0.65, vitamin_b6: 0.13, vitamin_b12: 2.31, folate: 18,
    choline: 69.3, fdc_id: "174370", data_type: "SR Legacy", notes: "Lamb ground, raw",
    unit_g: {"g":1}, typical_g: 150, emoji: "🥩", category: "proteins",
  },
  pork_belly: {
    kcal: 385, p: 15.2, c: 0, f: 35.8,
    fiber: 0, sugar: 0, sat_fat: null, mono_fat: null,
    poly_fat: null, trans_fat: null, omega3: null, cholesterol: 67,
    sodium: 50, potassium: 208, calcium: 4, iron: 0.38,
    magnesium: 12.2, phosphorus: 114, zinc: 1.07, selenium: null,
    iodine: null, copper: 0.033, vitamin_a: null, vitamin_c: null,
    vitamin_d: null, vitamin_b1: null, vitamin_b2: null, vitamin_b3: null,
    vitamin_b5: null, vitamin_b6: null, vitamin_b12: null, folate: null,
    choline: null, fdc_id: "2727576", data_type: "Foundation", notes: "Pork belly, with skin, raw",
    category: "proteins",
  },
  pork_loin: {
    kcal: 174, p: 21.1, c: 0, f: 9.47,
    fiber: 0, sugar: 0, sat_fat: 3.28, mono_fat: 3.95,
    poly_fat: 1.38, trans_fat: 0.029, omega3: null, cholesterol: 56,
    sodium: 40, potassium: 361, calcium: 4, iron: 0.45,
    magnesium: 22, phosphorus: 197, zinc: 1.57, selenium: null,
    iodine: null, copper: 0.038, vitamin_a: null, vitamin_c: null,
    vitamin_d: null, vitamin_b1: null, vitamin_b2: null, vitamin_b3: null,
    vitamin_b5: null, vitamin_b6: null, vitamin_b12: null, folate: null,
    choline: null, fdc_id: "2646168", data_type: "Foundation", notes: "Pork loin, boneless, raw",
    category: "proteins",
  },
  pork_tenderloin: {
    kcal: 125, p: 21.6, c: 0, f: 3.9,
    fiber: 0, sugar: 0, sat_fat: 0.866, mono_fat: 0.862,
    poly_fat: 0.418, trans_fat: 0.01, omega3: null, cholesterol: 60,
    sodium: 41, potassium: 397, calcium: 5, iron: 0.93,
    magnesium: 24.7, phosphorus: 217, zinc: 1.77, selenium: null,
    iodine: null, copper: 0.077, vitamin_a: null, vitamin_c: null,
    vitamin_d: null, vitamin_b1: null, vitamin_b2: null, vitamin_b3: null,
    vitamin_b5: null, vitamin_b6: null, vitamin_b12: null, folate: null,
    choline: null, fdc_id: "2646169", data_type: "Foundation", notes: "Pork loin tenderloin, boneless, raw",
    unit_g: {"g":1}, typical_g: 150, emoji: "🥩", category: "proteins",
  },
  salmon: {
    kcal: 203, p: 20.3, c: 0, f: 13.1,
    fiber: 0, sugar: 0, sat_fat: 2.28, mono_fat: 5.01,
    poly_fat: 4.06, trans_fat: null, omega3: 1.61, cholesterol: 62,
    sodium: 49, potassium: 378, calcium: 9, iron: 0.26,
    magnesium: 25.4, phosphorus: 230, zinc: 0.34, selenium: 22.8,
    iodine: 3.2, copper: 0.025, vitamin_a: 2, vitamin_c: null,
    vitamin_d: null, vitamin_b1: null, vitamin_b2: null, vitamin_b3: null,
    vitamin_b5: null, vitamin_b6: null, vitamin_b12: 5.7, folate: null,
    choline: null, fdc_id: "2684441", data_type: "Foundation", notes: "Atlantic salmon, farm raised, raw",
    unit_g: {"g":1}, typical_g: 150, emoji: "🐟", category: "proteins",
  },
  shrimp: {
    kcal: 85, p: 20.1, c: 0, f: 0.51,
    fiber: 0, sugar: 0, sat_fat: 0.101, mono_fat: 0.086,
    poly_fat: 0.152, trans_fat: 0.004, omega3: 0.033, cholesterol: 161,
    sodium: 119, potassium: 264, calcium: 64, iron: 0.52,
    magnesium: 35, phosphorus: 214, zinc: 1.34, selenium: null,
    iodine: null, copper: 0.391, vitamin_a: null, vitamin_c: null,
    vitamin_d: null, vitamin_b1: null, vitamin_b2: null, vitamin_b3: null,
    vitamin_b5: null, vitamin_b6: null, vitamin_b12: null, folate: null,
    choline: null, fdc_id: "175179", data_type: "SR Legacy", notes: "Crustaceans, shrimp, raw",
    unit_g: {"g":1}, typical_g: 150, emoji: "🦐", category: "proteins",
  },
  smoked_bacon: {
    kcal: 548, p: 37, c: 1.5, f: 42.3,
    fiber: 0, sugar: 0, sat_fat: 14, mono_fat: 18.8,
    poly_fat: 5.5, trans_fat: 0.2, omega3: 0.29, cholesterol: 121,
    sodium: 1717, potassium: 565, calcium: 11, iron: 1.1,
    magnesium: 27, phosphorus: 463, zinc: 2.3, selenium: 40.6,
    iodine: null, copper: 0.065, vitamin_a: 0, vitamin_c: 0,
    vitamin_d: 0.6, vitamin_b1: 0.433, vitamin_b2: 0.192, vitamin_b3: 6.17,
    vitamin_b5: 0.671, vitamin_b6: 0.397, vitamin_b12: 0.54, folate: 1,
    choline: 94.7, fdc_id: "168320", data_type: "SR Legacy", notes: "Pork, cured, bacon, raw — smoked bacon lardons",
    unit_g: {"g":1,"tbsp":15}, typical_g: 50, emoji: "🥓", category: "proteins",
  },
  tempeh: {
    kcal: 192, p: 20.3, c: 7.64, f: 10.8,
    fiber: null, sugar: null, sat_fat: 2.54, mono_fat: 3.2,
    poly_fat: 4.3, trans_fat: 0, omega3: 0.248, cholesterol: 0,
    sodium: 9, potassium: 412, calcium: 111, iron: 2.7,
    magnesium: 81, phosphorus: 266, zinc: 1.14, selenium: 0,
    iodine: null, copper: 0.56, vitamin_a: 0, vitamin_c: 0,
    vitamin_d: 0, vitamin_b1: 0.078, vitamin_b2: 0.358, vitamin_b3: 2.64,
    vitamin_b5: 0.278, vitamin_b6: 0.215, vitamin_b12: 0.08, folate: 24,
    choline: null, fdc_id: "174272", data_type: "SR Legacy", notes: "Tempeh, raw",
    category: "proteins",
  },
  tofu: {
    kcal: 144, p: 17.3, c: 2.78, f: 8.72,
    fiber: 2.3, sugar: null, sat_fat: 1.26, mono_fat: 1.92,
    poly_fat: 4.92, trans_fat: 0, omega3: 0.582, cholesterol: 0,
    sodium: 14, potassium: 237, calcium: 683, iron: 2.66,
    magnesium: 58, phosphorus: 190, zinc: 1.57, selenium: 17.4,
    iodine: null, copper: 0.378, vitamin_a: null, vitamin_c: 0.2,
    vitamin_d: 0, vitamin_b1: 0.158, vitamin_b2: 0.102, vitamin_b3: 0.381,
    vitamin_b5: 0.133, vitamin_b6: 0.092, vitamin_b12: 0, folate: 29,
    choline: null, fdc_id: "172475", data_type: "SR Legacy", notes: "Firm tofu, raw, prepared with calcium sulfate",
    unit_g: {"g":1}, typical_g: 150, emoji: "🫘", category: "proteins",
  },
  tuna_canned: {
    kcal: 116, p: 26, c: 0, f: 1,
    unit_g: {"g":1}, typical_g: 130, emoji: "🐟", category: "proteins",
  },
  tuna_oil: {
    kcal: 186, p: 26.5, c: 0, f: 8.08,
    fiber: 0, sugar: 0, sat_fat: 1.53, mono_fat: 2.95,
    poly_fat: 2.88, trans_fat: null, omega3: 0.128, cholesterol: 18,
    sodium: 396, potassium: 333, calcium: 4, iron: 0.65,
    magnesium: 34, phosphorus: 267, zinc: 0.47, selenium: 60.1,
    iodine: null, copper: 0.13, vitamin_a: 5, vitamin_c: 0,
    vitamin_d: null, vitamin_b1: 0.017, vitamin_b2: 0.079, vitamin_b3: 11.7,
    vitamin_b5: 0.37, vitamin_b6: 0.43, vitamin_b12: 2.2, folate: 5,
    choline: null, fdc_id: "175157", data_type: "SR Legacy", notes: "Tuna, white, canned in oil, drained",
    category: "proteins",
  },
  tuna_water: {
    kcal: 128, p: 23.6, c: 0, f: 2.97,
    fiber: 0, sugar: 0, sat_fat: 0.792, mono_fat: 0.784,
    poly_fat: 1.11, trans_fat: null, omega3: 0.88, cholesterol: 42,
    sodium: 416, potassium: 207, calcium: 13, iron: 1.39,
    magnesium: 31, phosphorus: 311, zinc: 0.9, selenium: 76,
    iodine: null, copper: 0.071, vitamin_a: 23, vitamin_c: 0,
    vitamin_d: 6.7, vitamin_b1: 0.038, vitamin_b2: 0.12, vitamin_b3: 12.4,
    vitamin_b5: 0.37, vitamin_b6: 0.11, vitamin_b12: 2.2, folate: 5,
    choline: 29.3, fdc_id: "175158", data_type: "SR Legacy", notes: "Tuna, white, canned in water, drained",
    unit_g: {"g":1}, typical_g: 130, emoji: "🐟", category: "proteins",
  },
  turkey_mince: {
    kcal: 180, p: 16.9, c: 0, f: 12.5,
    fiber: 0, sugar: 0, sat_fat: 3.33, mono_fat: 4.74,
    poly_fat: 3.17, trans_fat: 0.181, omega3: 0.02, cholesterol: 78,
    sodium: null, potassium: null, calcium: null, iron: null,
    magnesium: null, phosphorus: null, zinc: null, selenium: null,
    iodine: null, copper: null, vitamin_a: null, vitamin_c: null,
    vitamin_d: null, vitamin_b1: null, vitamin_b2: null, vitamin_b3: null,
    vitamin_b5: null, vitamin_b6: null, vitamin_b12: null, folate: null,
    choline: null, fdc_id: "174493", data_type: "SR Legacy", notes: "Ground turkey 85% lean / 15% fat, raw",
    unit_g: {"g":1}, typical_g: 150, emoji: "🦃", category: "proteins",
  },
  venison: {
    kcal: 116, p: 21.5, c: 0, f: 2.66,
    fiber: 0, sugar: null, sat_fat: 0.63, mono_fat: 0.34,
    poly_fat: 0.35, trans_fat: null, omega3: 0.05, cholesterol: 18,
    sodium: null, potassium: null, calcium: 7, iron: 2.9,
    magnesium: null, phosphorus: null, zinc: null, selenium: null,
    iodine: null, copper: null, vitamin_a: 0, vitamin_c: 0,
    vitamin_d: null, vitamin_b1: 0.2, vitamin_b2: 0.36, vitamin_b3: 6.6,
    vitamin_b5: null, vitamin_b6: null, vitamin_b12: null, folate: null,
    choline: null, fdc_id: "167622", data_type: "SR Legacy", notes: "Deer (venison), sitka, raw",
    category: "proteins",
  },
  whey_protein: {
    kcal: 370, p: 74, c: 7, f: 4,
    unit_g: {"g":1,"scoop":30}, typical_g: 30, emoji: "💪", category: "proteins",
  },
  whey_protein_concentrate: {
    kcal: 352, p: 78.1, c: 6.25, f: 1.56,
    fiber: 3.1, sugar: 0, sat_fat: 0.781, mono_fat: 0.158,
    poly_fat: 0.299, trans_fat: 0, omega3: null, cholesterol: 16,
    sodium: 156, potassium: 500, calcium: 469, iron: 1.13,
    magnesium: 195, phosphorus: 1320, zinc: 6.18, selenium: 26.7,
    iodine: null, copper: 0.049, vitamin_a: 0, vitamin_c: 0,
    vitamin_d: 0, vitamin_b1: 0.609, vitamin_b2: 2.02, vitamin_b3: 1.14,
    vitamin_b5: 5.52, vitamin_b6: 0.607, vitamin_b12: 2.45, folate: 33,
    choline: 224, fdc_id: "173180", data_type: "SR Legacy", notes: "Whey protein powder concentrate — values are label-based, vary by brand",
    category: "proteins",
  },
  whey_protein_isolate: {
    kcal: 359, p: 58.1, c: 29.1, f: 1.16,
    fiber: 0, sugar: 1.16, sat_fat: 0.581, mono_fat: 0.149,
    poly_fat: 0.021, trans_fat: 0, omega3: null, cholesterol: 16,
    sodium: 372, potassium: 872, calcium: 698, iron: 1.26,
    magnesium: 233, phosphorus: 581, zinc: 8.72, selenium: 40.7,
    iodine: null, copper: 1.16, vitamin_a: 872, vitamin_c: 34.9,
    vitamin_d: 0, vitamin_b1: 0.872, vitamin_b2: 0.988, vitamin_b3: 11.6,
    vitamin_b5: 5.81, vitamin_b6: 1.16, vitamin_b12: 3.49, folate: 233,
    choline: 225, fdc_id: "173177", data_type: "SR Legacy", notes: "Whey protein powder isolate — values are label-based, vary by brand",
    category: "proteins",
  },

  // ──────────────────────────────────────────────────────────
  //  DAIRY & EGGS
  // ──────────────────────────────────────────────────────────

  almond_milk: {
    kcal: 16, p: 0.6, c: 1, f: 1,
    unit_g: {"ml":1,"cup":240}, typical_g: 100, emoji: "🥛", category: "dairy",
  },
  butter: {
    kcal: 717, p: 0.9, c: 0, f: 81,
    unit_g: {"tbsp":14,"tsp":5}, typical_g: 15, emoji: "🧈", category: "dairy",
  },
  cheese_cheddar: {
    kcal: 402, p: 25, c: 1, f: 33,
    unit_g: {"slice":30}, typical_g: 30, emoji: "🧀", category: "dairy",
  },
  cheese_feta: {
    kcal: 264, p: 14, c: 4, f: 21,
    unit_g: {"tbsp":15}, typical_g: 30, emoji: "🧀", category: "dairy",
  },
  cheese_gruyere: {
    kcal: 413, p: 30, c: 0, f: 32,
    unit_g: {"slice":30}, typical_g: 25, emoji: "🧀", category: "dairy",
  },
  cheese_mozz: {
    kcal: 280, p: 22, c: 2.2, f: 22,
    unit_g: {"slice":30}, typical_g: 30, emoji: "🧀", category: "dairy",
  },
  cheese_parm: {
    kcal: 431, p: 38, c: 4, f: 29,
    unit_g: {"tbsp":8,"tsp":3}, typical_g: 15, emoji: "🧀", category: "dairy",
  },
  cheese_provolone: {
    kcal: 352, p: 26, c: 2, f: 27,
    unit_g: {"slice":28}, typical_g: 28, emoji: "🧀", category: "dairy",
  },
  cottage_cheese: {
    kcal: 98, p: 11, c: 3, f: 4.3,
    unit_g: {"tbsp":30}, typical_g: 100, emoji: "🥛", category: "dairy",
  },
  cream_cheese: {
    kcal: 342, p: 6, c: 4, f: 34,
    unit_g: {"tbsp":14,"tsp":5}, typical_g: 25, emoji: "🧀", category: "dairy",
  },
  creme_fraiche: {
    kcal: 292, p: 3, c: 3, f: 30,
    unit_g: {"tbsp":15,"tsp":5}, typical_g: 30, emoji: "🥛", category: "dairy",
  },
  eggs_dairy: {
    kcal: 143, p: 12.6, c: 0.7, f: 9.5,
    unit_g: {"whole":58}, typical_g: 58, emoji: "🥚", category: "dairy",
  },
  greek_yogurt: {
    kcal: 73, p: 10, c: 4, f: 0.4,
    unit_g: {"tbsp":30,"g":1}, typical_g: 150, emoji: "🥛", category: "dairy",
  },
  heavy_cream: {
    kcal: 340, p: 2.8, c: 2.7, f: 37,
    unit_g: {"tbsp":15,"ml":1}, typical_g: 30, emoji: "🥛", category: "dairy",
  },
  labneh: {
    kcal: 190, p: 8, c: 4, f: 16,
    unit_g: {"tbsp":15}, typical_g: 40, emoji: "🥛", category: "dairy",
  },
  milk: {
    kcal: 61, p: 3.2, c: 4.8, f: 3.3,
    unit_g: {"tbsp":15,"ml":1}, typical_g: 50, emoji: "🥛", category: "dairy",
  },
  quark_low_fat: {
    kcal: 67, p: 12, c: 4, f: 0.2,
    unit_g: {"tbsp":30}, typical_g: 150, emoji: "🥛", category: "dairy",
  },
  ricotta: {
    kcal: 174, p: 11, c: 3, f: 13,
    unit_g: {"tbsp":30}, typical_g: 80, emoji: "🧀", category: "dairy",
  },
  skyr: {
    kcal: 63, p: 11, c: 4, f: 0.2,
    unit_g: {"tbsp":30}, typical_g: 150, emoji: "🥛", category: "dairy",
  },
  sour_cream: {
    kcal: 193, p: 2.9, c: 4.7, f: 19,
    unit_g: {"tbsp":14,"tsp":5}, typical_g: 30, emoji: "🥛", category: "dairy",
  },
  soy_milk: {
    kcal: 43, p: 2.8, c: 3.6, f: 1.9,
    fiber: 0.5, sugar: 2.5, sat_fat: 0.3, mono_fat: 0.5,
    poly_fat: 1.1, trans_fat: 0, omega3: 0.15, cholesterol: 0,
    sodium: 39, potassium: 120, calcium: 123, iron: 0.6,
    magnesium: 18, phosphorus: 52, zinc: 0.18, selenium: 2,
    iodine: null, copper: 0.11, vitamin_a: 64, vitamin_c: 0,
    vitamin_d: 1.2, vitamin_b1: 0.04, vitamin_b2: 0.17, vitamin_b3: 0.5,
    vitamin_b5: 0.19, vitamin_b6: 0.07, vitamin_b12: 0.73, folate: 14,
    choline: 23.6, fdc_id: "175215", data_type: "SR Legacy", notes: "Soymilk, unfortified (unsweetened)",
    unit_g: {"ml":1,"cup":240}, typical_g: 100, emoji: "🥛", category: "dairy",
  },
  yoghurt_nonfat: {
    kcal: 56, p: 5.7, c: 7.7, f: 0.2,
    fiber: 0, sugar: 7.7, sat_fat: 0.1, mono_fat: 0.05,
    poly_fat: 0.01, trans_fat: 0, omega3: null, cholesterol: 2,
    sodium: 77, potassium: 255, calcium: 199, iron: 0.07,
    magnesium: 17, phosphorus: 157, zinc: 0.89, selenium: 2.2,
    iodine: null, copper: 0.01, vitamin_a: 2, vitamin_c: 0.5,
    vitamin_d: 0, vitamin_b1: 0.047, vitamin_b2: 0.214, vitamin_b3: 0.12,
    vitamin_b5: 0.55, vitamin_b6: 0.063, vitamin_b12: 0.75, folate: 11,
    choline: 15.1, fdc_id: "171284", data_type: "SR Legacy", notes: "Yogurt, plain, skim milk (0% fat)",
    unit_g: {"tbsp":30,"g":1}, typical_g: 150, emoji: "🥛", category: "dairy",
  },
  yogurt: {
    kcal: 59, p: 10, c: 3.6, f: 0.4,
    unit_g: {"tbsp":15}, typical_g: 80, emoji: "🥛", category: "dairy",
  },

  // ──────────────────────────────────────────────────────────
  //  CARBS (grains, noodles, potatoes, bread)
  // ──────────────────────────────────────────────────────────

  barley: {
    kcal: 354, p: 12.5, c: 73, f: 2.3,
    fiber: 17.3, sugar: null, sat_fat: 0.5, mono_fat: 0.3,
    poly_fat: 1.1, trans_fat: 0, omega3: null, cholesterol: 0,
    sodium: 12, potassium: 452, calcium: 33, iron: 3.6,
    magnesium: 133, phosphorus: 264, zinc: 2.8, selenium: 37.7,
    iodine: null, copper: 0.5, vitamin_a: 1, vitamin_c: 0,
    vitamin_d: 0, vitamin_b1: 0.646, vitamin_b2: 0.285, vitamin_b3: 4.6,
    vitamin_b5: 0.28, vitamin_b6: 0.318, vitamin_b12: 0, folate: 19,
    choline: null, fdc_id: "170283", data_type: "SR Legacy", notes: "Barley, pearled, raw, dry weight",
    category: "carbs",
  },
  bread: {
    kcal: 265, p: 9, c: 51, f: 3.2,
    fiber: 2.7, sugar: 5, sat_fat: 0.7, mono_fat: 0.7,
    poly_fat: 1.4, trans_fat: 0, omega3: null, cholesterol: 0,
    sodium: 491, potassium: 115, calcium: 67, iron: 3.6,
    magnesium: 23, phosphorus: 96, zinc: 0.8, selenium: 28.6,
    iodine: null, copper: 0.13, vitamin_a: 0, vitamin_c: 0,
    vitamin_d: 0, vitamin_b1: 0.495, vitamin_b2: 0.338, vitamin_b3: 5,
    vitamin_b5: 0.38, vitamin_b6: 0.047, vitamin_b12: 0, folate: 148,
    choline: null, fdc_id: "167995", data_type: "SR Legacy", notes: "White bread, commercially prepared",
    unit_g: {"slice":35,"whole":200}, typical_g: 80, emoji: "🫓", category: "carbs",
  },
  brown_rice: {
    kcal: 367, p: 7.9, c: 77, f: 2.9,
    fiber: 3.5, sugar: 0.7, sat_fat: 0.6, mono_fat: 1.1,
    poly_fat: 1, trans_fat: 0, omega3: 0.035, cholesterol: 0,
    sodium: 4, potassium: 268, calcium: 33, iron: 1.8,
    magnesium: 143, phosphorus: 264, zinc: 2, selenium: 23.4,
    iodine: null, copper: 0.28, vitamin_a: 0, vitamin_c: 0,
    vitamin_d: 0, vitamin_b1: 0.401, vitamin_b2: 0.093, vitamin_b3: 5.1,
    vitamin_b5: 1.5, vitamin_b6: 0.509, vitamin_b12: 0, folate: 20,
    choline: null, fdc_id: "169704", data_type: "SR Legacy", notes: "Brown rice, long-grain, raw, dry weight",
    category: "carbs",
  },
  bulgur: {
    kcal: 342, p: 12.3, c: 75, f: 1.3,
    fiber: 18.3, sugar: 0.4, sat_fat: 0.2, mono_fat: 0.2,
    poly_fat: 0.6, trans_fat: 0, omega3: null, cholesterol: 0,
    sodium: 17, potassium: 410, calcium: 35, iron: 2.5,
    magnesium: 164, phosphorus: 300, zinc: 1.9, selenium: 2.3,
    iodine: null, copper: 0.34, vitamin_a: 0, vitamin_c: 0,
    vitamin_d: 0, vitamin_b1: 0.232, vitamin_b2: 0.115, vitamin_b3: 5.1,
    vitamin_b5: null, vitamin_b6: 0.342, vitamin_b12: 0, folate: 27,
    choline: null, fdc_id: "169686", data_type: "SR Legacy", notes: "Bulgur, dry weight",
    unit_g: {"g":1,"cup":180}, typical_g: 80, emoji: "🌾", category: "carbs",
  },
  couscous: {
    kcal: 376, p: 12.8, c: 77, f: 0.6,
    fiber: 5, sugar: null, sat_fat: 0.1, mono_fat: 0.1,
    poly_fat: 0.3, trans_fat: 0, omega3: null, cholesterol: 0,
    sodium: 10, potassium: 166, calcium: 24, iron: 1.1,
    magnesium: 44, phosphorus: 170, zinc: 0.8, selenium: 27.5,
    iodine: null, copper: 0.19, vitamin_a: 0, vitamin_c: 0,
    vitamin_d: 0, vitamin_b1: 0.16, vitamin_b2: 0.08, vitamin_b3: 3.1,
    vitamin_b5: null, vitamin_b6: 0.11, vitamin_b12: 0, folate: 20,
    choline: null, fdc_id: "169699", data_type: "SR Legacy", notes: "Couscous, dry weight",
    unit_g: {"g":1,"cup":180}, typical_g: 80, emoji: "🌾", category: "carbs",
  },
  egg_noodle: {
    kcal: 357, p: 13, c: 71, f: 1.5,
    fiber: 2.1, sugar: null, sat_fat: 0.3, mono_fat: 0.4,
    poly_fat: 0.4, trans_fat: 0, omega3: null, cholesterol: 0,
    sodium: 338, potassium: 200, calcium: 30, iron: 2.3,
    magnesium: 40, phosphorus: 170, zinc: 1.2, selenium: null,
    iodine: null, copper: null, vitamin_a: null, vitamin_c: null,
    vitamin_d: null, vitamin_b1: null, vitamin_b2: null, vitamin_b3: null,
    vitamin_b5: null, vitamin_b6: null, vitamin_b12: null, folate: null,
    choline: null, fdc_id: "168905", data_type: "SR Legacy", notes: "Egg noodle, dry weight",
    category: "carbs",
  },
  glass_noodle: {
    kcal: 351, p: 0, c: 86, f: 0.1,
    fiber: 0.5, sugar: null, sat_fat: 0, mono_fat: 0,
    poly_fat: 0, trans_fat: 0, omega3: null, cholesterol: 0,
    sodium: 10, potassium: 10, calcium: 25, iron: 0.9,
    magnesium: null, phosphorus: null, zinc: null, selenium: null,
    iodine: null, copper: null, vitamin_a: 0, vitamin_c: 0,
    vitamin_d: 0, vitamin_b1: 0, vitamin_b2: 0, vitamin_b3: 0,
    vitamin_b5: null, vitamin_b6: 0, vitamin_b12: 0, folate: null,
    choline: null, fdc_id: "169735", data_type: "SR Legacy", notes: "Glass noodles (mung bean), dry weight",
    unit_g: {"tbsp":20}, typical_g: 30, emoji: "🍜", category: "carbs",
  },
  naan: {
    kcal: 307, p: 10, c: 50, f: 7.4,
    fiber: 2, sugar: 4.5, sat_fat: 1.1, mono_fat: 2.8,
    poly_fat: 2.9, trans_fat: 0, omega3: null, cholesterol: 14,
    sodium: 530, potassium: 130, calcium: 72, iron: 2.6,
    magnesium: 22, phosphorus: 95, zinc: 0.8, selenium: 20,
    iodine: null, copper: 0.1, vitamin_a: 0, vitamin_c: 0,
    vitamin_d: 0, vitamin_b1: 0.43, vitamin_b2: 0.28, vitamin_b3: 4,
    vitamin_b5: 0.32, vitamin_b6: 0.06, vitamin_b12: 0.05, folate: 106,
    choline: null, fdc_id: "172795", data_type: "SR Legacy", notes: "Bread, naan, commercially prepared",
    unit_g: {"piece":90,"g":1}, typical_g: 90, emoji: "🫓", category: "carbs",
  },
  noodle: {
    kcal: 357, p: 13, c: 71, f: 1.5,
    fiber: 2.1, sugar: null, sat_fat: 0.3, mono_fat: 0.4,
    poly_fat: 0.4, trans_fat: 0, omega3: null, cholesterol: 0,
    sodium: 338, potassium: 200, calcium: 30, iron: 2.3,
    magnesium: 40, phosphorus: 170, zinc: 1.2, selenium: null,
    iodine: null, copper: null, vitamin_a: null, vitamin_c: null,
    vitamin_d: null, vitamin_b1: null, vitamin_b2: null, vitamin_b3: null,
    vitamin_b5: null, vitamin_b6: null, vitamin_b12: null, folate: null,
    choline: null, fdc_id: "168905", data_type: "SR Legacy", notes: "Egg noodle, dry weight",
    unit_g: {"g":1}, typical_g: 80, emoji: "🍜", category: "carbs",
  },
  oats: {
    kcal: 389, p: 16.9, c: 66, f: 6.9,
    fiber: 10.6, sugar: 0, sat_fat: 1.2, mono_fat: 2.2,
    poly_fat: 2.5, trans_fat: 0, omega3: 0.111, cholesterol: 0,
    sodium: 2, potassium: 429, calcium: 54, iron: 4.7,
    magnesium: 177, phosphorus: 523, zinc: 4, selenium: 34.4,
    iodine: null, copper: 0.63, vitamin_a: 0, vitamin_c: 0,
    vitamin_d: 0, vitamin_b1: 0.763, vitamin_b2: 0.139, vitamin_b3: 0.96,
    vitamin_b5: 1.35, vitamin_b6: 0.12, vitamin_b12: 0, folate: 56,
    choline: null, fdc_id: "173904", data_type: "SR Legacy", notes: "Oats, rolled, dry weight",
    unit_g: {"cup":90,"g":1}, typical_g: 80, emoji: "🌾", category: "carbs",
  },
  pasta: {
    kcal: 371, p: 13, c: 74, f: 1.5,
    fiber: 3.2, sugar: 2.7, sat_fat: 0.3, mono_fat: 0.2,
    poly_fat: 0.6, trans_fat: 0, omega3: null, cholesterol: 0,
    sodium: 6, potassium: 223, calcium: 20, iron: 1.3,
    magnesium: 53, phosphorus: 189, zinc: 1.4, selenium: 63.2,
    iodine: null, copper: 0.29, vitamin_a: 0, vitamin_c: 0,
    vitamin_d: 0, vitamin_b1: 0.891, vitamin_b2: 0.411, vitamin_b3: 7.2,
    vitamin_b5: 0.43, vitamin_b6: 0.157, vitamin_b12: 0, folate: 237,
    choline: null, fdc_id: "169734", data_type: "SR Legacy", notes: "Pasta, dry, enriched, dry weight",
    unit_g: {"g":1}, typical_g: 80, emoji: "🍝", category: "carbs",
  },
  potato: {
    kcal: 77, p: 2, c: 17.5, f: 0.1,
    fiber: 2.2, sugar: 0.8, sat_fat: 0, mono_fat: 0,
    poly_fat: 0.1, trans_fat: 0, omega3: null, cholesterol: 0,
    sodium: 6, potassium: 425, calcium: 12, iron: 0.8,
    magnesium: 23, phosphorus: 57, zinc: 0.3, selenium: 0.4,
    iodine: null, copper: 0.11, vitamin_a: 0, vitamin_c: 19.7,
    vitamin_d: 0, vitamin_b1: 0.081, vitamin_b2: 0.032, vitamin_b3: 1.1,
    vitamin_b5: 0.296, vitamin_b6: 0.298, vitamin_b12: 0, folate: 15,
    choline: 12.1, fdc_id: "170026", data_type: "SR Legacy", notes: "Potato, raw, flesh and skin",
    unit_g: {"whole":150,"g":1}, typical_g: 300, emoji: "🥔", category: "carbs",
  },
  quinoa: {
    kcal: 368, p: 14.1, c: 64, f: 6.1,
    fiber: 7, sugar: null, sat_fat: 0.7, mono_fat: 1.6,
    poly_fat: 3.3, trans_fat: 0, omega3: 0.26, cholesterol: 0,
    sodium: 5, potassium: 563, calcium: 47, iron: 4.6,
    magnesium: 197, phosphorus: 457, zinc: 3.1, selenium: 8.5,
    iodine: null, copper: 0.59, vitamin_a: 1, vitamin_c: 0,
    vitamin_d: 0, vitamin_b1: 0.36, vitamin_b2: 0.318, vitamin_b3: 1.52,
    vitamin_b5: 0.77, vitamin_b6: 0.487, vitamin_b12: 0, folate: 184,
    choline: null, fdc_id: "168917", data_type: "SR Legacy", notes: "Quinoa, raw, dry weight",
    category: "carbs",
  },
  rice: {
    kcal: 365, p: 7.1, c: 80, f: 0.7,
    fiber: 0.4, sugar: 0.1, sat_fat: 0.2, mono_fat: 0.2,
    poly_fat: 0.2, trans_fat: 0, omega3: null, cholesterol: 0,
    sodium: 1, potassium: 115, calcium: 9, iron: 0.8,
    magnesium: 35, phosphorus: 115, zinc: 1.1, selenium: 15.1,
    iodine: null, copper: 0.22, vitamin_a: 0, vitamin_c: 0,
    vitamin_d: 0, vitamin_b1: 0.163, vitamin_b2: 0.016, vitamin_b3: 1.9,
    vitamin_b5: 1.1, vitamin_b6: 0.164, vitamin_b12: 0, folate: 8,
    choline: null, fdc_id: "168878", data_type: "SR Legacy", notes: "White rice, long-grain, raw, dry weight. Also use for Jasmine, Basmati, Sushi rice",
    unit_g: {"g":1}, typical_g: 80, emoji: "🍚", category: "carbs",
  },
  rice_cooked: {
    kcal: 130, p: 2.7, c: 28, f: 0.3,
    unit_g: {"g":1}, typical_g: 150, emoji: "🍚", category: "carbs",
  },
  rice_vermicelli: {
    kcal: 364, p: 8.1, c: 80.2, f: 0.3,
    fiber: 2.4, sugar: null, sat_fat: 0.1, mono_fat: 0.1,
    poly_fat: 0.1, trans_fat: 0, omega3: null, cholesterol: 0,
    sodium: 10, potassium: 55, calcium: 12, iron: 0.7,
    magnesium: 20, phosphorus: 60, zinc: 0.6, selenium: null,
    iodine: null, copper: null, vitamin_a: 0, vitamin_c: 0,
    vitamin_d: 0, vitamin_b1: 0.04, vitamin_b2: 0.03, vitamin_b3: 1.6,
    vitamin_b5: null, vitamin_b6: 0.06, vitamin_b12: 0, folate: 4,
    choline: null, fdc_id: "168907", data_type: "SR Legacy", notes: "Rice noodles (vermicelli), dry weight",
    unit_g: {"g":1}, typical_g: 80, emoji: "🍜", category: "carbs",
  },
  sweet_potato: {
    kcal: 86, p: 1.6, c: 20, f: 0.1,
    fiber: 3, sugar: 4.2, sat_fat: 0, mono_fat: 0,
    poly_fat: 0, trans_fat: 0, omega3: null, cholesterol: 0,
    sodium: 55, potassium: 337, calcium: 30, iron: 0.6,
    magnesium: 25, phosphorus: 47, zinc: 0.3, selenium: 0.6,
    iodine: null, copper: 0.15, vitamin_a: 961, vitamin_c: 2.4,
    vitamin_d: 0, vitamin_b1: 0.078, vitamin_b2: 0.061, vitamin_b3: 0.557,
    vitamin_b5: 0.8, vitamin_b6: 0.209, vitamin_b12: 0, folate: 11,
    choline: 12.3, fdc_id: "168482", data_type: "SR Legacy", notes: "Sweet potato, raw, unprepared",
    category: "carbs",
  },
  tortilla: {
    kcal: 312, p: 8, c: 51, f: 8,
    fiber: 2.4, sugar: null, sat_fat: 2, mono_fat: 3.5,
    poly_fat: 1.9, trans_fat: 0, omega3: null, cholesterol: 0,
    sodium: 604, potassium: 138, calcium: 95, iron: 3,
    magnesium: 23, phosphorus: 113, zinc: 0.5, selenium: null,
    iodine: null, copper: null, vitamin_a: 0, vitamin_c: 0,
    vitamin_d: 0, vitamin_b1: 0.55, vitamin_b2: 0.33, vitamin_b3: 4.7,
    vitamin_b5: null, vitamin_b6: null, vitamin_b12: 0, folate: 136,
    choline: null, fdc_id: "175036", data_type: "SR Legacy", notes: "Tortilla, flour, ready to bake or fry",
    unit_g: {"piece":45,"g":1}, typical_g: 45, emoji: "🌯", category: "carbs",
  },
  tortilla_wheat: {
    kcal: 312, p: 8, c: 51, f: 8,
    unit_g: {"piece":45,"g":1}, typical_g: 45, emoji: "🌯", category: "carbs",
  },
  white_bread: {
    kcal: 265, p: 9, c: 51, f: 3.2,
    fiber: 2.7, sugar: 5, sat_fat: 0.7, mono_fat: 0.7,
    poly_fat: 1.4, trans_fat: 0, omega3: null, cholesterol: 0,
    sodium: 491, potassium: 115, calcium: 67, iron: 3.6,
    magnesium: 23, phosphorus: 96, zinc: 0.8, selenium: 28.6,
    iodine: null, copper: 0.13, vitamin_a: 0, vitamin_c: 0,
    vitamin_d: 0, vitamin_b1: 0.495, vitamin_b2: 0.338, vitamin_b3: 5,
    vitamin_b5: 0.38, vitamin_b6: 0.047, vitamin_b12: 0, folate: 148,
    choline: null, fdc_id: "167995", data_type: "SR Legacy", notes: "White bread, commercially prepared",
    category: "carbs",
  },
  white_rice: {
    kcal: 365, p: 7.1, c: 80, f: 0.7,
    fiber: 0.4, sugar: 0.1, sat_fat: 0.2, mono_fat: 0.2,
    poly_fat: 0.2, trans_fat: 0, omega3: null, cholesterol: 0,
    sodium: 1, potassium: 115, calcium: 9, iron: 0.8,
    magnesium: 35, phosphorus: 115, zinc: 1.1, selenium: 15.1,
    iodine: null, copper: 0.22, vitamin_a: 0, vitamin_c: 0,
    vitamin_d: 0, vitamin_b1: 0.163, vitamin_b2: 0.016, vitamin_b3: 1.9,
    vitamin_b5: 1.1, vitamin_b6: 0.164, vitamin_b12: 0, folate: 8,
    choline: null, fdc_id: "168878", data_type: "SR Legacy", notes: "White rice, long-grain, raw, dry weight. Also use for Jasmine, Basmati, Sushi rice",
    unit_g: {"g":1}, typical_g: 80, emoji: "🍚", category: "carbs",
  },

  // ──────────────────────────────────────────────────────────
  //  FRESH PRODUCE (vegetables, fruit, fresh herbs & aromatics)
  // ──────────────────────────────────────────────────────────

  apple: {
    kcal: 52, p: 0.3, c: 13.8, f: 0.2,
    fiber: 2.4, sugar: 10.4,
    fdc_id: null, data_type: "Estimated",
    notes: "Apple, raw, with skin",
    unit_g: {"whole":180}, typical_g: 150, emoji: "🍎", category: "fresh",
  },
  avocado: {
    kcal: 160, p: 2, c: 9, f: 15,
    unit_g: {"whole":150}, typical_g: 75, emoji: "🥑", category: "fresh",
  },
  banana: {
    kcal: 89, p: 1.1, c: 23, f: 0.3,
    unit_g: {"piece":120,"g":1}, typical_g: 120, emoji: "🍌", category: "fresh",
  },
  basil: {
    kcal: 23, p: 3, c: 3, f: 1,
    unit_g: {"handful":10}, typical_g: 8, emoji: "🌿", category: "fresh",
  },
  bean_sprouts: {
    kcal: 30, p: 3, c: 6, f: 0,
    unit_g: {"handful":50}, typical_g: 80, emoji: "🌱", category: "fresh",
  },
  bell_pepper: {
    kcal: 31, p: 1, c: 6, f: 0.3,
    unit_g: {"whole":160}, typical_g: 80, emoji: "🫑", category: "fresh",
  },
  bok_choy: {
    kcal: 13, p: 1.5, c: 2.2, f: 0.2,
    unit_g: {"whole":200}, typical_g: 120, emoji: "🥬", category: "fresh",
  },
  broccoli: {
    kcal: 34, p: 3, c: 7, f: 0.4,
    unit_g: {"whole":200,"handful":80}, typical_g: 100, emoji: "🥦", category: "fresh",
  },
  cabbage: {
    kcal: 25, p: 1.3, c: 5.8, f: 0.1,
    unit_g: {"handful":60}, typical_g: 80, emoji: "🥬", category: "fresh",
  },
  carrot: {
    kcal: 41, p: 1, c: 10, f: 0,
    unit_g: {"whole":80}, typical_g: 50, emoji: "🥕", category: "fresh",
  },
  celery: {
    kcal: 16, p: 0.7, c: 3, f: 0.2,
    fiber: 1.6, sugar: 1.3,
    fdc_id: null, data_type: "Estimated",
    notes: "Celery, raw, stalks",
    unit_g: {"stalk":40,"whole":300}, typical_g: 60, emoji: "🌿", category: "fresh",
  },
  chili_fresh: {
    kcal: 40, p: 2, c: 9, f: 0,
    unit_g: {"whole":15}, typical_g: 10, emoji: "🌶️", category: "fresh",
  },
  chives: {
    kcal: 30, p: 3, c: 4, f: 1,
    unit_g: {"tbsp":5,"tsp":2}, typical_g: 8, emoji: "🌿", category: "fresh",
  },
  cilantro: {
    kcal: 23, p: 2, c: 4, f: 0,
    unit_g: {"handful":15}, typical_g: 10, emoji: "🌿", category: "fresh",
  },
  corn: {
    kcal: 86, p: 3.3, c: 19, f: 1.4,
    unit_g: {"whole":150}, typical_g: 80, emoji: "🌽", category: "fresh",
  },
  cucumber: {
    kcal: 15, p: 1, c: 4, f: 0,
    unit_g: {"whole":200}, typical_g: 80, emoji: "🥒", category: "fresh",
  },
  daikon: {
    kcal: 18, p: 1, c: 4, f: 0,
    unit_g: {"whole":300}, typical_g: 80, emoji: "🌿", category: "fresh",
  },
  dill_fresh: {
    kcal: 43, p: 4, c: 7, f: 1,
    unit_g: {"handful":10}, typical_g: 8, emoji: "🌿", category: "fresh",
  },
  eggplant: {
    kcal: 25, p: 1, c: 6, f: 0.2,
    unit_g: {"whole":300}, typical_g: 150, emoji: "🍆", category: "fresh",
  },
  frozen_peas: {
    kcal: 77, p: 5, c: 14, f: 0.4,
    unit_g: {"g":1,"cup":150}, typical_g: 80, emoji: "🫛", category: "fresh",
  },
  galangal: {
    kcal: 63, p: 1.7, c: 15.3, f: 0.5,
    fiber: 2.1, sugar: null, sat_fat: null, mono_fat: null,
    poly_fat: null, trans_fat: 0, omega3: null, cholesterol: 0,
    sodium: 9, potassium: 194, calcium: 16, iron: 1.5,
    magnesium: 33, phosphorus: 74, zinc: 0.3, selenium: null,
    iodine: null, copper: 0.09, vitamin_a: 0, vitamin_c: 5,
    vitamin_d: 0, vitamin_b1: 0.006, vitamin_b2: 0.034, vitamin_b3: 5,
    vitamin_b5: null, vitamin_b6: 0.16, vitamin_b12: 0, folate: null,
    choline: null, fdc_id: null, data_type: "Estimated", notes: "Galangal root, raw — values estimated from similar rhizomes",
    unit_g: {"tsp":3,"tbsp":9}, typical_g: 5, emoji: "🌿", category: "fresh",
  },
  garlic: {
    kcal: 149, p: 6, c: 33, f: 0.5,
    unit_g: {"clove":5}, typical_g: 15, emoji: "🧄", category: "fresh",
  },
  ginger: {
    kcal: 80, p: 2, c: 18, f: 1,
    unit_g: {"tbsp":8,"tsp":3}, typical_g: 10, emoji: "🫚", category: "fresh",
  },
  jalapeño: {
    kcal: 29, p: 1, c: 7, f: 0.3,
    unit_g: {"whole":14}, typical_g: 14, emoji: "🌶️", category: "fresh",
  },
  kaffir_lime: {
    kcal: 50, p: 1, c: 12, f: 0,
    unit_g: {"whole":2}, typical_g: 2, emoji: "🌿", category: "fresh",
  },
  kale: {
    kcal: 49, p: 4, c: 9, f: 1,
    unit_g: {"handful":30}, typical_g: 60, emoji: "🥬", category: "fresh",
  },
  kimchi: {
    kcal: 15, p: 1, c: 3, f: 0,
    unit_g: {"tbsp":30}, typical_g: 60, emoji: "🥬", category: "fresh",
  },
  leek: {
    kcal: 61, p: 2, c: 14, f: 0,
    unit_g: {"whole":80}, typical_g: 60, emoji: "🌿", category: "fresh",
  },
  lemon: {
    kcal: 29, p: 1, c: 9, f: 0,
    unit_g: {"whole":58,"tbsp":15}, typical_g: 15, emoji: "🍋", category: "fresh",
  },
  lemongrass: {
    kcal: 99, p: 2, c: 25, f: 1,
    unit_g: {"stalk":20}, typical_g: 20, emoji: "🌿", category: "fresh",
  },
  lettuce: {
    kcal: 15, p: 1, c: 3, f: 0,
    unit_g: {"handful":30}, typical_g: 50, emoji: "🥬", category: "fresh",
  },
  lime: {
    kcal: 30, p: 1, c: 11, f: 0,
    unit_g: {"whole":44,"tbsp":15}, typical_g: 15, emoji: "🍋", category: "fresh",
  },
  mint: {
    kcal: 44, p: 3, c: 9, f: 1,
    unit_g: {"handful":10}, typical_g: 8, emoji: "🌿", category: "fresh",
  },
  mushroom: {
    kcal: 22, p: 3.1, c: 3.3, f: 0.3,
    unit_g: {"whole":20}, typical_g: 80, emoji: "🍄", category: "fresh",
  },
  onion: {
    kcal: 40, p: 1, c: 9, f: 0.1,
    unit_g: {"whole":110}, typical_g: 80, emoji: "🧅", category: "fresh",
  },
  orange: {
    kcal: 47, p: 0.9, c: 11.8, f: 0.1,
    fiber: 2.4, sugar: 9.4,
    fdc_id: null, data_type: "Estimated",
    notes: "Orange, raw, all commercial varieties",
    unit_g: {"whole":130,"segment":16}, typical_g: 130, emoji: "🍊", category: "fresh",
  },
  pandan: {
    kcal: 100, p: 2, c: 22, f: 1,
    unit_g: {"whole":5}, typical_g: 5, emoji: "🌿", category: "fresh",
  },
  parsley: {
    kcal: 36, p: 3, c: 6, f: 1,
    unit_g: {"handful":15}, typical_g: 10, emoji: "🌿", category: "fresh",
  },
  radish: {
    kcal: 16, p: 0.7, c: 3.4, f: 0.1,
    unit_g: {"piece":10,"slice":3}, typical_g: 30, emoji: "🌿", category: "fresh",
  },
  rosemary: {
    kcal: 131, p: 3, c: 21, f: 6,
    unit_g: {"tbsp":2,"tsp":1}, typical_g: 3, emoji: "🌿", category: "fresh",
  },
  scallion: {
    kcal: 32, p: 2, c: 7, f: 0.2,
    unit_g: {"stalk":15}, typical_g: 30, emoji: "🌱", category: "fresh",
  },
  shallot: {
    kcal: 72, p: 2.5, c: 17, f: 0.1,
    unit_g: {"piece":30,"tbsp":15}, typical_g: 30, emoji: "🧅", category: "fresh",
  },
  snap_peas: {
    kcal: 42, p: 3, c: 8, f: 0.2,
    unit_g: {"handful":50}, typical_g: 60, emoji: "🫛", category: "fresh",
  },
  spinach: {
    kcal: 23, p: 2.9, c: 3.6, f: 0.4,
    unit_g: {"handful":30}, typical_g: 60, emoji: "🥬", category: "fresh",
  },
  thai_basil: {
    kcal: 22, p: 3, c: 3, f: 0,
    unit_g: {"handful":10}, typical_g: 10, emoji: "🌿", category: "fresh",
  },
  tomatillo: {
    kcal: 32, p: 1, c: 5.8, f: 1,
    fiber: 1.9, sugar: 3.9, sat_fat: 0.1, mono_fat: 0.2,
    poly_fat: 0.4, trans_fat: 0, omega3: null, cholesterol: 0,
    sodium: 1, potassium: 268, calcium: 7, iron: 0.6,
    magnesium: 20, phosphorus: 39, zinc: 0.2, selenium: 0.5,
    iodine: null, copper: 0.08, vitamin_a: 6, vitamin_c: 11.7,
    vitamin_d: 0, vitamin_b1: 0.04, vitamin_b2: 0.03, vitamin_b3: 1.8,
    vitamin_b5: 0.18, vitamin_b6: 0.05, vitamin_b12: 0, folate: 7,
    choline: 8.3, fdc_id: "168550", data_type: "SR Legacy", notes: "Tomatillos, raw",
    unit_g: {"piece":35}, typical_g: 50, emoji: "🍅", category: "fresh",
  },
  tomato: {
    kcal: 18, p: 1, c: 4, f: 0,
    unit_g: {"whole":120}, typical_g: 100, emoji: "🍅", category: "fresh",
  },
  zucchini: {
    kcal: 17, p: 1, c: 3, f: 0.3,
    unit_g: {"whole":200}, typical_g: 150, emoji: "🥒", category: "fresh",
  },

  // ──────────────────────────────────────────────────────────
  //  SAUCES & CONDIMENTS
  // ──────────────────────────────────────────────────────────

  anchovy_paste: {
    kcal: 128, p: 22, c: 0, f: 4,
    unit_g: {"tsp":5,"tbsp":15}, typical_g: 10, emoji: "🐟", category: "sauces",
  },
  apple_cider_vinegar: {
    kcal: 21, p: 0, c: 0.9, f: 0,
    unit_g: {"tbsp":15,"tsp":5}, typical_g: 10, emoji: "🫙", category: "sauces",
  },
  balsamic_glaze: {
    kcal: 160, p: 1, c: 38, f: 0,
    unit_g: {"tbsp":15,"tsp":5}, typical_g: 15, emoji: "🫙", category: "sauces",
  },
  bbq_sauce: {
    kcal: 172, p: 1, c: 40, f: 1,
    unit_g: {"tbsp":16,"tsp":5}, typical_g: 30, emoji: "🫙", category: "sauces",
  },
  capers: {
    kcal: 23, p: 2, c: 5, f: 0.9,
    unit_g: {"tbsp":15}, typical_g: 10, emoji: "🫙", category: "sauces",
  },
  chili_oil: {
    kcal: 500, p: 2, c: 5, f: 52,
    unit_g: {"tbsp":14,"tsp":5}, typical_g: 10, emoji: "🌶️", category: "sauces",
  },
  chipotle_adobo: {
    kcal: 120, p: 2, c: 18, f: 5,
    unit_g: {"tbsp":15,"tsp":5}, typical_g: 15, emoji: "🌶️", category: "sauces",
  },
  coconut_milk: {
    kcal: 197, p: 2, c: 6, f: 21,
    unit_g: {"tbsp":15,"ml":1}, typical_g: 60, emoji: "🥥", category: "sauces",
  },
  curry_paste: {
    kcal: 150, p: 5, c: 12, f: 10,
    unit_g: {"tbsp":18,"tsp":6}, typical_g: 25, emoji: "🌿", category: "sauces",
  },
  dijon: {
    kcal: 66, p: 4, c: 5, f: 4,
    unit_g: {"tbsp":15,"tsp":5}, typical_g: 10, emoji: "🫙", category: "sauces",
  },
  doenjang: {
    kcal: 180, p: 11, c: 22, f: 5,
    unit_g: {"tbsp":18,"tsp":6}, typical_g: 20, emoji: "🫙", category: "sauces",
  },
  doubanjiang: {
    kcal: 100, p: 7, c: 8, f: 4,
    unit_g: {"tbsp":18,"tsp":6}, typical_g: 20, emoji: "🫙", category: "sauces",
  },
  fish_sauce: {
    kcal: 25, p: 4, c: 3, f: 0,
    unit_g: {"tbsp":15,"tsp":5}, typical_g: 15, emoji: "🫙", category: "sauces",
  },
  gochujang: {
    kcal: 190, p: 5, c: 37, f: 2,
    unit_g: {"tbsp":18,"tsp":6}, typical_g: 25, emoji: "🌶️", category: "sauces",
  },
  harissa: {
    kcal: 152, p: 3, c: 12, f: 10,
    unit_g: {"tbsp":16,"tsp":5}, typical_g: 15, emoji: "🌶️", category: "sauces",
  },
  hoisin: {
    kcal: 220, p: 4, c: 43, f: 4,
    unit_g: {"tbsp":16,"tsp":5}, typical_g: 20, emoji: "🫙", category: "sauces",
  },
  hot_sauce: {
    kcal: 30, p: 1, c: 5, f: 0,
    unit_g: {"tbsp":15,"tsp":5}, typical_g: 10, emoji: "🌶️", category: "sauces",
  },
  ketchup: {
    kcal: 101, p: 1, c: 25, f: 0,
    unit_g: {"tbsp":15,"tsp":5}, typical_g: 20, emoji: "🫙", category: "sauces",
  },
  mayo: {
    kcal: 680, p: 1, c: 2, f: 75,
    unit_g: {"tbsp":14,"tsp":5}, typical_g: 15, emoji: "🫙", category: "sauces",
  },
  mayo_light: {
    kcal: 330, p: 0.5, c: 6, f: 33,
    unit_g: {"tbsp":14,"tsp":5}, typical_g: 15, emoji: "🫙", category: "sauces",
  },
  mirin: {
    kcal: 233, p: 0.5, c: 55, f: 0,
    unit_g: {"tbsp":15,"tsp":5}, typical_g: 15, emoji: "🫙", category: "sauces",
  },
  miso: {
    kcal: 199, p: 12, c: 27, f: 6,
    unit_g: {"tbsp":18,"tsp":6}, typical_g: 20, emoji: "🫙", category: "sauces",
  },
  mustard: {
    kcal: 66, p: 4, c: 6, f: 4,
    unit_g: {"tsp":5,"tbsp":15}, typical_g: 10, emoji: "🫙", category: "sauces",
  },
  oyster_sauce: {
    kcal: 87, p: 3, c: 18, f: 0.3,
    unit_g: {"tbsp":18,"tsp":6}, typical_g: 25, emoji: "🫙", category: "sauces",
  },
  peanut_butter: {
    kcal: 593, p: 25, c: 20, f: 51,
    unit_g: {"tbsp":16,"tsp":5}, typical_g: 20, emoji: "🥜", category: "sauces",
  },
  pickle_juice: {
    kcal: 3, p: 0, c: 0.4, f: 0,
    unit_g: {"tbsp":15,"tsp":5}, typical_g: 15, emoji: "🫙", category: "sauces",
  },
  ponzu: {
    kcal: 51, p: 3, c: 9, f: 0,
    unit_g: {"tbsp":15,"tsp":5}, typical_g: 15, emoji: "🫙", category: "sauces",
  },
  red_wine_vinegar: {
    kcal: 19, p: 0, c: 0.3, f: 0,
    unit_g: {"tbsp":15,"tsp":5}, typical_g: 10, emoji: "🫙", category: "sauces",
  },
  rice_vinegar: {
    kcal: 18, p: 0, c: 4, f: 0,
    unit_g: {"tbsp":15,"tsp":5}, typical_g: 15, emoji: "🫙", category: "sauces",
  },
  sake: {
    kcal: 134, p: 0.5, c: 5, f: 0,
    unit_g: {"tbsp":15,"tsp":5}, typical_g: 15, emoji: "🫙", category: "sauces",
  },
  sesame_oil: {
    kcal: 884, p: 0, c: 0, f: 100,
    unit_g: {"tbsp":14,"tsp":4}, typical_g: 7, emoji: "🫙", category: "sauces",
  },
  shio_koji: {
    kcal: 80, p: 3, c: 16, f: 0,
    unit_g: {"tbsp":18,"tsp":6}, typical_g: 20, emoji: "🫙", category: "sauces",
  },
  soy_sauce: {
    kcal: 60, p: 8, c: 8, f: 0,
    unit_g: {"tbsp":15,"tsp":5}, typical_g: 30, emoji: "🫙", category: "sauces",
  },
  sriracha: {
    kcal: 100, p: 1, c: 20, f: 1,
    unit_g: {"tbsp":15,"tsp":5}, typical_g: 10, emoji: "🌶️", category: "sauces",
  },
  sweet_soy: {
    kcal: 260, p: 6, c: 57, f: 0,
    unit_g: {"tbsp":15,"tsp":5}, typical_g: 20, emoji: "🫙", category: "sauces",
  },
  tahini: {
    kcal: 592, p: 17, c: 21, f: 53,
    unit_g: {"tbsp":15,"tsp":5}, typical_g: 20, emoji: "🫙", category: "sauces",
  },
  tamarind: {
    kcal: 239, p: 3, c: 57, f: 0.6,
    unit_g: {"tbsp":16,"tsp":5}, typical_g: 15, emoji: "🫙", category: "sauces",
  },
  teriyaki: {
    kcal: 89, p: 5, c: 15, f: 1,
    unit_g: {"tbsp":15,"tsp":5}, typical_g: 30, emoji: "🫙", category: "sauces",
  },
  toum: {
    kcal: 650, p: 2, c: 6, f: 70,
    unit_g: {"tbsp":14,"tsp":5}, typical_g: 15, emoji: "🧄", category: "sauces",
  },
  worcestershire: {
    kcal: 78, p: 1, c: 19, f: 0,
    unit_g: {"tbsp":15,"tsp":5}, typical_g: 10, emoji: "🫙", category: "sauces",
  },
  yuzu_kosho: {
    kcal: 62, p: 2, c: 8, f: 2,
    unit_g: {"tsp":5}, typical_g: 5, emoji: "🫙", category: "sauces",
  },

  // ──────────────────────────────────────────────────────────
  //  SPICES & DRIED HERBS
  // ──────────────────────────────────────────────────────────

  allspice: {
    kcal: 263, p: 6, c: 72, f: 9,
    unit_g: {"tbsp":7,"tsp":2.5}, typical_g: 2, emoji: "🌿", category: "spices",
  },
  baharat: {
    kcal: 290, p: 10, c: 50, f: 10,
    unit_g: {"tbsp":7,"tsp":2.5}, typical_g: 4, emoji: "🌿", category: "spices",
  },
  bay_leaf: {
    kcal: 313, p: 8, c: 75, f: 8,
    unit_g: {"tbsp":2,"tsp":1}, typical_g: 1, emoji: "🌿", category: "spices",
  },
  bay_leaves: {
    kcal: 313, p: 8, c: 75, f: 8,
    unit_g: {"piece":0.5}, typical_g: 1, emoji: "🌿", category: "spices",
  },
  berbere: {
    kcal: 251, p: 11, c: 43, f: 6,
    unit_g: {"tsp":3,"tbsp":9}, typical_g: 5, emoji: "🌶️", category: "spices",
  },
  black_pepper: {
    kcal: 251, p: 10, c: 64, f: 3,
    unit_g: {"tbsp":7,"tsp":2.5}, typical_g: 2, emoji: "🌿", category: "spices",
  },
  caraway_seeds: {
    kcal: 333, p: 19.8, c: 49.9, f: 14.6,
    fiber: 38, sugar: 0.64, sat_fat: 0.62, mono_fat: 7.12,
    poly_fat: 3.28, trans_fat: 0, omega3: null, cholesterol: 0,
    sodium: 17, potassium: 1351, calcium: 689, iron: 16.2,
    magnesium: 258, phosphorus: 568, zinc: 5.5, selenium: null,
    iodine: null, copper: 0.91, vitamin_a: 18, vitamin_c: 21,
    vitamin_d: 0, vitamin_b1: 0.383, vitamin_b2: 0.379, vitamin_b3: 3.61,
    vitamin_b5: null, vitamin_b6: 0.36, vitamin_b12: 0, folate: 10,
    choline: null, fdc_id: "170921", data_type: "SR Legacy", notes: "Caraway seeds, dried",
    category: "spices",
  },
  cardamom: {
    kcal: 311, p: 11, c: 68, f: 7,
    unit_g: {"tbsp":6,"tsp":2}, typical_g: 2, emoji: "🌿", category: "spices",
  },
  cayenne: {
    kcal: 318, p: 12, c: 57, f: 17,
    unit_g: {"tbsp":6,"tsp":2}, typical_g: 2, emoji: "🌶️", category: "spices",
  },
  chili_flakes: {
    kcal: 318, p: 12, c: 56, f: 17,
    unit_g: {"tbsp":6,"tsp":2}, typical_g: 2, emoji: "🌶️", category: "spices",
  },
  cinnamon: {
    kcal: 247, p: 4, c: 81, f: 1,
    unit_g: {"tbsp":7,"tsp":2.5}, typical_g: 2, emoji: "🌿", category: "spices",
  },
  cloves: {
    kcal: 274, p: 6, c: 66, f: 13,
    unit_g: {"tsp":2,"piece":0.2}, typical_g: 1, emoji: "🌿", category: "spices",
  },
  coriander: {
    kcal: 298, p: 12, c: 55, f: 18,
    unit_g: {"tbsp":7,"tsp":2.5}, typical_g: 3, emoji: "🌿", category: "spices",
  },
  cumin: {
    kcal: 375, p: 18, c: 44, f: 22,
    unit_g: {"tbsp":7,"tsp":2.5}, typical_g: 3, emoji: "🌿", category: "spices",
  },
  curry_powder: {
    kcal: 325, p: 13, c: 55, f: 14,
    unit_g: {"tbsp":7,"tsp":2.5}, typical_g: 5, emoji: "🌿", category: "spices",
  },
  dill_dried: {
    kcal: 253, p: 20, c: 56, f: 4,
    unit_g: {"tbsp":4,"tsp":1.5}, typical_g: 2, emoji: "🌿", category: "spices",
  },
  dukkah: {
    kcal: 450, p: 15, c: 25, f: 38,
    unit_g: {"tbsp":10,"tsp":3}, typical_g: 10, emoji: "🌿", category: "spices",
  },
  five_spice: {
    kcal: 300, p: 10, c: 55, f: 10,
    unit_g: {"tbsp":7,"tsp":2.5}, typical_g: 3, emoji: "🌿", category: "spices",
  },
  furikake: {
    kcal: 200, p: 10, c: 30, f: 6,
    unit_g: {"tbsp":8,"tsp":3}, typical_g: 5, emoji: "🌿", category: "spices",
  },
  garam_masala: {
    kcal: 350, p: 14, c: 52, f: 15,
    unit_g: {"tbsp":7,"tsp":2.5}, typical_g: 4, emoji: "🌿", category: "spices",
  },
  garlic_powder: {
    kcal: 331, p: 17, c: 73, f: 1,
    unit_g: {"tbsp":8,"tsp":3}, typical_g: 3, emoji: "🧄", category: "spices",
  },
  gochugaru: {
    kcal: 282, p: 14, c: 48, f: 5,
    unit_g: {"tbsp":9,"tsp":3}, typical_g: 5, emoji: "🌶️", category: "spices",
  },
  jerk_seasoning: {
    kcal: 270, p: 10, c: 48, f: 8,
    unit_g: {"tbsp":8,"tsp":3}, typical_g: 5, emoji: "🌿", category: "spices",
  },
  kasuri_methi: {
    kcal: 280, p: 23, c: 44, f: 6,
    unit_g: {"tbsp":4,"tsp":1.5}, typical_g: 3, emoji: "🌿", category: "spices",
  },
  msg: {
    kcal: 0, p: 0, c: 0, f: 0,
    unit_g: {"tsp":4}, typical_g: 2, emoji: "🌿", category: "spices",
  },
  onion_powder: {
    kcal: 341, p: 10, c: 80, f: 1,
    unit_g: {"tbsp":8,"tsp":3}, typical_g: 3, emoji: "🧅", category: "spices",
  },
  oregano: {
    kcal: 265, p: 9, c: 64, f: 4,
    unit_g: {"tbsp":4,"tsp":1.5}, typical_g: 2, emoji: "🌿", category: "spices",
  },
  paprika: {
    kcal: 282, p: 14, c: 54, f: 13,
    unit_g: {"tbsp":7,"tsp":2.5}, typical_g: 4, emoji: "🌿", category: "spices",
  },
  ras_el_hanout: {
    kcal: 285, p: 10, c: 48, f: 12,
    unit_g: {"tbsp":7,"tsp":2.5}, typical_g: 4, emoji: "🌿", category: "spices",
  },
  saffron: {
    kcal: 310, p: 11, c: 65, f: 6,
    unit_g: {"tsp":0.5}, typical_g: 0.2, emoji: "🌿", category: "spices",
  },
  smoked_paprika: {
    kcal: 282, p: 14, c: 54, f: 13,
    unit_g: {"tbsp":7,"tsp":2.5}, typical_g: 4, emoji: "🌿", category: "spices",
  },
  star_anise: {
    kcal: 337, p: 18, c: 50, f: 16,
    unit_g: {"tbsp":6,"tsp":2}, typical_g: 2, emoji: "🌿", category: "spices",
  },
  sumac: {
    kcal: 260, p: 5, c: 45, f: 10,
    unit_g: {"tbsp":7,"tsp":2.5}, typical_g: 4, emoji: "🌿", category: "spices",
  },
  tajin: {
    kcal: 120, p: 3, c: 25, f: 2,
    unit_g: {"tbsp":7,"tsp":2.5}, typical_g: 4, emoji: "🌿", category: "spices",
  },
  tandoori_masala: {
    kcal: 300, p: 12, c: 50, f: 12,
    unit_g: {"tbsp":8,"tsp":3}, typical_g: 5, emoji: "🌿", category: "spices",
  },
  thyme: {
    kcal: 276, p: 9, c: 64, f: 7,
    unit_g: {"tbsp":4,"tsp":1.5}, typical_g: 2, emoji: "🌿", category: "spices",
  },
  tikka_paste: {
    kcal: 150, p: 5, c: 12, f: 10,
    unit_g: {"tbsp":18,"tsp":6}, typical_g: 25, emoji: "🌿", category: "spices",
  },
  turmeric: {
    kcal: 354, p: 8, c: 65, f: 10,
    unit_g: {"tbsp":7,"tsp":2.5}, typical_g: 3, emoji: "🌿", category: "spices",
  },
  white_pepper: {
    kcal: 296, p: 10.4, c: 68.6, f: 2.1,
    fiber: 26.2, sugar: null, sat_fat: 0.6, mono_fat: 0.7,
    poly_fat: 0.6, trans_fat: 0, omega3: null, cholesterol: 0,
    sodium: 5, potassium: 73, calcium: 265, iron: 14.3,
    magnesium: 90, phosphorus: 173, zinc: 1, selenium: null,
    iodine: null, copper: 0.19, vitamin_a: 0, vitamin_c: 0,
    vitamin_d: 0, vitamin_b1: 0, vitamin_b2: 0, vitamin_b3: 0,
    vitamin_b5: null, vitamin_b6: 0.1, vitamin_b12: 0, folate: null,
    choline: null, fdc_id: "170931", data_type: "SR Legacy", notes: "Spices, pepper, white",
    unit_g: {"tsp":2,"g":1}, typical_g: 1, emoji: "🌿", category: "spices",
  },
  zaatar: {
    kcal: 270, p: 10, c: 35, f: 12,
    unit_g: {"tbsp":8,"tsp":3}, typical_g: 5, emoji: "🌿", category: "spices",
  },

  // ──────────────────────────────────────────────────────────
  //  PANTRY STAPLES (nuts, legumes, baking, misc.)
  // ──────────────────────────────────────────────────────────

  almonds: {
    kcal: 579, p: 21, c: 22, f: 50,
    unit_g: {"tbsp":15}, typical_g: 15, emoji: "🌰", category: "staples",
  },
  baking_powder: {
    kcal: 53, p: 0, c: 28, f: 0,
    unit_g: {"tsp":4,"g":1}, typical_g: 4, emoji: "🫙", category: "staples",
  },
  black_beans: {
    kcal: 132, p: 8.9, c: 24, f: 0.5,
    fiber: 8.7, sugar: null, sat_fat: 0.1, mono_fat: 0,
    poly_fat: 0.2, trans_fat: 0, omega3: null, cholesterol: 0,
    sodium: 277, potassium: 355, calcium: 46, iron: 2.1,
    magnesium: 70, phosphorus: 140, zinc: 1, selenium: 1.2,
    iodine: null, copper: 0.21, vitamin_a: 0, vitamin_c: 0.8,
    vitamin_d: 0, vitamin_b1: 0.195, vitamin_b2: 0.059, vitamin_b3: 0.5,
    vitamin_b5: 0.22, vitamin_b6: 0.072, vitamin_b12: 0, folate: 149,
    choline: null, fdc_id: "173735", data_type: "SR Legacy", notes: "Black beans, canned, drained",
    unit_g: {"tbsp":30}, typical_g: 80, emoji: "🫘", category: "staples",
  },
  black_olives: {
    kcal: 115, p: 0.8, c: 6, f: 10,
    unit_g: {"g":1,"piece":5}, typical_g: 30, emoji: "🫒", category: "staples",
  },
  breadcrumbs: {
    kcal: 395, p: 13, c: 72, f: 5,
    unit_g: {"tbsp":8,"tsp":3}, typical_g: 20, emoji: "🍞", category: "staples",
  },
  brown_sugar: {
    kcal: 377, p: 0, c: 97.3, f: 0,
    fiber: 0, sugar: 96.4, sat_fat: 0, mono_fat: 0,
    poly_fat: 0, trans_fat: 0, omega3: null, cholesterol: 0,
    sodium: 28, potassium: 346, calcium: 83, iron: 1.9,
    magnesium: 29, phosphorus: 22, zinc: 0.18, selenium: 1.2,
    iodine: null, copper: 0.298, vitamin_a: 0, vitamin_c: 0,
    vitamin_d: 0, vitamin_b1: 0.008, vitamin_b2: 0.007, vitamin_b3: 0.3,
    vitamin_b5: 0.135, vitamin_b6: 0.026, vitamin_b12: 0, folate: 1,
    choline: 2.3, fdc_id: "168833", data_type: "SR Legacy", notes: "Sugars, brown",
    unit_g: {"tsp":4,"tbsp":12}, typical_g: 10, emoji: "🍯", category: "staples",
  },
  canned_tomato: {
    kcal: 32, p: 1.5, c: 7, f: 0.2,
    unit_g: {"tbsp":15}, typical_g: 200, emoji: "🍅", category: "staples",
  },
  cashews: {
    kcal: 553, p: 18.2, c: 30.2, f: 43.8,
    fiber: 3.3, sugar: 5.91, sat_fat: 7.78, mono_fat: 23.8,
    poly_fat: 7.84, trans_fat: 0, omega3: 0.16, cholesterol: 0,
    sodium: 12, potassium: 660, calcium: 37, iron: 6.68,
    magnesium: 292, phosphorus: 593, zinc: 5.78, selenium: 19.9,
    iodine: null, copper: 2.22, vitamin_a: 0, vitamin_c: 0.5,
    vitamin_d: 0, vitamin_b1: 0.423, vitamin_b2: 0.058, vitamin_b3: 1.06,
    vitamin_b5: 0.864, vitamin_b6: 0.417, vitamin_b12: 0, folate: 25,
    choline: 61, fdc_id: "170162", data_type: "SR Legacy", notes: "Cashew nuts, raw",
    category: "staples",
  },
  chicken_stock: {
    kcal: 15, p: 1, c: 1, f: 0.5,
    unit_g: {"tbsp":15,"ml":1}, typical_g: 100, emoji: "🍲", category: "staples",
  },
  chickpeas: {
    kcal: 164, p: 8.9, c: 27, f: 2.6,
    fiber: 7.6, sugar: 4.8, sat_fat: 0.3, mono_fat: 0.6,
    poly_fat: 1.2, trans_fat: 0, omega3: null, cholesterol: 0,
    sodium: 240, potassium: 291, calcium: 42, iron: 2.9,
    magnesium: 48, phosphorus: 168, zinc: 1.5, selenium: 3.7,
    iodine: null, copper: 0.35, vitamin_a: 1, vitamin_c: 1.3,
    vitamin_d: 0, vitamin_b1: 0.085, vitamin_b2: 0.063, vitamin_b3: 0.5,
    vitamin_b5: 0.29, vitamin_b6: 0.135, vitamin_b12: 0, folate: 85,
    choline: null, fdc_id: "173757", data_type: "SR Legacy", notes: "Chickpeas (garbanzo beans), canned, drained",
    category: "staples",
  },
  chocolate_chips: {
    kcal: 540, p: 5, c: 60, f: 30,
    unit_g: {"g":1,"tbsp":15}, typical_g: 20, emoji: "🍫", category: "staples",
  },
  coconut_cream: {
    kcal: 330, p: 3.3, c: 7.7, f: 34,
    unit_g: {"tbsp":15,"ml":1}, typical_g: 40, emoji: "🥥", category: "staples",
  },
  cornstarch: {
    kcal: 381, p: 0.3, c: 91, f: 0.1,
    unit_g: {"tbsp":10,"tsp":3}, typical_g: 8, emoji: "🌾", category: "staples",
  },
  dark_chocolate: {
    kcal: 546, p: 5, c: 60, f: 31,
    unit_g: {"g":1,"tbsp":15}, typical_g: 20, emoji: "🍫", category: "staples",
  },
  dashi: {
    kcal: 5, p: 0, c: 1, f: 0,
    unit_g: {"tbsp":15,"ml":1}, typical_g: 100, emoji: "🍲", category: "staples",
  },
  dried_chili: {
    kcal: 274, p: 12, c: 56, f: 5,
    unit_g: {"whole":2}, typical_g: 3, emoji: "🌶️", category: "staples",
  },
  flour: {
    kcal: 364, p: 10, c: 76, f: 1,
    unit_g: {"tbsp":8,"tsp":3,"g":1}, typical_g: 30, emoji: "🌾", category: "staples",
  },
  fried_shallots: {
    kcal: 490, p: 8, c: 57, f: 25,
    unit_g: {"tbsp":12}, typical_g: 10, emoji: "🧅", category: "staples",
  },
  gherkins: {
    kcal: 11, p: 0.7, c: 2.3, f: 0.2,
    fiber: 0.7, sugar: 1.2, sat_fat: 0, mono_fat: 0,
    poly_fat: 0.1, trans_fat: 0, omega3: null, cholesterol: 0,
    sodium: 456, potassium: 116, calcium: 16, iron: 0.3,
    magnesium: 9, phosphorus: 16, zinc: 0.1, selenium: 0.1,
    iodine: null, copper: 0.02, vitamin_a: 8, vitamin_c: 1.6,
    vitamin_d: 0, vitamin_b1: 0.02, vitamin_b2: 0.02, vitamin_b3: 0.1,
    vitamin_b5: 0.07, vitamin_b6: 0.02, vitamin_b12: 0, folate: 4,
    choline: 6.4, fdc_id: "169401", data_type: "SR Legacy", notes: "Pickles, cucumber, dill (gherkins)",
    unit_g: {"piece":30,"tbsp":15}, typical_g: 30, emoji: "🥒", category: "staples",
  },
  glass_noodles: {
    kcal: 351, p: 0, c: 86, f: 0.1,
    unit_g: {"tbsp":20}, typical_g: 30, emoji: "🍜", category: "staples",
  },
  green_olives: {
    kcal: 145, p: 1, c: 4, f: 15,
    unit_g: {"g":1,"piece":5}, typical_g: 30, emoji: "🫒", category: "staples",
  },
  honey: {
    kcal: 304, p: 0.3, c: 82, f: 0,
    unit_g: {"tbsp":21,"tsp":7}, typical_g: 15, emoji: "🍯", category: "staples",
  },
  japanese_curry_roux: {
    kcal: 488, p: 7, c: 53, f: 29,
    unit_g: {"tbsp":20}, typical_g: 40, emoji: "🍛", category: "staples",
  },
  kidney_beans: {
    kcal: 127, p: 8.7, c: 22, f: 0.5,
    fiber: 6.4, sugar: null, sat_fat: 0.1, mono_fat: 0,
    poly_fat: 0.2, trans_fat: 0, omega3: null, cholesterol: 0,
    sodium: 237, potassium: 403, calcium: 45, iron: 2.9,
    magnesium: 45, phosphorus: 136, zinc: 1.1, selenium: 1.2,
    iodine: null, copper: 0.24, vitamin_a: 0, vitamin_c: 1.4,
    vitamin_d: 0, vitamin_b1: 0.144, vitamin_b2: 0.058, vitamin_b3: 0.6,
    vitamin_b5: 0.22, vitamin_b6: 0.084, vitamin_b12: 0, folate: 130,
    choline: null, fdc_id: "173744", data_type: "SR Legacy", notes: "Kidney beans, canned, drained",
    unit_g: {"tbsp":30}, typical_g: 80, emoji: "🫘", category: "staples",
  },
  lentils: {
    kcal: 352, p: 24.6, c: 63, f: 1.1,
    fiber: 10.7, sugar: null, sat_fat: 0.2, mono_fat: 0.2,
    poly_fat: 0.5, trans_fat: 0, omega3: null, cholesterol: 0,
    sodium: 6, potassium: 905, calcium: 35, iron: 7.5,
    magnesium: 107, phosphorus: 451, zinc: 3.3, selenium: 8.3,
    iodine: null, copper: 0.75, vitamin_a: 2, vitamin_c: 4.4,
    vitamin_d: 0, vitamin_b1: 0.873, vitamin_b2: 0.211, vitamin_b3: 2.6,
    vitamin_b5: 2.14, vitamin_b6: 0.54, vitamin_b12: 0, folate: 479,
    choline: null, fdc_id: "172420", data_type: "SR Legacy", notes: "Lentils, raw, dry weight",
    category: "staples",
  },
  neutral_oil: {
    kcal: 884, p: 0, c: 0, f: 100,
    unit_g: {"tbsp":14,"tsp":4}, typical_g: 10, emoji: "🫙", category: "staples",
  },
  nori: {
    kcal: 35, p: 6, c: 5, f: 0,
    unit_g: {"sheet":2}, typical_g: 2, emoji: "🌿", category: "staples",
  },
  olive_oil: {
    kcal: 884, p: 0, c: 0, f: 100,
    unit_g: {"tbsp":14,"tsp":4}, typical_g: 10, emoji: "🫙", category: "staples",
  },
  orange_juice: {
    kcal: 45, p: 0.7, c: 10.4, f: 0.2,
    fiber: 0.2, sugar: 8.4, sat_fat: 0.02, mono_fat: 0.04,
    poly_fat: 0.04, trans_fat: 0, omega3: null, cholesterol: 0,
    sodium: 1, potassium: 200, calcium: 11, iron: 0.2,
    magnesium: 11, phosphorus: 17, zinc: 0.05, selenium: 0.1,
    iodine: null, copper: 0.04, vitamin_a: 10, vitamin_c: 50,
    vitamin_d: 0, vitamin_b1: 0.087, vitamin_b2: 0.031, vitamin_b3: 0.4,
    vitamin_b5: 0.189, vitamin_b6: 0.042, vitamin_b12: 0, folate: 30,
    choline: 8.4, fdc_id: "169098", data_type: "SR Legacy", notes: "Orange juice, raw, freshly squeezed",
    category: "staples",
  },
  panko: {
    kcal: 385, p: 11, c: 73, f: 7,
    unit_g: {"tbsp":8,"tsp":3}, typical_g: 20, emoji: "🍞", category: "staples",
  },
  peanuts: {
    kcal: 567, p: 26, c: 16, f: 49,
    unit_g: {"tbsp":15}, typical_g: 20, emoji: "🥜", category: "staples",
  },
  pickled_veg: {
    kcal: 20, p: 1, c: 5, f: 0,
    unit_g: {"tbsp":15}, typical_g: 30, emoji: "🥒", category: "staples",
  },
  pine_nuts: {
    kcal: 673, p: 14, c: 13, f: 68,
    unit_g: {"tbsp":9,"g":1}, typical_g: 15, emoji: "🌰", category: "staples",
  },
  pomegranate_mol: {
    kcal: 267, p: 1, c: 68, f: 0.3,
    unit_g: {"tbsp":20,"tsp":7}, typical_g: 15, emoji: "🫙", category: "staples",
  },
  preserved_lemon: {
    kcal: 43, p: 1, c: 10, f: 0,
    unit_g: {"tbsp":15}, typical_g: 15, emoji: "🍋", category: "staples",
  },
  raisins: {
    kcal: 299, p: 3.1, c: 79, f: 0.5,
    unit_g: {"tbsp":10}, typical_g: 15, emoji: "🍇", category: "staples",
  },
  rice_paper: {
    kcal: 344, p: 1, c: 82, f: 0,
    unit_g: {"sheet":10}, typical_g: 10, emoji: "🫓", category: "staples",
  },
  sesame_seeds: {
    kcal: 573, p: 18, c: 23, f: 50,
    unit_g: {"tbsp":9,"tsp":3}, typical_g: 5, emoji: "🌿", category: "staples",
  },
  sugar: {
    kcal: 387, p: 0, c: 100, f: 0,
    unit_g: {"tbsp":12,"tsp":4}, typical_g: 10, emoji: "🍚", category: "staples",
  },
  tomato_paste: {
    kcal: 82, p: 4, c: 19, f: 0.4,
    unit_g: {"tbsp":16,"tsp":5}, typical_g: 20, emoji: "🍅", category: "staples",
  },
  vanilla_extract: {
    kcal: 288, p: 0, c: 13, f: 0.1,
    unit_g: {"tsp":4,"g":1}, typical_g: 4, emoji: "🫙", category: "staples",
  },
  water: {
    kcal: 0, p: 0, c: 0, f: 0,
    unit_g: {"tbsp":15,"tsp":5,"cup":240}, typical_g: 15, category: "staples",
  },
  white_beans: {
    kcal: 90, p: 5.6, c: 16.3, f: 0.29,
    fiber: 4.2, sugar: 0.26, sat_fat: 0.07, mono_fat: 0.02,
    poly_fat: 0.12, trans_fat: 0, omega3: null, cholesterol: 0,
    sodium: 295, potassium: 344, calcium: 67, iron: 2.6,
    magnesium: 37, phosphorus: 107, zinc: 0.88, selenium: 1.3,
    iodine: null, copper: 0.16, vitamin_a: 0, vitamin_c: 0,
    vitamin_d: 0, vitamin_b1: 0.063, vitamin_b2: 0.051, vitamin_b3: 0.19,
    vitamin_b5: 0.19, vitamin_b6: 0.059, vitamin_b12: 0, folate: 88,
    choline: null, fdc_id: "175197", data_type: "SR Legacy", notes: "White beans (cannellini), canned, drained",
    category: "staples",
  },
  white_wine: {
    kcal: 82, p: 0, c: 3, f: 0,
    unit_g: {"tbsp":15,"ml":1}, typical_g: 30, emoji: "🍷", category: "staples",
  },

};

// ──────────────────────────────────────────────────────────
//  SHORT-ID ALIASES — same object reference as their canonical, cited
//  entry above, so they can never carry a different number than it.
//  Needed because recipes.js's carb/protein ids and a few ING_NAME_MAP
//  targets use these short forms directly.
// ──────────────────────────────────────────────────────────
NUTRITION_DB.chicken = NUTRITION_DB.chicken_thigh;
NUTRITION_DB.egg = NUTRITION_DB.eggs;

// ──────────────────────────────────────────────────────────
//  DISPLAY CONFIG — what to show in UI (edit later)
// ──────────────────────────────────────────────────────────
const NUTRITION_DISPLAY = {
  basic:    ["kcal", "p", "c", "f"],
  extended: ["fiber", "sugar", "sat_fat", "cholesterol", "sodium", "potassium"],
  minerals: ["calcium", "iron", "magnesium", "phosphorus", "zinc", "selenium"],
  vitamins: ["vitamin_a", "vitamin_c", "vitamin_d", "vitamin_b12", "folate", "choline"],
};

// ──────────────────────────────────────────────────────────
//  CATEGORY LABELS — for the Nutrition DB tab's filter buttons
// ──────────────────────────────────────────────────────────
const NUTRITION_CATEGORIES = [
  { id: "proteins", label: "Proteins", emoji: "🥩" },
  { id: "dairy", label: "Dairy & Eggs", emoji: "🥛" },
  { id: "carbs", label: "Carbs", emoji: "🍚" },
  { id: "fresh", label: "Fresh Produce", emoji: "🥬" },
  { id: "sauces", label: "Sauces & Condiments", emoji: "🫙" },
  { id: "spices", label: "Spices & Herbs", emoji: "🌿" },
  { id: "staples", label: "Pantry Staples", emoji: "🥫" },
];
