#!/usr/bin/env python3
"""
Recipe Vault — Audit Script
Checks all recipes for: duplicates, non-English terms, missing units,
inconsistent units, macro plausibility, missing ingredients.
OUTPUT: .claude/recipe_audit_report.md
"""
import re, json, sys
from collections import defaultdict

RECIPES_JS = "/home/user/Recipe-Vault/recipes.js"
REPORT_OUT = "/home/user/Recipe-Vault/.claude/recipe_audit_report.md"

# ── German ingredient terms to flag ──────────────────────────────────────────
GERMAN_TERMS = [
    "magerquark","quark","frischkäse","topfen","putenbrust","hähnchen",
    "rindfleisch","schweinefleisch","speck","lachs","kabeljau","thunfisch",
    "garnelen","zwiebel","knoblauch","kartoffel","nudeln","mehl","zucker",
    "salz","pfeffer","öl","butter","milch","sahne","joghurt","käse",
    "erbsen","mais","brokkoli","spinat","kohl","möhre","möhren","karotte",
    "karotten","sellerie","lauch","zucchini","gurke","tomate","tomaten",
    "bohnen","linsen","kichererbsen","ei","eier","schnittkäse","frühlingszwiebeln",
]

UNITS = r"(?:g|kg|ml|l|oz|lb|tbsp|tsp|cup|cups|clove|cloves|slice|slices|" \
        r"piece|pieces|handful|pinch|can|cans|sheet|sheets|dash|drop|drops|" \
        r"bunch|head|stalk|stalks|sprig|sprigs|fillet|fillets)"

def load_js_array(text, var_name):
    """Extract a JS array/object assigned to var_name."""
    pattern = rf"(?:const|var|let)\s+{re.escape(var_name)}\s*=\s*"
    m = re.search(pattern, text)
    if not m:
        return None
    start = m.end()
    # find matching bracket
    ch = text[start]
    close = ']' if ch == '[' else '}'
    depth, i = 0, start
    while i < len(text):
        if text[i] == ch:
            depth += 1
        elif text[i] == close:
            depth -= 1
            if depth == 0:
                raw = text[start:i+1]
                # JS → JSON: strip trailing commas, convert single quotes
                raw = re.sub(r',\s*([}\]])', r'\1', raw)  # trailing commas
                raw = re.sub(r'//[^\n]*', '', raw)         # line comments
                raw = re.sub(r'/\*.*?\*/', '', raw, flags=re.DOTALL)
                try:
                    return json.loads(raw)
                except Exception as e:
                    # try with more aggressive cleanup
                    raw2 = re.sub(r"'", '"', raw)
                    try:
                        return json.loads(raw2)
                    except:
                        print(f"[WARN] Could not parse {var_name}: {e}", file=sys.stderr)
                        return None
        i += 1
    return None

def normalize_title(t):
    return re.sub(r'[^a-z0-9 ]', '', t.lower()).strip()

def check_duplicates(recipes):
    issues = []
    seen = {}
    for r in recipes:
        key = normalize_title(r.get('title',''))
        if key in seen:
            issues.append({
                'id': r.get('id'), 'title': r.get('title'),
                'detail': f"Same title as #{seen[key]['displayNum']} "{seen[key]['title']}""
            })
        else:
            seen[key] = r
    # check duplicate desc
    desc_seen = {}
    for r in recipes:
        d = (r.get('desc','') or '').strip()
        if len(d) > 20:
            if d in desc_seen:
                issues.append({
                    'id': r.get('id'), 'title': r.get('title'),
                    'detail': f"Identical description as "{desc_seen[d]}""
                })
            else:
                desc_seen[d] = r.get('title')
    return issues

def check_german(recipes, details):
    issues = []
    pattern = re.compile(r'\b(' + '|'.join(GERMAN_TERMS) + r')\b', re.IGNORECASE)
    for r in recipes:
        rid = r.get('id')
        # check card-level fields
        for field in ['title','desc']:
            val = r.get(field,'') or ''
            m = pattern.search(val)
            if m:
                issues.append({'id': rid, 'title': r.get('title'),
                               'detail': f'Field "{field}": found "{m.group()}"'})
        # check RECIPE_DETAILS ingredients
        det = details.get(rid, {})
        for ing in det.get('ingredients', []):
            text = ing if isinstance(ing, str) else ing.get('text','')
            m = pattern.search(text)
            if m:
                issues.append({'id': rid, 'title': r.get('title'),
                               'detail': f'Ingredient "{text[:60]}": found "{m.group()}"'})
        for step in det.get('steps', []):
            text = step if isinstance(step, str) else step.get('text','')
            m = pattern.search(text)
            if m:
                issues.append({'id': rid, 'title': r.get('title'),
                               'detail': f'Step text: found "{m.group()}" in "{text[:60]}"'})
    return issues

def check_missing_units(details):
    issues = []
    # number followed by ingredient name but no unit
    has_num = re.compile(r'\b\d+(?:\.\d+)?(?:/\d+)?\s*(?!' + UNITS + r'\b)', re.IGNORECASE)
    has_unit = re.compile(UNITS, re.IGNORECASE)
    for rid, det in details.items():
        for ing in det.get('ingredients', []):
            text = ing if isinstance(ing, str) else (ing.get('text','') if isinstance(ing,dict) else '')
            if not text: continue
            if re.search(r'\d', text) and not has_unit.search(text):
                issues.append({'id': rid, 'detail': f'"{text[:70]}"'})
    return issues

def check_inconsistent_units(details):
    # Map ingredient-name-stem → set of units used
    ing_units = defaultdict(lambda: defaultdict(set))
    unit_pat = re.compile(r'(\d[\d./]*)\s*(' + UNITS + r')\s+(.+)', re.IGNORECASE)
    for rid, det in details.items():
        for ing in det.get('ingredients', []):
            text = ing if isinstance(ing, str) else (ing.get('text','') if isinstance(ing,dict) else '')
            if not text: continue
            m = unit_pat.match(text.strip())
            if m:
                unit = m.group(2).lower()
                name = m.group(3).strip().lower()
                # take first 2 words as key
                key = ' '.join(name.split()[:2])
                ing_units[key][unit].add(rid)
    issues = []
    for name, unit_map in ing_units.items():
        if len(unit_map) > 1:
            summary = ', '.join(f"{u} ({len(rids)} recipes)" for u, rids in unit_map.items())
            issues.append({'ingredient': name, 'detail': summary})
    return issues

def check_macros(recipes):
    issues = []
    for r in recipes:
        carb = r.get('carb')
        if carb is None: continue
        try:
            c = float(carb)
        except:
            issues.append({'id': r.get('id'), 'title': r.get('title'),
                           'detail': f'Non-numeric carb value: {carb!r}'})
            continue
        if c < 0:
            issues.append({'id': r.get('id'), 'title': r.get('title'),
                           'detail': f'Negative carb: {c}g'})
        elif c > 500:
            issues.append({'id': r.get('id'), 'title': r.get('title'),
                           'detail': f'Suspiciously high carb: {c}g'})
    return issues

def check_missing_ingredients(recipes, details):
    """Flag ingredients mentioned in steps but missing from the ingredient list."""
    # Build a global ingredient vocabulary from all recipes
    all_ing_words = set()
    recipe_ing_words = {}
    for rid, det in details.items():
        words = set()
        for ing in det.get('ingredients', []):
            text = ing if isinstance(ing, str) else (ing.get('text','') if isinstance(ing,dict) else '')
            for w in re.findall(r'[a-z]{4,}', text.lower()):
                words.add(w)
                all_ing_words.add(w)
        recipe_ing_words[rid] = words

    # Common non-ingredient words to ignore
    STOPWORDS = {
        'with','and','the','for','from','until','then','about','over','into',
        'heat','cook','add','stir','mix','pour','place','remove','make','bring',
        'slice','dice','chop','mince','grate','coat','toss','serve','drain',
        'season','taste','each','both','well','just','like','that','this',
        'your','once','done','also','very','more','some','when','them','they',
        'will','have','been','after','before','while','small','large','medium',
        'finely','evenly','light','dark','thick','thin','fresh','fresh','aside',
        'bowl','plate','pan','wok','oven','skillet','minutes','seconds',
        'minute','second','tbsp','tsp','high','heat','side','sides','water',
        'half','together','pieces','piece','optional','desired','needed',
    }

    issues = []
    for r in recipes:
        rid = r.get('id')
        det = details.get(rid, {})
        my_words = recipe_ing_words.get(rid, set())
        step_words = set()
        for step in det.get('steps', []):
            text = step if isinstance(step, str) else (step.get('text','') if isinstance(step,dict) else '')
            for w in re.findall(r'[a-z]{4,}', text.lower()):
                step_words.add(w)
        # words in steps that appear in global ingredient vocabulary but NOT in this recipe's ingredients
        missing = (step_words & all_ing_words) - my_words - STOPWORDS
        if missing:
            sample = sorted(missing)[:5]
            issues.append({'id': rid, 'title': r.get('title'),
                           'detail': f'Possible missing ingredients: {", ".join(sample)}'})
    return issues

def fmt_section(title, issues, fmt_fn):
    lines = [f"\n## {title} ({len(issues)} issues)\n"]
    if not issues:
        lines.append("_No issues found._\n")
    else:
        for iss in issues:
            lines.append(fmt_fn(iss))
    return '\n'.join(lines)

def main():
    print("Reading recipes.js …")
    with open(RECIPES_JS, 'r', encoding='utf-8') as f:
        src = f.read()

    print("Parsing R[] …")
    recipes = load_js_array(src, 'R')
    if not recipes:
        print("ERROR: Could not parse R[]", file=sys.stderr)
        sys.exit(1)
    print(f"  → {len(recipes)} recipe cards loaded")

    print("Parsing RECIPE_DETAILS …")
    details = load_js_array(src, 'RECIPE_DETAILS')
    if not details:
        print("ERROR: Could not parse RECIPE_DETAILS", file=sys.stderr)
        sys.exit(1)
    print(f"  → {len(details)} recipe details loaded")

    print("Running checks …")
    dups       = check_duplicates(recipes)
    german     = check_german(recipes, details)
    no_units   = check_missing_units(details)
    incons     = check_inconsistent_units(details)
    macros     = check_macros(recipes)
    missing    = check_missing_ingredients(recipes, details)

    # ── Write report ─────────────────────────────────────────────────────────
    report = ["# Recipe Vault — Audit Report\n"]
    report.append(f"**Recipes scanned:** {len(recipes)}  |  **Details loaded:** {len(details)}\n")
    report.append(f"| Check | Issues |")
    report.append(f"|-------|--------|")
    report.append(f"| Duplicates | {len(dups)} |")
    report.append(f"| Non-English terms | {len(german)} |")
    report.append(f"| Missing units | {len(no_units)} |")
    report.append(f"| Inconsistent units | {len(incons)} |")
    report.append(f"| Macro plausibility | {len(macros)} |")
    report.append(f"| Possible missing ingredients | {len(missing)} |")

    report.append(fmt_section(
        "1. Duplicate Recipes", dups,
        lambda i: f"- **[{i['id']}]** {i['title']}: {i['detail']}"
    ))
    report.append(fmt_section(
        "2. Non-English Ingredient Terms", german,
        lambda i: f"- **[{i['id']}]** {i['title']}: {i['detail']}"
    ))
    report.append(fmt_section(
        "3. Missing Units", no_units,
        lambda i: f"- **[{i['id']}]** {i['detail']}"
    ))
    report.append(fmt_section(
        "4. Inconsistent Units Across Recipes", incons,
        lambda i: f"- **{i['ingredient']}**: {i['detail']}"
    ))
    report.append(fmt_section(
        "5. Macro Plausibility", macros,
        lambda i: f"- **[{i['id']}]** {i['title']}: {i['detail']}"
    ))
    report.append(fmt_section(
        "6. Possible Missing Ingredients (step mentions ingredient not in list)", missing,
        lambda i: f"- **[{i['id']}]** {i['title']}: {i['detail']}"
    ))

    with open(REPORT_OUT, 'w', encoding='utf-8') as f:
        f.write('\n'.join(report))

    print(f"\n{'='*60}")
    print(f"AUDIT COMPLETE — {len(recipes)} recipes checked")
    print(f"{'='*60}")
    print(f"  Duplicates:                   {len(dups)}")
    print(f"  Non-English terms:            {len(german)}")
    print(f"  Missing units:                {len(no_units)}")
    print(f"  Inconsistent units:           {len(incons)} ingredient names")
    print(f"  Macro plausibility issues:    {len(macros)}")
    print(f"  Possible missing ingredients: {len(missing)}")
    print(f"\nFull report → .claude/recipe_audit_report.md")

if __name__ == '__main__':
    main()
