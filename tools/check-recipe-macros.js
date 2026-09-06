// tools/check-recipe-macros.js
//
// Sanity-checks every recipe's computed macros at default weights (150g of
// its native protein, 1 serving). This runs the SAME functions the live site
// uses (parseIngredientGrams, calcIngredientMacros, baseMacros) pulled
// straight out of app.js, so it tests the real calculation path, not a
// reimplementation of it.
//
// A flagged recipe isn't automatically wrong — the bounds below are
// guardrails to catch data-entry mistakes (a misparsed amount, an ingredient
// mapped to the wrong DB entry, a unit fallback that's way off for that
// ingredient), not strict rules a recipe must follow. Rich dishes (coconut
// curries, egg+cheese breakfast burritos) are expected to sit near or over
// some of these bounds — read the flag, don't just chase it to zero.
//
// Run: node tools/check-recipe-macros.js
// Run after: adding/editing recipes, editing nutrition.js, or touching
// parseIngredientGrams/calcIngredientMacros/ING_NAME_MAP in app.js.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const REPO = path.join(__dirname, "..");

function extractFunction(src, signature) {
  const startIdx = src.indexOf(signature);
  if (startIdx === -1) throw new Error("function not found: " + signature);
  let i = src.indexOf("{", startIdx);
  let depth = 0, end = -1;
  for (let j = i; j < src.length; j++) {
    if (src[j] === "{") depth++;
    else if (src[j] === "}") { depth--; if (depth === 0) { end = j; break; } }
  }
  return src.slice(startIdx, end + 1);
}

const nutSrc = fs.readFileSync(path.join(REPO, "nutrition.js"), "utf8");
const appSrc = fs.readFileSync(path.join(REPO, "app.js"), "utf8");
const recSrc = fs.readFileSync(path.join(REPO, "recipes.js"), "utf8");

// ING_NAME_MAP is a `const {...}` object literal followed by hundreds of
// `ING_NAME_MAP["..."] = "...";` statements appended after it — grab the
// whole range, not just the initial literal, or most aliases are missed.
const ingMapStart = appSrc.indexOf("const ING_NAME_MAP = {");
const ingMapEnd = appSrc.indexOf("let compareSortKey =");
if (ingMapStart === -1 || ingMapEnd === -1) throw new Error("ING_NAME_MAP range markers not found — app.js structure changed?");
const ingNameMapFullSrc = appSrc.slice(ingMapStart, ingMapEnd);

const fnParseIngredientGrams = extractFunction(appSrc, "function parseIngredientGrams(e, a) {");
const fnCalcIngredientMacros = extractFunction(appSrc, "function calcIngredientMacros(e, a) {");
const fnBaseMacros = extractFunction(appSrc, "function baseMacros(e) {");

// Mirror autoCalcCarbs(): carb weights are DERIVED from protein weight via
// CARB_RATIOS, not a flat number — using the same flat weight for every carb
// type previously inflated every recipe's carb base term.
const CARB_RATIOS = { potato: 1.25, rice: 0.33, noodle: 0.33, bread: 0.2 };
const chickenW = 150;
const sandbox = {
  weights: {
    chicken: chickenW,
    potato: Math.round(chickenW * CARB_RATIOS.potato),
    rice: Math.round(chickenW * CARB_RATIOS.rice),
    noodle: Math.round(chickenW * CARB_RATIOS.noodle),
    bread: Math.round(chickenW * CARB_RATIOS.bread),
    eggs: 0,
    servings: 1,
  },
  activeProtein: "chicken_thigh",
  eggSizeG: 58,
};
vm.createContext(sandbox);
vm.runInContext(
  nutSrc + "\n" +
  fnParseIngredientGrams + "\n" +
  fnCalcIngredientMacros + "\n" +
  ingNameMapFullSrc + "\n" +
  fnBaseMacros + "\n" +
  recSrc + "\n" +
  "this.__RECIPE_DETAILS = RECIPE_DETAILS;\n" +
  "this.__R = R;\n" +
  "this.__findIngredientId = findIngredientId;\n" +
  "this.__calcIngredientMacros = calcIngredientMacros;\n" +
  "this.__baseMacros = baseMacros;\n",
  sandbox
);

const { __R: R, __RECIPE_DETAILS: RECIPE_DETAILS, __findIngredientId: findIngredientId, __calcIngredientMacros: calcIngredientMacros, __baseMacros: baseMacros } = sandbox;

// Same mapping _nativeVariant() uses in app.js to pick a recipe's default
// protein display — check each recipe against ITS OWN protein, not always chicken.
const NATIVE_VARIANT = { chicken: "chicken_thigh", beef: "beef_regular", eggs: "eggs", fish: "salmon", tofu: "tofu" };

function calcSauceMacros(recipe) {
  const detail = RECIPE_DETAILS[recipe.id];
  if (!detail || !detail.ingredients) return { kcal: 0, p: 0, c: 0, f: 0 };
  let i = 0, n = 0, s = 0, o = 0;
  detail.ingredients.forEach((section) => {
    section.items.forEach((item) => {
      if (item.amt && (item.amt.includes("{{proteinG}}") || item.amt.includes("{{carbG}}") || item.amt.includes("{{eggCount}}"))) return;
      const id = item.id || findIngredientId(item.name);
      if (!id) return;
      const c = calcIngredientMacros(id, item.amt || "");
      if (c) { i += c.kcal; n += c.p; s += c.c; o += c.f; }
    });
  });
  return { kcal: Math.round(i), p: Math.round(n * 10) / 10, c: Math.round(s * 10) / 10, f: Math.round(o * 10) / 10 };
}

// Sane per-PORTION bounds for a single meal in a high-protein fitness app.
const BOUNDS = { kcalMin: 200, kcalMax: 1200, proteinMin: 15, proteinMax: 90, carbMax: 150, fatMax: 70 };
const SAUCE_SHARE_MAX = 0.6; // extras (sauce/spice/veg) shouldn't dominate over protein+carb

const flags = [];
for (const recipe of R) {
  if (recipe.protein === "none" || !recipe.protein) continue;
  sandbox.activeProtein = NATIVE_VARIANT[recipe.protein] || "chicken_thigh";
  const base = baseMacros(recipe.carb);
  const sauce = calcSauceMacros(recipe);
  const total = {
    kcal: Math.round(base.kcal + sauce.kcal),
    p: Math.round((base.p + sauce.p) * 10) / 10,
    c: Math.round((base.c + sauce.c) * 10) / 10,
    f: Math.round((base.f + sauce.f) * 10) / 10,
  };
  const issues = [];
  if (total.kcal < BOUNDS.kcalMin) issues.push(`kcal too low (${total.kcal} < ${BOUNDS.kcalMin})`);
  if (total.kcal > BOUNDS.kcalMax) issues.push(`kcal too high (${total.kcal} > ${BOUNDS.kcalMax})`);
  if (total.p < BOUNDS.proteinMin) issues.push(`protein too low (${total.p}g < ${BOUNDS.proteinMin}g)`);
  if (total.p > BOUNDS.proteinMax) issues.push(`protein too high (${total.p}g > ${BOUNDS.proteinMax}g)`);
  if (total.c > BOUNDS.carbMax) issues.push(`carbs too high (${total.c}g > ${BOUNDS.carbMax}g)`);
  if (total.f > BOUNDS.fatMax) issues.push(`fat too high (${total.f}g > ${BOUNDS.fatMax}g)`);
  if (total.kcal > 0 && sauce.kcal / total.kcal > SAUCE_SHARE_MAX) {
    issues.push(`extras dominate: sauce/spice/veg = ${sauce.kcal}kcal, ${Math.round((sauce.kcal / total.kcal) * 100)}% of total ${total.kcal}kcal`);
  }
  if (issues.length) {
    flags.push({ id: recipe.id, displayNum: recipe.displayNum, title: recipe.title, total, sauce, issues });
  }
}

console.log(`Checked ${R.length} recipes at default weights (150g native protein, 1 serving).`);
console.log(`Flagged: ${flags.length}\n`);
for (const f of flags) {
  console.log(`#${f.displayNum} "${f.title}" (${f.id})`);
  console.log(`  total: ${f.total.kcal}kcal ${f.total.p}g P ${f.total.c}g C ${f.total.f}g F | extras: ${f.sauce.kcal}kcal ${f.sauce.p}g P ${f.sauce.c}g C ${f.sauce.f}g F`);
  f.issues.forEach((i) => console.log(`  ⚠ ${i}`));
  console.log("");
}
process.exitCode = flags.length ? 1 : 0;
