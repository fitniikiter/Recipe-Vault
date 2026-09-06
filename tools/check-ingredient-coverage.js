// tools/check-ingredient-coverage.js
//
// Runs every ingredient line from every recipe (RECIPE_DETAILS in
// recipes.js) through the REAL findIngredientId -> calcIngredientMacros
// resolution path (pulled straight out of app.js), and reports any line
// that silently fails to resolve or fails to parse its amount — those
// ingredients contribute ZERO to the recipe's displayed macros with no
// error shown anywhere.
//
// Run: node tools/check-ingredient-coverage.js
// Run after: adding/editing a recipe's ingredient list, or touching
// ING_NAME_MAP / NUTRITION_DB.

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

const ingMapStart = appSrc.indexOf("const ING_NAME_MAP = {");
const ingMapEnd = appSrc.indexOf("let compareSortKey =");
if (ingMapStart === -1 || ingMapEnd === -1) throw new Error("ING_NAME_MAP range markers not found — app.js structure changed?");
const ingNameMapFullSrc = appSrc.slice(ingMapStart, ingMapEnd);

const fnParseIngredientGrams = extractFunction(appSrc, "function parseIngredientGrams(e, a) {");
const fnCalcIngredientMacros = extractFunction(appSrc, "function calcIngredientMacros(e, a) {");

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(
  nutSrc + "\n" +
  fnParseIngredientGrams + "\n" +
  fnCalcIngredientMacros + "\n" +
  ingNameMapFullSrc + "\n" +
  recSrc + "\n" +
  "this.__RECIPE_DETAILS = RECIPE_DETAILS;\n" +
  "this.__findIngredientId = findIngredientId;\n" +
  "this.__calcIngredientMacros = calcIngredientMacros;\n",
  sandbox
);

const { __RECIPE_DETAILS: RECIPE_DETAILS, __findIngredientId: findIngredientId, __calcIngredientMacros: calcIngredientMacros } = sandbox;

const unresolved = new Map();
const unparseable = new Map();
let totalLines = 0, skippedPlaceholder = 0, resolvedOk = 0;

for (const [recipeId, detail] of Object.entries(RECIPE_DETAILS)) {
  if (!detail.ingredients) continue;
  for (const section of detail.ingredients) {
    for (const item of section.items || []) {
      totalLines++;
      if (item.amt && (item.amt.includes("{{proteinG}}") || item.amt.includes("{{carbG}}") || item.amt.includes("{{eggCount}}"))) {
        skippedPlaceholder++;
        continue;
      }
      const id = item.id || findIngredientId(item.name);
      if (!id) {
        if (!unresolved.has(item.name)) unresolved.set(item.name, { count: 0, recipeIds: new Set() });
        const rec = unresolved.get(item.name);
        rec.count++;
        rec.recipeIds.add(recipeId);
        continue;
      }
      const macros = calcIngredientMacros(id, item.amt || "");
      if (!macros) {
        const key = `${item.name} @ "${item.amt}" -> id=${id}`;
        if (!unparseable.has(key)) unparseable.set(key, { count: 0, recipeIds: new Set() });
        const rec = unparseable.get(key);
        rec.count++;
        rec.recipeIds.add(recipeId);
        continue;
      }
      resolvedOk++;
    }
  }
}

console.log(`Total ingredient lines across ${Object.keys(RECIPE_DETAILS).length} recipes: ${totalLines}`);
console.log(`Skipped (base protein/carb/egg-count placeholder lines): ${skippedPlaceholder}`);
console.log(`Resolved + macro-calculated OK: ${resolvedOk}`);
const unresolvedCount = [...unresolved.values()].reduce((s, v) => s + v.count, 0);
const unparseableCount = [...unparseable.values()].reduce((s, v) => s + v.count, 0);
console.log(`Unresolved (silently dropped from totals): ${unresolvedCount} lines, ${unresolved.size} unique names`);
console.log(`Resolved but amount unparseable: ${unparseableCount} lines, ${unparseable.size} unique cases`);

if (unresolved.size) {
  console.log("\n=== UNRESOLVED (sorted by impact) ===");
  [...unresolved.entries()].sort((a, b) => b[1].count - a[1].count).forEach(([name, info]) => {
    console.log(`  [${info.count}x, ${info.recipeIds.size} recipes] "${name}"`);
  });
}
if (unparseable.size) {
  console.log("\n=== UNPARSEABLE AMOUNTS ===");
  [...unparseable.entries()].sort((a, b) => b[1].count - a[1].count).forEach(([key, info]) => {
    console.log(`  [${info.count}x] ${key}`);
  });
}
process.exitCode = (unresolvedCount + unparseableCount) ? 1 : 0;
