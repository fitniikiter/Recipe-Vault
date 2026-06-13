// ============================================================
//  tools/nutrition-audit.js — Recipe Vault nutrition auditor
//
//  Runs the REAL macro engine from index.html over every recipe
//  in recipes.js and reports which recipes have nutrition that
//  cannot be fully calculated — i.e. ingredients the engine
//  silently drops because they are not in INGREDIENT_DB /
//  ING_NAME_MAP, or amounts it cannot parse into grams.
//
//  Those dropped ingredients are the #1 reason a recipe's macros
//  look "wrong" (too low): the app sums only what it can resolve.
//
//  Usage:  node tools/nutrition-audit.js            (summary)
//          node tools/nutrition-audit.js --full     (per-recipe)
//          node tools/nutrition-audit.js <recipeId>  (one recipe)
//
//  No dependencies. Reads index.html + recipes.js as-is, so it
//  always audits exactly what the live site computes.
// ============================================================

const fs = require("fs");
const vm = require("vm");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const recipesSrc = fs.readFileSync(path.join(ROOT, "recipes.js"), "utf8");

// --- Extract a balanced { ... } / ( ... ) block starting at `from`,
//     respecting quoted strings so braces inside strings don't count.
function extractBlock(src, from, open, close) {
  let i = src.indexOf(open, from);
  if (i < 0) return null;
  let depth = 0, quote = null, start = i;
  for (; i < src.length; i++) {
    const ch = src[i], prev = src[i - 1];
    if (quote) {
      if (ch === quote && prev !== "\\") quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") { quote = ch; continue; }
    if (ch === open) depth++;
    else if (ch === close) { depth--; if (depth === 0) return src.slice(start, i + 1); }
  }
  return null;
}

// Pull a `const NAME = { ... };` object literal out of the HTML.
function grabConst(name) {
  const m = new RegExp("const\\s+" + name + "\\s*=\\s*").exec(html);
  if (!m) throw new Error("could not find const " + name);
  const block = extractBlock(html, m.index, "{", "}");
  if (!block) throw new Error("unbalanced block for " + name);
  return "const " + name + " = " + block + ";";
}

// Pull a `function NAME(...) { ... }` definition out of the HTML.
function grabFn(name) {
  const m = new RegExp("function\\s+" + name + "\\s*\\(").exec(html);
  if (!m) throw new Error("could not find function " + name);
  // params
  const paren = extractBlock(html, m.index, "(", ")");
  // body starts after params
  const bodyStart = html.indexOf("{", m.index + (paren ? paren.length : 0));
  const body = extractBlock(html, bodyStart, "{", "}");
  if (!body) throw new Error("unbalanced body for " + name);
  return html.slice(m.index, bodyStart) + body;
}

// --- Build a sandbox with the engine + minimal UI globals it reads.
const sandbox = {};
vm.createContext(sandbox);

// Engine data + pure functions, lifted verbatim from index.html.
const engine = [
  grabConst("NUT"),
  grabConst("INGREDIENT_DB"),
  grabConst("ING_NAME_MAP"),
  grabFn("parseIngredientGrams"),
  grabFn("calcIngredientMacros"),
  grabFn("findIngredientId"),
  // UI state the engine reads — set to the app's defaults (1 serving).
  "var weights = { chicken: 150, potato: 150, rice: 150, noodle: 150, bread: 150, eggs: 0, servings: 1 };",
  "var activeProtein = 'chicken_thigh';",
  "var eggSizeG = 58;",
].join("\n");

vm.runInContext(engine, sandbox);
vm.runInContext(recipesSrc + "\nthis.__R = R; this.__D = RECIPE_DETAILS;", sandbox);

const R = sandbox.__R;
const D = sandbox.__D;
const findIngredientId = sandbox.findIngredientId;
const parseIngredientGrams = sandbox.parseIngredientGrams;
const calcIngredientMacros = sandbox.calcIngredientMacros;

// --- Audit one recipe: classify every non-base ingredient.
function auditRecipe(id) {
  const d = D[id];
  const card = R.find((r) => r.id === id);
  const res = { id, title: card ? card.title : "(no card)", resolved: [], unresolved: [], unparseable: [], total: { kcal: 0, p: 0, c: 0, f: 0 } };
  if (!d || !d.ingredients) return res;
  for (const sec of d.ingredients) {
    for (const it of sec.items || []) {
      const amt = it.amt || "";
      // Base protein/carb scale with the stepper and are handled by baseMacros.
      if (amt.includes("{{proteinG}}") || amt.includes("{{carbG}}")) continue;
      const ingId = it.id || findIngredientId(it.name);
      if (!ingId) { res.unresolved.push(it.name + (amt ? " (" + amt + ")" : "")); continue; }
      const grams = parseIngredientGrams(amt, ingId);
      if (grams == null) { res.unparseable.push(it.name + " [" + ingId + "] amt='" + amt + "'"); continue; }
      const m = calcIngredientMacros(ingId, amt);
      if (m) {
        res.resolved.push({ name: it.name, id: ingId, grams: m.grams, kcal: m.kcal });
        res.total.kcal += m.kcal; res.total.p += m.p; res.total.c += m.c; res.total.f += m.f;
      }
    }
  }
  res.total.p = Math.round(res.total.p * 10) / 10;
  res.total.c = Math.round(res.total.c * 10) / 10;
  res.total.f = Math.round(res.total.f * 10) / 10;
  return res;
}

const arg = process.argv[2];

if (arg && arg !== "--full") {
  // Single recipe deep-dive.
  const r = auditRecipe(arg);
  console.log("\n# " + r.id + " — " + r.title);
  console.log("computed sauce/extra macros:", r.total);
  console.log("resolved (" + r.resolved.length + "):");
  r.resolved.forEach((x) => console.log("   ✓ " + x.name + " → " + x.id + " (" + x.grams + "g, " + x.kcal + " kcal)"));
  if (r.unparseable.length) { console.log("UNPARSEABLE amounts (" + r.unparseable.length + "):"); r.unparseable.forEach((x) => console.log("   ⚠ " + x)); }
  if (r.unresolved.length) { console.log("UNRESOLVED — not in DB, DROPPED from total (" + r.unresolved.length + "):"); r.unresolved.forEach((x) => console.log("   ✗ " + x)); }
  process.exit(0);
}

// Whole-vault audit.
const all = R.map((r) => auditRecipe(r.id));
const flagged = all.filter((r) => r.unresolved.length || r.unparseable.length).sort((a, b) => (b.unresolved.length + b.unparseable.length) - (a.unresolved.length + a.unparseable.length));

const unresolvedTally = {};
for (const r of all) for (const name of r.unresolved) {
  const key = name.replace(/\s*\(.*\)$/, "").toLowerCase().trim();
  unresolvedTally[key] = (unresolvedTally[key] || 0) + 1;
}

console.log("=".repeat(60));
console.log("RECIPE VAULT — NUTRITION AUDIT");
console.log("recipes: " + R.length + " | clean: " + (R.length - flagged.length) + " | flagged: " + flagged.length);
console.log("=".repeat(60));

console.log("\n## Most common DROPPED ingredients (add these to INGREDIENT_DB + ING_NAME_MAP):");
Object.entries(unresolvedTally).sort((a, b) => b[1] - a[1]).slice(0, 40)
  .forEach(([name, n]) => console.log("   " + String(n).padStart(3) + "×  " + name));

if (arg === "--full") {
  console.log("\n## Per-recipe (flagged only):");
  for (const r of flagged) {
    console.log("\n• " + r.id + " — " + r.title + "  [computed: " + r.total.kcal + " kcal, " + r.total.p + "g P]");
    r.unresolved.forEach((x) => console.log("    ✗ dropped: " + x));
    r.unparseable.forEach((x) => console.log("    ⚠ unparseable: " + x));
  }
} else {
  console.log("\n## Top 25 recipes with the most uncounted ingredients:");
  flagged.slice(0, 25).forEach((r) =>
    console.log("   " + String(r.unresolved.length + r.unparseable.length).padStart(2) + " miss  " + r.id + " — " + r.title));
  console.log("\nRun with --full for every recipe, or `node tools/nutrition-audit.js <recipeId>` for one.");
}
