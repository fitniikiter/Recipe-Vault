// Shared helper: splits a recipes file (recipes.js / recipes-archive.js) into
// its recipe entries WITHOUT evaluating or re-serializing it, so tools can
// copy or patch entries as untouched source text.

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
// Each entry is { id, text, start, end }: text is the untouched source slice
// and start/end are its offsets in `src`.
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
      entries.push({ id: m[1], text, start: i, end });
      i = end;
      continue;
    }
    if (kind === "object") {
      const m = /^\s*(?:"([^"]+)"|([A-Za-z_$][\w$-]*))\s*:\s*\{/.exec(src.slice(i, i + 300));
      if (m) {
        const keyStart = i + m[0].search(/\S/);
        const open = i + m[0].length - 1;
        const end = matchBracket(src, open);
        entries.push({ id: m[1] || m[2], text: src.slice(keyStart, end), start: keyStart, end });
        i = end;
        continue;
      }
    }
    i++;
  }
  return entries;
}

// Parses the whole file. Returns the card and detail entries plus the
// offsets of the two literals, so callers can rebuild or patch the source.
function parseRecipeSource(src) {
  const rDecl = src.indexOf("const R = [");
  if (rDecl === -1) throw new Error("`const R = [` not found");
  const rOpen = src.indexOf("[", rDecl);
  const rEnd = matchBracket(src, rOpen);
  const dDecl = src.indexOf("const RECIPE_DETAILS = {", rEnd);
  if (dDecl === -1) throw new Error("`const RECIPE_DETAILS = {` not found");
  const dOpen = src.indexOf("{", dDecl);
  const dEnd = matchBracket(src, dOpen);
  return {
    cards: splitEntries(src, rOpen + 1, rEnd - 1, "array"),
    details: splitEntries(src, dOpen + 1, dEnd - 1, "object"),
    rOpen, rEnd, dOpen, dEnd,
  };
}

module.exports = { matchBracket, splitEntries, parseRecipeSource };
