---
name: reset-day-mealprep
description: Generate a full "Sunday Reset Day" weekly meal-prep plan for FIT NIIKITER — one prep session on Sunday (marinate + freeze protein portions, pre-cut veg) that turns into 6 different-tasting, minimal-effort fresh meals Monday–Saturday. Use this whenever Nick asks for a "reset day", a weekly meal-prep plan, "meal prep but still fresh every day", a batch-marinate/freeze-portion plan, or wants recipe suggestions built around a subscriber/newsletter-style weekly plan. Trigger even if he just says "gib mir einen Wochenplan" or "ich brauche 6 marinaden für die Woche" — this is the skill that turns that into the full prep sheet + day-by-day recipes.
---

# Reset Day Meal Prep

The whole pitch: Sunday does all the boring work (marinating, freezing, cutting)
so Monday–Saturday each feel like a fresh, different meal but take almost no
effort. The trick is separating what can hide in the freezer/fridge for 6 days
from what has to happen fresh each day — and keeping that fresh part to
literally one pan of carb + a 2-minute sauce.

## The system (don't deviate from this shape)

- **Protein**: one batch, split into 6 portions (default 200g raw chicken
  breast/thigh per portion — ask if Nick wants a different protein or gram
  amount). Each of the 6 portions gets a **different marinade**, so the
  protein itself is what creates daily variety even though it's all prepped
  in one sitting.
- **Veg**: pre-cut on Sunday, kept raw in a deli container in the fridge —
  only vegetables that actually hold up raw-cut for up to 6 days (see below).
- **Carb + sauce**: cooked fresh each day, ~5-15 min. This is the ONLY daily
  cooking, which is what makes "fresh every day" actually true rather than
  reheated leftovers. Don't batch-cook the carb for the whole week — rice,
  potatoes, etc. lose texture over 6 days; it defeats the point of the skill.
- **Sunday = Reset Day**: everything above gets restocked; nothing carries
  over two weeks.

## Step 1 — Check recipes.js before inventing anything

Recipe Vault already has 190+ marinade-based recipes. Grep `recipes.js` for
`marinat` (marinade/marinated) and for the target protein before writing new
marinades from scratch — reusing an existing recipe's marinade means Nick
already knows it works and it's already photographed/filmed. Only invent a
new marinade when nothing existing fits the flavor slot you need.

```bash
grep -n "marinat" recipes.js | grep -i chicken
```

Pick 6 marinades that are **maximally different in flavor family** (e.g. one
Korean gochujang, one Greek lemon-oregano, one Mexican chipotle, one
Middle-Eastern harissa or za'atar, one Japanese teriyaki, one Indian
tikka-style) — variety across the week is the entire value proposition, so
never repeat a flavor family within one week's 6 days.

## Step 2 — The Reset Day prep sheet (this is the core deliverable)

```
RESET DAY PREP SHEET — Week of [date]

PROTEIN (6× 200g chicken breast, 1200g total)
Day  Marinade                 Ingredients (per 200g portion)
Mon  Korean gochujang         1 tbsp gochujang, 1 tbsp soy sauce, ½ tbsp rice vinegar, 1 tsp honey, 1 clove garlic
Tue  Greek lemon-oregano      1 tbsp olive oil, ½ lemon (juice+zest), 1 tsp oregano, 1 clove garlic
...

PACKING & FREEZING
1. Mix each marinade fresh, coat its 200g portion in a bag/vacuum pouch.
2. Vacuum-seal (or press air out of a zip bag) and lay flat to freeze —
   flat portions thaw evenly and stack compactly.
3. Label each bag with the day + marinade name.
4. Freezing PAUSES marination, it doesn't skip it — the chicken keeps
   marinating as it thaws, so 10 min of mixing on Sunday gives you a fully
   marinated portion by Wednesday or Saturday alike.
5. Move that day's bag to the fridge the night before (or run under cold
   water for a quick thaw the morning of) — never marinate-then-refreeze.

VEG (pre-cut, raw, in a deli container, 6 days in the fridge)
- Bell pepper, carrot batons, red cabbage (shredded), celery, snap peas —
  these hold texture raw-cut for 6 days.
- AVOID pre-cutting: cucumber (weeps after ~3 days), tomato, avocado, or any
  leafy salad — cut those fresh per day instead if a recipe needs them.

SAUCE BASES (optional — batch what keeps)
- Yogurt-based sauces (tzatziki, tahini-yogurt, crema) keep ~4-5 days
  covered in the fridge — batch once, portion daily.
- Anything with fresh herbs, avocado, or citrus that browns: mix fresh
  per day (it's a 2-minute step, listed in each day's card).
```

Always give exact grams/ml scaled to the actual portion count and protein
amount Nick specifies — don't leave placeholders in the prep sheet itself
(placeholders like `{{proteinG}}` are only for the recipes.js output in Step 3).

## Step 3 — The 6 day cards, in Recipe Vault's actual schema

Each day is a real recipe in Recipe Vault's format (see project CLAUDE.md
"Recipe Structure"), so Nick can drop it straight into `recipes.js` with the
`add-recipe` skill, or use it standalone for the day. Because the protein is
already marinated and the veg already cut, the STEPS list should read as an
assembly job, not a full cook from raw — call out explicitly what's "already
done from Reset Day" so it doesn't read like a normal recipe that hides prep
time.

For each day, produce both objects:

```js
// R entry
{
  id: "gochujang-chicken-rice-bowl-reset",
  protein: "chicken",
  displayNum: <next free number, see below>,
  carb: "rice",
  time: 15,               // fresh-cook time only — marination doesn't count, it happened Sunday
  title: "Gochujang Chicken Rice Bowl",
  desc: "Reset Day gochujang-marinated chicken, seared fresh, over rice with pre-cut veg.",
  tags: ["korean", "meal-prep"],
  flavor: "savory",
  hint: "Reset Day Mon — chicken pre-marinated, veg pre-cut, just cook + assemble.",
}

// RECIPE_DETAILS entry
"gochujang-chicken-rice-bowl-reset": {
  ingredients: [
    { section: "From Reset Day", items: [
      { name: "Gochujang-marinated chicken breast (thawed)", amt: "{{proteinG}}g" },
      { name: "Pre-cut bell pepper + carrot", amt: "100g" },
    ]},
    { section: "Cook fresh", items: [
      { name: "Jasmine rice (dry)", amt: "{{carbG}}g" },
      { name: "Sesame oil", amt: "1 tsp" },
    ]},
  ],
  steps: [
    "Cook rice (rice cooker or 12 min stovetop).",
    "Sear the pre-marinated chicken in a hot pan, 4-5 min per side.",
    "Quick stir-fry the pre-cut veg in the same pan, 2-3 min.",
    "Assemble bowl, drizzle sesame oil.",
  ],
  hacks: ["💡 80/20 hack: finish with a spoon of the leftover marinade, boiled 1 min, as a glaze."],
  notes: "Part of a Sunday Reset Day batch — see prep sheet for the full week.",
}
```

Check the current highest `displayNum` in `recipes.js` before assigning new
numbers (CLAUDE.md tracks the count and next free number) — never reuse or
skip a number, and update the CLAUDE.md count if you actually add these to
the file rather than just proposing them.

Follow every existing Recipe Vault content rule while writing these: English
only, metric units, ingredients available at REWE/Edeka/Aldi/Lidl/Kaufland,
specific technique over "cook until done", and apply the 80/20 flavor rule
(one small high-value addition per recipe, flagged with a 💡 hack line) —
this is still FIT NIIKITER content, not generic meal-prep advice.

## Step 4 — Weekly summary (newsletter-ready)

Close with a compact block that could be dropped straight into an email —
this doesn't build the actual newsletter/signup system (that's a separate,
later task), but keep this section self-contained and skimmable since it's
the part most likely to get reused there:

```
THIS WEEK'S RESET
🗓 Prep once Sunday, eat fresh Mon-Sat
🍗 6× 200g chicken, 6 marinades: Korean · Greek · Mexican · Middle Eastern · Japanese · Indian
🥕 Pre-cut: bell pepper, carrot, red cabbage
⏱ Daily effort: ~15 min (cook carb + sear protein + toss veg)
📋 Full prep sheet + day-by-day recipes above
```

## Notes

- If Nick gives fewer/more than 6 days or a different protein/gram target,
  scale the whole system (marinade count, total protein weight, portion
  size) accordingly rather than forcing 6×200g.
- If he asks for the plan to actually go out to an email list, say clearly
  that's a separate build (signup form, sending mechanism, storage) and this
  skill only produces the content for it.
