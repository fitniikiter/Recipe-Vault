#!/usr/bin/env python3
"""
Recipe Vault — recipes.js audit script
Checks for duplicates, non-English ingredients, missing units,
inconsistent units, macro plausibility, and missing ingredients.
Output: .claude/recipe_audit_report.md + stdout summary.
"""

import re
import json
import sys
import os
from collections import defaultdict

RECIPES_JS = "/home/user/Recipe-Vault/recipes.js"
REPORT_PATH = "/home/user/Recipe-Vault/.claude/recipe_audit_report.md"

# ── helpers ────────────────────────────────────────────────────────────────

def strip_comments(text):
    """Remove JS // line comments and /* */ block comments."""
    # block comments first
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL)
    # line comments
    text = re.sub(r'//[^\n]*', '', text)
    return text

def js_to_json(js_obj_str):
    """Best-effort convert JS object literal to JSON."""
    s = js_obj_str.strip()
    # remove trailing commas before } or ]
    s = re.sub(r',(\s*[}\]])', r'\1', s)
    # quote unquoted keys:  word: → "word":
    s = re.sub(r'(?<!["\w])(\b[a-zA-Z_][a-zA-Z0-9_]*\b)\s*:', r'"\1":', s)
    # replace single-quoted strings with double-quoted
    # Simple heuristic: handle 'value' not inside double-quoted strings
    s = re.sub(r"'([^'\\]*(?:\\.[^'\\]*)*)'", lambda m: json.dumps(m.group(1)), s)
    # undefined → null
    s = re.sub(r'\bundefined\b', 'null', s)
    # true/false are already JSON-compatible
    return s

def extract_array_or_obj(text, start_marker):
    """
    Find start_marker in text, then extract the balanced {...} or [...] block.
    Returns the raw JS string of the block (including braces/brackets).
    """
    idx = text.find(start_marker)
    if idx == -1:
        raise ValueError(f"Marker not found: {start_marker!r}")
    # advance to first { or [
    i = idx + len(start_marker)
    while i < len(text) and text[i] not in '{[':
        i += 1
    if i >= len(text):
        raise ValueError("No opening brace/bracket found")
    opener = text[i]
    closer = '}' if opener == '{' else ']'
    depth = 0
    in_str = False
    str_char = None
    escape = False
    start = i
    for j in range(i, len(text)):
        c = text[j]
        if escape:
            escape = False
            continue
        if c == '\\' and in_str:
            escape = True
            continue
        if in_str:
            if c == str_char:
                in_str = False
        else:
            if c in ('"', "'", '`'):
                in_str = True
                str_char = c
            elif c == opener:
                depth += 1
            elif c == closer:
                depth -= 1
                if depth == 0:
                    return text[start:j+1]
    raise ValueError("Unbalanced braces/brackets")

def normalize_title(t):
    """Lowercase, strip punctuation for comparison."""
    t = t.lower()
    t = re.sub(r'[^a-z0-9 ]', '', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t

# ── parsing ────────────────────────────────────────────────────────────────

def parse_recipes_js():
    with open(RECIPES_JS, 'r', encoding='utf-8') as f:
        raw = f.read()

    # Strip JS comments (but keep the string intact for extraction)
    cleaned = strip_comments(raw)

    # ---- Extract R[] ----
    r_block = extract_array_or_obj(cleaned, 'const R =')
    try:
        r_json = js_to_json(r_block)
        R = json.loads(r_json)
    except Exception as e:
        # fallback: try more aggressive cleanup
        r_json = js_to_json(r_block)
        # Remove template literals {{...}} which break JSON
        r_json = re.sub(r'\{\{[^}]*\}\}', '""', r_json)
        try:
            R = json.loads(r_json)
        except Exception as e2:
            print(f"[ERROR] Could not parse R[]: {e2}", file=sys.stderr)
            print(f"First parse error: {e}", file=sys.stderr)
            R = []

    # ---- Extract RECIPE_DETAILS{} ----
    rd_block = extract_array_or_obj(cleaned, 'const RECIPE_DETAILS =')
    try:
        rd_json = js_to_json(rd_block)
        # Remove template literals {{...}}
        rd_json = re.sub(r'\{\{[^}]*\}\}', '""', rd_json)
        RECIPE_DETAILS = json.loads(rd_json)
    except Exception as e:
        print(f"[ERROR] Could not parse RECIPE_DETAILS: {e}", file=sys.stderr)
        RECIPE_DETAILS = {}

    return R, RECIPE_DETAILS

# ── checks ─────────────────────────────────────────────────────────────────

GERMAN_WORDS = [
    'magerquark', 'quark', 'frischkäse', 'topfen', 'putenbrust', 'hähnchen',
    'rindfleisch', 'schweinefleisch', 'speck', 'lachs', 'kabeljau', 'thunfisch',
    'garnelen', 'zwiebel', 'knoblauch', 'kartoffel', 'nudeln', 'reis', 'mehl',
    'zucker', 'salz', 'pfeffer', 'öl', 'butter', 'milch', 'sahne', 'joghurt',
    'käse', 'ei', 'eier', 'erbsen', 'mais', 'brokkoli', 'spinat', 'kohl',
    'möhre', 'möhren', 'karotte', 'karotten', 'sellerie', 'lauch', 'zucchini',
    'gurke', 'tomate', 'tomaten', 'bohnen', 'linsen', 'kichererbsen',
    # paprika is a special case — it's used in English too, but "paprika" by
    # itself as an ingredient (not spice) is German. We'll flag it only when
    # it appears as a standalone word meaning the vegetable. We skip it here
    # because "paprika" is a widely accepted English spice name.
]

# Build regex: match whole-word German terms
GERMAN_RE = re.compile(
    r'\b(' + '|'.join(re.escape(w) for w in GERMAN_WORDS) + r')\b',
    re.IGNORECASE | re.UNICODE
)

UNIT_WORDS = [
    'g', 'ml', 'kg', 'l', 'oz', 'lb', 'lbs',
    'tbsp', 'tsp', 'cup', 'cups',
    'clove', 'cloves', 'slice', 'slices',
    'piece', 'pieces', 'handful', 'pinch',
    'can', 'cans', 'sheet', 'sheets',
    'dash', 'drop', 'drops',
    'bunch', 'head', 'stalk', 'stalks',
    'sprig', 'sprigs', 'scoop', 'scoops',
    'serving', 'servings',
    # also allow 'to taste', 'as needed', 'optional', fractions etc
]
UNIT_RE = re.compile(
    r'\b(' + '|'.join(re.escape(u) for u in UNIT_WORDS) + r')\b',
    re.IGNORECASE
)
# Number pattern: digits possibly with fraction/decimal
NUMBER_RE = re.compile(r'\d+([.,/]\d+)?|[½⅓¼¾⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]')

CARB_TAGS = {'rice', 'noodle', 'pasta', 'potato', 'bread', 'wrap', 'oat',
             'oats', 'quinoa', 'couscous', 'grain', 'tortilla', 'pita',
             'lentil', 'bean', 'corn', 'bulgur', 'barley', 'rye'}


def check_duplicates(R):
    issues = []
    # Title duplicates
    title_map = defaultdict(list)
    for r in R:
        key = normalize_title(r.get('title', ''))
        title_map[key].append(r)
    for key, recipes in title_map.items():
        if len(recipes) > 1:
            ids = ', '.join(f"{r['id']} (#{r.get('displayNum','')})" for r in recipes)
            issues.append(('duplicate_title', recipes[0]['id'], recipes[0].get('title',''),
                           f"Same/similar title shared with: {ids}"))

    # Desc duplicates
    desc_map = defaultdict(list)
    for r in R:
        d = (r.get('desc') or '').strip()
        if d:
            desc_map[d].append(r)
    for desc, recipes in desc_map.items():
        if len(recipes) > 1:
            ids = ', '.join(f"{r['id']} (#{r.get('displayNum','')})" for r in recipes)
            issues.append(('duplicate_desc', recipes[0]['id'], recipes[0].get('title',''),
                           f"Identical desc shared with: {ids}"))
    return issues


def check_german(R, RECIPE_DETAILS):
    issues = []

    # Check R[].ing[] if present
    for r in R:
        rid = r.get('id', '')
        title = r.get('title', '')
        for ing_str in r.get('ing', []):
            matches = GERMAN_RE.findall(str(ing_str))
            if matches:
                issues.append(('german_R_ing', rid, title,
                               f"German word(s) {matches} in ing: {ing_str!r}"))

    # Check RECIPE_DETAILS ingredients
    for rid, detail in RECIPE_DETAILS.items():
        # find matching title from R
        title = rid
        for r in R:
            if r.get('id') == rid:
                title = r.get('title', rid)
                break
        for section in detail.get('ingredients', []):
            for item in section.get('items', []):
                name = item.get('name', '')
                amt = item.get('amt', '')
                for text in (name, str(amt)):
                    matches = GERMAN_RE.findall(text)
                    if matches:
                        issues.append(('german_detail', rid, title,
                                       f"German word(s) {matches} in ingredient: {name!r} / {amt!r}"))
    return issues


def check_missing_units(RECIPE_DETAILS, R):
    issues = []
    r_title_map = {r['id']: r.get('title', r['id']) for r in R}

    for rid, detail in RECIPE_DETAILS.items():
        title = r_title_map.get(rid, rid)
        for section in detail.get('ingredients', []):
            for item in section.get('items', []):
                amt = str(item.get('amt', ''))
                name = item.get('name', '')
                # skip template placeholders and "to taste" style
                if '{{' in amt:
                    continue
                skip_phrases = ['to taste', 'as needed', 'optional', 'as desired',
                                'spray', 'for serving', 'for garnish', 'for frying',
                                'for cooking', 'as required', 'handful', 'pinch',
                                'for topping', 'see note', 'small handful']
                skip = False
                for ph in skip_phrases:
                    if ph.lower() in amt.lower():
                        skip = True
                        break
                if skip:
                    continue
                # Check: has a number but no unit
                has_number = bool(NUMBER_RE.search(amt))
                has_unit = bool(UNIT_RE.search(amt))
                if has_number and not has_unit:
                    issues.append(('missing_unit', rid, title,
                                   f"No unit in amt={amt!r} for ingredient {name!r}"))
    return issues


def check_inconsistent_units(RECIPE_DETAILS, R):
    """Find same ingredient name used with different unit types across recipes."""
    # Map ingredient name (normalized) -> set of unit types found
    ing_units = defaultdict(set)  # normalized_name -> set of (rid, unit)
    ing_unit_recipes = defaultdict(list)  # normalized_name -> [(rid, amt, unit)]

    r_title_map = {r['id']: r.get('title', r['id']) for r in R}

    def extract_unit(amt):
        amt_s = str(amt).lower()
        if '{{' in amt_s:
            return None
        # Try to find a unit
        m = UNIT_RE.search(amt_s)
        if m:
            return m.group(1).lower()
        return None

    def normalize_ing_name(name):
        name = name.lower()
        name = re.sub(r'\(.*?\)', '', name)  # remove parenthetical
        name = re.sub(r'[^a-z ]', '', name)
        name = re.sub(r'\s+', ' ', name).strip()
        # Remove common modifiers
        modifiers = ['fresh', 'dried', 'chopped', 'minced', 'sliced', 'diced',
                     'shredded', 'grated', 'cooked', 'raw', 'frozen', 'canned',
                     'low fat', 'low sodium', 'full fat', 'light', 'large', 'small',
                     'medium', 'whole', 'halved', 'crushed', 'ground', 'packed',
                     'heaped', 'level', 'ripe', 'peeled', 'deseeded', 'trimmed',
                     'boneless', 'skinless', 'lean', 'extra']
        words = name.split()
        words = [w for w in words if w not in modifiers]
        return ' '.join(words).strip()

    for rid, detail in RECIPE_DETAILS.items():
        for section in detail.get('ingredients', []):
            for item in section.get('items', []):
                name = normalize_ing_name(item.get('name', ''))
                if not name or len(name) < 3:
                    continue
                amt = str(item.get('amt', ''))
                unit = extract_unit(amt)
                if unit:
                    ing_unit_recipes[name].append((rid, amt, unit))
                    ing_units[name].add(unit)

    issues = []
    # Group units into categories: weight vs volume vs count
    weight_units = {'g', 'kg', 'oz', 'lb', 'lbs'}
    volume_units = {'ml', 'l', 'cup', 'cups', 'tbsp', 'tsp'}
    count_units = {'clove', 'cloves', 'slice', 'slices', 'piece', 'pieces',
                   'can', 'cans', 'stalk', 'stalks', 'sprig', 'sprigs',
                   'head', 'bunch', 'drop', 'drops', 'sheet', 'sheets'}

    def unit_category(u):
        if u in weight_units: return 'weight'
        if u in volume_units: return 'volume'
        if u in count_units: return 'count'
        return 'other'

    for name, units in ing_units.items():
        categories = set(unit_category(u) for u in units)
        # Only flag if multiple CATEGORIES (not just different units in same category)
        if len(categories) > 1:
            recipe_examples = ing_unit_recipes[name]
            # Show at most 3 examples
            example_strs = []
            seen_units = set()
            for rid, amt, unit in recipe_examples:
                if unit not in seen_units:
                    example_strs.append(f"{rid}: {amt!r}")
                    seen_units.add(unit)
                if len(example_strs) >= 4:
                    break
            issues.append(('inconsistent_units', name, name,
                           f"Units across categories {categories}: {'; '.join(example_strs)}"))
    return issues


def check_macro_plausibility(R):
    issues = []
    CARB_TYPES = {'rice', 'noodle', 'pasta', 'potato', 'bread', 'wrap', 'oat',
                  'oats', 'quinoa', 'couscous', 'grain', 'tortilla', 'pita',
                  'lentil', 'bean', 'corn', 'bulgur', 'barley', 'rye', 'flatbread'}

    for r in R:
        rid = r.get('id', '')
        title = r.get('title', '')
        carb_field = r.get('carb')

        # carb field is typically a string like "rice" or a number
        # Check if it's a numeric carb value
        if isinstance(carb_field, (int, float)):
            val = float(carb_field)
            if val > 500:
                issues.append(('macro_carb_high', rid, title,
                               f"carb value {val}g seems very high (>500g)"))
            elif val < 0:
                issues.append(('macro_carb_negative', rid, title,
                               f"carb value {val}g is negative"))
            elif val == 0:
                tags = [t.lower() for t in r.get('tags', [])]
                carb_type = str(r.get('carb', '')).lower()
                has_carb_tag = any(t in CARB_TYPES for t in tags) or carb_type in CARB_TYPES
                if not has_carb_tag:
                    issues.append(('macro_zero_carb', rid, title,
                                   f"carb=0 and no carb-related tag (tags: {tags})"))
    return issues


def check_missing_ingredients(R, RECIPE_DETAILS):
    """
    Heuristic: tokenize steps, find words that appear in other recipes'
    ingredient lists but NOT in this recipe's own ingredient list.
    Only flag high-confidence misses (appearing in 3+ other recipes).
    """
    # First, build a global ingredient vocabulary
    # Maps normalized word -> count of recipes it appears in as ingredient
    global_ing_words = defaultdict(int)  # word -> recipe count
    recipe_ing_words = {}  # rid -> set of normalized words

    STOP_WORDS = {
        'a', 'an', 'the', 'and', 'or', 'of', 'with', 'in', 'to', 'for',
        'on', 'at', 'by', 'is', 'are', 'be', 'as', 'it', 'its', 'this',
        'that', 'from', 'into', 'over', 'until', 'then', 'add', 'mix',
        'cook', 'stir', 'heat', 'place', 'pour', 'cut', 'slice', 'chop',
        'dice', 'let', 'set', 'rest', 'use', 'get', 'put', 'take', 'make',
        'toss', 'coat', 'combine', 'bring', 'serve', 'remove', 'turn',
        'top', 'season', 'taste', 'good', 'high', 'low', 'hot', 'cold',
        'fresh', 'dry', 'wet', 'done', 'well', 'each', 'both', 'all',
        'some', 'more', 'less', 'just', 'about', 'around', 'off', 'out',
        'up', 'down', 'through', 'do', 'not', 'no', 'if', 'when', 'while',
        'after', 'before', 'once', 'now', 'should', 'will', 'can', 'may',
        'side', 'pan', 'wok', 'bowl', 'pot', 'tray', 'oven', 'grill',
        'fridge', 'plate', 'board', 'knife', 'spoon', 'foil', 'paper',
        'water', 'heat', 'medium', 'large', 'small', 'minute', 'minutes',
        'second', 'seconds', 'hour', 'hours', 'temperature', 'aside',
        'bit', 'half', 'piece', 'few', 'room', 'temp', 'very', 'quite',
        'still', 'also', 'even', 'much', 'back', 'same', 'new', 'old',
        'way', 'time', 'times', 'step', 'note', 'tip', 'recipe',
    }

    def tokenize(text):
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        return {w for w in words if w not in STOP_WORDS}

    for rid, detail in RECIPE_DETAILS.items():
        ing_text = []
        for section in detail.get('ingredients', []):
            for item in section.get('items', []):
                ing_text.append(item.get('name', ''))
        words = tokenize(' '.join(ing_text))
        recipe_ing_words[rid] = words
        for w in words:
            global_ing_words[w] += 1

    # Only consider words that appear in 3+ recipes (common ingredients)
    common_ing_words = {w for w, c in global_ing_words.items() if c >= 3}

    issues = []
    r_title_map = {r['id']: r.get('title', r['id']) for r in R}

    for rid, detail in RECIPE_DETAILS.items():
        title = r_title_map.get(rid, rid)
        steps_text = ' '.join(str(s) for s in detail.get('steps', []))
        step_words = tokenize(steps_text)

        own_ing_words = recipe_ing_words.get(rid, set())

        # Words in steps that are common ingredients but not in own ingredient list
        suspicious = step_words & common_ing_words - own_ing_words

        # Filter: only flag words that appear 5+ times globally (very common ingredients)
        flagged = [w for w in suspicious if global_ing_words[w] >= 5]
        flagged.sort()

        if flagged:
            issues.append(('missing_ingredient', rid, title,
                           f"Step mentions words not in own ingredients (common in {global_ing_words[w]} recipes): {flagged[:10]}"))
    return issues


# ── report generation ──────────────────────────────────────────────────────

def write_report(all_issues, R, RECIPE_DETAILS, path):
    categories = {
        'duplicate_title': '## A. Duplicate Titles',
        'duplicate_desc': '## B. Duplicate Descriptions',
        'german_R_ing': '## C. Non-English Ingredients (R[] ing[])',
        'german_detail': '## C. Non-English Ingredients (RECIPE_DETAILS)',
        'missing_unit': '## D. Missing Units',
        'inconsistent_units': '## E. Inconsistent Units',
        'macro_carb_high': '## F. Macro Plausibility — High Carb',
        'macro_carb_negative': '## F. Macro Plausibility — Negative Carb',
        'macro_zero_carb': '## F. Macro Plausibility — Zero Carb No Tag',
        'missing_ingredient': '## G. Possible Missing Ingredients (Heuristic)',
    }

    section_order = [
        ('duplicate_title', 'duplicate_desc'),
        ('german_R_ing', 'german_detail'),
        ('missing_unit',),
        ('inconsistent_units',),
        ('macro_carb_high', 'macro_carb_negative', 'macro_zero_carb'),
        ('missing_ingredient',),
    ]

    section_headers = {
        ('duplicate_title', 'duplicate_desc'): '## A. Duplicates',
        ('german_R_ing', 'german_detail'): '## C. Non-English Ingredient Names',
        ('missing_unit',): '## D. Missing Units in RECIPE_DETAILS',
        ('inconsistent_units',): '## E. Inconsistent Units Across Recipes',
        ('macro_carb_high', 'macro_carb_negative', 'macro_zero_carb'): '## F. Macro Plausibility',
        ('missing_ingredient',): '## G. Possible Missing Ingredients (Heuristic)',
    }

    # Group issues by category
    by_cat = defaultdict(list)
    for issue in all_issues:
        cat = issue[0]
        by_cat[cat].append(issue)

    lines = [
        '# Recipe Vault — Audit Report',
        '',
        f'**Recipes in R[]:** {len(R)}',
        f'**Recipes in RECIPE_DETAILS:** {len(RECIPE_DETAILS)}',
        f'**Total issues found:** {len(all_issues)}',
        '',
        '---',
        '',
    ]

    for group, header in section_headers.items():
        group_issues = []
        for cat in group:
            group_issues.extend(by_cat.get(cat, []))

        lines.append(header)
        lines.append('')
        if not group_issues:
            lines.append('_No issues found._')
            lines.append('')
            continue

        lines.append(f'**{len(group_issues)} issue(s)**')
        lines.append('')

        for issue in group_issues:
            cat, rid, title, detail = issue
            cat_label = cat.replace('_', ' ').title()
            lines.append(f'- **[{cat_label}]** `{rid}` — *{title}*')
            lines.append(f'  - {detail}')
        lines.append('')

    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))


# ── main ───────────────────────────────────────────────────────────────────

def main():
    print("Parsing recipes.js ...", flush=True)
    R, RECIPE_DETAILS = parse_recipes_js()
    print(f"  R[]: {len(R)} recipes")
    print(f"  RECIPE_DETAILS: {len(RECIPE_DETAILS)} entries")
    print()

    if not R:
        print("[FATAL] R[] is empty — parsing failed. Aborting.", file=sys.stderr)
        sys.exit(1)

    all_issues = []

    print("Running check A: Duplicates ...", flush=True)
    dup_issues = check_duplicates(R)
    all_issues.extend(dup_issues)
    print(f"  {len(dup_issues)} issue(s)")

    print("Running check C: Non-English ingredients ...", flush=True)
    german_issues = check_german(R, RECIPE_DETAILS)
    all_issues.extend(german_issues)
    print(f"  {len(german_issues)} issue(s)")

    print("Running check D: Missing units ...", flush=True)
    unit_issues = check_missing_units(RECIPE_DETAILS, R)
    all_issues.extend(unit_issues)
    print(f"  {len(unit_issues)} issue(s)")

    print("Running check E: Inconsistent units ...", flush=True)
    incons_issues = check_inconsistent_units(RECIPE_DETAILS, R)
    all_issues.extend(incons_issues)
    print(f"  {len(incons_issues)} issue(s)")

    print("Running check F: Macro plausibility ...", flush=True)
    macro_issues = check_macro_plausibility(R)
    all_issues.extend(macro_issues)
    print(f"  {len(macro_issues)} issue(s)")

    print("Running check G: Missing ingredients (heuristic) ...", flush=True)
    missing_ing_issues = check_missing_ingredients(R, RECIPE_DETAILS)
    all_issues.extend(missing_ing_issues)
    print(f"  {len(missing_ing_issues)} issue(s)")

    print()
    print("Writing report ...", flush=True)
    write_report(all_issues, R, RECIPE_DETAILS, REPORT_PATH)
    print(f"  Report written to: {REPORT_PATH}")
    print()

    # Summary
    cats = defaultdict(int)
    for issue in all_issues:
        cats[issue[0]] += 1

    print("=" * 60)
    print("AUDIT SUMMARY")
    print("=" * 60)
    print(f"Total recipes checked (R[]):        {len(R)}")
    print(f"Total detail entries (RECIPE_DETAILS): {len(RECIPE_DETAILS)}")
    print(f"Total issues found:                 {len(all_issues)}")
    print()
    cat_labels = [
        ('duplicate_title',    'A  Duplicate titles'),
        ('duplicate_desc',     'A  Duplicate descriptions'),
        ('german_R_ing',       'C  German words in R[].ing'),
        ('german_detail',      'C  German words in RECIPE_DETAILS'),
        ('missing_unit',       'D  Missing units'),
        ('inconsistent_units', 'E  Inconsistent units'),
        ('macro_carb_high',    'F  Carb value > 500g'),
        ('macro_carb_negative','F  Negative carb value'),
        ('macro_zero_carb',    'F  Zero carb no tag'),
        ('missing_ingredient', 'G  Possible missing ingredients'),
    ]
    for cat, label in cat_labels:
        count = cats.get(cat, 0)
        marker = ' !' if count > 0 else ''
        print(f"  {label:<40} {count:>4}{marker}")
    print("=" * 60)


if __name__ == '__main__':
    main()
