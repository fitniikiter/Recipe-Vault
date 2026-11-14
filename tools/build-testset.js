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

// Returns the index just past the bracket that closes the one at `open`,
// skipping strings, template literals and comments.
function matchBracket(src, open) {
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    const ch = src[i];
    if (ch === '"' || ch === "'" || ch === "`") {
      for (i++; i < src.length && src[i] !== ch; i++) if (src[i] === "\\") i++;
    } else if (ch === "/" && src[i + 1] === "/") {
      i = src.indexOf("\n", i);
      if (i < 0) break;
    } else if (ch === "/" && src[i + 1] === "*") {
      i = src.indexOf("*/", i) + 1;
    } else if (ch === "{" || ch === "[") {
      depth++;
    } else if (ch === "}" || ch === "]") {
      if (--depth === 0) return i + 1;
    }
  }
  throw new Error("Unbalanced bracket at offset " + open);
}

// Splits the body of a top-level array/object literal into its entries.
// Each entry is { id, text } where text is the untouched source slice.
function splitEntries(src, bodyStart, bodyEnd, kind) {
  const entries = [];
  let i = bodyStart;
  while (i < bodyEnd) {
    const ch = src[i];
    if (ch === "/" && src[i + 1] === "/") { i = src.indexOf("\n", i) + 1; continue; }
    if (ch === "/" && src[i + 1] === "*") { i = src.indexOf("*/", i) + 2; continue; }
    if (kind === "array" && ch === "{") {
      const end = matchBracket(src, i);
      const text = src.slice(i, end);
      const m = text.match(/\bid:\s*"([^"]+)"/);
      if (!m) throw new Error("Card without id near offset " + i);
      entries.push({ id: m[1], text });
      i = end;
      continue;
    }
    if (kind === "object") {
      const m = /^\s*(?:"([^"]+)"|([A-Za-z_$][\w$-]*))\s*:\s*\{/.exec(src.slice(i, i + 300));
      if (m) {
        const keyStart = i + m[0].search(/\S/);
        const open = i + m[0].length - 1;
        const end = matchBracket(src, open);
        entries.push({ id: m[1] || m[2], text: src.slice(keyStart, end) });
        i = end;
        continue;
      }
    }
    i++;
  }
  return entries;
}

const src = fs.readFileSync(ARCHIVE, "utf8");
const all = process.argv.includes("--all");

const rDecl = src.indexOf("const R = [");
const rOpen = src.indexOf("[", rDecl);
const rEnd = matchBracket(src, rOpen);
const dDecl = src.indexOf("const RECIPE_DETAILS = {", rEnd);
const dOpen = src.indexOf("{", dDecl);
const dEnd = matchBracket(src, dOpen);

const cards = splitEntries(src, rOpen + 1, rEnd - 1, "array");
const details = splitEntries(src, dOpen + 1, dEnd - 1, "object");

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
