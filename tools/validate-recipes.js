#!/usr/bin/env node
// Validates recipe data against the fixed schema below. This is the gate a
// recipe has to pass before it goes on the site: structure and placeholders
// here, ingredient→nutrition coverage in check-ingredient-coverage.js, macro
// plausibility in check-recipe-macros.js.
//
// Usage:
//   node tools/validate-recipes.js              validate recipes-archive.js + recipes.js
//   node tools/validate-recipes.js <file.js>    validate one file
// Exit code 1 if any ERROR is found (warnings don't fail).
//
// ── SCHEMA ────────────────────────────────────────────────────────────────
// Card (entry of `const R`):
//   id          kebab-case, unique, same key as its RECIPE_DETAILS entry
//   displayNum  positive integer, unique
//   protein     chicken | beef | eggs | fish | tofu | none
//   carb        rice | potato | noodle | bread | none
//   mealType    non-empty array of breakfast | main | snack | dip — a dish can
//               be both, e.g. ["breakfast", "main"]. Randomizer slots use this.
//   time        minutes, integer 1–240
//   title, desc non-empty strings
//   tags        array of known tags (TAGS below), no duplicates
//   flavor      savory | sweet
//   hint        string ("" when there is none)
//   sideEgg     optional boolean — recipe is served with a fried egg
//
// Details (entry of `const RECIPE_DETAILS`):
//   video        YouTube id, or "" / null when there is none
//   image        optional string or null
//   ingredients  non-empty [{ section, items: [{ name, amt, id? }] }]
//   steps        non-empty array of strings
//   hacks        array of { title, text }
//   notes        string
//
// Placeholders — how a recipe's adjustable base is written in `amt`:
//   {{proteinG}}  grams of the main protein   → exactly one, unless protein is eggs/none
//   {{eggCount}}  number of whole eggs        → exactly one for protein "eggs"
//   {{carbG}}     grams of the carb base      → exactly one, unless carb is none
// The macro engine adds these itself, so the base must NOT also appear as a
// fixed amount, and no other {{...}} placeholder exists.
// ──────────────────────────────────────────────────────────────────────────
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const REPO = path.join(__dirname, "..");

const PROTEINS = ["chicken", "beef", "eggs", "fish", "tofu", "none"];
const CARBS = ["rice", "potato", "noodle", "bread", "none"];
const MEAL_TYPES = ["breakfast", "main", "snack", "dip"];
const FLAVORS = ["savory", "sweet"];
const TAGS = [
  // cuisines
  "american", "argentinian", "asian", "british", "chinese", "ethiopian", "filipino", "french", "german", "greek",
  "hawaiian", "indian", "indonesian", "italian", "japanese", "korean", "mediterranean", "mexican", "middle-eastern",
  "moroccan", "north-african", "peruvian", "spanish", "taiwanese", "thai", "turkish", "vietnamese",
  // style / content
  "comfort", "fusion", "spicy", "dip", "eggs", "oats", "protein-powder",
];
const CARD_KEYS = ["id", "displayNum", "protein", "carb", "mealType", "time", "title", "desc", "tags", "flavor", "hint", "sideEgg"];
const DETAIL_KEYS = ["video", "image", "ingredients", "steps", "hacks", "notes"];
const ITEM_KEYS = ["name", "amt", "id"];

const isStr = (v) => typeof v === "string";
const nonEmpty = (v) => isStr(v) && v.trim().length > 0;

function validateFile(file) {
  const errors = [], warnings = [];
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(file, "utf8") + "\n;this.R = R; this.D = RECIPE_DETAILS;", sandbox);
  const { R, D } = sandbox;
  const err = (r, msg) => errors.push(`#${r.displayNum ?? "?"} ${r.id ?? "(no id)"}: ${msg}`);
  const warn = (r, msg) => warnings.push(`#${r.displayNum ?? "?"} ${r.id ?? "(no id)"}: ${msg}`);

  const seenIds = new Set(), seenNums = new Set();
  for (const r of R) {
    // ── card ──
    if (!nonEmpty(r.id) || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(r.id)) err(r, `id must be kebab-case (got ${JSON.stringify(r.id)})`);
    if (seenIds.has(r.id)) err(r, "duplicate id");
    seenIds.add(r.id);
    if (!Number.isInteger(r.displayNum) || r.displayNum < 1) err(r, `displayNum must be a positive integer (got ${JSON.stringify(r.displayNum)})`);
    if (seenNums.has(r.displayNum)) err(r, "duplicate displayNum");
    seenNums.add(r.displayNum);
    if (!PROTEINS.includes(r.protein)) err(r, `protein must be one of ${PROTEINS.join("|")} (got ${JSON.stringify(r.protein)})`);
    if (!CARBS.includes(r.carb)) err(r, `carb must be one of ${CARBS.join("|")} (got ${JSON.stringify(r.carb)})`);
    const mealOk = Array.isArray(r.mealType) && r.mealType.length > 0 && r.mealType.every((m) => MEAL_TYPES.includes(m)) && new Set(r.mealType).size === r.mealType.length;
    if (!mealOk) err(r, `mealType must be a non-empty array of ${MEAL_TYPES.join("|")} without duplicates (got ${JSON.stringify(r.mealType)})`);
    if (!Number.isInteger(r.time) || r.time < 1 || r.time > 240) err(r, `time must be whole minutes 1–240 (got ${JSON.stringify(r.time)})`);
    if (!nonEmpty(r.title)) err(r, "title is empty");
    if (!nonEmpty(r.desc)) err(r, "desc is empty");
    if (!FLAVORS.includes(r.flavor)) err(r, `flavor must be one of ${FLAVORS.join("|")} (got ${JSON.stringify(r.flavor)})`);
    if (!isStr(r.hint)) err(r, 'hint must be a string (use "" for none)');
    if (r.sideEgg !== undefined && typeof r.sideEgg !== "boolean") err(r, "sideEgg must be true/false when present");
    if (!Array.isArray(r.tags)) err(r, "tags must be an array");
    else {
      r.tags.filter((t) => !TAGS.includes(t)).forEach((t) => err(r, `unknown tag "${t}" — add it to TAGS in tools/validate-recipes.js if it is intended`));
      if (new Set(r.tags).size !== r.tags.length) err(r, "duplicate tags");
      const isDip = mealOk && r.mealType.includes("dip");
      if (isDip !== r.tags.includes("dip")) err(r, 'mealType "dip" and the "dip" tag must go together');
      if (isDip && r.mealType.length > 1) err(r, "a dip is not also a meal — mealType must be just [\"dip\"]");
    }
    Object.keys(r).filter((k) => !CARD_KEYS.includes(k)).forEach((k) => err(r, `unknown card field "${k}"`));

    // ── details ──
    const d = D[r.id];
    if (!d) { err(r, "no RECIPE_DETAILS entry"); continue; }
    Object.keys(d).filter((k) => !DETAIL_KEYS.includes(k)).forEach((k) => err(r, `unknown details field "${k}"`));
    if (!(d.video === null || isStr(d.video))) err(r, 'video must be a YouTube id, "" or null');
    if (!(d.image === undefined || d.image === null || isStr(d.image))) err(r, "image must be a string or null");
    if (!isStr(d.notes)) err(r, "notes must be a string");
    if (!Array.isArray(d.steps) || !d.steps.length || !d.steps.every(nonEmpty)) err(r, "steps must be a non-empty array of non-empty strings");
    if (!Array.isArray(d.hacks) || !d.hacks.every((h) => h && nonEmpty(h.title) && nonEmpty(h.text))) err(r, "hacks must be an array of { title, text }");
    if (!Array.isArray(d.ingredients) || !d.ingredients.length) { err(r, "ingredients must be a non-empty array"); continue; }

    const items = [];
    d.ingredients.forEach((sec, si) => {
      if (!nonEmpty(sec.section)) err(r, `ingredient section ${si + 1} has no name`);
      if (!Array.isArray(sec.items) || !sec.items.length) return err(r, `section "${sec.section}" has no items`);
      sec.items.forEach((it) => {
        if (!nonEmpty(it.name)) err(r, `an item in "${sec.section}" has no name`);
        if (!nonEmpty(it.amt)) err(r, `"${it.name}" has no amount`);
        Object.keys(it).filter((k) => !ITEM_KEYS.includes(k)).forEach((k) => err(r, `"${it.name}": unknown item field "${k}"`));
        items.push(it);
      });
    });

    // ── placeholders ──
    const count = (ph) => items.filter((it) => (it.amt || "").includes(ph)).length;
    const nP = count("{{proteinG}}"), nE = count("{{eggCount}}"), nC = count("{{carbG}}");
    if (r.protein === "none") {
      if (nP || nE) err(r, "protein is none but the ingredients use {{proteinG}}/{{eggCount}}");
    } else if (r.protein === "eggs") {
      if (nE !== 1) err(r, `egg recipe needs exactly one "{{eggCount}} pieces" item (found ${nE})`);
      if (nP) err(r, "egg recipe must list eggs as {{eggCount}} pieces, not {{proteinG}} grams");
    } else {
      if (nP !== 1) err(r, `needs exactly one {{proteinG}} item for its ${r.protein} (found ${nP})`);
      if (nE) err(r, "{{eggCount}} is only for recipes with protein: eggs — use a fixed amount or sideEgg");
    }
    if (r.carb === "none" ? nC !== 0 : nC !== 1) err(r, r.carb === "none" ? "carb is none but the ingredients use {{carbG}}" : `needs exactly one {{carbG}} item for its ${r.carb} (found ${nC})`);
    const all = JSON.stringify(d).match(/\{\{\w+\}\}/g) || [];
    [...new Set(all)].filter((p) => !["{{proteinG}}", "{{eggCount}}", "{{carbG}}"].includes(p)).forEach((p) => err(r, `unknown placeholder ${p}`));
    if ((JSON.stringify(d.steps) + JSON.stringify(d.hacks) + d.notes).includes("{{")) err(r, "placeholders only work in ingredient amounts, not in steps/hacks/notes");

  }

  // displayNum must run without gaps in the full catalog (the test set keeps original numbers).
  const isArchive = path.basename(file) === "recipes-archive.js";
  if (isArchive) {
    const nums = [...seenNums].filter(Number.isInteger).sort((a, b) => a - b);
    for (let i = 0; i < nums.length; i++) if (nums[i] !== i + 1) { errors.push(`displayNum sequence has a gap or jump at position ${i + 1} (found ${nums[i]})`); break; }
  }
  Object.keys(D).filter((id) => !seenIds.has(id)).forEach((id) => warnings.push(`RECIPE_DETAILS has "${id}" but there is no card for it`));

  // Share previews exist per recipe.
  for (const r of R) {
    if (!fs.existsSync(path.join(REPO, "r", String(r.id), "index.html"))) warn(r, "no share stub at /r/<id>/index.html");
    if (!fs.existsSync(path.join(REPO, "og", r.id + ".png"))) warn(r, "no share image at /og/<id>.png");
  }
  return { count: R.length, errors, warnings };
}

const files = process.argv[2] ? [path.resolve(process.argv[2])] : [path.join(REPO, "recipes-archive.js"), path.join(REPO, "recipes.js")];
let failed = false;
for (const file of files) {
  const { count, errors, warnings } = validateFile(file);
  console.log(`\n${path.basename(file)} — ${count} recipes: ${errors.length} error(s), ${warnings.length} warning(s)`);
  errors.forEach((e) => console.log("  ✗ " + e));
  warnings.forEach((w) => console.log("  ⚠ " + w));
  if (errors.length) failed = true;
}
console.log(failed ? "\nFAILED — fix the ✗ lines above." : "\nOK — all recipes match the schema.");
process.exit(failed ? 1 : 0);
