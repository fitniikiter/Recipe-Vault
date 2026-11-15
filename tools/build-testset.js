#!/usr/bin/env node
// Builds recipes.js (the small test set the site loads) from
// recipes-archive.js (the full catalog, not loaded by the site).
//
// Why: while the app's foundation (macro logic, data format, pages, design)
// is being finished, a handful of representative recipes is easier to reason
// about than ~200. Nothing is deleted — the archive stays the source of truth.
//
// Usage:
//   node tools/build-testset.js            rebuild recipes.js with TESTSET_IDS
//   node tools/build-testset.js --all      restore the full catalog
//
// Entries are copied as source text (not re-serialized), so comments and
// formatting inside each recipe survive unchanged.
const fs = require("fs");
const path = require("path");
const { parseRecipeSource } = require("./lib/recipe-source");
const REPO = path.join(__dirname, "..");
const ARCHIVE = path.join(REPO, "recipes-archive.js");
const OUT = path.join(REPO, "recipes.js");

// One recipe per protein/carb shape the app has to handle, plus special cases.
const TESTSET_IDS = [
  "korean-glazed-chicken-bowl", // chicken / rice, video, thigh-breast variant
  "honey-garlic-chicken-noodles", // chicken / noodle, sideEgg
  "chicken-caesar-wrap", // chicken / bread
  "bbq-chicken-smashed-potato", // chicken / potato
  "thai-basil-beef-rice", // beef / rice, sideEgg, spicy
  "american-bigmac-burger-bowl", // beef / potato
  "smash-burger-brioche", // beef / bread
  "beef-bolognese-protein-pasta", // beef / noodle
  "japanese-beef-lettuce-wraps", // beef / no carb
  "korean-egg-fried-rice", // eggs / rice, has a hint
  "shakshuka-middle-eastern-eggs", // eggs / bread
  "american-cinnamon-apple-porridge", // eggs / no carb, egg-count control
  "teriyaki-salmon-rice-bowl", // fish / rice
  "crispy-tofu-bibimbap", // tofu / rice
  "chocolate-chip-baked-oats", // no protein / no carb (fixed portion)
  "caesar-dressing-light", // dip (excluded from the Randomizer)
];

const src = fs.readFileSync(ARCHIVE, "utf8");
const all = process.argv.includes("--all");

const { cards, details } = parseRecipeSource(src);

if (all) {
  fs.writeFileSync(OUT, src);
  console.log(`recipes.js restored to the full catalog (${cards.length} recipes).`);
  process.exit(0);
}

const cardById = new Map(cards.map((e) => [e.id, e]));
const detailById = new Map(details.map((e) => [e.id, e]));
for (const id of TESTSET_IDS) {
  if (!cardById.has(id)) throw new Error("No card in archive for " + id);
  if (!detailById.has(id)) throw new Error("No details in archive for " + id);
}

// Keep the archive's order (= displayNum order) regardless of list order above.
const wanted = new Set(TESTSET_IDS);
const keep = cards.map((e) => e.id).filter((id) => wanted.has(id));

const banner =
  "// ⚠️ GENERATED TEST SET — " + TESTSET_IDS.length + " of " + cards.length + " recipes.\n" +
  "// The full catalog lives in recipes-archive.js (not loaded by the site).\n" +
  "// Change the selection in tools/build-testset.js and re-run it; edit recipe\n" +
  "// CONTENT in recipes-archive.js, not here, or the next build overwrites it.\n\n";

const out =
  banner +
  "const R = [\n" +
  keep.map((id) => "  " + cardById.get(id).text + ",\n").join("") +
  "];\n\n" +
  "const RECIPE_DETAILS = {\n" +
  keep.map((id) => "  " + detailById.get(id).text + ",\n").join("") +
  "};\n";

fs.writeFileSync(OUT, out);
console.log(`recipes.js rebuilt: ${TESTSET_IDS.length} of ${cards.length} recipes (${details.length} detail blocks in archive).`);
