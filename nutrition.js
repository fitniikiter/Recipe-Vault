// ============================================================
//  nutrition.js — FIT NIIKITER'S RECIPE VAULT
//  Complete Nutrition Database — USDA FoodData Central
//  Source: fdc.nal.usda.gov | All values per 100g raw/uncooked
//  Energy: Atwater Specific Factors where available, else General
//  null = data not available in USDA source
// ============================================================
//
//  FIELDS (all per 100g):
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
//  data_type   — Foundation / SR Legacy
//  notes       — Relevant notes
// ============================================================

const NUTRITION_DB = {

  // ──────────────────────────────────────────────────────────
  //  PROTEINS — POULTRY
  // ──────────────────────────────────────────────────────────

  chicken_thigh: {
    kcal: 149, p: 18.6, c: 0, f: 7.92,
    fiber: 0, sugar: 0,
    sat_fat: 1.66, mono_fat: 2.24, poly_fat: 1.42, trans_fat: 0.024, omega3: null,
    cholesterol: 92,
    sodium: 62, potassium: 272, calcium: 6, iron: 0.6,
    magnesium: 21.8, phosphorus: 178, zinc: 1.35, selenium: null,
    iodine: null, copper: 0.042,
    vitamin_a: null, vitamin_c: null, vitamin_d: null,
    vitamin_b1: null, vitamin_b2: null, vitamin_b3: null,
    vitamin_b5: null, vitamin_b6: null, vitamin_b12: null,
    folate: null, choline: null,
    fdc_id: "2646171", data_type: "Foundation",
    notes: "Boneless, skinless, raw",
  },

  chicken_breast: {
    kcal: 112, p: 22.5, c: 0, f: 1.93,
    fiber: 0, sugar: 0,
    sat_fat: 0.349, mono_fat: 0.369, poly_fat: 0.296, trans_fat: 0.009, omega3: null,
    cholesterol: 73,
    sodium: 66, potassium: 330, calcium: 4, iron: 0.35,
    magnesium: 26.2, phosphorus: 215, zinc: 0.65, selenium: null,
    iodine: null, copper: 0.004,
    vitamin_a: null, vitamin_c: null, vitamin_d: null,
    vitamin_b1: null, vitamin_b2: null, vitamin_b3: null,
    vitamin_b5: null, vitamin_b6: null, vitamin_b12: null,
    folate: null, choline: null,
    fdc_id: "2646170", data_type: "Foundation",
    notes: "Boneless, skinless, raw",
  },

  turkey_mince: {
    kcal: 180, p: 16.9, c: 0, f: 12.5,
    fiber: 0, sugar: 0,
    sat_fat: 3.33, mono_fat: 4.74, poly_fat: 3.17, trans_fat: 0.181, omega3: 0.02,
    cholesterol: 78,
    sodium: null, potassium: null, calcium: null, iron: null,
    magnesium: null, phosphorus: null, zinc: null, selenium: null,
    iodine: null, copper: null,
    vitamin_a: null, vitamin_c: null, vitamin_d: null,
    vitamin_b1: null, vitamin_b2: null, vitamin_b3: null,
    vitamin_b5: null, vitamin_b6: null, vitamin_b12: null,
    folate: null, choline: null,
    fdc_id: "174493", data_type: "SR Legacy",
    notes: "Ground turkey 85% lean / 15% fat, raw",
  },

  duck_breast: {
    kcal: 123, p: 19.8, c: 0, f: 4.25,
    fiber: 0, sugar: null,
    sat_fat: 1.32, mono_fat: 1.21, poly_fat: 0.58, trans_fat: null, omega3: 0.07,
    cholesterol: 77,
    sodium: 57, potassium: 268, calcium: 3, iron: 4.51,
    magnesium: 22, phosphorus: 186, zinc: 0.74, selenium: 13.9,
    iodine: null, copper: 0.33,
    vitamin_a: 16, vitamin_c: 6.2, vitamin_d: null,
    vitamin_b1: 0.416, vitamin_b2: 0.31, vitamin_b3: 3.44,
    vitamin_b5: 0.77, vitamin_b6: 0.63, vitamin_b12: 0.76,
    folate: 25, choline: null,
    fdc_id: "174491", data_type: "SR Legacy",
    notes: "Duck breast, meat only, raw",
  },

  // ──────────────────────────────────────────────────────────
  //  PROTEINS — BEEF
  // ──────────────────────────────────────────────────────────

  beef_regular: {
    kcal: 248, p: 17.5, c: 0, f: 19.4,
    fiber: 0, sugar: 0,
    sat_fat: 6.84, mono_fat: 7.25, poly_fat: 0.485, trans_fat: 0.7, omega3: null,
    cholesterol: 68,
    sodium: 55, potassium: 273, calcium: 7, iron: 1.96,
    magnesium: 16.4, phosphorus: 144, zinc: 3.85, selenium: null,
    iodine: null, copper: 0.055,
    vitamin_a: null, vitamin_c: null, vitamin_d: null,
    vitamin_b1: null, vitamin_b2: null, vitamin_b3: null,
    vitamin_b5: null, vitamin_b6: null, vitamin_b12: null,
    folate: null, choline: null,
    fdc_id: "2514744", data_type: "Foundation",
    notes: "Ground beef 80% lean / 20% fat, raw",
  },

  beef_lean: {
    kcal: 137, p: 21.4, c: 0, f: 5,
    fiber: 0, sugar: 0,
    sat_fat: 2.18, mono_fat: 1.99, poly_fat: 0.257, trans_fat: 0.22, omega3: 0.029,
    cholesterol: 62,
    sodium: 66, potassium: 346, calcium: 9, iron: 2.38,
    magnesium: 22, phosphorus: 198, zinc: 5.09, selenium: 17.4,
    iodine: null, copper: 0.078,
    vitamin_a: 4, vitamin_c: 0, vitamin_d: 0.1,
    vitamin_b1: 0.041, vitamin_b2: 0.151, vitamin_b3: 5.49,
    vitamin_b5: 0.652, vitamin_b6: 0.392, vitamin_b12: 2.24,
    folate: 5, choline: 70.9,
    fdc_id: "171790", data_type: "SR Legacy",
    notes: "Ground beef 95% lean / 5% fat, raw",
  },

  lamb_mince: {
    kcal: 282, p: 16.6, c: 0, f: 23.4,
    fiber: 0, sugar: 0,
    sat_fat: 10.2, mono_fat: 9.6, poly_fat: 1.85, trans_fat: null, omega3: 0.42,
    cholesterol: 73,
    sodium: 59, potassium: 222, calcium: 16, iron: 1.55,
    magnesium: 21, phosphorus: 157, zinc: 3.41, selenium: 18.8,
    iodine: null, copper: 0.101,
    vitamin_a: 0, vitamin_c: 0, vitamin_d: 0.1,
    vitamin_b1: 0.11, vitamin_b2: 0.21, vitamin_b3: 5.96,
    vitamin_b5: 0.65, vitamin_b6: 0.13, vitamin_b12: 2.31,
    folate: 18, choline: 69.3,
    fdc_id: "174370", data_type: "SR Legacy",
    notes: "Lamb ground, raw",
  },

  venison: {
    kcal: 116, p: 21.5, c: 0, f: 2.66,
    fiber: 0, sugar: null,
    sat_fat: 0.63, mono_fat: 0.34, poly_fat: 0.35, trans_fat: null, omega3: 0.05,
    cholesterol: 18,
    sodium: null, potassium: null, calcium: 7, iron: 2.9,
    magnesium: null, phosphorus: null, zinc: null, selenium: null,
    iodine: null, copper: null,
    vitamin_a: 0, vitamin_c: 0, vitamin_d: null,
    vitamin_b1: 0.2, vitamin_b2: 0.36, vitamin_b3: 6.6,
    vitamin_b5: null, vitamin_b6: null, vitamin_b12: null,
    folate: null, choline: null,
    fdc_id: "167622", data_type: "SR Legacy",
    notes: "Deer (venison), sitka, raw",
  },

  bison: {
    kcal: 164, p: 19.9, c: 0, f: 8.88,
    fiber: 0, sugar: 0,
    sat_fat: null, mono_fat: null, poly_fat: null, trans_fat: null, omega3: null,
    cholesterol: 65,
    sodium: 56, potassium: 301, calcium: 7, iron: 2.17,
    magnesium: 18.5, phosphorus: 166, zinc: 3.76, selenium: null,
    iodine: null, copper: 0.078,
    vitamin_a: null, vitamin_c: null, vitamin_d: null,
    vitamin_b1: null, vitamin_b2: null, vitamin_b3: null,
    vitamin_b5: null, vitamin_b6: null, vitamin_b12: null,
    folate: null, choline: null,
    fdc_id: "2727571", data_type: "Foundation",
    notes: "Bison, ground, raw",
  },

  // ──────────────────────────────────────────────────────────
  //  PROTEINS — PORK
  // ──────────────────────────────────────────────────────────

  pork_loin: {
    kcal: 174, p: 21.1, c: 0, f: 9.47,
    fiber: 0, sugar: 0,
    sat_fat: 3.28, mono_fat: 3.95, poly_fat: 1.38, trans_fat: 0.029, omega3: null,
    cholesterol: 56,
    sodium: 40, potassium: 361, calcium: 4, iron: 0.45,
    magnesium: 22, phosphorus: 197, zinc: 1.57, selenium: null,
    iodine: null, copper: 0.038,
    vitamin_a: null, vitamin_c: null, vitamin_d: null,
    vitamin_b1: null, vitamin_b2: null, vitamin_b3: null,
    vitamin_b5: null, vitamin_b6: null, vitamin_b12: null,
    folate: null, choline: null,
    fdc_id: "2646168", data_type: "Foundation",
    notes: "Pork loin, boneless, raw",
  },

  pork_tenderloin: {
    kcal: 125, p: 21.6, c: 0, f: 3.9,
    fiber: 0, sugar: 0,
    sat_fat: 0.866, mono_fat: 0.862, poly_fat: 0.418, trans_fat: 0.01, omega3: null,
    cholesterol: 60,
    sodium: 41, potassium: 397, calcium: 5, iron: 0.93,
    magnesium: 24.7, phosphorus: 217, zinc: 1.77, selenium: null,
    iodine: null, copper: 0.077,
    vitamin_a: null, vitamin_c: null, vitamin_d: null,
    vitamin_b1: null, vitamin_b2: null, vitamin_b3: null,
    vitamin_b5: null, vitamin_b6: null, vitamin_b12: null,
    folate: null, choline: null,
    fdc_id: "2646169", data_type: "Foundation",
    notes: "Pork loin tenderloin, boneless, raw",
  },

  pork_belly: {
    kcal: 385, p: 15.2, c: 0, f: 35.8,
    fiber: 0, sugar: 0,
    sat_fat: null, mono_fat: null, poly_fat: null, trans_fat: null, omega3: null,
    cholesterol: 67,
    sodium: 50, potassium: 208, calcium: 4, iron: 0.38,
    magnesium: 12.2, phosphorus: 114, zinc: 1.07, selenium: null,
    iodine: null, copper: 0.033,
    vitamin_a: null, vitamin_c: null, vitamin_d: null,
    vitamin_b1: null, vitamin_b2: null, vitamin_b3: null,
    vitamin_b5: null, vitamin_b6: null, vitamin_b12: null,
    folate: null, choline: null,
    fdc_id: "2727576", data_type: "Foundation",
    notes: "Pork belly, with skin, raw",
  },

  // ──────────────────────────────────────────────────────────
  //  PROTEINS — FISH & SEAFOOD
  // ──────────────────────────────────────────────────────────

  salmon: {
    kcal: 203, p: 20.3, c: 0, f: 13.1,
    fiber: 0, sugar: 0,
    sat_fat: 2.28, mono_fat: 5.01, poly_fat: 4.06, trans_fat: null,
    omega3: 1.61,
    cholesterol: 62,
    sodium: 49, potassium: 378, calcium: 9, iron: 0.26,
    magnesium: 25.4, phosphorus: 230, zinc: 0.34, selenium: 22.8,
    iodine: 3.2, copper: 0.025,
    vitamin_a: 2, vitamin_c: null, vitamin_d: null,
    vitamin_b1: null, vitamin_b2: null, vitamin_b3: null,
    vitamin_b5: null, vitamin_b6: null, vitamin_b12: 5.7,
    folate: null, choline: null,
    fdc_id: "2684441", data_type: "Foundation",
    notes: "Atlantic salmon, farm raised, raw",
  },

  shrimp: {
    kcal: 85, p: 20.1, c: 0, f: 0.51,
    fiber: 0, sugar: 0,
    sat_fat: 0.101, mono_fat: 0.086, poly_fat: 0.152, trans_fat: 0.004,
    omega3: 0.033,
    cholesterol: 161,
    sodium: 119, potassium: 264, calcium: 64, iron: 0.52,
    magnesium: 35, phosphorus: 214, zinc: 1.34, selenium: null,
    iodine: null, copper: 0.391,
    vitamin_a: null, vitamin_c: null, vitamin_d: null,
    vitamin_b1: null, vitamin_b2: null, vitamin_b3: null,
    vitamin_b5: null, vitamin_b6: null, vitamin_b12: null,
    folate: null, choline: null,
    fdc_id: "175179", data_type: "SR Legacy",
    notes: "Crustaceans, shrimp, raw",
  },

  cod: {
    kcal: 82, p: 17.8, c: 0, f: 0.67,
    fiber: 0, sugar: 0,
    sat_fat: 0.131, mono_fat: 0.094, poly_fat: 0.231, trans_fat: null,
    omega3: 0.194,
    cholesterol: 43,
    sodium: 54, potassium: 413, calcium: 16, iron: 0.38,
    magnesium: 32, phosphorus: 203, zinc: 0.45, selenium: 33.1,
    iodine: null, copper: 0.028,
    vitamin_a: 12, vitamin_c: 1, vitamin_d: 0.9,
    vitamin_b1: 0.076, vitamin_b2: 0.065, vitamin_b3: 2.06,
    vitamin_b5: 0.153, vitamin_b6: 0.245, vitamin_b12: 0.91,
    folate: 7, choline: 65.2,
    fdc_id: "171955", data_type: "SR Legacy",
    notes: "Fish, cod, Atlantic, raw",
  },

  tuna_oil: {
    kcal: 186, p: 26.5, c: 0, f: 8.08,
    fiber: 0, sugar: 0,
    sat_fat: 1.53, mono_fat: 2.95, poly_fat: 2.88, trans_fat: null,
    omega3: 0.128,
    cholesterol: 18,
    sodium: 396, potassium: 333, calcium: 4, iron: 0.65,
    magnesium: 34, phosphorus: 267, zinc: 0.47, selenium: 60.1,
    iodine: null, copper: 0.13,
    vitamin_a: 5, vitamin_c: 0, vitamin_d: null,
    vitamin_b1: 0.017, vitamin_b2: 0.079, vitamin_b3: 11.7,
    vitamin_b5: 0.37, vitamin_b6: 0.43, vitamin_b12: 2.2,
    folate: 5, choline: null,
    fdc_id: "175157", data_type: "SR Legacy",
    notes: "Tuna, white, canned in oil, drained",
  },

  tuna_water: {
    kcal: 128, p: 23.6, c: 0, f: 2.97,
    fiber: 0, sugar: 0,
    sat_fat: 0.792, mono_fat: 0.784, poly_fat: 1.11, trans_fat: null,
    omega3: 0.88,
    cholesterol: 42,
    sodium: 416, potassium: 207, calcium: 13, iron: 1.39,
    magnesium: 31, phosphorus: 311, zinc: 0.9, selenium: 76,
    iodine: null, copper: 0.071,
    vitamin_a: 23, vitamin_c: 0, vitamin_d: 6.7,
    vitamin_b1: 0.038, vitamin_b2: 0.12, vitamin_b3: 12.4,
    vitamin_b5: 0.37, vitamin_b6: 0.11, vitamin_b12: 2.2,
    folate: 5, choline: 29.3,
    fdc_id: "175158", data_type: "SR Legacy",
    notes: "Tuna, white, canned in water, drained",
  },

  // ──────────────────────────────────────────────────────────
  //  PROTEINS — PLANT-BASED
  // ──────────────────────────────────────────────────────────

  tofu: {
    kcal: 144, p: 17.3, c: 2.78, f: 8.72,
    fiber: 2.3, sugar: null,
    sat_fat: 1.26, mono_fat: 1.92, poly_fat: 4.92, trans_fat: 0,
    omega3: 0.582,
    cholesterol: 0,
    sodium: 14, potassium: 237, calcium: 683, iron: 2.66,
    magnesium: 58, phosphorus: 190, zinc: 1.57, selenium: 17.4,
    iodine: null, copper: 0.378,
    vitamin_a: null, vitamin_c: 0.2, vitamin_d: 0,
    vitamin_b1: 0.158, vitamin_b2: 0.102, vitamin_b3: 0.381,
    vitamin_b5: 0.133, vitamin_b6: 0.092, vitamin_b12: 0,
    folate: 29, choline: null,
    fdc_id: "172475", data_type: "SR Legacy",
    notes: "Firm tofu, raw, prepared with calcium sulfate",
  },

  tempeh: {
    kcal: 192, p: 20.3, c: 7.64, f: 10.8,
    fiber: null, sugar: null,
    sat_fat: 2.54, mono_fat: 3.2, poly_fat: 4.3, trans_fat: 0,
    omega3: 0.248,
    cholesterol: 0,
    sodium: 9, potassium: 412, calcium: 111, iron: 2.7,
    magnesium: 81, phosphorus: 266, zinc: 1.14, selenium: 0,
    iodine: null, copper: 0.56,
    vitamin_a: 0, vitamin_c: 0, vitamin_d: 0,
    vitamin_b1: 0.078, vitamin_b2: 0.358, vitamin_b3: 2.64,
    vitamin_b5: 0.278, vitamin_b6: 0.215, vitamin_b12: 0.08,
    folate: 24, choline: null,
    fdc_id: "174272", data_type: "SR Legacy",
    notes: "Tempeh, raw",
  },

  edamame: {
    kcal: 109, p: 11.2, c: 7.61, f: 4.73,
    fiber: 4.8, sugar: 2.48,
    sat_fat: null, mono_fat: null, poly_fat: null, trans_fat: 0,
    omega3: null,
    cholesterol: 0,
    sodium: 6, potassium: 482, calcium: 60, iron: 2.11,
    magnesium: 61, phosphorus: 161, zinc: 1.32, selenium: null,
    iodine: null, copper: 0.324,
    vitamin_a: null, vitamin_c: 9.7, vitamin_d: null,
    vitamin_b1: 0.15, vitamin_b2: 0.265, vitamin_b3: 0.925,
    vitamin_b5: 0.535, vitamin_b6: 0.135, vitamin_b12: 0,
    folate: 303, choline: 56,
    fdc_id: "168410", data_type: "SR Legacy",
    notes: "Edamame, frozen, unprepared",
  },

  // ──────────────────────────────────────────────────────────
  //  PROTEINS — DAIRY / EGGS
  // ──────────────────────────────────────────────────────────

  eggs: {
    kcal: 147, p: 12.4, c: 0.96, f: 9.96,
    fiber: 0, sugar: 0.2,
    sat_fat: 3.2, mono_fat: 3.63, poly_fat: 1.82, trans_fat: null,
    omega3: null,
    cholesterol: 411,
    sodium: 129, potassium: 132, calcium: 48, iron: 1.67,
    magnesium: 11.4, phosphorus: 184, zinc: 1.24, selenium: 31.1,
    iodine: 49.1, copper: null,
    vitamin_a: 180, vitamin_c: null, vitamin_d: 2.46,
    vitamin_b1: 0.077, vitamin_b2: 0.419, vitamin_b3: null,
    vitamin_b5: null, vitamin_b6: 0.063, vitamin_b12: 1.02,
    folate: 71, choline: 335,
    fdc_id: "748967", data_type: "Foundation",
    notes: "Grade A Large, whole egg, raw",
  },

  // ──────────────────────────────────────────────────────────
  //  PROTEINS — SUPPLEMENTS
  // ──────────────────────────────────────────────────────────

  whey_protein_isolate: {
    kcal: 359, p: 58.1, c: 29.1, f: 1.16,
    fiber: 0, sugar: 1.16,
    sat_fat: 0.581, mono_fat: 0.149, poly_fat: 0.021, trans_fat: 0,
    omega3: null,
    cholesterol: 16,
    sodium: 372, potassium: 872, calcium: 698, iron: 1.26,
    magnesium: 233, phosphorus: 581, zinc: 8.72, selenium: 40.7,
    iodine: null, copper: 1.16,
    vitamin_a: 872, vitamin_c: 34.9, vitamin_d: 0,
    vitamin_b1: 0.872, vitamin_b2: 0.988, vitamin_b3: 11.6,
    vitamin_b5: 5.81, vitamin_b6: 1.16, vitamin_b12: 3.49,
    folate: 233, choline: 225,
    fdc_id: "173177", data_type: "SR Legacy",
    notes: "Whey protein powder isolate — values are label-based, vary by brand",
  },

  whey_protein_concentrate: {
    kcal: 352, p: 78.1, c: 6.25, f: 1.56,
    fiber: 3.1, sugar: 0,
    sat_fat: 0.781, mono_fat: 0.158, poly_fat: 0.299, trans_fat: 0,
    omega3: null,
    cholesterol: 16,
    sodium: 156, potassium: 500, calcium: 469, iron: 1.13,
    magnesium: 195, phosphorus: 1320, zinc: 6.18, selenium: 26.7,
    iodine: null, copper: 0.049,
    vitamin_a: 0, vitamin_c: 0, vitamin_d: 0,
    vitamin_b1: 0.609, vitamin_b2: 2.02, vitamin_b3: 1.14,
    vitamin_b5: 5.52, vitamin_b6: 0.607, vitamin_b12: 2.45,
    folate: 33, choline: 224,
    fdc_id: "173180", data_type: "SR Legacy",
    notes: "Whey protein powder concentrate — values are label-based, vary by brand",
  },

  // ──────────────────────────────────────────────────────────
  //  CARBS — STILL NEEDED
  //  (white_rice, brown_rice, potato, sweet_potato,
  //   pasta, egg_noodle, rice_noodle, glass_noodle,
  //   udon, soba, ramen, gnocchi, white_bread, sourdough,
  //   pita, naan, tortilla, bagel, oats, quinoa,
  //   couscous, bulgur, polenta, millet, barley,
  //   lentils, chickpeas, black_beans, kidney_beans)
  // ──────────────────────────────────────────────────────────

};

// ──────────────────────────────────────────────────────────
//  DISPLAY CONFIG — what to show in UI (edit later)
// ──────────────────────────────────────────────────────────
const NUTRITION_DISPLAY = {
  basic:    ["kcal", "p", "c", "f"],
  extended: ["fiber", "sugar", "sat_fat", "cholesterol", "sodium", "potassium"],
  minerals: ["calcium", "iron", "magnesium", "phosphorus", "zinc", "selenium"],
  vitamins: ["vitamin_a", "vitamin_c", "vitamin_d", "vitamin_b12", "folate", "choline"],
};

// Temporarily append carbs — will be moved into NUTRITION_DB above
const NUTRITION_CARBS = {

  // ──────────────────────────────────────────────────────────
  //  CARBS — GRAINS (dry weight)
  // ──────────────────────────────────────────────────────────

  white_rice: {
    kcal: 365, p: 7.1, c: 80, f: 0.7,
    fiber: 0.4, sugar: 0.1,
    sat_fat: 0.2, mono_fat: 0.2, poly_fat: 0.2, trans_fat: 0, omega3: null,
    cholesterol: 0,
    sodium: 1, potassium: 115, calcium: 9, iron: 0.8,
    magnesium: 35, phosphorus: 115, zinc: 1.1, selenium: 15.1,
    iodine: null, copper: 0.22,
    vitamin_a: 0, vitamin_c: 0, vitamin_d: 0,
    vitamin_b1: 0.163, vitamin_b2: 0.016, vitamin_b3: 1.9,
    vitamin_b5: 1.1, vitamin_b6: 0.164, vitamin_b12: 0,
    folate: 8, choline: null,
    fdc_id: "168878", data_type: "SR Legacy",
    notes: "White rice, long-grain, raw, dry weight. Also use for Jasmine, Basmati, Sushi rice",
  },

  brown_rice: {
    kcal: 367, p: 7.9, c: 77, f: 2.9,
    fiber: 3.5, sugar: 0.7,
    sat_fat: 0.6, mono_fat: 1.1, poly_fat: 1.0, trans_fat: 0, omega3: 0.035,
    cholesterol: 0,
    sodium: 4, potassium: 268, calcium: 33, iron: 1.8,
    magnesium: 143, phosphorus: 264, zinc: 2.0, selenium: 23.4,
    iodine: null, copper: 0.28,
    vitamin_a: 0, vitamin_c: 0, vitamin_d: 0,
    vitamin_b1: 0.401, vitamin_b2: 0.093, vitamin_b3: 5.1,
    vitamin_b5: 1.5, vitamin_b6: 0.509, vitamin_b12: 0,
    folate: 20, choline: null,
    fdc_id: "169704", data_type: "SR Legacy",
    notes: "Brown rice, long-grain, raw, dry weight",
  },

  oats: {
    kcal: 389, p: 16.9, c: 66, f: 6.9,
    fiber: 10.6, sugar: 0,
    sat_fat: 1.2, mono_fat: 2.2, poly_fat: 2.5, trans_fat: 0, omega3: 0.111,
    cholesterol: 0,
    sodium: 2, potassium: 429, calcium: 54, iron: 4.7,
    magnesium: 177, phosphorus: 523, zinc: 4.0, selenium: 34.4,
    iodine: null, copper: 0.63,
    vitamin_a: 0, vitamin_c: 0, vitamin_d: 0,
    vitamin_b1: 0.763, vitamin_b2: 0.139, vitamin_b3: 0.96,
    vitamin_b5: 1.35, vitamin_b6: 0.12, vitamin_b12: 0,
    folate: 56, choline: null,
    fdc_id: "173904", data_type: "SR Legacy",
    notes: "Oats, rolled, dry weight",
  },

  quinoa: {
    kcal: 368, p: 14.1, c: 64, f: 6.1,
    fiber: 7.0, sugar: null,
    sat_fat: 0.7, mono_fat: 1.6, poly_fat: 3.3, trans_fat: 0, omega3: 0.26,
    cholesterol: 0,
    sodium: 5, potassium: 563, calcium: 47, iron: 4.6,
    magnesium: 197, phosphorus: 457, zinc: 3.1, selenium: 8.5,
    iodine: null, copper: 0.59,
    vitamin_a: 1, vitamin_c: 0, vitamin_d: 0,
    vitamin_b1: 0.36, vitamin_b2: 0.318, vitamin_b3: 1.52,
    vitamin_b5: 0.77, vitamin_b6: 0.487, vitamin_b12: 0,
    folate: 184, choline: null,
    fdc_id: "168917", data_type: "SR Legacy",
    notes: "Quinoa, raw, dry weight",
  },

  couscous: {
    kcal: 376, p: 12.8, c: 77, f: 0.6,
    fiber: 5.0, sugar: null,
    sat_fat: 0.1, mono_fat: 0.1, poly_fat: 0.3, trans_fat: 0, omega3: null,
    cholesterol: 0,
    sodium: 10, potassium: 166, calcium: 24, iron: 1.1,
    magnesium: 44, phosphorus: 170, zinc: 0.8, selenium: 27.5,
    iodine: null, copper: 0.19,
    vitamin_a: 0, vitamin_c: 0, vitamin_d: 0,
    vitamin_b1: 0.16, vitamin_b2: 0.08, vitamin_b3: 3.1,
    vitamin_b5: null, vitamin_b6: 0.11, vitamin_b12: 0,
    folate: 20, choline: null,
    fdc_id: "169699", data_type: "SR Legacy",
    notes: "Couscous, dry weight",
  },

  bulgur: {
    kcal: 342, p: 12.3, c: 75, f: 1.3,
    fiber: 18.3, sugar: 0.4,
    sat_fat: 0.2, mono_fat: 0.2, poly_fat: 0.6, trans_fat: 0, omega3: null,
    cholesterol: 0,
    sodium: 17, potassium: 410, calcium: 35, iron: 2.5,
    magnesium: 164, phosphorus: 300, zinc: 1.9, selenium: 2.3,
    iodine: null, copper: 0.34,
    vitamin_a: 0, vitamin_c: 0, vitamin_d: 0,
    vitamin_b1: 0.232, vitamin_b2: 0.115, vitamin_b3: 5.1,
    vitamin_b5: null, vitamin_b6: 0.342, vitamin_b12: 0,
    folate: 27, choline: null,
    fdc_id: "169686", data_type: "SR Legacy",
    notes: "Bulgur, dry weight",
  },

  barley: {
    kcal: 354, p: 12.5, c: 73, f: 2.3,
    fiber: 17.3, sugar: null,
    sat_fat: 0.5, mono_fat: 0.3, poly_fat: 1.1, trans_fat: 0, omega3: null,
    cholesterol: 0,
    sodium: 12, potassium: 452, calcium: 33, iron: 3.6,
    magnesium: 133, phosphorus: 264, zinc: 2.8, selenium: 37.7,
    iodine: null, copper: 0.50,
    vitamin_a: 1, vitamin_c: 0, vitamin_d: 0,
    vitamin_b1: 0.646, vitamin_b2: 0.285, vitamin_b3: 4.6,
    vitamin_b5: 0.28, vitamin_b6: 0.318, vitamin_b12: 0,
    folate: 19, choline: null,
    fdc_id: "170283", data_type: "SR Legacy",
    notes: "Barley, pearled, raw, dry weight",
  },

  // ──────────────────────────────────────────────────────────
  //  CARBS — NOODLES (dry weight)
  // ──────────────────────────────────────────────────────────

  pasta: {
    kcal: 371, p: 13.0, c: 74, f: 1.5,
    fiber: 3.2, sugar: 2.7,
    sat_fat: 0.3, mono_fat: 0.2, poly_fat: 0.6, trans_fat: 0, omega3: null,
    cholesterol: 0,
    sodium: 6, potassium: 223, calcium: 20, iron: 1.3,
    magnesium: 53, phosphorus: 189, zinc: 1.4, selenium: 63.2,
    iodine: null, copper: 0.29,
    vitamin_a: 0, vitamin_c: 0, vitamin_d: 0,
    vitamin_b1: 0.891, vitamin_b2: 0.411, vitamin_b3: 7.2,
    vitamin_b5: 0.43, vitamin_b6: 0.157, vitamin_b12: 0,
    folate: 237, choline: null,
    fdc_id: "169734", data_type: "SR Legacy",
    notes: "Pasta, dry, enriched, dry weight",
  },

  egg_noodle: {
    kcal: 357, p: 13.0, c: 71, f: 1.5,
    fiber: 2.1, sugar: null,
    sat_fat: 0.3, mono_fat: 0.4, poly_fat: 0.4, trans_fat: 0, omega3: null,
    cholesterol: 0,
    sodium: 338, potassium: 200, calcium: 30, iron: 2.3,
    magnesium: 40, phosphorus: 170, zinc: 1.2, selenium: null,
    iodine: null, copper: null,
    vitamin_a: null, vitamin_c: null, vitamin_d: null,
    vitamin_b1: null, vitamin_b2: null, vitamin_b3: null,
    vitamin_b5: null, vitamin_b6: null, vitamin_b12: null,
    folate: null, choline: null,
    fdc_id: "168905", data_type: "SR Legacy",
    notes: "Egg noodle, dry weight",
  },

  glass_noodle: {
    kcal: 351, p: 0, c: 86, f: 0.1,
    fiber: 0.5, sugar: null,
    sat_fat: 0, mono_fat: 0, poly_fat: 0, trans_fat: 0, omega3: null,
    cholesterol: 0,
    sodium: 10, potassium: 10, calcium: 25, iron: 0.9,
    magnesium: null, phosphorus: null, zinc: null, selenium: null,
    iodine: null, copper: null,
    vitamin_a: 0, vitamin_c: 0, vitamin_d: 0,
    vitamin_b1: 0, vitamin_b2: 0, vitamin_b3: 0,
    vitamin_b5: null, vitamin_b6: 0, vitamin_b12: 0,
    folate: null, choline: null,
    fdc_id: "169735", data_type: "SR Legacy",
    notes: "Glass noodles (mung bean), dry weight",
  },

  // ──────────────────────────────────────────────────────────
  //  CARBS — POTATOES (raw)
  // ──────────────────────────────────────────────────────────

  potato: {
    kcal: 77, p: 2.0, c: 17.5, f: 0.1,
    fiber: 2.2, sugar: 0.8,
    sat_fat: 0, mono_fat: 0, poly_fat: 0.1, trans_fat: 0, omega3: null,
    cholesterol: 0,
    sodium: 6, potassium: 425, calcium: 12, iron: 0.8,
    magnesium: 23, phosphorus: 57, zinc: 0.3, selenium: 0.4,
    iodine: null, copper: 0.11,
    vitamin_a: 0, vitamin_c: 19.7, vitamin_d: 0,
    vitamin_b1: 0.081, vitamin_b2: 0.032, vitamin_b3: 1.1,
    vitamin_b5: 0.296, vitamin_b6: 0.298, vitamin_b12: 0,
    folate: 15, choline: 12.1,
    fdc_id: "170026", data_type: "SR Legacy",
    notes: "Potato, raw, flesh and skin",
  },

  sweet_potato: {
    kcal: 86, p: 1.6, c: 20, f: 0.1,
    fiber: 3.0, sugar: 4.2,
    sat_fat: 0, mono_fat: 0, poly_fat: 0, trans_fat: 0, omega3: null,
    cholesterol: 0,
    sodium: 55, potassium: 337, calcium: 30, iron: 0.6,
    magnesium: 25, phosphorus: 47, zinc: 0.3, selenium: 0.6,
    iodine: null, copper: 0.15,
    vitamin_a: 961, vitamin_c: 2.4, vitamin_d: 0,
    vitamin_b1: 0.078, vitamin_b2: 0.061, vitamin_b3: 0.557,
    vitamin_b5: 0.8, vitamin_b6: 0.209, vitamin_b12: 0,
    folate: 11, choline: 12.3,
    fdc_id: "168482", data_type: "SR Legacy",
    notes: "Sweet potato, raw, unprepared",
  },

  // ──────────────────────────────────────────────────────────
  //  CARBS — BREAD
  // ──────────────────────────────────────────────────────────

  white_bread: {
    kcal: 265, p: 9.0, c: 51, f: 3.2,
    fiber: 2.7, sugar: 5.0,
    sat_fat: 0.7, mono_fat: 0.7, poly_fat: 1.4, trans_fat: 0, omega3: null,
    cholesterol: 0,
    sodium: 491, potassium: 115, calcium: 67, iron: 3.6,
    magnesium: 23, phosphorus: 96, zinc: 0.8, selenium: 28.6,
    iodine: null, copper: 0.13,
    vitamin_a: 0, vitamin_c: 0, vitamin_d: 0,
    vitamin_b1: 0.495, vitamin_b2: 0.338, vitamin_b3: 5.0,
    vitamin_b5: 0.38, vitamin_b6: 0.047, vitamin_b12: 0,
    folate: 148, choline: null,
    fdc_id: "167995", data_type: "SR Legacy",
    notes: "White bread, commercially prepared",
  },

  tortilla: {
    kcal: 312, p: 8.0, c: 51, f: 8.0,
    fiber: 2.4, sugar: null,
    sat_fat: 2.0, mono_fat: 3.5, poly_fat: 1.9, trans_fat: 0, omega3: null,
    cholesterol: 0,
    sodium: 604, potassium: 138, calcium: 95, iron: 3.0,
    magnesium: 23, phosphorus: 113, zinc: 0.5, selenium: null,
    iodine: null, copper: null,
    vitamin_a: 0, vitamin_c: 0, vitamin_d: 0,
    vitamin_b1: 0.55, vitamin_b2: 0.33, vitamin_b3: 4.7,
    vitamin_b5: null, vitamin_b6: null, vitamin_b12: 0,
    folate: 136, choline: null,
    fdc_id: "175036", data_type: "SR Legacy",
    notes: "Tortilla, flour, ready to bake or fry",
  },

  // ──────────────────────────────────────────────────────────
  //  CARBS — LEGUMES (cooked/canned)
  // ──────────────────────────────────────────────────────────

  lentils: {
    kcal: 352, p: 24.6, c: 63, f: 1.1,
    fiber: 10.7, sugar: null,
    sat_fat: 0.2, mono_fat: 0.2, poly_fat: 0.5, trans_fat: 0, omega3: null,
    cholesterol: 0,
    sodium: 6, potassium: 905, calcium: 35, iron: 7.5,
    magnesium: 107, phosphorus: 451, zinc: 3.3, selenium: 8.3,
    iodine: null, copper: 0.75,
    vitamin_a: 2, vitamin_c: 4.4, vitamin_d: 0,
    vitamin_b1: 0.873, vitamin_b2: 0.211, vitamin_b3: 2.6,
    vitamin_b5: 2.14, vitamin_b6: 0.54, vitamin_b12: 0,
    folate: 479, choline: null,
    fdc_id: "172420", data_type: "SR Legacy",
    notes: "Lentils, raw, dry weight",
  },

  chickpeas: {
    kcal: 164, p: 8.9, c: 27, f: 2.6,
    fiber: 7.6, sugar: 4.8,
    sat_fat: 0.3, mono_fat: 0.6, poly_fat: 1.2, trans_fat: 0, omega3: null,
    cholesterol: 0,
    sodium: 240, potassium: 291, calcium: 42, iron: 2.9,
    magnesium: 48, phosphorus: 168, zinc: 1.5, selenium: 3.7,
    iodine: null, copper: 0.35,
    vitamin_a: 1, vitamin_c: 1.3, vitamin_d: 0,
    vitamin_b1: 0.085, vitamin_b2: 0.063, vitamin_b3: 0.5,
    vitamin_b5: 0.29, vitamin_b6: 0.135, vitamin_b12: 0,
    folate: 85, choline: null,
    fdc_id: "173757", data_type: "SR Legacy",
    notes: "Chickpeas (garbanzo beans), canned, drained",
  },

  black_beans: {
    kcal: 132, p: 8.9, c: 24, f: 0.5,
    fiber: 8.7, sugar: null,
    sat_fat: 0.1, mono_fat: 0, poly_fat: 0.2, trans_fat: 0, omega3: null,
    cholesterol: 0,
    sodium: 277, potassium: 355, calcium: 46, iron: 2.1,
    magnesium: 70, phosphorus: 140, zinc: 1.0, selenium: 1.2,
    iodine: null, copper: 0.21,
    vitamin_a: 0, vitamin_c: 0.8, vitamin_d: 0,
    vitamin_b1: 0.195, vitamin_b2: 0.059, vitamin_b3: 0.5,
    vitamin_b5: 0.22, vitamin_b6: 0.072, vitamin_b12: 0,
    folate: 149, choline: null,
    fdc_id: "173735", data_type: "SR Legacy",
    notes: "Black beans, canned, drained",
  },

  kidney_beans: {
    kcal: 127, p: 8.7, c: 22, f: 0.5,
    fiber: 6.4, sugar: null,
    sat_fat: 0.1, mono_fat: 0, poly_fat: 0.2, trans_fat: 0, omega3: null,
    cholesterol: 0,
    sodium: 237, potassium: 403, calcium: 45, iron: 2.9,
    magnesium: 45, phosphorus: 136, zinc: 1.1, selenium: 1.2,
    iodine: null, copper: 0.24,
    vitamin_a: 0, vitamin_c: 1.4, vitamin_d: 0,
    vitamin_b1: 0.144, vitamin_b2: 0.058, vitamin_b3: 0.6,
    vitamin_b5: 0.22, vitamin_b6: 0.084, vitamin_b12: 0,
    folate: 130, choline: null,
    fdc_id: "173744", data_type: "SR Legacy",
    notes: "Kidney beans, canned, drained",
  },
};

// Merge carbs into main NUTRITION_DB
Object.assign(NUTRITION_DB, NUTRITION_CARBS);
