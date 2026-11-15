#!/usr/bin/env node
// Runs every recipe check in one go, on the full catalog and on the live
// test set. Run this after editing recipes or the nutrition DB:
//
//   node tools/check.js
//
// 1. validate-recipes.js          schema + placeholders        (fails on errors)
// 2. check-ingredient-coverage.js every ingredient has nutrition data
// 3. check-recipe-macros.js       macro plausibility flags (to read, not to zero out)
const { spawnSync } = require("child_process");
const path = require("path");
const REPO = path.join(__dirname, "..");
const tool = (name, ...args) => spawnSync(process.execPath, [path.join(__dirname, name), ...args], { encoding: "utf8" });
const tail = (out, n) => out.trim().split("\n").slice(-n).join("\n");

let failed = false;
const v = tool("validate-recipes.js");
console.log("── Schema ──" + v.stdout.trimEnd());
if (v.status !== 0) failed = true;

for (const file of ["recipes-archive.js", "recipes.js"]) {
  const full = path.join(REPO, file);
  const cov = tool("check-ingredient-coverage.js", full);
  console.log(`\n── Ingredient coverage: ${file} ──\n` + tail(cov.stdout + cov.stderr, 4));
  if (cov.status !== 0 || !/Unresolved[^:]*: 0 lines/.test(cov.stdout) || !/unparseable: 0 lines/.test(cov.stdout)) failed = true;
  const mac = tool("check-recipe-macros.js", full);
  const flagged = (mac.stdout.match(/Flagged: (\d+)/) || [])[1];
  console.log(`\n── Macro plausibility: ${file} ── ${flagged ?? "?"} flagged (run tools/check-recipe-macros.js ${file} for details)`);
  if (flagged === undefined) { failed = true; console.log(tail(mac.stdout + mac.stderr, 6)); } // flags are for reading; only a crash fails
}
console.log(failed ? "\n✗ CHECK FAILED" : "\n✓ All checks passed");
process.exit(failed ? 1 : 0);
