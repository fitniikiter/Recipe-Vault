// Dependency-free stand-in for the small subset of anime.js this app
      // uses (targets, from/to keyframes for opacity/height/transform, easing,
      // duration, delay incl. stagger, begin/complete). Backed by the native
      // Web Animations API so the app stays self-contained — no CDN at runtime.
      (function () {
        const EASINGS = {
          easeInQuad: "cubic-bezier(0.55,0.085,0.68,0.53)",
          easeOutQuad: "cubic-bezier(0.25,0.46,0.45,0.94)",
          easeOutBack: "cubic-bezier(0.34,1.56,0.64,1)",
          linear: "linear",
        };
        // Split anime-style props into a [from, to] pair of CSS declarations,
        // compositing transform sub-properties (scale/translate/rotate).
        function frames(props) {
          const from = {}, to = {}, tFrom = [], tTo = [];
          for (const key in props) {
            const v = props[key];
            if (!Array.isArray(v)) continue; // only [from, to] tuples animate
            const [a, b] = v;
            if (key === "translateX" || key === "translateY") {
              tFrom.push(`${key}(${a}px)`);
              tTo.push(`${key}(${b}px)`);
            } else if (key === "scale") {
              tFrom.push(`scale(${a})`);
              tTo.push(`scale(${b})`);
            } else if (key === "rotate") {
              tFrom.push(`rotate(${a}deg)`);
              tTo.push(`rotate(${b}deg)`);
            } else if (key === "height" || key === "width") {
              from[key] = `${a}px`;
              to[key] = `${b}px`;
            } else {
              from[key] = a; // opacity and other unitless props
              to[key] = b;
            }
          }
          if (tFrom.length) {
            from.transform = tFrom.join(" ");
            to.transform = tTo.join(" ");
          }
          return [from, to];
        }
        function anime(opts) {
          let targets = opts.targets;
          if (typeof targets === "string") targets = document.querySelectorAll(targets);
          const els = targets == null ? [] : targets.nodeType ? [targets] : Array.from(targets);
          const easing = EASINGS[opts.easing] || opts.easing || "ease";
          const duration = opts.duration || 400;
          if (!els.length) {
            opts.complete && opts.complete();
            return;
          }
          opts.begin && opts.begin();
          let remaining = els.length, done = false;
          els.forEach((el, i) => {
            const [from, to] = frames(opts);
            let delay = opts.delay || 0;
            if (typeof delay === "function") delay = delay(el, i);
            const anim = el.animate([from, to], { duration, delay, easing, fill: "forwards" });
            anim.onfinish = () => {
              // Bake final values into inline styles (like anime did), then
              // release the WAAPI hold so complete() callbacks can override.
              try { anim.commitStyles(); } catch (e) {}
              anim.cancel();
              if (--remaining <= 0 && !done) {
                done = true;
                opts.complete && opts.complete();
              }
            };
          });
        }
        // Per-element increasing delay: stagger(step, { start }) -> (el, i) => start + i*step
        anime.stagger = function (value, o) {
          const start = (o && o.start) || 0;
          return (el, i) => start + i * value;
        };
        window.anime = anime;
      })();
      // NUT and INGREDIENT_DB used to live here as separate, hand-duplicated
      // copies of ingredient macros. Everything now reads from the single
      // canonical NUTRITION_DB defined in nutrition.js (loaded before this
      // file) — see that file for the full ingredient list.
      function parseIngredientGrams(e, a) {
        if (!e) return null;
        const t = NUTRITION_DB[a];
        if (!t) return null;
        const i = e.toString().toLowerCase().trim();
        let n = 0;
        const s = { "½": 0.5, "¼": 0.25, "¾": 0.75, "⅓": 0.33, "⅔": 0.67, "⅛": 0.125 };
        let o = i;
        for (const [e, a] of Object.entries(s)) o = o.replace(e, a + " ");
        const r = o.match(/([\d]+(?:\.\d+)?(?:\s*\/\s*[\d]+)?)/);
        if (r) {
          const e = r[1].split("/");
          n = 2 === e.length ? parseFloat(e[0]) / parseFloat(e[1]) : parseFloat(e[0]);
        }
        0 === n && (n = 1);
        const c = t.unit_g || {};
        // A count-based unit (tbsp/clove/piece/...) this ingredient doesn't define
        // its own conversion for falls back to ITS OWN typical_g before a generic
        // cross-ingredient guess — "2 pieces star anise" using a bread-slice-sized
        // 50g default was how a 2g spice turned into 100g in a recipe's totals.
        const d = t.typical_g;
        return i.includes("tbsp")
          ? n * (c.tbsp || d || 15)
          : i.includes("tsp")
            ? n * (c.tsp || d || 5)
            : i.includes("ml")
              ? n * (c.ml || 1)
              : i.includes("clove")
                ? n * (c.clove || d || 5)
                : i.includes("stalk") || i.includes("sprig")
                  ? n * (c.stalk || d || 15)
                  : i.includes("whole")
                    ? n * (c.whole || d || 100)
                    : i.includes("piece")
                      ? n * (c.piece || c.whole || d || 50)
                      : i.includes("slice")
                      ? n * (c.slice || d || 30)
                      : i.includes("sheet")
                        ? n * (c.sheet || d || 2)
                        : i.includes("handful")
                          ? n * (c.handful || d || 30)
                          : i.includes("pinch")
                            ? 0.5 * n
                            : i.includes("splash")
                              ? 5 * n
                              : i.includes("drizzle")
                                ? 7 * n
                                : i.includes("g")
                                  ? n
                                  : i.includes("cup")
                                    ? 240 * n
                                    : t.typical_g || null;
      }
      function calcIngredientMacros(e, a) {
        const t = NUTRITION_DB[e];
        if (!t) return null;
        const i = parseIngredientGrams(a, e);
        if (!i) return null;
        const n = i / 100,
          s = 7 * (t.a || 0) * n;
        return {
          grams: Math.round(i),
          kcal: Math.round(t.kcal * n + s),
          p: Math.round(t.p * n * 10) / 10,
          c: Math.round(t.c * n * 10) / 10,
          f: Math.round(t.f * n * 10) / 10,
          a: t.a ? Math.round((t.a || 0) * n * 10) / 10 : 0,
        };
      }
      let spicyFilter = false,
        dipFilter = false,
        currentCuisineFilter = "all",
        weights = { chicken: 150, potato: 150, rice: 150, noodle: 150, bread: 150, eggs: 0, servings: 1 };
      const DEFAULT_PROTEIN_G = 150;
      const CARB_RATIOS = { potato: 1.25, rice: 0.33, noodle: 0.33, bread: 0.2 };
      // A recipe's sauce/spice amounts are fixed per portion (see
      // calcSauceMacros) — they don't scale with the protein/carb weight
      // sliders. That's fine at normal amounts, but with no ceiling a huge
      // batch total at 1 serving implied a single portion of several
      // kilograms of "meat" seasoned with the recipe's fixed 2 tbsp of
      // sauce. Cap the batch total so the effective PER-PORTION weight
      // never exceeds a realistic ceiling, whatever combination of weight
      // and serving count produced it.
      const PORTION_BOUNDS = { protMax: 400, carbMax: 350 };
      function _capToServings(g, perPortionMax) {
        return Math.min(g, perPortionMax * Math.max(weights.servings, 1));
      }
      function _reclampAllWeights() {
        weights.chicken = _capToServings(weights.chicken, PORTION_BOUNDS.protMax);
        ["potato", "rice", "noodle", "bread"].forEach((k) => {
          weights[k] = _capToServings(weights[k], PORTION_BOUNDS.carbMax);
        });
      }
      const TAG_FLAGS = {
        "korean": "🇰🇷", "japanese": "🇯🇵", "thai": "🇹🇭", "mexican": "🇲🇽",
        "chinese": "🇨🇳", "indian": "🇮🇳", "vietnamese": "🇻🇳", "american": "🇺🇸",
        "turkish": "🇹🇷", "greek": "🇬🇷", "moroccan": "🇲🇦", "indonesian": "🇮🇩",
        "filipino": "🇵🇭", "taiwanese": "🇹🇼", "peruvian": "🇵🇪", "ethiopian": "🇪🇹",
        "argentinian": "🇦🇷", "mediterranean": "🌊", "middle-eastern": "🌙",
        "north-african": "🌍", "asian": "🌏", "hawaiian": "🌺", "german": "🇩🇪", "italian": "🇮🇹", "french": "🇫🇷", "spanish": "🇪🇸", "british": "🇬🇧",
        // Auto-injected ingredient tags
        "beef": "🥩", "eggs": "🥚", "fish": "🐟", "shrimp": "🦐",
        "tofu": "🫘", "cheese": "🧀", "turkey": "🦃", "pork": "🐷",
      };
      function tagLabel(e) {
        const flag = TAG_FLAGS[e];
        const text = e.replace(/-/g, " ");
        const label = text.charAt(0).toUpperCase() + text.slice(1);
        return flag ? flag + "\u00a0" + label : label;
      }
      function clockEmoji(e) {
        return e <= 15
          ? "🕐"
          : e <= 25
            ? "🕑"
            : e <= 35
              ? "🕒"
              : e <= 45
                ? "🕓"
                : e <= 55 || e <= 70 || e <= 90
                  ? "🕔"
                  : "🕕";
      }
      // The carb amount is ONE setting, shown as dry rice in the filter panel.
      // Other carb types are the equivalent amount by CARB_RATIOS (potato is
      // mostly water, so the same meal needs ~3.8× the grams of rice). Setting
      // it from any type keeps the others in step.
      function setCarbAmount(type, grams) {
        const base = grams / (CARB_RATIOS[type] || CARB_RATIOS.rice);
        ["potato", "rice", "noodle", "bread"].forEach((k) => {
          weights[k] = _capToServings(Math.round(base * CARB_RATIOS[k]), PORTION_BOUNDS.carbMax);
        });
        CARB_RATIOS[type] && (weights[type] = _capToServings(grams, PORTION_BOUNDS.carbMax));
      }
      function autoCalcCarbs() {
        const e = weights.chicken;
        ((weights.potato = Math.round(e * CARB_RATIOS.potato)),
          (weights.rice = Math.round(e * CARB_RATIOS.rice)),
          (weights.noodle = Math.round(e * CARB_RATIOS.noodle)),
          (weights.bread = Math.round(e * CARB_RATIOS.bread)));
        const fcw = document.getElementById("filterCarbWeight");
        fcw && (fcw.value = weights.rice);
      }
      let eggSizeG = 58,
        eggCount = 2,
        sideEggSizeG = 58,
        sideEggCount = 1,
        activeProtein = "chicken_thigh",
        carbEnabled = { potato: !0, rice: !0, noodle: !0, bread: !0, sweet_potato: !0 };

      // ─── Auto-weight (per-recipe) ────────────────────────────────────────
      // Macros are linear in the protein/carb grams, so we can solve each
      // recipe exactly for grams that satisfy the active macro constraints.
      const AUTO_W = { pgMin: 20, pgMax: 400, cgMin: 0, cgMax: 500 };
      let _autoW = {}; // { recipeId: { pg, cg, feasible } } — grams PER SERVING

      function autoWeightActive() {
        return !!(
          document.getElementById("chkAutoProtein")?.checked ||
          document.getElementById("chkAutoCarb")?.checked
        );
      }
      function _autoProteinOn() { return !!document.getElementById("chkAutoProtein")?.checked; }
      function _autoCarbOn() { return !!document.getElementById("chkAutoCarb")?.checked; }
      function _autoRound5() { return !!document.getElementById("chkRound5")?.checked; }


      // ─── Macro engine (single source of truth) ───────────────────────────
      // Every number the app shows for a recipe — card, filter, modal header,
      // modal total bar, Randomizer — comes from recipeMacros()/macrosForPortion().
      // Don't re-derive macros anywhere else.
      //
      // Model (all values PER PORTION):
      //   protein grams × the recipe's OWN protein  (never a global protein)
      // + carb grams × the recipe's carb base
      // + fixed part: sauce/extras from the ingredient list + optional side egg
      //
      // Where the grams come from, in order of precedence (see portionFor):
      //   1. a Randomizer portion override (only inside the modal)
      //   2. egg recipes: whole eggs (eggCount × eggSizeG), never a gram solve
      //   3. per-recipe auto-weight, when the auto toggles are on
      //   4. the global batch weights divided by servings
      const PROTEIN_FAMILIES = {
        chicken: ["chicken_thigh", "chicken_breast"],
        beef: ["beef_regular", "beef_lean"],
        eggs: ["eggs"],
        fish: ["salmon"],
        tofu: ["tofu"],
      };
      // The chosen variant per family (Thigh/Breast, 20%/5%). Kept per family so
      // picking "Lean" on a beef recipe can't change what chicken recipes use.
      const proteinVariantPref = { chicken: "chicken_thigh", beef: "beef_regular" };
      const ZERO_MACROS = { kcal: 0, p: 0, c: 0, f: 0 };

      // NUTRITION_DB key of the protein this recipe is cooked with, or null.
      function proteinKeyFor(recipe) {
        const famName = recipe && recipe.protein && recipe.protein !== "none" ? getRecipeProtein(recipe) : null;
        const fam = famName && PROTEIN_FAMILIES[famName];
        if (!fam) return null;
        const pref = proteinVariantPref[famName];
        return pref && fam.includes(pref) ? pref : fam[0];
      }
      function carbNutFor(recipe) {
        return recipe && recipe.carb && recipe.carb !== "none" && NUTRITION_DB[recipe.carb] ? NUTRITION_DB[recipe.carb] : null;
      }

      // Set while a recipe opened from the Randomizer is shown in the modal, so
      // the modal cooks the portion the Randomizer planned: { id, pg, cg, eggCount }.
      let _portionOverride = null;
      function _overrideFor(recipe) {
        return _portionOverride && recipe && _portionOverride.id === recipe.id ? _portionOverride : null;
      }

      // Per-portion grams for a recipe. `inModal` lets the Randomizer override apply.
      function portionFor(recipe, inModal) {
        const sv = Math.max(weights.servings, 1),
          key = proteinKeyFor(recipe),
          hasCarb = !!carbNutFor(recipe),
          ov = inModal ? _overrideFor(recipe) : null,
          aw = !ov && autoWeightActive() && _autoW[recipe.id] ? _autoW[recipe.id] : null;
        let pg = 0, cg = 0, eggs = null;
        if (key === "eggs") {
          eggs = ov && ov.eggCount != null ? ov.eggCount : eggCount;
          pg = eggs * eggSizeG;
        } else if (key) {
          pg = ov ? ov.pg : aw ? aw.pg : weights.chicken / sv;
        }
        if (hasCarb) cg = ov ? ov.cg : aw ? aw.cg : (weights[recipe.carb] || 0) / sv;
        return { key, pg, cg, eggs, source: ov ? "randomizer" : aw ? "auto" : "global" };
      }

      // The part of a portion that does not depend on protein/carb grams:
      // sauce + extras, plus the fried side egg (counted per portion).
      function fixedMacros(recipe) {
        const sm = getSauceMacros(recipe);
        let kcal = sm.kcal || 0, p = sm.p || 0, c = sm.c || 0, f = sm.f || 0;
        if (recipe.sideEgg) {
          const nut = NUTRITION_DB.eggs, g = sideEggCount * sideEggSizeG;
          kcal += (nut.kcal * g) / 100; p += (nut.p * g) / 100; c += (nut.c * g) / 100; f += (nut.f * g) / 100;
        }
        return { kcal, p, c, f };
      }

      // Unrounded macros of one portion for explicit grams.
      function macrosForPortion(recipe, portion) {
        const pn = portion.key ? NUTRITION_DB[portion.key] || ZERO_MACROS : ZERO_MACROS,
          cn = carbNutFor(recipe) || ZERO_MACROS,
          fx = fixedMacros(recipe),
          a = (portion.pg || 0) / 100,
          b = (portion.cg || 0) / 100;
        return {
          kcal: a * pn.kcal + b * cn.kcal + fx.kcal,
          p: a * pn.p + b * cn.p + fx.p,
          c: a * pn.c + b * cn.c + fx.c,
          f: a * pn.f + b * cn.f + fx.f,
        };
      }

      // What the UI shows: whole numbers for the recipe's current portion.
      function recipeMacros(recipe, inModal) {
        const m = macrosForPortion(recipe, portionFor(recipe, inModal));
        return { kcal: Math.round(m.kcal), p: Math.round(m.p), c: Math.round(m.c), f: Math.round(m.f) };
      }
      // ─────────────────────────────────────────────────────────────────────

      // Fixed macros per serving, in the shape the solver expects.
      function _autoFixed(recipe) {
        const fx = fixedMacros(recipe);
        return { k: fx.kcal, p: fx.p, c: fx.c, f: fx.f };
      }

      // Solve one recipe for per-serving protein (pg) and carb (cg) grams.
      // Policy: meet the protein floor with the fewest calories, then spend the
      // remaining calorie/carb budget on carbs. Returns feasible=false when the
      // active constraints cannot all be met.
      function solveAutoWeight(recipe) {
        const _pKey = proteinKeyFor(recipe),
          _isEgg = _pKey === "eggs",
          t = (_pKey && NUTRITION_DB[_pKey]) || ZERO_MACROS,
          carbValid = recipe.carb && recipe.carb !== "none" && NUTRITION_DB[recipe.carb],
          i = carbValid ? NUTRITION_DB[recipe.carb] : { kcal: 0, p: 0, c: 0, f: 0 },
          hasProtein = recipe.protein && recipe.protein !== "none" && t.p > 0,
          fx = _autoFixed(recipe),
          sv = Math.max(weights.servings, 1),
          apOn = _autoProteinOn(),
          acOn = _autoCarbOn(),
          protMin = macroFilter.protMin || 0,
          kcalMax = macroFilter.kcalMax,   // 9999 => inactive
          carbMax = macroFilter.carbMax,   // 999  => inactive
          fatMax = macroFilter.fatMax;     // 999  => inactive

        // Protein grams (per serving): minimum needed to clear the floor.
        let pg;
        if (_isEgg) {
          pg = eggCount * eggSizeG; // eggs come in whole pieces — not solved
        } else if (apOn && hasProtein && protMin > 0) {
          pg = ((protMin - fx.p) * 100) / t.p; // carb's tiny protein ignored
        } else {
          pg = hasProtein ? weights.chicken / sv : 0;
        }
        if (!_isEgg) pg = Math.max(hasProtein ? AUTO_W.pgMin : 0, Math.min(AUTO_W.pgMax, pg));

        // Carb grams (per serving): fill up to the tightest active ceiling.
        let cg = 0;
        if (carbValid && i.c > 0) {
          const carbBudget = ((carbMax - fx.c - (pg * t.c) / 100) * 100) / i.c;
          const kcalBudget = ((kcalMax - fx.k - (pg * t.kcal) / 100) * 100) / i.kcal;
          if (acOn && (carbMax < 999 || kcalMax < 9999)) {
            const bounds = [AUTO_W.cgMax];
            if (carbMax < 999) bounds.push(carbBudget);
            if (kcalMax < 9999) bounds.push(kcalBudget);
            cg = Math.min.apply(null, bounds);
          } else {
            cg = weights[recipe.carb] / sv;
            if (carbMax < 999) cg = Math.min(cg, carbBudget);
            if (kcalMax < 9999) cg = Math.min(cg, kcalBudget);
          }
          cg = Math.max(0, Math.min(AUTO_W.cgMax, cg));
        }

        // Optional kitchen-friendly rounding (protein up, carbs down so the
        // constraints stay satisfied where possible).
        if (_autoRound5()) {
          if (hasProtein && !_isEgg) pg = Math.min(AUTO_W.pgMax, Math.ceil(pg / 5) * 5);
          if (carbValid) cg = Math.max(0, Math.floor(cg / 5) * 5);
        }

        // Feasibility: recompute and check the active constraints.
        const P = (pg * t.p) / 100 + (cg * i.p) / 100 + fx.p,
          K = (pg * t.kcal) / 100 + (cg * i.kcal) / 100 + fx.k,
          C = (pg * t.c) / 100 + (cg * i.c) / 100 + fx.c,
          F = (pg * t.f) / 100 + (cg * i.f) / 100 + fx.f;
        let feasible = true;
        if (apOn && protMin > 0 && P < protMin - 0.5) feasible = false;
        if (kcalMax < 9999 && K > kcalMax + 0.5) feasible = false;
        if (carbMax < 999 && C > carbMax + 0.5) feasible = false;
        if (fatMax < 999 && F > fatMax + 0.5) feasible = false;

        return { pg: Math.round(pg), cg: Math.round(cg), feasible };
      }

      // Recompute the per-recipe weight map. Cheap (linear arithmetic per
      // recipe); called whenever constraints or the auto toggles change.
      function computeAllAutoWeights() {
        _autoW = {};
        if (!autoWeightActive()) return;
        R.forEach((r) => { _autoW[r.id] = solveAutoWeight(r); });
      }

      function toggleRound5() {
        updateCardMacros();
        filterRecipes();
      }
      // Manually editing a weight means "I'm taking control" — turn auto off so
      // the typed value sticks instead of being overwritten by the solver.
      function _disableAutoWeightIfOn() {
        let changed = false;
        ["chkAutoProtein", "chkAutoCarb"].forEach((id) => {
          const c = document.getElementById(id);
          if (c && c.checked) { c.checked = false; changed = true; }
        });
        if (changed) {
          if (typeof _syncFilterBtn === "function") {
            _syncFilterBtn("btnAutoProtein", false);
            _syncFilterBtn("btnAutoCarb", false);
          }
          computeAllAutoWeights();
        }
        return changed;
      }
      // The protein NUTRITION_DB key to show a recipe with by default — its own protein,
      // keeping the current variant if it already belongs to that family.
      function _nativeVariant(recipe) {
        return proteinKeyFor(recipe) || activeProtein; // "none"/unknown: leave global as-is
      }
      // ─────────────────────────────────────────────────────────────────────

      const PROTEIN_DEFS = [
        {
          key: "chicken",
          icon: "🍗",
          name: "Chicken",
          variants: [
            { key: "chicken_thigh", label: "Thigh", sub: "150 kcal · 17g P · 9g F per 100g" },
            { key: "chicken_breast", label: "Breast", sub: "110 kcal · 23g P · 1.5g F per 100g" },
          ],
        },
        {
          key: "beef",
          icon: "🥩",
          name: "Beef",
          variants: [
            { key: "beef_regular", label: "Regular (20% fat)", sub: "215 kcal · 17g P · 16g F per 100g" },
            { key: "beef_lean", label: "Lean (5% fat)", sub: "145 kcal · 20g P · 7g F per 100g" },
          ],
        },
        { key: "eggs", icon: "🥚", name: "Eggs", variants: null },
        { key: "salmon", icon: "🐟", name: "Salmon", variants: null },
        { key: "tofu", icon: "🫘", name: "Tofu", variants: null },
      ];
      let proteinEnabled = { chicken: !0, beef: !0, eggs: !0, fish: !0, tofu: !0 },
        videoFilterOnly = !1,
        flavorFilter = "all";
      const FISH_PROTEIN_IDS = new Set(["salmon", "shrimp", "cod", "tuna_canned", "tuna_water"]);
      function getRecipeProtein(e) {
        const a = e.protein || "chicken";
        return FISH_PROTEIN_IDS.has(a) ? "fish" : a;
      }
      function toggleFilterSection(el) {
        el.closest(".filter-section").classList.toggle("open");
      }
      let _filterPanelAnimating = false;
      function toggleFilterPanel() {
        const panel = document.getElementById("filterPanel");
        const btn = document.getElementById("btnFilterToggle");
        const arrow = document.getElementById("filterPillArrow");
        if (!panel || _filterPanelAnimating) return;
        const isOpen = panel.style.display !== "none";
        if (btn) btn.classList.toggle("open", !isOpen);
        if (arrow) arrow.style.transform = isOpen ? "" : "rotate(180deg)";
        _filterPanelAnimating = true;
        if (isOpen) {
          anime({
            targets: panel,
            height: [panel.scrollHeight, 0],
            opacity: [1, 0],
            duration: 260,
            easing: "easeInQuad",
            begin: () => { panel.style.overflow = "hidden"; },
            complete: () => {
              panel.style.display = "none";
              panel.style.height = "";
              panel.style.overflow = "";
              _filterPanelAnimating = false;
            }
          });
        } else {
          panel.style.display = "block";
          panel.style.overflow = "hidden";
          panel.style.height = "0";
          const targetH = panel.scrollHeight;
          anime({
            targets: panel,
            height: [0, targetH],
            opacity: [0, 1],
            duration: 300,
            easing: "easeOutQuad",
            complete: () => {
              panel.style.height = "auto";
              panel.style.overflow = "";
              _filterPanelAnimating = false;
            }
          });
        }
      }
      function buildDisplayNumbers() {}
      function updatePillStates() {
        let count = 0;
        if (currentCuisineFilter !== "all") count++;
        if (Object.values(carbEnabled).some((e) => !e)) count++;
        if (Object.values(proteinEnabled).some((e) => !e)) count++;
        if (
          macroFilter.kcalMax < 9999 ||
          macroFilter.protMin > 0 ||
          macroFilter.carbMax < 999 ||
          macroFilter.fatMax < 999 ||
          macroFilter.scoreMin > 1 ||
          macroFilter.timeMax < 999
        ) count++;
        if (activeDietary.size) count++;
        if (videoFilterOnly) count++;
        if (flavorFilter !== "all" || spicyFilter || dipFilter) count++;
        const badge = document.getElementById("filterCountBadge");
        const btn = document.getElementById("btnFilterToggle");
        if (badge) {
          badge.textContent = count;
          badge.style.display = count > 0 ? "inline-block" : "none";
        }
        if (btn) btn.classList.toggle("has-active", count > 0);
      }
      function setModalEggSize(e, a) {
        eggSizeG = e;
        const t = { 48: "S", 58: "M", 68: "L" }[e];
        (document.querySelectorAll(".egg-size-btn").forEach((e) => {
          e.classList.toggle("active", e.id === "egg" + t);
        }));
        const i = R.find((e) => e.id === a);
        (i && (buildIngredientsTab(i), updateModalMacros(i)), updateCardMacros());
      }
      function changeModalEggCount(e, a) {
        // Opened from the Randomizer: step from the planned count, then hand
        // control back to the normal (global) egg count.
        if (_portionOverride && _portionOverride.id === a && _portionOverride.eggCount != null) {
          eggCount = _portionOverride.eggCount;
          _portionOverride.eggCount = null;
        }
        eggCount = Math.max(1, Math.min(20, eggCount + e));
        const t = document.getElementById("modalEggCountVal");
        t && (t.textContent = eggCount);
        const i = document.getElementById("eggCountVal");
        i && (i.textContent = eggCount);
        const n = R.find((e) => e.id === a);
        (n && (buildIngredientsTab(n), updateModalMacros(n)), updateCardMacros());
      }
      // Side-egg controls for sideEgg: true recipes
      function setSideEggSize(g, id) {
        sideEggSizeG = g;
        // Update active state on size buttons by matching their label to sideEggSizeG
        const sizeMap = {"S": 48, "M": 58, "L": 68};
        document.querySelectorAll("#sideEggRow .modal-variant-btn").forEach(function(btn) {
          btn.classList.toggle("active", sizeMap[btn.textContent.trim()] === sideEggSizeG);
        });
        // Recalculate macros inline (same as changeSideEggCount)
        const nut = NUTRITION_DB.eggs || { kcal: 143, p: 12.6, c: 0.7, f: 9.5 };
        const gPP = Math.round(sideEggCount * sideEggSizeG); // one side egg per portion, not shared across servings
        const grid = document.querySelector("#sideEggRow .ing-macro-grid");
        if (grid) {
          grid.innerHTML =
            "<div class=\"ing-macro-cell mk\"><span class=\"imc-val\">" + Math.round((nut.kcal * gPP) / 100) + "</span><span class=\"imc-lbl\">kcal</span></div>" +
            "<div class=\"ing-macro-cell mp\"><span class=\"imc-val\">" + (Math.round(nut.p * gPP) / 100).toFixed(1) + "g</span><span class=\"imc-lbl\">protein</span></div>" +
            "<div class=\"ing-macro-cell mc\"><span class=\"imc-val\">" + (Math.round(nut.c * gPP) / 100).toFixed(1) + "g</span><span class=\"imc-lbl\">carbs</span></div>" +
            "<div class=\"ing-macro-cell mf\"><span class=\"imc-val\">" + (Math.round(nut.f * gPP) / 100).toFixed(1) + "g</span><span class=\"imc-lbl\">fat</span></div>";
        }
        const hint = document.querySelector("#sideEggRow .ing-macro-hint");
        if (hint) hint.textContent = "Per portion \u00b7 " + gPP + "g \u00b7 per 100g: " + nut.kcal + "kcal " + nut.p + "g P " + nut.c + "g C " + nut.f + "g F";
        const portionHint = document.querySelector("#sideEggRow .modal-weight-hint");
        if (portionHint) portionHint.textContent = gPP + "g per portion";
        const r = R.find((r) => r.id === id);
        r && updateModalMacros(r);
      }
      function changeSideEggCount(delta, id) {
        sideEggCount = Math.max(0, Math.min(10, sideEggCount + delta));
        // Update the count display directly — no full tab rebuild to avoid overwriting the value
        const el = document.getElementById("sideEggCountVal");
        if (el) el.textContent = sideEggCount;
        // Update the size buttons active state — don't touch them, sideEggSizeG hasn't changed
        // Recalculate and update the macro panel inside sideEggRow
        const nut = NUTRITION_DB.eggs || { kcal: 143, p: 12.6, c: 0.7, f: 9.5 };
        const gPP = Math.round(sideEggCount * sideEggSizeG); // one side egg per portion, not shared across servings
        const grid = document.querySelector("#sideEggRow .ing-macro-grid");
        if (grid) {
          grid.innerHTML =
            "<div class=\"ing-macro-cell mk\"><span class=\"imc-val\">" + Math.round((nut.kcal * gPP) / 100) + "</span><span class=\"imc-lbl\">kcal</span></div>" +
            "<div class=\"ing-macro-cell mp\"><span class=\"imc-val\">" + (Math.round(nut.p * gPP) / 100).toFixed(1) + "g</span><span class=\"imc-lbl\">protein</span></div>" +
            "<div class=\"ing-macro-cell mc\"><span class=\"imc-val\">" + (Math.round(nut.c * gPP) / 100).toFixed(1) + "g</span><span class=\"imc-lbl\">carbs</span></div>" +
            "<div class=\"ing-macro-cell mf\"><span class=\"imc-val\">" + (Math.round(nut.f * gPP) / 100).toFixed(1) + "g</span><span class=\"imc-lbl\">fat</span></div>";
        }
        const hint = document.querySelector("#sideEggRow .ing-macro-hint");
        if (hint) hint.textContent = "Per portion \u00b7 " + gPP + "g \u00b7 per 100g: " + nut.kcal + "kcal " + nut.p + "g P " + nut.c + "g C " + nut.f + "g F";
        const portionHint = document.querySelector("#sideEggRow .modal-weight-hint");
        if (portionHint) portionHint.textContent = gPP + "g per portion";
        // Only update the modal macro totals
        const r = R.find((r) => r.id === id);
        r && updateModalMacros(r);
      }
      function selectModalVariant(e, a) {
        activeProtein = e;
        Object.keys(PROTEIN_FAMILIES).forEach((fam) => {
          PROTEIN_FAMILIES[fam].length > 1 && PROTEIN_FAMILIES[fam].includes(e) && (proteinVariantPref[fam] = e);
        });
        computeAllAutoWeights(); // refresh auto-weights BEFORE the modal re-renders (was one step behind)
        const o = R.find((e) => e.id === a);
        (o && (buildIngredientsTab(o), refreshRecipeTabIfOpen(o), updateModalMacros(o)),
          updateCardMacros(),
          filterRecipes());
      }
      let _protWeightTimer = null, _carbWeightTimer = null;
      function updateModalWeight(e, a, t) {
        (_portionOverride && _portionOverride.id === t) || _disableAutoWeightIfOn();
        const inputId = e === "prot" ? "mwProt" : "mwCarb";
        // Strip leading zeros immediately on mobile
        const el = document.getElementById(inputId);
        if (el && el.value && el.value.length > 1 && el.value[0] === "0") {
          el.value = String(parseInt(el.value) || 0);
          a = el.value;
        }
        if (e === "prot") {
          clearTimeout(_protWeightTimer);
          _protWeightTimer = setTimeout(() => {
            const i = _capToServings(Math.max(0, Math.min(3e3, parseInt(a) || 0)), PORTION_BOUNDS.protMax),
              n = R.find((r) => r.id === t);
            if (n && _overrideFor(n)) {
              _portionOverride.pg = i / Math.max(modalServings, 1);
            } else if (n) {
              weights.chicken = i;
              const elC = document.getElementById("chickenInput");
              elC && (elC.value = i);
              const fpw = document.getElementById("filterProteinWeight");
              fpw && (fpw.value = i);
            }
            if (n) {
              buildIngredientsTab(n);
              refreshRecipeTabIfOpen(n);
              updateModalMacros(n);
              updateCardMacros();
              filterRecipes();
              const refEl = document.getElementById("mwProt");
              if (refEl) { refEl.focus(); try { const l = refEl.value.length; refEl.setSelectionRange(l, l); } catch(ex) {} }
            }
          }, 600);
        } else {
          clearTimeout(_carbWeightTimer);
          _carbWeightTimer = setTimeout(() => {
            const i = _capToServings(Math.max(0, Math.min(3e3, parseInt(a) || 0)), PORTION_BOUNDS.carbMax),
              n = R.find((r) => r.id === t);
            if (n) {
              _overrideFor(n) ? (_portionOverride.cg = i / Math.max(modalServings, 1)) : setCarbAmount(n.carb, i);
              const fcw = document.getElementById("filterCarbWeight");
              fcw && (fcw.value = weights.rice);
              buildIngredientsTab(n);
              refreshRecipeTabIfOpen(n);
              updateModalMacros(n);
              updateCardMacros();
              filterRecipes();
              const refEl = document.getElementById("mwCarb");
              if (refEl) { refEl.focus(); try { const l = refEl.value.length; refEl.setSelectionRange(l, l); } catch(ex) {} }
            }
          }, 600);
        }
      }
      function _filterProteinInput(v) {
        const gRaw = v === "" ? 0 : Math.max(0, Math.min(3000, parseInt(v) || 0));
        const g = _capToServings(gRaw, PORTION_BOUNDS.protMax);
        weights.chicken = g;
        autoCalcCarbs();
        _reclampAllWeights(); // autoCalcCarbs derives carbs from a ratio > 1x protein — re-check the carb ceiling too
        Object.keys(_sauceMacroCache).forEach((k) => delete _sauceMacroCache[k]);
        const fpw = document.getElementById("filterProteinWeight");
        fpw && (fpw.value = weights.chicken);
        const ci = document.getElementById("chickenInput");
        ci && (ci.value = g);
        document.querySelectorAll(".card-weight-input").forEach((e) => { e.value = g; });
        const mwp = document.getElementById("mwProt");
        mwp && (mwp.value = g);
        updateCardMacros();
        currentModalRecipe && refreshRecipeTabIfOpen(R.find((e) => e.id === currentModalRecipe.id));
        filterRecipes();
      }
      function _filterCarbInput(v) {
        const gRaw = v === "" ? 0 : Math.max(0, Math.min(3000, parseInt(v) || 0));
        const g = _capToServings(gRaw, PORTION_BOUNDS.carbMax);
        setCarbAmount("rice", g);
        Object.keys(_sauceMacroCache).forEach((k) => delete _sauceMacroCache[k]);
        const fcw = document.getElementById("filterCarbWeight");
        fcw && (fcw.value = g);
        const mwc = document.getElementById("mwCarb");
        mwc && (mwc.value = g);
        updateCardMacros();
        currentModalRecipe && refreshRecipeTabIfOpen(R.find((e) => e.id === currentModalRecipe.id));
        filterRecipes();
      }
      // sync a filter button's active class without triggering its handler
      function _syncFilterBtn(btnId, val) {
        const btn = document.getElementById(btnId);
        if (btn) btn.classList.toggle("active", val);
      }
      function toggleCarbBtn(type, btn) {
        btn.classList.toggle("active");
        const enabled = btn.classList.contains("active");
        const chk = document.getElementById("chk" + type.charAt(0).toUpperCase() + type.slice(1));
        if (chk) chk.checked = enabled;
        carbEnabled[type] = enabled;
        const input = document.getElementById(type + "Input");
        if (input) {
          if (enabled) {
            const w = Math.round(weights.chicken * (CARB_RATIOS[type] || 0.5));
            input.value = w; weights[type] = w;
          } else {
            input.dataset.prev = input.value; input.value = 0; weights[type] = 0;
          }
        }
        filterRecipes();
      }
      function toggleProteinBtn(type, btn) {
        btn.classList.toggle("active");
        const enabled = btn.classList.contains("active");
        const chk = document.getElementById("chkP" + type.charAt(0).toUpperCase() + type.slice(1));
        if (chk) chk.checked = enabled;
        proteinEnabled[type] = enabled;
        updatePillStates(); filterRecipes();
      }
      function toggleAutoProteinBtn(btn) {
        btn.classList.toggle("active");
        const on = btn.classList.contains("active");
        const chk = document.getElementById("chkAutoProtein");
        if (chk) chk.checked = on;
        if (on) applyAutoProteinWeight();
        updateCardMacros(); filterRecipes();
      }
      function toggleAutoCarbBtn(btn) {
        btn.classList.toggle("active");
        const on = btn.classList.contains("active");
        const chk = document.getElementById("chkAutoCarb");
        if (chk) chk.checked = on;
        if (on) applyAutoCarbWeight();
        updateCardMacros(); filterRecipes();
      }
      function toggleVideoBtn(btn) {
        btn.classList.toggle("active");
        const on = btn.classList.contains("active");
        const chk = document.getElementById("chkVideoOnly");
        if (chk) chk.checked = on;
        videoFilterOnly = on;
        filterRecipes();
      }
      // ─── Dietary filters ─────────────────────────────────────────────────
      // Each filter is a self-contained rule; a recipe is hidden when ANY active
      // filter matches it (see dietBlocks). A rule can match by:
      //   blocks    ingredient ids found in the recipe's ingredient list
      //   proteins  the recipe's protein family
      //   carbs     the recipe's carb base
      //   tags      a recipe tag
      //   sideEgg   the recipe is served with a fried egg
      // Dietary filters do NOT touch the protein/carb buttons or the pantry —
      // switching one off restores exactly what it hid.
      const _DIET_MEAT = ["chicken", "chicken_thigh", "chicken_breast", "chicken_sausage", "chicken_stock", "beef_regular", "beef_lean", "lamb_mince", "pork_belly", "pork_loin", "pork_tenderloin", "smoked_bacon", "turkey_mince", "duck_breast"];
      const _DIET_FISH = ["salmon", "shrimp", "cod", "tuna_canned", "tuna_oil", "tuna_water", "anchovy_paste", "fish_sauce", "oyster_sauce", "dashi"];
      const _DIET_PORK = ["pork_belly", "pork_loin", "pork_tenderloin", "smoked_bacon"];
      const _DIET_ALCOHOL = ["sake", "white_wine", "mirin"];
      const _DIET_EGG = ["eggs", "eggs_dairy", "egg", "egg_noodle", "mayo", "mayo_light"];
      const _DIET_DAIRY = ["butter", "milk", "heavy_cream", "cream_cheese", "sour_cream", "creme_fraiche", "labneh", "cheese_parm", "cheese_mozz", "cheese_feta", "cheese_cheddar", "cheese_gruyere", "cheese_provolone", "yogurt", "greek_yogurt", "yoghurt_nonfat", "quark_low_fat", "skyr", "cottage_cheese", "ricotta", "whey_protein", "whey_protein_concentrate", "whey_protein_isolate"];
      const DIETARY_FILTERS = [
        { id: "no_alcohol", icon: "🍶", label: "No Alcohol", sub: "No sake/wine/mirin", blocks: _DIET_ALCOHOL },
        { id: "halal", icon: "☪️", label: "Halal", sub: "No alcohol, no pork", blocks: [..._DIET_ALCOHOL, ..._DIET_PORK] },
        { id: "gluten_free", icon: "🌾", label: "Gluten-Free", sub: "No wheat/barley/rye", blocks: ["panko", "flour", "worcestershire", "hoisin", "breadcrumbs", "couscous", "bulgur", "barley", "naan", "pasta"], carbs: ["bread", "noodle"] },
        { id: "dairy_free", icon: "🥛", label: "Dairy-Free", sub: "No milk/cheese/butter", blocks: _DIET_DAIRY },
        { id: "nut_free", icon: "🥜", label: "Nut-Free", sub: "No peanuts/tree nuts", blocks: ["peanuts", "pine_nuts", "peanut_butter", "almonds", "cashews", "tahini"] },
        { id: "no_soy", icon: "🫘", label: "No Soy", sub: "No soy sauce/tofu", blocks: ["soy_sauce", "sweet_soy", "hoisin", "miso", "doenjang", "teriyaki", "oyster_sauce", "tofu", "tempeh", "edamame", "soy_milk"], proteins: ["tofu"] },
        { id: "no_fish", icon: "🐟", label: "No Fish/Seafood", sub: "No fish/seafood", blocks: _DIET_FISH, proteins: ["fish"] },
        { id: "no_eggs", icon: "🥚", label: "No Eggs", sub: "Egg-free recipes only", blocks: _DIET_EGG, proteins: ["eggs"], sideEgg: true },
        { id: "no_beef", icon: "🐄", label: "No Beef", sub: "Beef-free only", blocks: ["beef_regular", "beef_lean"], proteins: ["beef"] },
        { id: "no_pork", icon: "🐷", label: "No Pork", sub: "Pork-free only", blocks: _DIET_PORK },
        { id: "low_spice", icon: "🌶️", label: "Low Spice", sub: "Mild recipes only", blocks: [], tags: ["spicy"] },
        { id: "no_garlic", icon: "🧄", label: "No Garlic/Onion", sub: "FODMAP-friendly", blocks: ["garlic", "onion", "garlic_powder", "onion_powder", "shallot", "fried_shallots", "leek", "scallion", "chives"] },
        { id: "vegetarian", icon: "🌱", label: "Vegetarian", sub: "No meat", blocks: [..._DIET_MEAT, ..._DIET_FISH], proteins: ["chicken", "beef", "fish"] },
        { id: "vegan", icon: "🌿", label: "Vegan", sub: "No animal products", blocks: [..._DIET_MEAT, ..._DIET_FISH, ..._DIET_EGG, ..._DIET_DAIRY, "honey"], proteins: ["chicken", "beef", "fish", "eggs"], sideEgg: true },
      ];
      // recipe id → Set of ingredient ids, filled by buildIngredientRecipeMap().
      const RECIPE_INGREDIENT_IDS = {};
      // True when an active dietary filter rules this recipe out.
      function dietBlocks(recipe) {
        if (!activeDietary.size) return false;
        const ings = RECIPE_INGREDIENT_IDS[recipe.id];
        return DIETARY_FILTERS.some(
          (f) =>
            activeDietary.has(f.id) &&
            ((f.proteins && f.proteins.includes(getRecipeProtein(recipe))) ||
              (f.carbs && f.carbs.includes(recipe.carb)) ||
              (f.tags && f.tags.some((t) => recipe.tags.includes(t))) ||
              (f.sideEgg && recipe.sideEgg) ||
              (ings && f.blocks.some((id) => ings.has(id)))),
        );
      }
      // True when the (optional) My Pantry feature has an ingredient of this recipe unchecked.
      function pantryBlocks(recipe) {
        if (!disabledIngredients.size) return false;
        const ings = RECIPE_INGREDIENT_IDS[recipe.id];
        return !!ings && [...disabledIngredients].some((id) => ings.has(id));
      }
      let activeDietary = new Set(JSON.parse(localStorage.getItem("dietaryFilters") || "[]"));
      function saveDietary() {
        try {
          localStorage.setItem("dietaryFilters", JSON.stringify([...activeDietary]));
        } catch (e) {}
      }
      function buildDietaryGrid() {
        const e = document.getElementById("dietaryGrid");
        e &&
          ((e.innerHTML = DIETARY_FILTERS.map(
            (e) =>
              `<button class="dietary-btn ${activeDietary.has(e.id) ? "active" : ""}" onclick="toggleDietary('${e.id}')"><span class="diet-icon">${e.icon}</span><span class="diet-label">${e.label}</span></button>`,
          ).join("")),
          updateDietaryBar());
      }
      function updateDietaryBar() {
        const e = document.getElementById("dietaryActiveBar");
        if (!e) return;
        if (0 === activeDietary.size) return void (e.textContent = "");
        const a = [...activeDietary].map((e) => DIETARY_FILTERS.find((a) => a.id === e)?.label).filter(Boolean);
        e.textContent = a.join(" · ");
      }
      function toggleDietary(e) {
        if (!DIETARY_FILTERS.some((f) => f.id === e)) return;
        (activeDietary.has(e) ? activeDietary.delete(e) : activeDietary.add(e),
          saveDietary(),
          buildDietaryGrid(),
          updatePillStates(),
          filterRecipes());
      }
      function isPantryModified() {
        return (PANTRY_ENABLED && disabledIngredients.size > 0) || activeDietary.size > 0;
      }
      function resetAllFilters() {
        isPantryModified() ? document.getElementById("resetConfirmOverlay").classList.add("open") : doResetAll();
      }
      function doResetAll() {
        (document.getElementById("resetConfirmOverlay").classList.remove("open"),
          (currentCuisineFilter = "all"),
          // Only the cuisine buttons — other tabs (Nutrition, Randomizer) reuse .filter-btn.
          document.querySelectorAll('#filterPanel [onclick^="setFilter("]').forEach((e) => e.classList.remove("active")),
          document.querySelector(`#filterPanel [onclick^="setFilter('all'"]`)?.classList.add("active"),
          ["Potato", "Rice", "Noodle", "Bread"].forEach((e) => {
            const a = document.getElementById("chk" + e);
            (a && (a.checked = !0), (carbEnabled[e.toLowerCase()] = !0));
            _syncFilterBtn("btn" + e, true);
          }),
          ["Chicken", "Beef", "Eggs", "Fish", "Tofu"].forEach((e) => {
            const a = document.getElementById("chkP" + e);
            (a && (a.checked = !0), (proteinEnabled[e.toLowerCase()] = !0));
            _syncFilterBtn("btnP" + e, true);
          }));
        const e = document.getElementById("chkVideoOnly");
        (e && (e.checked = !1),
        _syncFilterBtn("btnVideoOnly", false),
          (videoFilterOnly = !1),
          resetMacroFilter(),
          (weights.servings = 1),
          (weights.chicken = DEFAULT_PROTEIN_G),
          autoCalcCarbs(),
          _syncGlobalWeightInputs());
        const a = document.getElementById("globalServingVal");
        a && (a.textContent = "1");
        const t = document.getElementById("servingsInput");
        t && (t.textContent = "1");
        const i = document.getElementById("pillServingsLabel");
        (i && (i.textContent = "1 Serving"),
          (flavorFilter = "all"),
          (spicyFilter = false),
          (dipFilter = false),
          document.querySelector(".filter-btn.spicy") && document.querySelector(".filter-btn.spicy").classList.remove("active"),
          document.querySelector(".filter-btn.dip") && document.querySelector(".filter-btn.dip").classList.remove("active"),
          document
            .querySelectorAll(".filter-btn.sweet, .filter-btn.savory")
            .forEach((e) => e.classList.remove("active")));
        const n = document.getElementById("searchInput");
        (n && (n.value = ""), disabledIngredients.clear(), activeDietary.clear(), savePantry(), saveDietary());
        try {
          localStorage.removeItem("dietaryFilters");
        } catch (e) {}
        (document.getElementById("pantry-sauces")?.children.length > 0 && renderPantry(),
          buildDietaryGrid(),
          updatePillStates(),
          updateCardMacros(),
          filterRecipes());
      }
      function togglePantrySection(e) {
        const a = document.getElementById("psec-" + e);
        a && a.classList.toggle("open");
      }
      function updatePantryCounts() {
        ["sauces", "spices", "fresh", "dairy", "staples", "proteins", "carbs"].forEach((e) => {
          const a = PANTRY_ITEMS[e] || [],
            t = a.filter((e) => disabledIngredients.has(e.id)).length,
            i = document.getElementById("pcount-" + e);
          i && (i.textContent = t > 0 ? `${a.length - t}/${a.length}` : `${a.length}/${a.length}`);
        });
      }
      function buildAllCards() {
        const e = document.getElementById("recipeGrid"),
          a = { potato: "🥔 Potato", rice: "🍚 Rice", noodle: "🍜 Noodle", bread: "🫓 Bread" },
          t = document.createDocumentFragment();
        (R.forEach((e, cardIdx) => {
          const i = document.createElement("div");
          ((i.className = "card"), (i.dataset.id = e.id), (i.dataset.id = e.id), (i.onclick = () => openModal(e.id)));
          const n = e.tags.filter(t => t !== "spicy" && t !== "dip" && t !== e.protein).map((e) => `<span class="tag tag-${e}">${tagLabel(e)}</span>`).join(""),
            s = e.protein === "none" ? "none" : (e.protein || "chicken"),
            o =
              { chicken: "🍗 Chicken", beef: "🥩 Beef", eggs: "🥚 Eggs", fish: "🐟 Fish", tofu: "🫘 Tofu" }[s] ||
              "🍗 Chicken",
            r = RECIPE_DETAILS[e.id];
          let c = "";
          const loadingAttrs = cardIdx === 0 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
          (r && r.image
            ? (c = `<div class="card-thumb-wrap"><img class="card-thumb" onerror="(this.closest('.card-thumb-wrap')||this).remove()" src="${r.image}" ${loadingAttrs} alt="${e.title}"></div>`)
            : r &&
              r.video &&
              (c = `<div class="card-thumb-wrap"><img class="card-thumb" onerror="(this.closest('.card-thumb-wrap')||this).remove()" src="https://img.youtube.com/vi/${r.video}/hqdefault.jpg" ${loadingAttrs} alt="${e.title}"><div class="play-overlay"><span>▶️</span></div></div>`),
            (i.innerHTML = `${c}\n      <div class="card-top">\n        <div class="card-num">#${String(e.displayNum).padStart(3, "0")}</div>\n        <div class="card-time"><span class="time-icon">${clockEmoji(e.time)}</span>${e.time} min</div>\n      </div>\n      <div class="card-title">${e.title}</div>\n      <div class="card-desc">${e.desc}</div>\n      <div style="display:flex;align-items:center;flex-wrap:wrap;gap:5px;margin-bottom:10px;">\n        ${e.carb !== "none" ? '<span class="carb-badge ' + e.carb + '" style="margin-bottom:0;vertical-align:middle;">' + a[e.carb] + '</span>' : ""}\n        ${s !== "none" ? `<span class="protein-badge ${s}" style="margin-bottom:0;vertical-align:middle;">${o}</span>` : ""}\n        <span class="flavor-badge ${e.flavor || "savory"}" style="margin-bottom:0;">${"sweet" === e.flavor ? "🍯 Sweet" : "🧂 Savory"}</span>\n        ${ALCOHOL_RECIPE_IDS.has(e.id) ? '<span class="flavor-badge alcohol" style="margin-bottom:0;">🍶 Alcohol</span>' : ""}\n        ${SPICY_RECIPE_IDS.has(e.id) ? '<span class="flavor-badge spicy" style="margin-bottom:0;">🌶️ Spicy</span>' : ""}\n        ${DIP_RECIPE_IDS.has(e.id) ? '<span class="flavor-badge dip" style="margin-bottom:0;">🥣 Dip</span>' : ""}\n      </div>\n      <div class="macro-row">\n        <div class="macro-box kcal-box">    <span class="val" data-macro="kcal">—</span>  <span class="lbl">kcal</span></div>\n        <div class="macro-box protein-box"> <span class="val" data-macro="prot">—</span> <span class="lbl">protein</span></div>\n        <div class="macro-box carbs-box">   <span class="val" data-macro="carbs">—</span><span class="lbl">carbs</span></div>\n        <div class="macro-box fat-box">     <span class="val" data-macro="fat">—</span>  <span class="lbl">fat</span></div>\n      </div>\n      <div style="font-size:9px;color:var(--faint);text-align:right;margin-top:-8px;margin-bottom:6px;" data-macro-context>per portion · <span data-serving-label>1 serving</span></div>\n      <div class="score-row">\n        <span class="score-badge" data-score></span>\n        <div class="score-bar-bg"><div class="score-bar-fill" data-fill></div></div>\n        <span class="score-label" data-scorelabel></span>\n      </div>\n      <div class="card-bottom"><div class="tags">${n}</div></div>\n      <div class="card-click-hint">tap to open recipe →</div>`),
            t.appendChild(i));
        }),
          e.appendChild(t));
      }
      function updateCardMacros() {
        computeAllAutoWeights();
        const _sv = Math.max(weights.servings, 1);
        (R.forEach((e) => {
          const a = document.querySelector(`.card[data-id="${e.id}"]`);
          if (!a) return;
          const _m = recipeMacros(e),
            n = _m.kcal,
            s = _m.p,
            o = _m.c,
            r = _m.f,
            c = calcScore(e, s, r);
          ((a.querySelector('[data-macro="kcal"]').textContent = n),
            (a.querySelector('[data-macro="prot"]').textContent = s + "g"),
            (a.querySelector('[data-macro="carbs"]').textContent = o + "g"),
            (a.querySelector('[data-macro="fat"]').textContent = r + "g"));
          const l = a.querySelector("[data-score]");
          ((l.textContent = c + "/10"), (l.className = "score-badge sc-" + c));
          const d = a.querySelector("[data-fill]");
          ((d.className = "score-bar-fill fill-" + c),
            (d.style.width = 10 * c + "%"),
            (a.querySelector("[data-scorelabel]").textContent = scoreLabel(c)));
          const m = a.querySelector("[data-serving-label]");
          m && (m.textContent = weights.servings + (1 === weights.servings ? " serving" : " servings"));
        }),
          refreshOpenSaucePanels());
      }
      function refreshOpenSaucePanels() {
        document.querySelectorAll(".card-sauce-panel.open").forEach((e) => {
          const a = e.id.replace("sauce-panel-", "");
          if (!a) return;
          const t = RECIPE_DETAILS[a];
          if (!t || !t.ingredients) return;
          const i = R.find((e) => e.id === a);
          if (!i) return;
          const n = Math.max(weights.servings, 1),
            _pS = portionFor(i),
            s = Math.round(_pS.pg),
            o = Math.round(_pS.cg);
          let r = "<ul>";
          (t.ingredients.forEach((e) => {
            ((r += `<li class="card-sauce-section" style="list-style:none;">${e.section}</li>`),
              e.items.forEach((e) => {
                const a = (e.amt || "").includes("{{proteinG}}") || (e.amt || "").includes("{{carbG}}"),
                  t = (e.amt || "")
                    .replace("{{proteinG}}", s)
                    .replace("{{carbG}}", o)
                    .replace("{{servings}}", n);
                let i = a ? t : scaleAmt(t, n),
                  c = e.name;
                (
                  
                  (r += `<li><span class="si-name">${c}</span><span class="si-amt">${i}</span></li>`));
              }));
          }),
            (r += "</ul>"),
            (e.innerHTML = r));
        });
      }
      function filterRecipes() {
        computeAllAutoWeights();
        const _sv = Math.max(weights.servings, 1);
        const e = document.getElementById("searchInput").value.toLowerCase();
        let a = 0;
        const t = document.getElementById("noResults");
        (R.forEach((t) => {
          const i = document.querySelector(`.card[data-id="${t.id}"]`);
          if (!i) return;
          if (t.carb !== "none" && !carbEnabled[t.carb]) return void (i.style.display = "none");
          if ("sweet_potato" === t.carb && !carbEnabled.potato) return void (i.style.display = "none");
          // Recipes without a protein/carb base (dips, baked oats) are not
          // affected by the protein/carb buttons — those only switch off what
          // they name.
          const n = getRecipeProtein(t);
          if (n !== "none" && !proteinEnabled[n]) return void (i.style.display = "none");
          if (videoFilterOnly) {
            const e = RECIPE_DETAILS[t.id];
            if (!e || !e.video) return void (i.style.display = "none");
          }
          const s = "all" === currentCuisineFilter || t.tags.includes(currentCuisineFilter),
            o = (() => {
              if (!e) return true;
              // Number search: "7" or "#007" -> match by displayNum
              if (/^\d+$/.test(e.trim())) return t.displayNum === parseInt(e.trim());
              if (e.trim().startsWith("#") && /^#\d+$/.test(e.trim())) return t.displayNum === parseInt(e.trim().slice(1));
              // Multi-word search: ALL words must match somewhere in title, desc or tags
              const words = e.trim().split(/\s+/).filter(Boolean);
              // Build full searchable text: title + desc + tags + flavor + special badges
              const _badges = [];
              if (t.flavor) _badges.push(t.flavor);
              if (SPICY_RECIPE_IDS.has(t.id)) _badges.push("spicy");
              if (DIP_RECIPE_IDS.has(t.id)) _badges.push("dip");
              if (ALCOHOL_RECIPE_IDS.has(t.id)) _badges.push("alcohol");
              if (t.carb) _badges.push(t.carb);
              if (t.protein) _badges.push(t.protein);
              const searchText = t.title.toLowerCase() + " " + t.desc.toLowerCase() + " " + t.tags.join(" ").toLowerCase() + " " + _badges.join(" ");
              return words.every(w => searchText.includes(w));
            })(),
            _fm = recipeMacros(t),
            l = _fm.kcal,
            d = _fm.p,
            m = _fm.c,
            h = _fm.f,
            p = calcScore(t, d, h),
            u =
              l <= macroFilter.kcalMax &&
              d >= macroFilter.protMin &&
              m <= macroFilter.carbMax &&
              h <= macroFilter.fatMax &&
              p >= macroFilter.scoreMin &&
              t.time <= macroFilter.timeMax,
            g = dietBlocks(t) || pantryBlocks(t),
            k = "all" === flavorFilter || (t.flavor || "savory") === flavorFilter,
            j = !spicyFilter || SPICY_RECIPE_IDS.has(t.id),
            q = !dipFilter || DIP_RECIPE_IDS.has(t.id),
            y = s && o && u && !g && k && j && q;
          ((i.style.display = y ? "" : "none"), y && a++);
        }),
          (document.getElementById("visibleCount").textContent = a));
        const i = R.length,
          n = document.getElementById("totalCount");
        (n && (n.textContent = i), t && (t.style.display = 0 === a ? "block" : "none"));
        updatePillStates(); // the badge always reflects what was just filtered
      }
      function setFilter(e, a) {
        ((currentCuisineFilter = e),
          document
            .querySelectorAll("#panel-cuisine .filter-btn:not(.sweet):not(.savory)")
            .forEach((e) => e.classList.remove("active")),
          a.classList.add("active"));
        const t = document.getElementById("pillCuisine");
        (t &&
          ("all" !== currentCuisineFilter || "all" !== flavorFilter
            ? t.classList.add("has-active")
            : t.classList.remove("has-active")),
          filterRecipes());
      }
      function calcScore(e, a, t) {
        let i = a >= 45 ? 3 : a >= 35 ? 2 : a >= 25 ? 1 : 0;
        let n = { potato: 3, noodle: 2, rice: 1, bread: 1 }[e.carb] || 1,
          s = t >= 15 ? 2 : t >= 8 ? 1 : 0;
        const o = e.title.toLowerCase(),
          r = e.desc.toLowerCase();
        const c =
          i +
          n +
          s +
          ([
            "stew",
            "soup",
            "braise",
            "braised",
            "congee",
            "porridge",
            "stew",
            "hotpot",
            "tagine",
            "goulash",
            "caldo",
            "chowder",
          ].some((e) => o.includes(e) || r.includes(e))
            ? 2
            : ["curry", "bowl", "bake", "gratin", "casserole"].some((e) => o.includes(e) || r.includes(e))
              ? 1
              : 0);
        return Math.max(1, Math.min(10, c));
      }
      function scoreLabel(e) {
        return e <= 2
          ? "Stays hungry"
          : e <= 4
            ? "Not very filling"
            : e <= 6
              ? "Fairly filling"
              : e <= 8
                ? "Keeps you full"
                : "Very filling";
      }
      let macroFilter = { kcalMax: 9999, protMin: 0, carbMax: 999, fatMax: 999, scoreMin: 1, timeMax: 999 };
      function _mfSliderVal(id) {
        const el = document.getElementById(id);
        if (!el) return NaN;
        const v = parseFloat(el.value);
        const nf = parseFloat(el.dataset?.nofilter ?? "");
        return (!isNaN(nf) && v === nf) ? NaN : v;
      }
      function _mfSliderInput(slider, displayId, template) {
        const v = parseFloat(slider.value);
        const noFilter = parseFloat(slider.dataset.nofilter);
        const isOff = v === noFilter;
        const min = parseFloat(slider.min), max = parseFloat(slider.max);
        const fillPct = ((v - min) / (max - min) * 100).toFixed(1) + '%';
        slider.style.setProperty('--fill', isOff ? '0%' : fillPct);
        slider.classList.toggle('off', isOff);
        const display = document.getElementById(displayId);
        if (display) {
          display.textContent = isOff ? '—' : template.replace('{v}', v);
          display.classList.toggle('active', !isOff);
        }
        applyMacroFilterLive();
      }
      function _resetSlider(id, displayId) {
        const el = document.getElementById(id);
        if (!el) return;
        const nf = el.dataset.nofilter;
        if (nf !== undefined) el.value = nf;
        el.classList.add('off');
        el.style.setProperty('--fill', '0%');
        const d = displayId && document.getElementById(displayId);
        if (d) { d.textContent = '—'; d.classList.remove('active'); }
      }
      function applyMacroFilterLive() {
        const _r = (id, fallback) => {
          const v = _mfSliderVal(id);
          return isNaN(v) ? fallback : v;
        };
        ((macroFilter.kcalMax = _r("mfKcalMax", 9999)),
          (macroFilter.protMin = _r("mfProtMin", 0)),
          (macroFilter.carbMax = _r("mfCarbMax", 999)),
          (macroFilter.fatMax = _r("mfFatMax", 999)),
          (macroFilter.timeMax = _r("mfTimeMax", 999)),
          (macroFilter.scoreMin = _r("mfScoreMin", 1)),
          applyAutoProteinWeight(),
          applyAutoCarbWeight(),
          updateCardMacros(),
          updatePillStates(),
          filterRecipes());
      }
      // Superseded by the per-recipe solver (computeAllAutoWeights, run inside
      // updateCardMacros/filterRecipes). Kept as no-ops so existing call sites
      // stay harmless; per-recipe weights no longer mutate the global weights.
      function applyAutoProteinWeight() {}
      function applyAutoCarbWeight() {}
      function resetMacroFilter() {
        macroFilter = { kcalMax: 9999, protMin: 0, carbMax: 999, fatMax: 999, scoreMin: 1, timeMax: 999 };
        const e = document.getElementById("chkAutoProtein");
        e && (e.checked = !1);
        _syncFilterBtn("btnAutoProtein", false);
        const a = document.getElementById("chkAutoCarb");
        a && (a.checked = !1);
        _syncFilterBtn("btnAutoCarb", false);
        _resetSlider("mfKcalMax", "mfKcalMaxD");
        _resetSlider("mfProtMin", "mfProtMinD");
        _resetSlider("mfCarbMax", "mfCarbMaxD");
        _resetSlider("mfFatMax", "mfFatMaxD");
        _resetSlider("mfScoreMin", "mfScoreMinD");
        _resetSlider("mfTimeMax", "mfTimeMaxD");
        filterRecipes();
      }
      function _syncGlobalWeightInputs() {
        const cw = document.getElementById("chickenInput");
        cw && (cw.value = weights.chicken);
        const fpw = document.getElementById("filterProteinWeight");
        fpw && (fpw.value = weights.chicken);
        const fcw = document.getElementById("filterCarbWeight");
        fcw && (fcw.value = weights.rice);
        document.querySelectorAll(".card-weight-input").forEach((e) => { e.value = weights.chicken; });
      }
      function changeGlobalServings(e) {
        const a = Math.max(1, Math.min(10, weights.servings + e));
        weights.servings = a;
        _reclampAllWeights(); // fewer servings lowers the per-portion ceiling for the same batch total
        _syncGlobalWeightInputs();
        const t = document.getElementById("servingsInput");
        t && (t.textContent = a);
        const i = document.getElementById("globalServingVal");
        i && (i.textContent = a);
        const n = document.getElementById("pillServingsLabel");
        n && (n.textContent = a + (1 === a ? " Serving" : " Servings"));
        const s = document.getElementById("pillServings");
        (s && s.classList.toggle("has-active", 2 !== a), updateCardMacros(), filterRecipes());
      }

      function getRecipeDetail(e) {
        if (RECIPE_DETAILS[e.id]) return RECIPE_DETAILS[e.id];
        const a = { potato: "potato", rice: "rice", noodle: "noodles", bread: "bread/wrap" }[e.carb],
          t = activeProtein.replace("_", " ");
        return {
          ingredients: [
            { section: "Protein", items: [{ name: t + " (raw)", amt: "{{proteinG}}g" }] },
            { section: "Carb Base", items: [{ name: a + " (raw)", amt: "{{carbG}}g" }] },
            {
              section: "Sauce & Seasonings",
              items: [
                { name: "See full recipe on YouTube", amt: "—" },
                { name: "Key spices & sauce", amt: "per recipe" },
              ],
            },
          ],
          steps: [
            "Full step-by-step coming soon — subscribe on YouTube to be notified when this recipe drops! 🎬",
            "In the meantime: season your " +
              t +
              ", cook your " +
              a +
              ", and use the macro calculator to dial in your portions.",
          ],
          hacks: [],
          video: null,
          placeholder: !0,
        };
      }
      let currentModalRecipe = null;
      function updateModalMacros(e) {
        if (!e) return;
        const m = recipeMacros(e, true);
        ((document.getElementById("mKcal").textContent = m.kcal),
          (document.getElementById("mProt").textContent = m.p + "g"),
          (document.getElementById("mCarbs").textContent = m.c + "g"),
          (document.getElementById("mFat").textContent = m.f + "g"));
      }
      function openModal(e) {
        const a = R.find((a) => a.id === e);
        if (!a) return;
        // Open the recipe with its OWN protein (beef for a beef recipe), not the
        // globally selected one, so ingredients and macros match. Recompute the
        // auto-weights so they reflect this protein.
        activeProtein = _nativeVariant(a);
        _portionOverride && _portionOverride.id !== a.id && (_portionOverride = null);
        computeAllAutoWeights();
        ((currentModalRecipe = a),
          (document.getElementById("modalNum").textContent = "#" + String(a.displayNum).padStart(3, "0")),
          (function(){ const sl=document.getElementById("modalServingLabel"); if(sl) sl.textContent="1 serving"; })(),
          (document.getElementById("modalTitle").textContent = a.title),
          (document.getElementById("modalDesc").textContent = a.desc),
          (function(){ const hb=document.getElementById("modalHintBox"),ht=document.getElementById("modalHintText"); if(a.hint){ht.textContent=a.hint;hb.style.display="flex";}else{hb.style.display="none";ht.textContent="";} })(),
          (document.getElementById("modalTime").innerHTML =
            `<span class="time-icon">${clockEmoji(a.time)}</span>${a.time} min`));
        const t = a.protein === "none" ? "none" : (a.protein || "chicken"),
          i =
            { chicken: "🍗 Chicken", beef: "🥩 Beef", eggs: "🥚 Eggs", fish: "🐟 Fish", tofu: "🫘 Tofu" }[t] ||
            "🍗 Chicken",
          n = { chicken: "chicken", beef: "beef", eggs: "eggs", salmon: "salmon", tofu: "tofu" }[t] || "chicken",
          s = document.getElementById("modalTagsRow"),
          o = (a.tags || []).filter(e => e !== "spicy" && e !== "dip" && e !== a.protein).map((e) => `<span class="tag tag-${e}">${tagLabel(e)}</span>`).join("");
        ((s.innerHTML = `\n    <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:${o ? "6px" : "0"};">\n      ${a.carb !== "none" ? `<span class="carb-badge ${a.carb}" style="font-size:10px;padding:4px 10px;">${{ potato: "🥔 Potato", rice: "🍚 Rice", noodle: "🍜 Noodle", bread: "🫓 Bread" }[a.carb]}</span>` : ""}\n      ${t !== "none" ? `<span class="protein-badge ${n}" style="font-size:10px;padding:4px 10px;">${i}</span>` : ""}\n      <span class="flavor-badge ${a.flavor || "savory"}" style="font-size:10px;padding:4px 10px;">${"sweet" === a.flavor ? "🍯 Sweet" : "🧂 Savory"}</span>\n      ${ALCOHOL_RECIPE_IDS.has(a.id) ? '<span class="flavor-badge alcohol" style="font-size:10px;padding:4px 10px;">🍶 Alcohol</span>' : ""}\n      ${SPICY_RECIPE_IDS.has(a.id) ? '<span class="flavor-badge spicy" style="font-size:10px;padding:4px 10px;">🌶️ Spicy</span>' : ""}\n      ${DIP_RECIPE_IDS.has(a.id) ? '<span class="flavor-badge dip" style="font-size:10px;padding:4px 10px;">🥣 Dip</span>' : ""}\n    </div>\n    ${o ? `<div style="display:flex;flex-wrap:wrap;gap:5px;">${o}</div>` : ""}\n  `),
          (modalServings = weights.servings), updateModalMacros(a));
        const r = getRecipeDetail(a),
          c = document.getElementById("modalTabs");
        ((c.innerHTML = `\n    <div class="modal-tab active" onclick="switchModalTab('ingredients',this)">🥄 Ingredients</div>\n    <div class="modal-tab" onclick="switchModalTab('recipe',this)">👨‍🍳 Recipe</div>\n    ${r.video ? '<div class="modal-tab" onclick="switchModalTab(\'video\',this)">▶️ Video</div>' : ""}\n  `),
          buildIngredientsTab(a, modalServings),
          buildRecipeTab(a),
          r.video && buildVideoTab(a),
          switchModalTab("ingredients", c.querySelector(".modal-tab")),
          (function(){
            const modal = document.getElementById("recipeModal");
            modal.classList.toggle("no-protein", a.protein === "none");
            modal.classList.toggle("no-carb", a.carb === "none");
          })(),
          document.getElementById("recipeModal").classList.add("open"),
          (document.body.style.overflow = "hidden"));
        anime({
          targets: document.querySelector("#recipeModal .modal"),
          scale: [0.92, 1],
          translateY: [18, 0],
          opacity: [0, 1],
          duration: 340,
          easing: "easeOutBack"
        });
        const l = document.querySelector(".modal-body"),
          d = document.getElementById("modalCollapsible");
        l &&
          d &&
          ((l.onscroll = () => {}),
          (l.scrollTop = 0),
          d.classList.remove("collapsed"));
      }
      function closeModal(e) {
        e.target === document.getElementById("recipeModal") && closeModalDirect();
      }
      function closeModalDirect() {
        (document.getElementById("recipeModal").classList.remove("open"), (document.body.style.overflow = ""));
        _portionOverride = null; // a Randomizer portion only lives as long as its modal
        // Reset the embed so a playing video doesn't keep running behind the closed modal.
        const v = document.querySelector("#tab-video iframe");
        v && (v.src = v.src);
        // Drop the deep-link param so a reload doesn't reopen the modal.
        try {
          const u = new URL(window.location.href);
          u.searchParams.has("recipe") && (u.searchParams.delete("recipe"), history.replaceState(null, "", u.pathname + u.search + u.hash));
        } catch (e) {}
      }
      function switchModalTab(e, a) {
        (document.querySelectorAll("#modalTabs .modal-tab").forEach((e) => e.classList.remove("active")),
          document.querySelectorAll(".modal-tab-content").forEach((e) => e.classList.remove("active")),
          a && a.classList.add("active"));
        const t = document.getElementById("tab-" + e);
        if ((t && t.classList.add("active"), "recipe" === e && currentModalRecipe)) {
          const e = R.find((e) => e.id === currentModalRecipe.id);
          e && buildRecipeTab(e);
        }
      }
      function refreshRecipeTabIfOpen(e) {
        const a = document.getElementById("tab-recipe");
        a && a.classList.contains("active") && e && buildRecipeTab(e);
      }
      document.addEventListener("keydown", (e) => {
        "Escape" === e.key && closeModalDirect();
      });
      let modalServings = 2;
      function scaleAmt(e, a) {
        if (!e || 1 === a) return e;
        if (
          /^(pinch|splash|drizzle|handful|large handful|small handful|big handful|sprinkle|squeeze|to taste|to coat|to finish|to garnish|to serve|alongside|reserved|see note|see qty|per recipe|—|few|extra sprinkle|generous)$/i.test(
            e.trim(),
          )
        )
          return e;
        const t = { "½": 0.5, "¼": 0.25, "¾": 0.75, "⅓": 1 / 3, "⅔": 2 / 3, "⅛": 0.125 };
        function i(e) {
          if (e === Math.round(e)) return String(Math.round(e));
          const a = [
              [0.25, "¼"],
              [0.5, "½"],
              [0.75, "¾"],
              [1 / 3, "⅓"],
              [2 / 3, "⅔"],
              [0.125, "⅛"],
            ],
            t = e % 1,
            i = Math.floor(e);
          for (const [e, n] of a) if (Math.abs(t - e) < 0.05) return i > 0 ? i + n : n;
          return (Math.round(10 * e) / 10).toString();
        }
        const n = e.match(/^([½¼¾⅓⅔⅛]|\d+(?:[.,]\d+)?(?:[-–]\d+(?:[.,]\d+)?)?)(\s*)(.*)/);
        if (!n) return e;
        let s,
          o = n[1],
          r = n[2],
          c = n[3];
        if (/^per /i.test(c.trim())) return e;
        if (t[o]) s = t[o];
        else {
          if (o.includes("-") || o.includes("–")) {
            const t = o.split(/[-–]/),
              n = parseFloat(t[0]),
              s = parseFloat(t[1]);
            return isNaN(n) || isNaN(s) ? e : i(n * a) + "–" + i(s * a) + r + c;
          }
          s = parseFloat(o.replace(",", "."));
        }
        if (isNaN(s)) return e;
        return i(s * a) + r + c;
      }
      function buildSideEggBlock(recipeId, gPP, sgK, sgP, sgC, sgF, sgNut) {
        const sizes = [{k:"S",g:48},{k:"M",g:58},{k:"L",g:68}];
        const btns = sizes.map(function(a) {
          const active = sideEggSizeG === a.g ? " active" : "";
          return "<button class=\"modal-variant-btn" + active + "\" style=\"padding:2px 8px;font-size:10px;\" " +
            "onclick=\"setSideEggSize(" + a.g + ",'" + recipeId + "');event.stopPropagation()\">" + a.k + "</button>";
        }).join("");
        return "<div class=\"modal-weight-row\" id=\"sideEggRow\">" +
          "<div class=\"modal-weight-row-main\" onclick=\"toggleWeightRow('sideEggRow')\" style=\"flex-wrap:nowrap;align-items:center;\">" +
          "<label style=\"flex-shrink:0;white-space:nowrap;\">🍳 Fried Egg</label>" +
          "<div style=\"display:flex;align-items:center;gap:6px;margin-left:8px;\">" +
          "<div style=\"display:inline-flex;gap:4px;\">" + btns + "</div>" +
          "<div class=\"serving-stepper\" style=\"margin-left:4px;\">" +
          "<button class=\"step-btn\" onclick=\"changeSideEggCount(-1,'" + recipeId + "');event.stopPropagation()\">&#8722;</button>" +
          "<span class=\"serving-val\" id=\"sideEggCountVal\" style=\"width:32px;height:28px;line-height:28px;font-size:14px;\">" + sideEggCount + "</span>" +
          "<button class=\"step-btn\" onclick=\"changeSideEggCount(1,'" + recipeId + "');event.stopPropagation()\">+</button>" +
          "</div></div>" +
          "<span class=\"modal-weight-hint\" style=\"margin-left:auto;\">" + gPP + "g per portion</span>" +
          "<span class=\"modal-weight-expand\">\u25bc</span>" +
          "</div>" +
          "<div class=\"modal-weight-macro-panel\">" +
          "<div class=\"ing-macro-grid\" style=\"margin-top:8px;\">" +
          "<div class=\"ing-macro-cell mk\"><span class=\"imc-val\">" + sgK + "</span><span class=\"imc-lbl\">kcal</span></div>" +
          "<div class=\"ing-macro-cell mp\"><span class=\"imc-val\">" + sgP + "g</span><span class=\"imc-lbl\">protein</span></div>" +
          "<div class=\"ing-macro-cell mc\"><span class=\"imc-val\">" + sgC + "g</span><span class=\"imc-lbl\">carbs</span></div>" +
          "<div class=\"ing-macro-cell mf\"><span class=\"imc-val\">" + sgF + "g</span><span class=\"imc-lbl\">fat</span></div>" +
          "</div>" +
          "<div class=\"ing-macro-hint\">Per portion &middot; " + gPP + "g &middot; per 100g: " + sgNut.kcal + "kcal " + sgNut.p + "g P " + sgNut.c + "g C " + sgNut.f + "g F</div>" +
          "</div></div>";
      }
      let _ingIdAliasMap = null;
      function _getIngIdAliasMap() {
        if (_ingIdAliasMap) return _ingIdAliasMap;
        _ingIdAliasMap = {};
        Object.entries(ING_NAME_MAP).forEach(([alias, id]) => {
          if (!_ingIdAliasMap[id]) _ingIdAliasMap[id] = [];
          _ingIdAliasMap[id].push(alias.toLowerCase());
        });
        return _ingIdAliasMap;
      }
      function _isIngInSteps(item, stepsText) {
        const amt = (item.amt || "").toLowerCase().trim();
        // placeholders, optional, "to taste" and "—" are always considered present
        if (amt.includes("{{") || amt === "to taste" || amt === "—" || amt.includes("optional") || amt.includes("to taste")) return true;
        const name = (item.name || "").toLowerCase().trim();
        if (!name) return true;
        // generic seasoning/oil entries are always implied in cooking steps
        if (/\b(salt|pepper|spice|seasoning|neutral oil|cooking oil|oil)\b/.test(name)) return true;
        // direct name match
        if (stepsText.includes(name)) return true;
        // match via canonical id and all ING_NAME_MAP aliases
        const id = item.id || findIngredientId(item.name);
        if (id) {
          if (stepsText.includes(id.toLowerCase().replace(/_/g, " "))) return true;
          const aliases = _getIngIdAliasMap()[id] || [];
          for (const alias of aliases) { if (stepsText.includes(alias)) return true; }
        }
        return false;
      }
      function buildIngredientsTab(e, a) {
        void 0 !== a && (modalServings = Math.max(1, a));
        const t = getRecipeDetail(e),
          i = modalServings,
          n = e.protein || "chicken",
          s = PROTEIN_DEFS.find((e) => e.key === n),
          o = "eggs" === n,
          _isNoneProtein = "none" === n,
          r = o
            ? "eggs"
            : "salmon" === n
              ? "salmon"
              : "tofu" === n
                ? "tofu"
                : s && s.variants && s.variants.find((e) => e.key === activeProtein)
                  ? activeProtein
                  : s && s.variants
                    ? s.variants[0].key
                    : n,
          c = {
            chicken_thigh: { ing: "Chicken thigh (boneless, skinless, raw)", short: "Chicken Thigh" },
            chicken_breast: { ing: "Chicken breast (boneless, skinless, raw)", short: "Chicken Breast" },
            beef_regular: { ing: "Ground beef (20% fat, raw)", short: "Ground Beef (20%)" },
            beef_lean: { ing: "Lean ground beef (5% fat, raw)", short: "Lean Ground Beef" },
            eggs: { ing: "Eggs (whole)", short: "Eggs" },
            salmon: { ing: "Salmon fillet (skin on, raw)", short: "Salmon" },
            tofu: { ing: "Firm tofu", short: "Tofu" },
          },
          l = c[r] || c.chicken_thigh,
          d =
            {
              chicken_thigh: "🍗",
              chicken_breast: "🍗",
              beef_regular: "🥩",
              beef_lean: "🥩",
              eggs: "🥚",
              salmon: "🐟",
              tofu: "🫘",
            }[r] || "🍗",
          m = { potato: "🥔", rice: "🍚", noodle: "🍜", bread: "🫓" }[e.carb] || "🍽️",
          h = { potato: "Potato", rice: "Rice", noodle: "Noodles", bread: "Bread/Wrap" }[e.carb] || "Carb",
          _por = portionFor(e, true),
          _eggN = _por.eggs != null ? _por.eggs : eggCount,
          p = Math.round(_por.pg),
          u = Math.round(_por.cg);
        let g = "";
        if (!o && s && s.variants) {
          const a = s.variants
            .map(
              (a) =>
                `<button class="modal-variant-btn ${r === a.key ? "active" : ""}"\n        onclick="selectModalVariant('${a.key}', '${e.id}')">${a.label}</button>`,
            )
            .join("");
          g = `<div class="modal-variant-row">\n      <label>${d} Variant</label>\n      ${a}\n    </div>`;
        }
        let k = "";
        if (o) {
          k = `<div class="modal-variant-row">\n      <label>🥚 Egg Size</label>\n      ${[
            { k: "S", g: 48 },
            { k: "M", g: 58 },
            { k: "L", g: 68 },
          ]
            .map(
              (a) =>
                `<button class="modal-variant-btn ${eggSizeG === a.g ? "active" : ""}"\n        onclick="setModalEggSize(${a.g}, '${e.id}')">${a.k} ~${a.g}g</button>`,
            )
            .join(
              "",
            )}\n    </div>\n    <div class="modal-weight-row">\n      <div class="modal-weight-row-main" style="cursor:default;flex-wrap:nowrap;align-items:center;gap:8px;">\n        <label style="flex-shrink:0;white-space:nowrap;">🥚 Egg Count</label>\n        <div class="serving-stepper" style="margin-left:0;">\n          <button class="step-btn" onclick="changeModalEggCount(-1, '${e.id}')">−</button>\n          <span class="serving-val" id="modalEggCountVal" style="width:36px;height:30px;line-height:30px;font-size:15px;">${_eggN}</span>\n          <button class="step-btn" onclick="changeModalEggCount(1, '${e.id}')">+</button>\n        </div>\n        <span class="modal-weight-hint" style="margin-left:auto;">${p}g per portion</span>\n      </div>\n    </div>`;
        }
        // Side-egg stepper for sideEgg: true recipes
        const _hasSideEgg = !!e.sideEgg;
        const _sgPP = Math.round(sideEggCount * sideEggSizeG);
        const _sgNut = NUTRITION_DB.eggs || { kcal: 143, p: 12.6, c: 0.7, f: 9.5 };
        const _sgK = Math.round((_sgNut.kcal * _sgPP) / 100);
        const _sgP = Math.round((_sgNut.p * _sgPP) / 100 * 10) / 10;
        const _sgC = Math.round((_sgNut.c * _sgPP) / 100 * 10) / 10;
        const _sgF = Math.round((_sgNut.f * _sgPP) / 100 * 10) / 10;
        const _sideEggBlock = _hasSideEgg ? buildSideEggBlock(e.id, _sgPP, _sgK, _sgP, _sgC, _sgF, _sgNut) : "";
        let y = `\n  <div class="serving-variant-row">\n  ${g}\n  <div class="serving-control">\n    <label>🍽️ Servings</label>\n    <div class="serving-stepper">\n      <button class="step-btn" onclick="changeModalServings(-1, '${e.id}')">−</button>\n      <span class="serving-val" id="modalServingVal">${i}</span>\n      <button class="step-btn" onclick="changeModalServings(1, '${e.id}')">+</button>\n    </div>\n    <span class="modal-weight-hint">per portion</span>\n  </div>\n  </div>\n  ${
            (o || _isNoneProtein)
              ? k
              : (() => {
                  const a = NUTRITION_DB[r] || NUTRITION_DB.chicken_thigh,
                    t = Math.round((a.kcal * p) / 100),
                    i = Math.round(((a.p * p) / 100) * 10) / 10,
                    n = Math.round(((a.c * p) / 100) * 10) / 10,
                    s = Math.round(((a.f * p) / 100) * 10) / 10;
                  return `\n  <div class="modal-weight-row" id="protWeightRow">\n    <div class="modal-weight-row-main" onclick="toggleWeightRow('protWeightRow')">\n      <label>${d} ${l.short}</label>\n      <input type="number" class="modal-weight-input" id="mwProt" value="${Math.round(_por.pg * modalServings)}"\n        min="50" max="3000"\n        onclick="event.stopPropagation()"\n        oninput="updateModalWeight('prot', this.value, '${e.id}')">\n      <span class="modal-weight-unit">g batch total</span>\n      <span class="modal-weight-hint">${p}g per portion</span>\n      <span class="modal-weight-expand">▼</span>\n    </div>\n    <div class="modal-weight-macro-panel">\n      <div class="ing-macro-grid" style="margin-top:8px;">\n        <div class="ing-macro-cell mk"><span class="imc-val">${t}</span><span class="imc-lbl">kcal</span></div>\n        <div class="ing-macro-cell mp"><span class="imc-val">${i}g</span><span class="imc-lbl">protein</span></div>\n        <div class="ing-macro-cell mc"><span class="imc-val">${n}g</span><span class="imc-lbl">carbs</span></div>\n        <div class="ing-macro-cell mf"><span class="imc-val">${s}g</span><span class="imc-lbl">fat</span></div>\n      </div>\n      <div class="ing-macro-hint">Per portion · ${p}g · per 100g: ${a.kcal}kcal ${a.p}g P ${a.c}g C ${a.f}g F</div>\n    </div>\n  </div>`;
                })()
          }\n  <div class="modal-weight-row" id="carbWeightRow">\n    ${(() => {
            const a = NUTRITION_DB[e.carb] || {},
              t = Math.round(((a.kcal || 0) * u) / 100),
              i = Math.round((((a.p || 0) * u) / 100) * 10) / 10,
              n = Math.round((((a.c || 0) * u) / 100) * 10) / 10,
              s = Math.round((((a.f || 0) * u) / 100) * 10) / 10;
            return `\n    <div class="modal-weight-row-main" onclick="toggleWeightRow('carbWeightRow')">\n      <label>${m} ${h}</label>\n      <input type="number" class="modal-weight-input" id="mwCarb" value="${Math.round(_por.cg * modalServings)}"\n        min="0" max="3000"\n        onclick="event.stopPropagation()"\n        oninput="updateModalWeight('carb', this.value, '${e.id}')">\n      <span class="modal-weight-unit">g batch total</span>\n      <span class="modal-weight-hint">${u}g per portion</span>\n      <span class="modal-weight-expand">▼</span>\n    </div>\n    <div class="modal-weight-macro-panel">\n      <div class="ing-macro-grid" style="margin-top:8px;">\n        <div class="ing-macro-cell mk"><span class="imc-val">${t}</span><span class="imc-lbl">kcal</span></div>\n        <div class="ing-macro-cell mp"><span class="imc-val">${i}g</span><span class="imc-lbl">protein</span></div>\n        <div class="ing-macro-cell mc"><span class="imc-val">${n}g</span><span class="imc-lbl">carbs</span></div>\n        <div class="ing-macro-cell mf"><span class="imc-val">${s}g</span><span class="imc-lbl">fat</span></div>\n      </div>\n      <div class="ing-macro-hint">Per portion · ${u}g · per 100g: ${a.kcal || 0}kcal ${a.p || 0}g P ${a.c || 0}g C ${a.f || 0}g F</div>\n    </div>`;
          })()}\n  </div>${_hasSideEgg ? _sideEggBlock : ""}`,
          b = 0,
          f = 0,
          v = 0,
          w = 0,
          _ = !1;
        const _recipeStepsText = (t.steps || []).join(" ").toLowerCase();
        t.ingredients.forEach((a, sectionIdx) => {
          ((y += `<div class="ing-section-title">${a.section}</div><ul class="ing-list">`),
            a.items.forEach((a) => {
              const t = (a.amt || "").includes("{{proteinG}}") || (a.amt || "").includes("{{carbG}}") || (a.amt || "").includes("{{eggCount}}"),
                // The list is the whole batch: per-portion grams × servings.
                n = _por.pg * i,
                s = _por.cg * i,
                c = (a.amt || "")
                  .replace("{{proteinG}}", Math.round(n))
                  .replace("{{carbG}}", Math.round(s))
                  .replace("{{eggCount}}", _eggN * i)
                  .replace("{{servings}}", i);
              let d = t ? c : scaleAmt(c, i),
                m = a.name;
              a.amt && a.amt.includes("{{proteinG}}") && (m = l.ing);
              let h = null,
                g = null;
              try {
                if (a.amt && a.amt.includes("{{proteinG}}")) {
                  const e = NUTRITION_DB[r] || NUTRITION_DB.chicken_thigh;
                  g = {
                    grams: p,
                    kcal: Math.round((e.kcal * p) / 100),
                    p: Math.round(((e.p * p) / 100) * 10) / 10,
                    c: Math.round(((e.c * p) / 100) * 10) / 10,
                    f: Math.round(((e.f * p) / 100) * 10) / 10,
                  };
                } else if (a.amt && a.amt.includes("{{carbG}}")) {
                  const a = NUTRITION_DB[e.carb] || {};
                  g = {
                    grams: u,
                    kcal: Math.round(((a.kcal || 0) * u) / 100),
                    p: Math.round((((a.p || 0) * u) / 100) * 10) / 10,
                    c: Math.round((((a.c || 0) * u) / 100) * 10) / 10,
                    f: Math.round((((a.f || 0) * u) / 100) * 10) / 10,
                  };
                } else if (a.amt && a.amt.includes("{{eggCount}}")) {
                  const _eggNut = NUTRITION_DB.eggs || { kcal: 143, p: 12.6, c: 0.7, f: 9.5 };
                  const _eggG = Math.round(_eggN * eggSizeG);
                  g = {
                    grams: _eggG,
                    kcal: Math.round((_eggNut.kcal * _eggG) / 100),
                    p: Math.round(((_eggNut.p * _eggG) / 100) * 10) / 10,
                    c: Math.round(((_eggNut.c * _eggG) / 100) * 10) / 10,
                    f: Math.round(((_eggNut.f * _eggG) / 100) * 10) / 10,
                  };
                } else ((h = a.id || findIngredientId(m)), (g = h ? calcIngredientMacros(h, d) : null));
              } catch (e) {}
              const _inSteps = _isIngInSteps(a, _recipeStepsText);
              const _warnBadge = _inSteps ? "" : ' <span class="ing-not-in-steps" title="Not mentioned in recipe steps">!</span>';
              if (g) {
                ((_ = !0), (b += g.kcal), (f += g.p), (v += g.c), (w += g.f));
                Math.random().toString(36).slice(2, 7);
                y += `<li class="has-macros" onclick="toggleIngMacro(this)">\n          <div class="ing-main-row">\n            <div style="display:flex;align-items:center;gap:4px;">\n              <span class="ing-expand-icon">▼</span>\n              <span class="ing-item-name">${m}${_warnBadge}</span>\n            </div>\n            <span class="ing-item-amt">${d}</span>\n          </div>\n          <div class="ing-macro-panel">\n            <div class="ing-macro-grid">\n              <div class="ing-macro-cell mk"><span class="imc-val">${g.kcal}</span><span class="imc-lbl">kcal</span></div>\n              <div class="ing-macro-cell mp"><span class="imc-val">${g.p}g</span><span class="imc-lbl">protein</span></div>\n              <div class="ing-macro-cell mc"><span class="imc-val">${g.c}g</span><span class="imc-lbl">carbs</span></div>\n              <div class="ing-macro-cell mf"><span class="imc-val">${g.f}g</span><span class="imc-lbl">fat</span></div>\n              ${g.a > 0 ? `<div class="ing-macro-cell ma"><span class="imc-val">${g.a}g</span><span class="imc-lbl">alcohol</span></div>` : ""}\n            </div>\n            <div class="ing-macro-hint">${i > 1 ? `${i} servings` : "Per portion"} · based on ${g.grams}g</div>\n          </div>\n        </li>`;
              } else
                y += `<li><div class="ing-main-row"><span class="ing-item-name">${m}${_warnBadge}</span><span class="ing-item-amt">${d}</span></div></li>`;
            }),
            (y += "</ul>"));
          if (!t.placeholder) {
            const sectionSteps = (t.steps || []).filter(function(step) {
              const sl = step.toLowerCase();
              const sn = (a.section || "").toLowerCase();
              if (sn.length > 2 && sl.includes(sn)) return true;
              return (a.items || []).some(function(item) {
                const nl = (item.name || "").toLowerCase()
                  .replace(/[(){}]/g, "")
                  .replace(/\{\{proteing\}\}/g, "chicken")
                  .replace(/\{\{carbg\}\}/g, e.carb || "potato")
                  .trim();
                return nl.split(/[\s,\/]+/).filter(function(w) { return w.length > 3; }).some(function(w) { return sl.includes(w); });
              });
            });
            if (sectionSteps.length > 0) {
              const gId = "isg-" + sectionIdx + "-" + e.id;
              y += "<div class=\"ing-step-group\"><div class=\"ing-step-toggle\" onclick=\"toggleIngStepGroup(this,'" + gId + "')\">👨‍🍳 " + sectionSteps.length + " step" + (sectionSteps.length > 1 ? "s" : "") + " <span class=\"sia-arrow\">▼</span></div><div class=\"ing-step-panel\" id=\"" + gId + "\">" + sectionSteps.map(function(s, si) { return "<div class=\"ing-step-item\"><span class=\"ing-step-num\">" + (si + 1) + "</span>" + s + "</div>"; }).join("") + "</div></div>";
            }
          }
        });
        const _tm = recipeMacros(e, true),
          T = _tm.kcal,
          x = _tm.p,
          B = _tm.c,
          P = _tm.f;
        ((y += `<div class="ing-total-bar">\n    <div class="ing-total-title">📊 Total per portion</div>\n    <div class="ing-total-grid">\n      <div class="ing-total-cell mk"><span class="itc-val">${T}</span><span class="itc-lbl">kcal</span></div>\n      <div class="ing-total-cell mp"><span class="itc-val">${x}g</span><span class="itc-lbl">protein</span></div>\n      <div class="ing-total-cell mc"><span class="itc-val">${B}g</span><span class="itc-lbl">carbs</span></div>\n      <div class="ing-total-cell mf"><span class="itc-val">${P}g</span><span class="itc-lbl">fat</span></div>\n    </div>\n    <div class="ing-macro-hint" style="margin-top:8px;">Tap any ingredient to see its macros</div>\n  </div>`),
          t.placeholder
            ? (y += '<div class="ing-note">📌 Full ingredient list coming soon — follow on YouTube & TikTok!</div>')
            : (y += _por.source === "randomizer"
                ? '<div class="ing-note">🎲 Portion sized by the Randomizer for this meal. Changes here stay in this recipe.</div>'
                : '<div class="ing-note">📌 Weights are global — changes apply to all recipes.</div>'),
          (document.getElementById("tab-ingredients").innerHTML = y));
      }
      function changeModalServings(e, a) {
        ((modalServings = Math.max(1, Math.min(10, modalServings + e))), (weights.servings = modalServings));
        if (a) Object.keys(_sauceMacroCache).forEach(k => { if (k === a || k.startsWith(a + "_s")) delete _sauceMacroCache[k]; });
        const _sl = document.getElementById("modalServingLabel");
        if (_sl) _sl.textContent = modalServings + (modalServings === 1 ? " serving" : " servings");
        const t = document.getElementById("servingsInput");
        t && (t.textContent = modalServings);
        const i = document.getElementById("globalServingVal");
        i && (i.textContent = modalServings);
        const n = document.getElementById("pillServingsLabel");
        n && (n.textContent = modalServings + (1 === modalServings ? " Serving" : " Servings"));
        const s = document.getElementById("pillServings");
        s && s.classList.toggle("has-active", 2 !== modalServings);
        const o = R.find((e) => e.id === a);
        o && (buildIngredientsTab(o), updateModalMacros(o), updateCardMacros());
      }
      function toggleStepIng(e, a) {
        const t = document.getElementById(a);
        t && (e.classList.toggle("open"), t.classList.toggle("open"));
      }
      function toggleIngStepGroup(el, id) {
        el.classList.toggle("open");
        const panel = document.getElementById(id);
        if (panel) panel.classList.toggle("open");
      }
      function buildRecipeTab(e) {
        const a = getRecipeDetail(e);
        let t = "";
        const i = [];
        (a.ingredients || []).forEach((e) => {
          (e.items || []).forEach((a) => {
            i.push({ ...a, section: e.section });
          });
        });
        const n = Math.max(weights.servings, 1),
          _pR = e ? portionFor(e, true) : { pg: 0, cg: 0 },
          s = Math.round(_pR.pg * n),
          o = Math.round(_pR.cg * n),
          _proteinNames = {
            chicken_thigh: "Chicken thigh (boneless, skinless, raw)",
            chicken_breast: "Chicken breast (boneless, skinless, raw)",
            beef_regular: "Ground beef (20% fat, raw)",
            beef_lean: "Lean ground beef (5% fat, raw)",
            eggs: "Eggs (whole)",
            salmon: "Salmon fillet (skin on, raw)",
            tofu: "Firm tofu",
          },
          _proteinLabel = _proteinNames[activeProtein] || _proteinNames.chicken_thigh,
          _carbNames = { potato: "Potato (raw)", rice: "Rice (dry)", noodle: "Noodles (dry)", bread: "Bread / Wrap" },
          _carbLabel = _carbNames[e ? e.carb : "potato"] || "Carb base";
        (a.steps.length &&
          ((t += '<div class="step-list">'),
          a.steps.forEach((a, r) => {
            const c = a.toLowerCase(),
              l = i.filter((a) =>
                a.name
                  .toLowerCase()
                  .replace(/[(){}]/g, "")
                  .replace(/{{proteing}}/g, "chicken")
                  .replace(/{{carbg}}/g, e ? e.carb : "potato")
                  .trim()
                  .split(/[\s,\/]+/)
                  .filter((e) => e.length > 3)
                  .some((e) => c.includes(e)),
              );
            let d = "";
            if (l.length > 0) {
              const a = "step-ing-" + e.id + "-" + r,
                t = l
                  .map((e) => {
                    const a = (e.amt || "").includes("{{proteinG}}") || (e.amt || "").includes("{{carbG}}"),
                      t = (e.amt || "")
                        .replace("{{proteinG}}", s)
                        .replace("{{carbG}}", o)
                        .replace("{{servings}}", n);
                    let i = a ? t : scaleAmt(t, n),
                      r = e.name;
                    e.amt && e.amt.includes("{{proteinG}}") && (r = _proteinLabel);
                    e.amt && e.amt.includes("{{carbG}}") && (r = _carbLabel);
                    return (
                      `<div class="step-ing-item">\n            <span class="sii-name">${r}</span>\n            <span class="sii-amt">${i}</span>\n          </div>`
                    );
                  })
                  .join("");
              d = `\n          <div class="step-ing-btn" onclick="toggleStepIng(this,'${a}')">\n            🥄 ${l.length} ingredient${l.length > 1 ? "s" : ""} <span class="sia-arrow">▼</span>\n          </div>\n          <div class="step-ing-panel" id="${a}">\n            ${t}\n          </div>`;
            }
            t += `<div class="step">\n        <div class="step-num">${r + 1}</div>\n        <div class="step-text">\n          <div>${a}</div>\n          ${d}\n        </div>\n      </div>`;
          }),
          (t += "</div>")),
          a.hacks &&
            a.hacks.length &&
            a.hacks.forEach((e) => {
              t += `<div class="hack-box"><strong>💡 80/20 hack — ${e.title}:</strong> ${e.text}</div>`;
            }),
          a.notes && (t += `<div class="ing-note" style="margin-top:16px;">📌 ${a.notes}</div>`));
        const r = detectEquipment(a.steps);
        (r.length &&
          ((t += '<div class="equipment-row"><span class="equipment-label">🛠 Need:</span>'),
          r.forEach((e) => {
            t += `<span class="equipment-tag">${e.icon} ${e.label}</span>`;
          }),
          (t += "</div>")),
          (document.getElementById("tab-recipe").innerHTML = t));
      }
      const EQUIPMENT_MAP = [
        {
          icon: "🔥",
          label: "Oven",
          keys: ["oven", "roast at", "bake at", "grill/broil", "broil", "180c", "190c", "200c", "210c", "220c", "°c"],
        },
        {
          icon: "🍳",
          label: "Pan / Wok",
          keys: ["pan", "wok", "skillet", "sear", "fry", "sauté", "saute", "non-stick", "cast iron"],
        },
        { icon: "🫕", label: "Pot", keys: ["pot", "boil", "simmer", "braise", "soup", "stock", "poach", "blanch"] },
        { icon: "💨", label: "Air Fryer", keys: ["air fry", "airfry", "air-fry"] },
        { icon: "🧈", label: "Grill", keys: ["grill", "griddle", "bbq", "char mark", "charcoal"] },
        { icon: "⚡", label: "Blender", keys: ["blend", "blender", "food processor", "stick blender"] },
        { icon: "🔪", label: "Sharp Knife", keys: ["julienne", "mince", "finely", "thin slice", "shave", "julien"] },
        {
          icon: "⏲️",
          label: "Timer",
          keys: ["12 min", "15 min", "20 min", "25 min", "30 min", "35 min", "40 min", "45 min", "50 min"],
        },
        { icon: "🥣", label: "Mixing Bowl", keys: ["mixing bowl", "in a bowl", "toss in", "combine in"] },
        { icon: "🫙", label: "Sandwich Press", keys: ["sandwich press", "press down", "panini"] },
      ];
      function detectEquipment(e) {
        if (!e || !e.length) return [];
        const a = e.join(" ").toLowerCase(),
          t = [];
        return (
          EQUIPMENT_MAP.forEach((e) => {
            e.keys.some((e) => a.includes(e)) && t.push(e);
          }),
          t
        );
      }
      function buildVideoTab(e) {
        const a = getRecipeDetail(e);
        let t = "";
        (a.video &&
          (t = `<div class="video-embed"><iframe src="https://www.youtube.com/embed/${a.video}" allowfullscreen loading="lazy"></iframe></div>`),
          (document.getElementById("tab-video").innerHTML = t));
      }
      const PANTRY_ITEMS = {
          sauces: [
            { id: "soy_sauce", name: "Soy Sauce" },
            { id: "oyster_sauce", name: "Oyster Sauce" },
            { id: "fish_sauce", name: "Fish Sauce" },
            { id: "hoisin", name: "Hoisin Sauce" },
            { id: "gochujang", name: "Gochujang" },
            { id: "miso", name: "Miso Paste" },
            { id: "doenjang", name: "Doenjang (Korean Soybean Paste)" },
            { id: "teriyaki", name: "Teriyaki Sauce" },
            { id: "sesame_oil", name: "Sesame Oil" },
            { id: "sriracha", name: "Sriracha" },
            { id: "tahini", name: "Tahini" },
            { id: "harissa", name: "Harissa" },
            { id: "worcestershire", name: "Worcestershire" },
            { id: "ketchup", name: "Ketchup / Tomato Paste" },
            { id: "mayo", name: "Mayonnaise" },
            { id: "hot_sauce", name: "Hot Sauce" },
            { id: "peanut_butter", name: "Peanut Butter" },
            { id: "coconut_milk", name: "Coconut Milk" },
            { id: "rice_vinegar", name: "Rice Vinegar" },
            { id: "apple_cider_vinegar", name: "Apple Cider Vinegar" },
            { id: "mirin", name: "Mirin" },
            { id: "sake", name: "Sake / Dry White Wine" },
            { id: "toum", name: "Toum / Garlic Sauce" },
            { id: "dijon", name: "Dijon / Whole Grain Mustard" },
            { id: "bbq_sauce", name: "BBQ Sauce" },
            { id: "chipotle_adobo", name: "Chipotle in Adobo" },
            { id: "sweet_soy", name: "Sweet Soy Sauce (Kecap Manis)" },
            { id: "ponzu", name: "Ponzu Sauce" },
            { id: "shio_koji", name: "Shio Koji" },
            { id: "yuzu_kosho", name: "Yuzu Kosho" },
            { id: "tamarind", name: "Tamarind Paste" },
            { id: "balsamic_glaze", name: "Balsamic Glaze" },
            { id: "chili_oil", name: "Chili Oil" },
          ],
          spices: [
            { id: "gochugaru", name: "Gochugaru (Korean Chili)" },
            { id: "cumin", name: "Cumin" },
            { id: "coriander", name: "Ground Coriander" },
            { id: "turmeric", name: "Turmeric" },
            { id: "smoked_paprika", name: "Smoked Paprika" },
            { id: "paprika", name: "Paprika" },
            { id: "chili_flakes", name: "Chili Flakes" },
            { id: "five_spice", name: "Chinese 5-Spice" },
            { id: "zaatar", name: "Za'atar" },
            { id: "sumac", name: "Sumac" },
            { id: "baharat", name: "Baharat" },
            { id: "ras_el_hanout", name: "Ras el Hanout" },
            { id: "curry_powder", name: "Curry Powder" },
            { id: "garam_masala", name: "Garam Masala" },
            { id: "tandoori_masala", name: "Tandoori Masala" },
            { id: "tikka_paste", name: "Tikka Masala Paste" },
            { id: "kasuri_methi", name: "Kasuri Methi (Dried Fenugreek)" },
            { id: "oregano", name: "Dried Oregano" },
            { id: "thyme", name: "Dried Thyme" },
            { id: "dill_dried", name: "Dried Dill" },
            { id: "bay_leaf", name: "Bay Leaves" },
            { id: "cinnamon", name: "Cinnamon" },
            { id: "cardamom", name: "Cardamom" },
            { id: "star_anise", name: "Star Anise" },
            { id: "allspice", name: "Allspice" },
            { id: "garlic_powder", name: "Garlic Powder" },
            { id: "onion_powder", name: "Onion Powder" },
            { id: "cayenne", name: "Cayenne Pepper" },
            { id: "black_pepper", name: "Black Pepper" },
            { id: "msg", name: "MSG" },
            { id: "saffron", name: "Saffron" },
            { id: "jerk_seasoning", name: "Jerk Seasoning" },
            { id: "dukkah", name: "Dukkah" },
            { id: "furikake", name: "Furikake" },
            { id: "tajin", name: "Tajin / Chili Lime Seasoning" },
          ],
          fresh: [
            { id: "garlic", name: "Garlic" },
            { id: "ginger", name: "Fresh Ginger" },
            { id: "scallion", name: "Spring Onion / Scallion" },
            { id: "onion", name: "Onion" },
            { id: "lemon", name: "Lemon" },
            { id: "lime", name: "Lime" },
            { id: "cilantro", name: "Fresh Cilantro" },
            { id: "parsley", name: "Fresh Parsley" },
            { id: "basil", name: "Fresh Basil" },
            { id: "mint", name: "Fresh Mint" },
            { id: "rosemary", name: "Fresh Rosemary" },
            { id: "chives", name: "Fresh Chives" },
            { id: "dill_fresh", name: "Fresh Dill" },
            { id: "lemongrass", name: "Lemongrass" },
            { id: "kaffir_lime", name: "Kaffir Lime Leaves" },
            { id: "thai_basil", name: "Thai Basil" },
            { id: "pandan", name: "Pandan Leaves" },
            { id: "chili_fresh", name: "Fresh Chili" },
            { id: "tomato", name: "Fresh Tomato" },
            { id: "cucumber", name: "Cucumber" },
            { id: "avocado", name: "Avocado" },
            { id: "bell_pepper", name: "Bell Pepper / Capsicum" },
            { id: "cabbage", name: "Cabbage (White / Red)" },
            { id: "carrot", name: "Carrot" },
            { id: "corn", name: "Corn (Fresh / Frozen)" },
            { id: "leek", name: "Leek" },
            { id: "mushroom", name: "Mushrooms" },
            { id: "spinach", name: "Spinach" },
            { id: "bok_choy", name: "Bok Choy" },
            { id: "kimchi", name: "Kimchi" },
          ],
          dairy: [
            { id: "butter", name: "Butter" },
            { id: "eggs_dairy", name: "Eggs" },
            { id: "milk", name: "Milk" },
            { id: "heavy_cream", name: "Heavy Cream" },
            { id: "sour_cream", name: "Sour Cream" },
            { id: "cream_cheese", name: "Cream Cheese" },
            { id: "creme_fraiche", name: "Crème Fraîche" },
            { id: "yogurt", name: "Greek Yogurt" },
            { id: "quark_low_fat", name: "Low-Fat Quark" },
            { id: "skyr", name: "Skyr" },
            { id: "cottage_cheese", name: "Cottage Cheese" },
            { id: "ricotta", name: "Ricotta" },
            { id: "labneh", name: "Labneh" },
            { id: "cheese_parm", name: "Parmesan" },
            { id: "cheese_mozz", name: "Mozzarella" },
            { id: "cheese_feta", name: "Feta" },
            { id: "cheese_cheddar", name: "Cheddar" },
            { id: "cheese_gruyere", name: "Gruyère / Emmental" },
            { id: "cheese_provolone", name: "Provolone / Swiss" },
          ],
          staples: [
            { id: "olive_oil", name: "Olive Oil" },
            { id: "neutral_oil", name: "Neutral Oil (Sunflower etc.)" },
            { id: "chicken_stock", name: "Chicken Stock / Broth" },
            { id: "canned_tomato", name: "Canned Tomatoes" },
            { id: "tomato_paste", name: "Tomato Paste" },
            { id: "black_beans", name: "Black Beans (canned)" },
            { id: "kidney_beans", name: "Kidney Beans (canned)" },
            { id: "coconut_cream", name: "Coconut Cream" },
            { id: "panko", name: "Panko Breadcrumbs" },
            { id: "breadcrumbs", name: "Regular Breadcrumbs" },
            { id: "flour", name: "All-Purpose Flour" },
            { id: "cornstarch", name: "Cornstarch" },
            { id: "honey", name: "Honey" },
            { id: "sugar", name: "Sugar / Brown Sugar" },
            { id: "sesame_seeds", name: "Sesame Seeds" },
            { id: "peanuts", name: "Peanuts / Cashews" },
            { id: "almonds", name: "Almonds (blanched)" },
            { id: "pine_nuts", name: "Pine Nuts" },
            { id: "raisins", name: "Raisins" },
            { id: "dashi", name: "Dashi / Dashi Powder" },
            { id: "japanese_curry_roux", name: "Japanese Curry Roux (S&B)" },
            { id: "nori", name: "Nori / Seaweed" },
            { id: "glass_noodles", name: "Glass Noodles" },
            { id: "rice_paper", name: "Rice Paper" },
            { id: "pickled_veg", name: "Pickled Veg / Gherkins" },
            { id: "dried_chili", name: "Dried Chili" },
            { id: "pomegranate_mol", name: "Pomegranate Molasses" },
            { id: "preserved_lemon", name: "Preserved Lemon" },
          ],
          proteins: [
            { id: "chicken_thigh", name: "Chicken Thigh" },
            { id: "chicken_breast", name: "Chicken Breast" },
            { id: "beef_regular", name: "Ground Beef (Regular)" },
            { id: "beef_lean", name: "Lean Ground Beef" },
            { id: "eggs", name: "Eggs" },
            { id: "salmon", name: "Salmon" },
            { id: "tofu", name: "Firm Tofu" },
            { id: "tuna_canned", name: "Tuna (Canned in Water)" },
            { id: "shrimp", name: "Shrimp / Prawns" },
            { id: "cod", name: "Cod / White Fish" },
            { id: "turkey_mince", name: "Turkey Mince" },
            { id: "quark_low_fat", name: "Low-Fat Quark" },
            { id: "skyr", name: "Skyr" },
            { id: "cottage_cheese", name: "Cottage Cheese" },
          ],
          carbs: [
            { id: "potato", name: "Potato" },
            { id: "rice", name: "Rice (White, Dry)" },
            { id: "noodle", name: "Noodles (Egg / Wheat, Dry)" },
            { id: "bread", name: "Bread / Wrap" },
          ],
        },
        INGREDIENT_RECIPE_MAP = {},
                ALCOHOL_RECIPE_IDS = new Set(),
                SPICY_RECIPE_IDS = new Set(),
                DIP_RECIPE_IDS = new Set();
      // My Pantry is switched off via the "pantry-off" class on <html> (see
      // index.html). While off, a visitor's saved pantry selection is left
      // untouched in localStorage but NOT applied — otherwise recipes would
      // stay hidden with no visible control to bring them back.
      const PANTRY_ENABLED = !document.documentElement.classList.contains("pantry-off");
      let disabledIngredients = new Set(PANTRY_ENABLED ? JSON.parse(localStorage.getItem("pantryDisabled") || "[]") : []);
      function savePantry() {
        if (!PANTRY_ENABLED) return; // don't overwrite the saved selection with dietary-only state
        try {
          localStorage.setItem("pantryDisabled", JSON.stringify([...disabledIngredients]));
        } catch (e) {}
      }
      function pantrySearchFilter() {
        const e = document.getElementById("pantrySearch")?.value.toLowerCase() || "";
        (document.querySelectorAll(".ing-item").forEach((a) => {
          const t = a.querySelector(".ing-name")?.textContent.toLowerCase() || "";
          a.classList.toggle("hidden", e.length > 0 && !t.includes(e));
        }),
          document.querySelectorAll(".pantry-section").forEach((a) => {
            const t = [...a.querySelectorAll(".ing-item")].every((e) => e.classList.contains("hidden"));
            a.style.display = t && e.length > 0 ? "none" : "";
          }));
      }
      function renderPantry() {
        (Object.entries({
          sauces: "pantry-sauces",
          spices: "pantry-spices",
          fresh: "pantry-fresh",
          dairy: "pantry-dairy",
          staples: "pantry-staples",
          proteins: "pantry-proteins",
          carbs: "pantry-carbs",
        }).forEach(([e, a]) => {
          const t = document.getElementById(a);
          t &&
            (t.innerHTML = PANTRY_ITEMS[e]
              .map((e) => {
                const a = disabledIngredients.has(e.id),
                  t = (INGREDIENT_RECIPE_MAP[e.id] || []).length;
                return `<div class="ing-item ${a ? "disabled" : ""}" onclick="toggleIngredient('${e.id}',this)">\n        <span class="ing-checkbox"></span>\n        <span class="ing-name">${e.name}${t ? ` <span style="color:var(--faint);font-size:10px">(${t})</span>` : ""}</span>\n      </div>`;
              })
              .join(""));
        }),
          updatePantryCounts());
      }
      function toggleIngredient(e, a) {
        (disabledIngredients.has(e) ? disabledIngredients.delete(e) : disabledIngredients.add(e),
          a.classList.toggle("disabled", disabledIngredients.has(e)),
          savePantry(),
          updatePantryCounts(),
          filterRecipes());
      }
      function pantrySelectAll() {
        (disabledIngredients.clear(),
          savePantry(),
          renderPantry(),
          filterRecipes());
      }
      function pantrySelectNone() {
        (Object.values(PANTRY_ITEMS)
          .flat()
          .forEach((e) => disabledIngredients.add(e.id)),
          savePantry(),
          renderPantry(),
          filterRecipes());
      }
      function switchTab(e, a) {
        (document.querySelectorAll(".nav-tab").forEach((e) => e.classList.remove("active")),
          a.classList.add("active"),
          document.querySelectorAll(".page").forEach((e) => e.classList.remove("active")),
          document.getElementById("page-" + e).classList.add("active"),
          "pantry" === e && (renderPantry(), buildDietaryGrid()),
          "nutrition" === e && switchNutView(_nutView),
          "randomizer" === e && renderRandomizer());
      }

      // The Nutrition tab holds two views (formerly separate tabs): the
      // carb/protein comparison and the full ingredient database.
      let _nutView = "compare";
      try { _nutView = localStorage.getItem("nutView") === "db" ? "db" : "compare"; } catch (e) {}
      function switchNutView(view) {
        _nutView = view === "db" ? "db" : "compare";
        try { localStorage.setItem("nutView", _nutView); } catch (e) {}
        document.querySelectorAll(".nut-switch-btn").forEach((b) => b.classList.toggle("active", b.dataset.view === _nutView));
        document.querySelectorAll(".nut-view").forEach((v) => v.classList.toggle("active", v.id === "nutview-" + _nutView));
        "db" === _nutView ? renderNutritionDB() : buildCompareTable();
      }

      let _nutdbData = null;
      let _nutdbSortCol = "name";
      let _nutdbSortDir = 1;
      let _nutdbQuery = "";
      let _nutdbActiveCats = new Set(NUTRITION_CATEGORIES.map((c) => c.id));

      const NUTDB_HIDDEN_ALIASES = new Set(["chicken", "egg"]); // pure internal aliases (== chicken_thigh/eggs), not distinct foods
      function _buildNutdbData() {
        if (_nutdbData) return;
        _nutdbData = Object.entries(NUTRITION_DB)
          .filter(([key]) => !NUTDB_HIDDEN_ALIASES.has(key))
          .map(([key, v]) => ({
          key,
          name: key.replace(/_/g, " "),
          kcal: v.kcal ?? null,
          p: v.p ?? null,
          c: v.c ?? null,
          f: v.f ?? null,
          category: v.category || "staples",
        }));
      }

      function nutdbFilter() {
        _nutdbQuery = document.getElementById("nutdbSearch").value.toLowerCase();
        _nutdbRender();
      }

      function nutdbToggleCategory(catId, btn) {
        if (_nutdbActiveCats.has(catId)) _nutdbActiveCats.delete(catId);
        else _nutdbActiveCats.add(catId);
        btn.classList.toggle("active", _nutdbActiveCats.has(catId));
        _nutdbRender();
      }

      function nutdbSort(col) {
        if (_nutdbSortCol === col) {
          _nutdbSortDir *= -1;
        } else {
          _nutdbSortCol = col;
          _nutdbSortDir = col === "name" ? 1 : -1;
        }
        _nutdbRender();
      }

      function renderNutritionDB() {
        _buildNutdbData();
        _nutdbRender();
      }

      function _nutdbRender() {
        _buildNutdbData();
        const q = _nutdbQuery;
        let rows = _nutdbData.filter((r) => _nutdbActiveCats.has(r.category) && (!q || r.name.includes(q)));
        rows.sort((a, b) => {
          if (_nutdbSortCol === "name") return _nutdbSortDir * a.name.localeCompare(b.name);
          const av = a[_nutdbSortCol] ?? -1;
          const bv = b[_nutdbSortCol] ?? -1;
          return _nutdbSortDir * (av - bv);
        });
        document.querySelectorAll("#nutdbTable thead th").forEach((th) => {
          const col = th.dataset.col;
          th.classList.toggle("sort-active", col === _nutdbSortCol);
          const arrow = th.querySelector(".sort-arrow");
          if (arrow) arrow.textContent = col !== _nutdbSortCol ? "↕" : _nutdbSortDir === 1 ? "↑" : "↓";
        });
        const fmt = (v) => (v == null ? "—" : v);
        document.getElementById("nutdbBody").innerHTML = rows
          .map(
            (r) =>
              `<tr><td class="nutdb-name">${r.name}</td><td>${fmt(r.kcal)}</td><td>${fmt(r.p)}</td><td>${fmt(r.c)}</td><td>${fmt(r.f)}</td></tr>`
          )
          .join("") || `<tr><td colspan="5" class="nutdb-empty">${_nutdbActiveCats.size ? "No ingredient matches your search." : "Select at least one category above."}</td></tr>`;
        document.getElementById("nutdbCount").textContent = rows.length + " ingredients";
      }

      // ─── Meal Randomizer ────────────────────────────────────────────────
      // Reuses the site's real filter predicates (dietBlocks / pantryBlocks) so
      // a recipe excluded by the dietary filters elsewhere is excluded here
      // too, instead of maintaining a second, divergent copy of that logic.
      const RAND_CUISINES = ["mediterranean", "american", "mexican", "korean", "japanese", "middle-eastern", "indian", "thai", "chinese", "greek"];
      let randActiveCuisines = new Set();
      // Every recipe declares its mealType as a list (breakfast | main | snack |
      // dip) — a dish can be both a breakfast and a main. Enforced by
      // tools/validate-recipes.js. Slots draw from "breakfast" and "main";
      // snacks and dips are never a standalone meal.
      function recipeIsMealType(r, type) {
        return (r.mealType || ["main"]).includes(type);
      }
      // RAND_SLOT_TYPES picks which candidate pool a slot draws from;
      // RAND_SLOT_DISPLAY_LABELS is just what it's called on screen — lunch
      // and dinner draw from the same "main" pool (the catalog doesn't
      // distinguish them) but are still separate, separately-sized slots.
      const RAND_SLOT_TYPES = ["breakfast", "main", "main", "main"];
      const RAND_SLOT_DISPLAY_LABELS = ["🍳 Breakfast", "🍽️ Lunch", "🍽️ Dinner", "🍽️ Extra"];
      let randSlots = [null, null, null, null];
      let randLocked = [false, false, false, false];
      let randUsedIds = new Set();

      function randCandidatePool(mealType) {
        return R.filter((r) => {
          if (!recipeIsMealType(r, mealType)) return false;
          if (randActiveCuisines.size && !r.tags.some((t) => randActiveCuisines.has(t))) return false;
          return !dietBlocks(r) && !pantryBlocks(r);
        });
      }

      function randPickOne(mealType, exclude, slotIndex) {
        const pool = randCandidatePool(mealType).filter((r) => !exclude.has(r.id));
        if (!pool.length) return null;
        if (slotIndex == null) return pool[Math.floor(Math.random() * pool.length)];

        // Portion-scaling solves protein/carb GRAMS to hit their share, but
        // fat — and, in dishes like burrito bowls where beans/rice/tortilla
        // ride along as "extras" rather than the templated carb base, a good
        // chunk of carbs too — is baked into the recipe's fixed ingredients
        // and can't be dialed down after the fact (see calcSauceMacros: it's
        // a fixed per-portion amount, not scaled by weight). So instead of
        // scoring fat alone, score by how close the recipe's TOTAL solved
        // kcal lands to this slot's kcal share — that catches overshoot from
        // ANY source (fat, hidden carbs, both) in one number.
        const shareTarget = randShareTargetFor(slotIndex);
        const scored = pool.map((r) => ({ r, kcal: randSolveRecipeAtShare(r, shareTarget).kcal }));

        // The goal decides which side of the share is acceptable: cutting
        // means the share is a ceiling (landing over it defeats the point of
        // a target at all), bulking means it's a floor (a surplus is the
        // goal), maintaining wants either direction as long as it's close.
        const goal = randGoal();
        let candidates;
        if (goal === "cut") {
          candidates = scored.filter((s) => s.kcal <= shareTarget.kcal);
          if (!candidates.length) {
            // Nothing fits under budget at all — closest-from-above beats
            // silently picking something even further over.
            scored.sort((a, b) => a.kcal - b.kcal);
            candidates = scored.slice(0, Math.max(3, Math.ceil(scored.length * 0.2)));
          }
        } else if (goal === "bulk") {
          candidates = scored.filter((s) => s.kcal >= shareTarget.kcal && s.kcal <= shareTarget.kcal * 1.3);
          if (!candidates.length) {
            // Nothing reaches the floor (a lean cuisine filter, say) —
            // closest-from-below beats a surplus goal landing short.
            scored.sort((a, b) => b.kcal - a.kcal);
            candidates = scored.slice(0, Math.max(3, Math.ceil(scored.length * 0.2)));
          }
        } else {
          const KCAL_TOLERANCE = 1.15; // allow 15% over this slot's kcal share before treating a candidate as "too much"
          candidates = scored.filter((s) => s.kcal <= shareTarget.kcal * KCAL_TOLERANCE);
          if (!candidates.length) {
            scored.sort((a, b) => a.kcal - b.kcal);
            candidates = scored.slice(0, Math.max(3, Math.ceil(scored.length * 0.2)));
          }
        }
        // Randomize among the qualifying candidates (not always literally
        // the single closest one) so rerolling still gives real variety.
        return candidates[Math.floor(Math.random() * candidates.length)].r;
      }

      // Each slot gets a share of the daily target (default: split evenly),
      // editable per card (the "bigger lunch, smaller dinner" case). The
      // recipe's protein/carb GRAMS are then solved — not just looked up at
      // some fixed global weight — so the card actually lands near its
      // share instead of always using whatever the last-viewed recipe's
      // weight happened to be. This mirrors the site's own per-recipe
      // auto-weight solver (protein floor first, then fill the carb/kcal
      // budget) — see solveAutoWeight() — just driven by this slot's share
      // of the day instead of a global macro-filter constraint.
      let randShares = [25, 25, 25, 25];
      const RAND_SHARE_MIN = 10, RAND_SHARE_MAX = 70;
      function randAdjustShare(i, delta) {
        // A bigger meal has to come out of another one: the day never plans
        // more than 100% of the target.
        const others = randShares.reduce((sum, v, k) => (k === i ? sum : sum + v), 0);
        const next = Math.max(RAND_SHARE_MIN, Math.min(RAND_SHARE_MAX, 100 - others, randShares[i] + delta));
        if (next === randShares[i]) return;
        randShares[i] = next;
        randSlots.forEach((_, k) => randRenderCard(k)); // other cards' + buttons depend on the total
        randRenderMacros();
      }

      // Solves ANY recipe's protein/carb grams against an arbitrary share
      // target — split out from randRecipeMacrosForSlot() so randPickOne()
      // can also use it to evaluate candidates BEFORE one lands in a slot
      // (see below: picking now weighs each candidate's resulting fat,
      // since fat is the one macro portioning can't fix after the fact).
      function randSolveRecipeAtShare(recipe, shareTarget) {
        const key = proteinKeyFor(recipe),
          pn = (key && NUTRITION_DB[key]) || ZERO_MACROS,
          cn = carbNutFor(recipe),
          fx = fixedMacros(recipe); // sauce + side egg — same fixed part the cards and modal use

        // Floors matter as much as the target here: a tight share can solve
        // to a technically-correct but uncookable "0g noodles" bolognese
        // when the recipe's fixed sauce alone already eats the whole carb
        // budget. AUTO_W.pgMin is the same floor the site's own per-recipe
        // solver uses; carbFloor is a smaller version of the same idea for
        // carbs specifically (0g carb is fine when the recipe HAS no carb,
        // never fine when it does).
        let pg = 0, eggs = null;
        if (key && pn.p > 0) {
          pg = Math.max(0, ((shareTarget.p - fx.p) * 100) / pn.p);
          pg = Math.min(Math.max(pg, AUTO_W.pgMin), PORTION_BOUNDS.protMax);
          if (key === "eggs") {
            // Eggs are cooked whole: round to a real count the modal can show.
            eggs = Math.max(1, Math.min(6, Math.round(pg / eggSizeG)));
            pg = eggs * eggSizeG;
          }
        }

        let cg = 0;
        if (cn && cn.c > 0) {
          const remainingCarb = shareTarget.c - fx.c - (pg * pn.c) / 100;
          const carbFloor = 15;
          cg = Math.min(Math.max((remainingCarb * 100) / cn.c, carbFloor), PORTION_BOUNDS.carbMax);
        }

        // Round the grams first, then compute macros from the rounded grams,
        // so the numbers on the card are exactly what the modal shows.
        pg = Math.round(pg);
        cg = Math.round(cg);
        const m = macrosForPortion(recipe, { key, pg, cg });
        return {
          kcal: Math.round(m.kcal),
          p: Math.round(m.p),
          c: Math.round(m.c),
          f: Math.round(m.f),
          pg,
          cg,
          eggs,
        };
      }

      // Open a Randomizer pick in the modal with the portion planned for its slot.
      function randOpen(i) {
        const r = randSlots[i];
        if (!r) return;
        const m = randRecipeMacrosForSlot(i);
        _portionOverride = { id: r.id, pg: m.pg, cg: m.cg, eggCount: m.eggs };
        openModal(r.id);
      }

      function randShareTargetFor(i) {
        const target = randTarget();
        const share = (randShares[i] || 0) / 100;
        return { kcal: target.kcal * share, p: target.p * share, c: target.c * share, f: target.f * share };
      }

      function randRecipeMacrosForSlot(i) {
        const recipe = randSlots[i];
        if (!recipe) return { kcal: 0, p: 0, c: 0, f: 0, pg: 0, cg: 0 };
        return randSolveRecipeAtShare(recipe, randShareTargetFor(i));
      }

      const RAND_TARGET_DEFAULT = { kcal: 2000, p: 160, c: 190, f: 60 };
      function randTarget() {
        try {
          return JSON.parse(localStorage.getItem("randTarget")) || RAND_TARGET_DEFAULT;
        } catch (e) {
          return RAND_TARGET_DEFAULT;
        }
      }

      // The goal changes which side of the target a candidate is allowed to
      // land on: cutting means the target is a ceiling (at or under —
      // finishing over it defeats the point of counting at all), bulking
      // means it's a floor (at or over is fine, that's the surplus), and
      // maintaining just wants to land close either way.
      function randGoal() {
        try {
          return localStorage.getItem("randGoal") || "maintain";
        } catch (e) {
          return "maintain";
        }
      }
      function randSetGoal(goal) {
        try { localStorage.setItem("randGoal", goal); } catch (e) {}
        randSyncGoalButtons();
        randRerollAll(); // re-pick unlocked slots now, under the new goal — otherwise switching goal does nothing until the next manual reroll
      }
      function randSyncGoalButtons() {
        const goal = randGoal();
        const map = { cut: "randGoalBtnCut", maintain: "randGoalBtnMaintain", bulk: "randGoalBtnBulk" };
        Object.entries(map).forEach(([g, id]) => {
          const btn = document.getElementById(id);
          btn && btn.classList.toggle("active", g === goal);
        });
      }
      function randUpdateTarget() {
        const t = {
          kcal: parseInt(document.getElementById("randTargetKcal").value) || 0,
          p: parseInt(document.getElementById("randTargetP").value) || 0,
          c: parseInt(document.getElementById("randTargetC").value) || 0,
          f: parseInt(document.getElementById("randTargetF").value) || 0,
        };
        try { localStorage.setItem("randTarget", JSON.stringify(t)); } catch (e) {}
        randSlots.forEach((_, i) => randRenderCard(i)); // portions are solved against the target, so cards go stale otherwise
        randRenderMacros();
      }

      function randRenderMacros() {
        const target = randTarget();
        const sums = { kcal: 0, p: 0, c: 0, f: 0 };
        randSlots.forEach((r, i) => {
          if (r) {
            const m = randRecipeMacrosForSlot(i);
            sums.kcal += m.kcal; sums.p += m.p; sums.c += m.c; sums.f += m.f;
          }
        });
        const shareEl = document.getElementById("randDayShare");
        shareEl && (shareEl.textContent = randSlots.reduce((sum, r, i) => (r ? sum + randShares[i] : sum), 0));
        const pct = (v, t) => (t > 0 ? Math.min(100, Math.round((v / t) * 100)) : 0);
        const grid = document.getElementById("randMacroGrid");
        if (!grid) return;
        const rows = [
          ["kcal", "Kcal", Math.round(sums.kcal), target.kcal, "var(--accent2)", ""],
          ["protein", "Protein", Math.round(sums.p), target.p, "var(--accent3)", "g"],
          ["carbs", "Carbs", Math.round(sums.c), target.c, "#47b3e8", "g"],
          ["fat", "Fat", Math.round(sums.f), target.f, "#e8a347", "g"],
        ];
        grid.innerHTML = rows
          .map(
            ([key, label, val, tgt, color, unit]) => `
          <div class="result-card ${key}">
            <span class="r-val">${val}</span><span class="r-unit">/ ${tgt}${unit}</span><span class="r-lbl">${label}</span>
            <div class="macro-bar" style="margin-top:8px;"><div style="height:100%; width:${pct(val, tgt)}%; background:${color}; border-radius:4px;"></div></div>
          </div>`
          )
          .join("");
      }

      function randCuisineToggle(id, btn) {
        (randActiveCuisines.has(id) ? randActiveCuisines.delete(id) : randActiveCuisines.add(id));
        btn.classList.toggle("active", randActiveCuisines.has(id));
        randRerollAll(); // apply the filter now, same as switching goal
      }

      function randBuildFilterChips() {
        const cEl = document.getElementById("randCuisineChips");
        if (cEl) {
          cEl.innerHTML = RAND_CUISINES.map(
            (c) => `<button class="filter-btn ${randActiveCuisines.has(c) ? "active" : ""}" onclick="randCuisineToggle('${c}', this)">${tagLabel(c)}</button>`
          ).join("");
        }
        const dEl = document.getElementById("randDietChips");
        if (dEl) {
          dEl.innerHTML = DIETARY_FILTERS.map(
            (d) => `<button class="filter-btn ${activeDietary.has(d.id) ? "active" : ""}" onclick="toggleDietary('${d.id}'); randBuildFilterChips(); randRerollAll();">${d.icon} ${d.label}</button>`
          ).join("");
        }
        const note = document.getElementById("randPantryNote");
        if (note) {
          const n = disabledIngredients.size;
          note.textContent = PANTRY_ENABLED && n ? `🧺 Respecting ${n} unavailable pantry item${n === 1 ? "" : "s"}` : "";
        }
      }

      function randRenderCard(i) {
        const el = document.getElementById("randSlot" + i);
        if (!el) return;
        const r = randSlots[i];
        const locked = randLocked[i];
        const slotLabel = RAND_SLOT_DISPLAY_LABELS[i];
        if (!r) {
          el.style.borderColor = "";
          el.style.background = "";
          el.innerHTML = `<div class="rand-card-top"><span class="rand-card-num">${slotLabel}</span></div><div class="rand-empty">No ${RAND_SLOT_TYPES[i]} recipe matches your filters</div>`;
          return;
        }
        const m = randRecipeMacrosForSlot(i);
        el.style.borderColor = locked ? "#47e8a3" : "";
        el.style.background = locked ? "rgba(71,232,163,0.06)" : "";
        el.innerHTML = `
        <div class="rand-card-top">
          <span class="rand-card-num">${slotLabel} · #${r.displayNum}</span>
          <span class="rand-card-btns">
            <button onclick="randReroll(${i})" ${locked ? "disabled style='opacity:.3'" : ""} title="Reroll">🎲</button>
            <button onclick="randToggleLock(${i})" title="Lock">${locked ? "🔒" : "🔓"}</button>
          </span>
        </div>
        <div class="card-title" style="cursor:pointer" onclick="randOpen(${i})">${r.title}</div>
        <div class="tags">${r.tags.slice(0, 2).map((t) => `<span class="tag tag-${t}">${tagLabel(t)}</span>`).join("")}</div>
        <div class="rand-card-macros">${m.kcal} kcal · ${m.p}g P · ${m.c}g C · ${m.f}g F</div>
        <div class="rand-card-portion">
          <span class="rand-portion-grams">${[m.eggs ? m.eggs + (m.eggs === 1 ? " egg" : " eggs") : m.pg ? m.pg + "g protein" : "", m.cg ? m.cg + "g carb" : ""].filter(Boolean).join(" · ") || "fixed portion"}</span>
          <span class="rand-portion-stepper">
            <button onclick="randAdjustShare(${i}, -5)" ${randShares[i] <= RAND_SHARE_MIN ? "disabled" : ""} title="Smaller portion">−</button>
            <span>${randShares[i]}% of day</span>
            <button onclick="randAdjustShare(${i}, 5)" ${randShares[i] >= RAND_SHARE_MAX || randShares.reduce((a, b) => a + b, 0) >= 100 ? "disabled" : ""} title="Bigger portion — shrink another meal first if the day is full">+</button>
          </span>
        </div>`;
      }

      function randReroll(i) {
        if (randLocked[i]) return;
        if (randSlots[i]) randUsedIds.delete(randSlots[i].id);
        const next = randPickOne(RAND_SLOT_TYPES[i], randUsedIds, i);
        randSlots[i] = next;
        if (next) randUsedIds.add(next.id);
        randRenderCard(i);
        randRenderMacros();
      }

      function randToggleLock(i) {
        randLocked[i] = !randLocked[i];
        randRenderCard(i);
        randRenderMacros();
      }

      function randRerollAll() {
        for (let i = 0; i < randSlots.length; i++) if (!randLocked[i]) randReroll(i);
      }

      function randResetLocks() {
        randLocked = randLocked.map(() => false);
        randSlots.forEach((_, i) => randRenderCard(i));
        randRenderMacros();
      }

      function renderRandomizer() {
        randBuildFilterChips();
        randSyncGoalButtons();
        const grid = document.getElementById("randGrid");
        if (grid && !grid.dataset.built) {
          grid.innerHTML = [0, 1, 2, 3].map((i) => `<div class="rand-card" id="randSlot${i}"></div>`).join("");
          grid.dataset.built = "1";
        }
        const t = randTarget();
        document.getElementById("randTargetKcal").value = t.kcal;
        document.getElementById("randTargetP").value = t.p;
        document.getElementById("randTargetC").value = t.c;
        document.getElementById("randTargetF").value = t.f;
        randUsedIds.clear();
        for (let i = 0; i < 4; i++) {
          if (!randSlots[i]) {
            const next = randPickOne(RAND_SLOT_TYPES[i], randUsedIds, i);
            randSlots[i] = next;
            if (next) randUsedIds.add(next.id);
          } else if (!randLocked[i] && !randCandidatePool(RAND_SLOT_TYPES[i]).some((r) => r.id === randSlots[i].id)) {
            // Pantry/diet settings changed since this pick — it no longer qualifies.
            const next = randPickOne(RAND_SLOT_TYPES[i], randUsedIds, i);
            randSlots[i] = next;
            if (next) randUsedIds.add(next.id);
          } else {
            randUsedIds.add(randSlots[i].id);
          }
          randRenderCard(i);
        }
        randRenderMacros();
      }

      let c2Goal = "fat_loss",
        c2Gender = "m",
        c2ActivityFactor = 1.375;
      // The last computed plan, so it can be handed to the Randomizer.
      let c2Plan = null;
      function _c2ResultsShown() {
        return document.getElementById("calc2Results").classList.contains("show");
      }
      function setGoal(e) {
        ((c2Goal = e),
          document.getElementById("goalFatLoss").classList.toggle("active", "fat_loss" === e),
          document.getElementById("goalMuscle").classList.toggle("active", "muscle" === e));
        _c2ResultsShown() && runCalc(true); // keep visible results in step with the selection
      }
      function setGender(e) {
        ((c2Gender = e),
          document.getElementById("genderM").classList.toggle("active", "m" === e),
          document.getElementById("genderF").classList.toggle("active", "f" === e));
        _c2ResultsShown() && runCalc(true);
      }
      function setActivity(e) {
        (document.querySelectorAll(".activity-opt").forEach((e) => e.classList.remove("active")),
          e.classList.add("active"),
          (c2ActivityFactor = parseFloat(e.dataset.factor)));
        _c2ResultsShown() && runCalc(true);
      }
      // Shows a validation message under the form instead of a browser alert.
      function _c2Error(msg) {
        const el = document.getElementById("calc2Error");
        el && ((el.textContent = msg || ""), (el.style.display = msg ? "block" : "none"));
      }
      const C2_FIELDS = [
        { id: "c2Age", label: "Age", min: 14, max: 90, unit: "years" },
        { id: "c2Weight", label: "Weight", min: 30, max: 300, unit: "kg" },
        { id: "c2Height", label: "Height", min: 100, max: 250, unit: "cm" },
      ];
      function _c2SaveInputs() {
        try {
          localStorage.setItem(
            "calcInputs",
            JSON.stringify({
              age: document.getElementById("c2Age").value,
              weight: document.getElementById("c2Weight").value,
              height: document.getElementById("c2Height").value,
              bf: document.getElementById("c2BF").value,
              goal: c2Goal,
              gender: c2Gender,
              activity: c2ActivityFactor,
            }),
          );
        } catch (e) {}
      }
      // Restore the visitor's last entries so the form isn't empty on every visit.
      function _c2RestoreInputs() {
        let d;
        try { d = JSON.parse(localStorage.getItem("calcInputs") || "null"); } catch (e) {}
        if (!d) return;
        [["c2Age", d.age], ["c2Weight", d.weight], ["c2Height", d.height], ["c2BF", d.bf]].forEach(([id, v]) => {
          const el = document.getElementById(id);
          el && v && (el.value = v);
        });
        (d.goal === "muscle" || d.goal === "fat_loss") && setGoal(d.goal);
        (d.gender === "m" || d.gender === "f") && setGender(d.gender);
        const act = [...document.querySelectorAll(".activity-opt")].find((o) => parseFloat(o.dataset.factor) === d.activity);
        act && setActivity(act);
      }
      // Hand the computed plan to the Randomizer as its daily target.
      function calcToRandomizer() {
        if (!c2Plan) return;
        try {
          localStorage.setItem("randTarget", JSON.stringify({ kcal: c2Plan.kcal, p: c2Plan.p, c: c2Plan.c, f: c2Plan.f }));
          localStorage.setItem("randGoal", "fat_loss" === c2Plan.goal ? "cut" : "bulk");
        } catch (e) {}
        randSlots = randSlots.map((r, i) => (randLocked[i] ? r : null)); // re-pick unlocked meals for the new target
        const tab = document.querySelector(`.nav-tab[onclick*="'randomizer'"]`);
        tab && switchTab("randomizer", tab);
        window.scrollTo(0, 0);
      }
      function runCalc(quiet) {
        const e = parseFloat(document.getElementById("c2Age").value),
          a = parseFloat(document.getElementById("c2Weight").value),
          t = parseFloat(document.getElementById("c2Height").value),
          i = parseFloat(document.getElementById("c2BF").value);
        const bad = C2_FIELDS.find((f) => {
          const v = parseFloat(document.getElementById(f.id).value);
          return isNaN(v) || v < f.min || v > f.max;
        });
        if (bad) {
          if (quiet) return;
          const empty = document.getElementById(bad.id).value === "";
          _c2Error(empty ? "Please fill in age, weight and height." : `${bad.label} must be between ${bad.min} and ${bad.max} ${bad.unit}.`);
          document.getElementById(bad.id).focus();
          return;
        }
        if (document.getElementById("c2BF").value !== "" && (isNaN(i) || i < 3 || i > 60)) {
          if (quiet) return;
          _c2Error("Body fat must be between 3 and 60 % — or leave it empty.");
          document.getElementById("c2BF").focus();
          return;
        }
        _c2Error("");
        _c2SaveInputs();
        let n;
        if (!isNaN(i) && i >= 3 && i <= 60) {
          n = 370 + 21.6 * (a * (1 - i / 100));
        } else n = "m" === c2Gender ? 10 * a + 6.25 * t - 5 * e + 5 : 10 * a + 6.25 * t - 5 * e - 161;
        const s = Math.round(n * c2ActivityFactor);
        let o, r, c, l;
        ((n = Math.round(n)),
          "fat_loss" === c2Goal
            ? ((o = Math.min(Math.round(0.2 * s), 700)),
              (r = s - o),
              (c = -Math.round(((7 * o) / 7700) * 10) / 10),
              (l = `−${o} kcal (deficit)`))
            : ((o = Math.round(0.12 * s)),
              (r = s + o),
              (c = Math.round(((7 * o) / 7700) * 10) / 10),
              (l = `+${o} kcal (surplus)`)));
        const d = "fat_loss" === c2Goal ? 2 : 1.8,
          m = Math.round(a * d),
          h = 4 * m,
          p = Math.round(0.25 * r),
          u = Math.round(p / 9),
          g = r - h - p,
          k = Math.round(g / 4);
        ((document.getElementById("rTDEE").textContent = s),
          (document.getElementById("rTarget").textContent = r),
          (document.getElementById("rProtein").textContent = m),
          (document.getElementById("rProtG").textContent = m),
          (document.getElementById("rProtKcal").textContent = h),
          (document.getElementById("rCarbG").textContent = Math.max(0, k)),
          (document.getElementById("rCarbKcal").textContent = Math.max(0, g)),
          (document.getElementById("rFatG").textContent = u),
          (document.getElementById("rFatKcal").textContent = p),
          (document.getElementById("rBMR").textContent = n + " kcal"),
          (document.getElementById("rTDEE2").textContent = s + " kcal"),
          (document.getElementById("rAdjust").textContent = l),
          (document.getElementById("rTarget2").textContent = r + " kcal"),
          (document.getElementById("rProtDetail").textContent = `${m}g (${d}g × ${a}kg)`));
        c2Plan = { kcal: r, p: m, c: Math.max(0, k), f: u, goal: c2Goal };
        const y = "fat_loss" === c2Goal ? "−" : "+",
          b = "fat_loss" === c2Goal ? "red" : "green",
          f = document.getElementById("rWeekly");
        ((f.textContent = `${y}${Math.abs(c)} kg/week`), (f.className = "rr-val " + b));
        document.getElementById("resultsGoalLabel").textContent = {
          fat_loss: "🔥 Fat Loss Plan",
          muscle: "💪 Muscle Gain Plan",
        }[c2Goal];
        const v = {
          fat_loss: `<strong>Fat Loss tip:</strong> At ${r} kcal/day you're in a ${o} kcal deficit — enough to lose roughly ${Math.abs(c)} kg/week without muscle loss. Hit your ${m}g protein target every day — it's the most important number on this page. The recipes in this vault are built for exactly this: high protein, controlled calories.`,
          muscle: `<strong>Muscle Gain tip:</strong> At ${r} kcal/day you're in a ${o} kcal surplus — a lean bulk that minimizes fat gain. Prioritize your ${m}g protein target and make sure you're training hard enough to use the extra calories for muscle. Expect roughly ${c} kg gained per week, mostly muscle.`,
        };
        ((document.getElementById("calc2Tip").innerHTML = v[c2Goal]),
          document.getElementById("calc2Results").classList.add("show"),
          quiet || document.getElementById("calc2Results").scrollIntoView({ behavior: "smooth", block: "start" }));
      }
      function setDipFilter(a) {
        dipFilter = !dipFilter;
        a.classList.toggle("active", dipFilter);
        const t = document.getElementById("pillCuisine");
        t && (dipFilter || spicyFilter || "all" !== currentCuisineFilter || "all" !== flavorFilter ? t.classList.add("has-active") : t.classList.remove("has-active"));
        filterRecipes();
      }
      function setSpicyFilter(a) {
        spicyFilter = !spicyFilter;
        a.classList.toggle("active", spicyFilter);
        const t = document.getElementById("pillCuisine");
        t && (spicyFilter || "all" !== currentCuisineFilter || "all" !== flavorFilter ? t.classList.add("has-active") : t.classList.remove("has-active"));
        filterRecipes();
      }
      function setFlavorFilter(e, a) {
        e === flavorFilter && (e = "all"); // clicking the active flavor switches it off
        ((flavorFilter = e),
          document
            .querySelectorAll(".filter-btn.sweet, .filter-btn.savory")
            .forEach((e) => e.classList.remove("active")),
          "all" !== e && a.classList.add("active"));
        const t = document.getElementById("pillCuisine");
        (t &&
          ("all" !== flavorFilter || "all" !== currentCuisineFilter
            ? t.classList.add("has-active")
            : t.classList.remove("has-active")),
          updatePillStates(),
          filterRecipes());
      }
      function calcSauceMacros(e) {
        const a = getRecipeDetail(e);
        if (!a || !a.ingredients) return { kcal: e.sauce_kcal, p: e.sauce_p, c: e.sauce_c, f: e.sauce_f };
        // Recipe ingredient amounts are per-portion by design — never divide by servings
        const t = 1;
        let i = 0, n = 0, s = 0, o = 0;
        a.ingredients.forEach((e) => {
          e.items.forEach((e) => {
            if (e.amt && (e.amt.includes("{{proteinG}}") || e.amt.includes("{{carbG}}") || e.amt.includes("{{eggCount}}"))) return;
            const a = e.id || findIngredientId(e.name);
            if (!a) return;
            const c = calcIngredientMacros(a, e.amt || "");
            if (c) { i += c.kcal / t; n += c.p / t; s += c.c / t; o += c.f / t; }
          });
        });
        // Always return calculated values — no hardcoded fallback
        return {
          kcal: Math.round(i),
          p: Math.round(10 * n) / 10,
          c: Math.round(10 * s) / 10,
          f: Math.round(10 * o) / 10,
        };
      }
      const _sauceMacroCache = {};
      function getSauceMacros(e) {
        const cacheKey = e.id;
        if (_sauceMacroCache[cacheKey]) return _sauceMacroCache[cacheKey];
        const a = calcSauceMacros(e);
        return ((_sauceMacroCache[cacheKey] = a), a);
      }
      function toggleIngMacro(e) {
        e.classList.toggle("open");
      }
      function toggleWeightRow(e) {
        const a = document.getElementById(e);
        a && a.classList.toggle("open");
      }
      const ING_NAME_MAP = {
        "soy sauce": "soy_sauce",
        "soy sauce (low-sodium)": "soy_sauce",
        "oyster sauce": "oyster_sauce",
        "fish sauce": "fish_sauce",
        hoisin: "hoisin",
        gochujang: "gochujang",
        miso: "miso",
        doenjang: "doenjang",
        teriyaki: "teriyaki",
        "sesame oil": "sesame_oil",
        sriracha: "sriracha",
        tahini: "tahini",
        harissa: "harissa",
        worcestershire: "worcestershire",
        ketchup: "ketchup",
        mayo: "mayo",
        mayonnaise: "mayo",
        "light mayo": "mayo_light",
        "light mayonnaise": "mayo_light",
        "mayo light": "mayo_light",
        "hot sauce": "hot_sauce",
        "peanut butter": "peanut_butter",
        "coconut milk": "coconut_milk",
        "rice vinegar": "rice_vinegar",
        "apple cider vinegar": "apple_cider_vinegar",
        mirin: "mirin",
        sake: "sake",
        toum: "toum",
        dijon: "dijon",
        "bbq sauce": "bbq_sauce",
        chipotle: "chipotle_adobo",
        ponzu: "ponzu",
        "shio koji": "shio_koji",
        "yuzu kosho": "yuzu_kosho",
        tamarind: "tamarind",
        balsamic: "balsamic_glaze",
        "chili oil": "chili_oil",
        gochugaru: "gochugaru",
        cumin: "cumin",
        coriander: "coriander",
        turmeric: "turmeric",
        "smoked paprika": "smoked_paprika",
        paprika: "paprika",
        "chili flakes": "chili_flakes",
        "red pepper flakes": "chili_flakes",
        "five spice": "five_spice",
        "5-spice": "five_spice",
        zaatar: "zaatar",
        "za'atar": "zaatar",
        sumac: "sumac",
        baharat: "baharat",
        "ras el hanout": "ras_el_hanout",
        "curry powder": "curry_powder",
        "garam masala": "garam_masala",
        tandoori: "tandoori_masala",
        "tikka paste": "tikka_paste",
        oregano: "oregano",
        thyme: "thyme",
        dill: "dill_dried",
        "bay leaf": "bay_leaf",
        cinnamon: "cinnamon",
        cardamom: "cardamom",
        "star anise": "star_anise",
        allspice: "allspice",
        "garlic powder": "garlic_powder",
        "onion powder": "onion_powder",
        cayenne: "cayenne",
        "black pepper": "black_pepper",
        pepper: "black_pepper",
        msg: "msg",
        saffron: "saffron",
        "jerk seasoning": "jerk_seasoning",
        dukkah: "dukkah",
        furikake: "furikake",
        tajin: "tajin",
        garlic: "garlic",
        "garlic clove": "garlic",
        "garlic (minced)": "garlic",
        ginger: "ginger",
        "spring onion": "scallion",
        scallion: "scallion",
        "green onion": "scallion",
        onion: "onion",
        lemon: "lemon",
        lime: "lime",
        cilantro: "cilantro",
        "coriander leaves": "cilantro",
        parsley: "parsley",
        basil: "basil",
        mint: "mint",
        rosemary: "rosemary",
        chives: "chives",
        "fresh dill": "dill_fresh",
        lemongrass: "lemongrass",
        "kaffir lime": "kaffir_lime",
        "thai basil": "thai_basil",
        pandan: "pandan",
        "fresh chili": "chili_fresh",
        chili: "chili_fresh",
        tomato: "tomato",
        cucumber: "cucumber",
        avocado: "avocado",
        "bell pepper": "bell_pepper",
        cabbage: "cabbage",
        carrot: "carrot",
        corn: "corn",
        leek: "leek",
        mushroom: "mushroom",
        spinach: "spinach",
        "bok choy": "bok_choy",
        kimchi: "kimchi",
        butter: "butter",
        egg: "eggs",
        eggs: "eggs",
        milk: "milk",
        "heavy cream": "heavy_cream",
        "sour cream": "sour_cream",
        "cream cheese": "cream_cheese",
        "crème fraîche": "creme_fraiche",
        "creme fraiche": "creme_fraiche",
        yogurt: "yogurt",
        labneh: "labneh",
        parmesan: "cheese_parm",
        mozzarella: "cheese_mozz",
        feta: "cheese_feta",
        cheddar: "cheese_cheddar",
        gruyere: "cheese_gruyere",
        provolone: "cheese_provolone",
        "olive oil": "olive_oil",
        "neutral oil": "neutral_oil",
        "cooking spray": "neutral_oil",
        "chicken broth": "chicken_stock",
        "chicken stock": "chicken_stock",
        "canned tomato": "canned_tomato",
        "crushed tomato": "canned_tomato",
        "tomato paste": "tomato_paste",
        "black beans": "black_beans",
        "kidney beans": "kidney_beans",
        "coconut cream": "coconut_cream",
        panko: "panko",
        breadcrumbs: "breadcrumbs",
        flour: "flour",
        cornstarch: "cornstarch",
        "corn starch": "cornstarch",
        honey: "honey",
        sugar: "sugar",
        "sesame seeds": "sesame_seeds",
        peanuts: "peanuts",
        almonds: "almonds",
        "pine nuts": "pine_nuts",
        raisins: "raisins",
        dashi: "dashi",
        "japanese curry": "japanese_curry_roux",
        "curry roux": "japanese_curry_roux",
        nori: "nori",
        "glass noodles": "glass_noodle",
        "rice paper": "rice_paper",
        pickled: "pickled_veg",
        "dried chili": "dried_chili",
        "pomegranate molasses": "pomegranate_mol",
        "preserved lemon": "preserved_lemon",
        broccoli: "broccoli",
        broccolini: "broccoli",
        cauliflower: "broccoli",
        zucchini: "zucchini",
        courgette: "zucchini",
        eggplant: "eggplant",
        aubergine: "eggplant",
        "bean sprouts": "bean_sprouts",
        "bean sprout": "bean_sprouts",
        "mung bean sprouts": "bean_sprouts",
        edamame: "edamame",
        "edamame (shelled, frozen)": "edamame",
        "edamame (shelled)": "edamame",
        "frozen edamame": "edamame",
        "snap peas": "snap_peas",
        "snow peas": "snap_peas",
        "sugar snap": "snap_peas",
        kale: "kale",
        "swiss chard": "kale",
        chard: "kale",
        lettuce: "lettuce",
        iceberg: "lettuce",
        romaine: "lettuce",
        arugula: "lettuce",
        rocket: "lettuce",
        daikon: "daikon",
        mooli: "daikon",
        jalapeño: "jalapeño",
        jalapeno: "jalapeño",
        serrano: "jalapeño",
        "red wine vinegar": "red_wine_vinegar",
        "sherry vinegar": "red_wine_vinegar",
        capers: "capers",
        "white wine": "white_wine",
        "dry white wine": "white_wine",
        "red wine": "white_wine",
        "curry paste": "curry_paste",
        "thai curry paste": "curry_paste",
        "massaman curry paste": "curry_paste",
        "green curry paste": "curry_paste",
        "red curry paste": "curry_paste",
        "tikka masala paste": "curry_paste",
        "potato (raw, unpeeled)": "potato",
        "potato (raw)": "potato",
        "potato (diced": "potato",
        "rice (dry)": "white_rice",
        "jasmine rice": "white_rice",
        "basmati rice": "white_rice",
        "jasmine / basmati rice": "white_rice",
        "short grain rice": "white_rice",
        "day-old cooked rice": "rice_cooked",
        "noodles / pasta": "noodle",
        noodles: "noodle",
        pasta: "noodle",
        "rice noodles": "noodle",
        "ramen noodles": "noodle",
        "wheat noodles": "noodle",
        "egg noodles": "noodle",
        "udon noodles": "noodle",
        "soba noodles": "noodle",
        "bread / flatbread": "bread",
        flatbread: "bread",
        wrap: "bread",
        "brioche buns": "bread",
        "bao buns": "bread",
        "steamed bao": "bread",
        "french baguette": "bread",
        pita: "bread",
        tortilla: "bread",
        "boneless skinless chicken thighs": "chicken_thigh",
        "chicken thighs": "chicken_thigh",
        "chicken breast": "chicken_breast",
        "chicken mince": "chicken_breast",
        "ground beef (lean)": "beef_lean",
        "lean ground": "beef_lean",
        "beef sirloin": "beef",
        "beef flank": "beef",
        "beef mince": "beef",
        "salmon fillet": "salmon",
        "salmon (skin": "salmon",
        "firm tofu": "tofu",
        "extra firm tofu": "tofu",
        "silken tofu": "tofu",
        "pomegranate seeds": "pomegranate_mol",
        pomegranate: "pomegranate_mol",
        "bean sprouts": "bok_choy",
        sprouts: "bok_choy",
        daikon: "pickled_veg",
        radish: "pickled_veg",
        jalapeño: "chili_fresh",
        jalapeno: "chili_fresh",
        serrano: "chili_fresh",
        edamame: "edamame",
        "snap peas": "bok_choy",
        "snow peas": "bok_choy",
        zucchini: "cucumber",
        courgette: "cucumber",
        eggplant: "bell_pepper",
        aubergine: "bell_pepper",
        broccoli: "bok_choy",
        cauliflower: "bok_choy",
        broccolini: "bok_choy",
        kale: "spinach",
        "swiss chard": "spinach",
        arugula: "spinach",
        rocket: "spinach",
        "iceberg lettuce": "spinach",
        romaine: "spinach",
        lettuce: "spinach",
        shallot: "onion",
        "red onion": "onion",
        "white onion": "onion",
        "cherry tomato": "tomato",
        "grape tomato": "tomato",
        "sun-dried tomato": "tomato",
        pear: "apple_cider_vinegar",
        "apple (grated)": "apple_cider_vinegar",
        "thai curry paste": "tikka_paste",
        "massaman curry paste": "tikka_paste",
        "green curry paste": "tikka_paste",
        "red curry paste": "tikka_paste",
        "tikka masala paste": "tikka_paste",
        "curry paste": "tikka_paste",
        "red wine vinegar": "apple_cider_vinegar",
        "white wine vinegar": "apple_cider_vinegar",
        "sherry vinegar": "apple_cider_vinegar",
        vinegar: "apple_cider_vinegar",
        capers: "pickled_veg",
        pickles: "pickled_veg",
        gherkins: "pickled_veg",
        "dry white wine": "sake",
        "white wine": "sake",
        "red wine": "sake",
        "beef stock": "chicken_stock",
        "vegetable stock": "chicken_stock",
        "water or stock": "chicken_stock",
        "chicken or vegetable stock": "chicken_stock",
        "beef broth": "chicken_stock",
        "vegetable broth": "chicken_stock",
        "american cheese": "cheese_cheddar",
        "cheese slices": "cheese_cheddar",
        velveeta: "cheese_cheddar",
        "cheese sauce": "cheese_cheddar",
        salt: "msg",
        "kosher salt": "msg",
        "sea salt": "msg",
        "flaky salt": "msg",
        "fresh herbs": "parsley",
        "mixed herbs": "parsley",
        herb: "parsley",
        water: "water",
        "hot water": "chicken_stock",
        banana: "banana",
        "banana (ripe)": "banana",
        "ripe banana": "banana",
        oats: "oats",
        "rolled oats": "oats",
        "oat flakes": "oats",
        "haferflocken": "oats",
        "dark chocolate chips": "chocolate_chips",
        "chocolate chips": "chocolate_chips",
        "milk chocolate chips": "chocolate_chips",
        "vollmilch-schokotropfen": "chocolate_chips",
        "schokotropfen": "chocolate_chips",
        "dark chocolate": "dark_chocolate",
        "whey protein": "whey_protein",
        "whey protein (chocolate)": "whey_protein",
        "chocolate whey": "whey_protein",
        "protein powder": "whey_protein",
        "almond milk": "almond_milk",
        "almond milk (unsweetened)": "almond_milk",
        "mandelmilch": "almond_milk",
        "vanilla extract": "vanilla_extract",
        "vanilla extract (sugar-free)": "vanilla_extract",
        "baking powder": "baking_powder",
        "backpulver": "baking_powder",
        couscous: "couscous",
        "couscous (dry)": "couscous",
        bulgur: "bulgur",
        "bulgur wheat (dry)": "bulgur",
        "bulgur wheat": "bulgur",
        "rice vermicelli": "rice_vermicelli",
        "rice vermicelli (dry)": "rice_vermicelli",
        "glass noodles": "glass_noodle",
        "frozen peas": "frozen_peas",
        "peas": "frozen_peas",
        "green olives": "green_olives",
        "green olives (sliced)": "green_olives",
        "kalamata olives": "black_olives",
        "kalamata olives (sliced)": "black_olives",
        "black olives": "black_olives",
        "olives": "green_olives",
        mustard: "mustard",
        "yellow mustard": "mustard",
        "pickle juice": "pickle_juice",
        berbere: "berbere",
        "berbere spice blend": "berbere",
        "bay leaves": "bay_leaves",
        "bay leaf": "bay_leaves",
        "curry leaves": "curry_leaves",
        "curry leaves (fresh or dried)": "curry_leaves",
        cloves: "cloves",
        "cloves (ground)": "cloves",
        "ground cloves": "cloves",
        "neutral cooking oil": "neutral_oil",
        "vegetable oil": "neutral_oil",
        "canola oil": "neutral_oil",
        "sunflower oil": "neutral_oil",
        "cooking oil": "neutral_oil",
        oil: "neutral_oil",
        "unsalted butter": "butter",
        "salted butter": "butter",
        "whole egg": "eggs",
        "egg yolk": "eggs",
        "egg white": "eggs",
        "light soy": "soy_sauce",
        "dark soy": "soy_sauce",
        tamari: "soy_sauce",
        "low-sodium soy": "soy_sauce",
        "spring roll wrapper": "rice_paper",
        "wonton wrapper": "rice_paper",
        "gyoza wrapper": "rice_paper",
        "dumpling wrapper": "rice_paper",
        quark: "quark_low_fat",
        magerquark: "quark_low_fat",
        "low-fat quark": "quark_low_fat",
        "quark (low-fat)": "quark_low_fat",
        skyr: "skyr",
        "icelandic yogurt": "skyr",
        "cottage cheese": "cottage_cheese",
        hüttenkäse: "cottage_cheese",
        ricotta: "ricotta",
        "ricotta cheese": "ricotta",
        tuna: "tuna_water",
        "canned tuna": "tuna_water",
        "tuna (canned)": "tuna_water",
        "tuna in water": "tuna_water",
        thunfisch: "tuna_water",
        shrimp: "shrimp",
        prawns: "shrimp",
        shrimps: "shrimp",
        garnelen: "shrimp",
        cod: "cod",
        kabeljau: "cod",
        "white fish": "cod",
        tilapia: "cod",
        "turkey mince": "turkey_mince",
        "ground turkey": "turkey_mince",
        turkey: "turkey_mince",
        putenhack: "turkey_mince",
        pute: "turkey_mince",
      };
      // Additional ingredient name mappings
      // === Protein / Meat ===
      ING_NAME_MAP["ground beef (20% fat)"] = "beef_regular";
      ING_NAME_MAP["ground beef (5% fat)"] = "beef_lean";
      ING_NAME_MAP["lean ground beef"] = "beef_lean";
      ING_NAME_MAP["lean ground beef (5% fat)"] = "beef_lean";
      ING_NAME_MAP["lean ground beef (95% lean)"] = "beef_lean";
      ING_NAME_MAP["chicken or anchovy broth"] = "chicken_stock";
      ING_NAME_MAP["ground turkey"] = "turkey_mince";
      ING_NAME_MAP["egg (whole)"] = "eggs";
      ING_NAME_MAP["egg (fried — optional)"] = "eggs";
      ING_NAME_MAP["eggs (whole)"] = "eggs";
      ING_NAME_MAP["whole eggs"] = "eggs";
      ING_NAME_MAP["soft-boiled egg"] = "eggs";
      ING_NAME_MAP["anchovy paste"] = "anchovy_paste";
      ING_NAME_MAP["anchovy paste (optional)"] = "anchovy_paste";
      // === Tofu / Dairy ===
      ING_NAME_MAP["silken or soft tofu"] = "tofu";
      ING_NAME_MAP["silken tofu"] = "tofu";
      ING_NAME_MAP["soft tofu"] = "tofu";
      ING_NAME_MAP["firm tofu"] = "tofu";
      ING_NAME_MAP["greek yogurt (0%)"] = "yoghurt_nonfat";
      ING_NAME_MAP["crème fraîche or greek yogurt (10%)"] = "creme_fraiche";
      ING_NAME_MAP["soy milk (unsweetened)"] = "soy_milk";
      // === Vegetables ===
      ING_NAME_MAP["pak choi"] = "bok_choy";
      ING_NAME_MAP["pak choi (halved)"] = "bok_choy";
      ING_NAME_MAP["bok choy (halved)"] = "bok_choy";
      ING_NAME_MAP["baby spinach"] = "spinach";
      ING_NAME_MAP["cabbage (roughly chopped)"] = "cabbage";
      ING_NAME_MAP["cabbage (thinly sliced)"] = "cabbage";
      ING_NAME_MAP["white cabbage (finely shredded)"] = "cabbage";
      ING_NAME_MAP["carrot (finely diced)"] = "carrot";
      ING_NAME_MAP["carrot (julienned)"] = "carrot";
      ING_NAME_MAP["shredded carrot"] = "carrot";
      ING_NAME_MAP["cucumber (diced)"] = "cucumber";
      ING_NAME_MAP["cucumber (grated, squeezed dry)"] = "cucumber";
      ING_NAME_MAP["cucumber (julienned)"] = "cucumber";
      ING_NAME_MAP["cucumber (sliced)"] = "cucumber";
      ING_NAME_MAP["cucumber (thinly sliced)"] = "cucumber";
      ING_NAME_MAP["daikon / white radish (julienned)"] = "daikon";
      ING_NAME_MAP["daikon radish (grated)"] = "daikon";
      ING_NAME_MAP["onion (diced)"] = "onion";
      ING_NAME_MAP["onion (finely diced)"] = "onion";
      ING_NAME_MAP["onion (finely grated)"] = "onion";
      ING_NAME_MAP["onion (grated)"] = "onion";
      ING_NAME_MAP["onion (thinly sliced)"] = "onion";
      ING_NAME_MAP["white onion (finely diced)"] = "onion";
      ING_NAME_MAP["red onion (diced)"] = "onion";
      ING_NAME_MAP["red onion (finely diced)"] = "onion";
      ING_NAME_MAP["red onion (thinly sliced)"] = "onion";
      ING_NAME_MAP["red onion (cut into wedges)"] = "onion";
      ING_NAME_MAP["shallot (finely diced)"] = "shallot";
      ING_NAME_MAP["shallot (minced)"] = "shallot";
      ING_NAME_MAP["shallots (finely diced)"] = "shallot";
      ING_NAME_MAP["shallots (thinly sliced)"] = "shallot";
      ING_NAME_MAP["fried shallots (optional)"] = "fried_shallots";
      ING_NAME_MAP["fried shallots"] = "fried_shallots";
      ING_NAME_MAP["tomato (diced)"] = "tomato";
      ING_NAME_MAP["tomatoes (diced)"] = "tomato";
      ING_NAME_MAP["tomatoes (cut into wedges)"] = "tomato";
      ING_NAME_MAP["fresh tomato (diced)"] = "tomato";
      ING_NAME_MAP["ripe tomatoes (large)"] = "tomato";
      ING_NAME_MAP["cherry tomatoes (halved)"] = "tomato";
      ING_NAME_MAP["cherry tomatoes (quartered)"] = "tomato";
      ING_NAME_MAP["tomatillos (canned or fresh)"] = "tomatillo";
      ING_NAME_MAP["potato (roasted)"] = "potato";
      ING_NAME_MAP["potato (cubed, boiled or roasted)"] = "potato";
      ING_NAME_MAP["potato (roasted or boiled)"] = "potato";
      ING_NAME_MAP["potatoes (cubed)"] = "potato";
      ING_NAME_MAP["waxy potatoes"] = "potato";
      ING_NAME_MAP["waxy potatoes (diced small)"] = "potato";
      ING_NAME_MAP["waxy potatoes (drillinge)"] = "potato";
      ING_NAME_MAP["baby potatoes (drillinge)"] = "potato";
      ING_NAME_MAP["baby potatoes"] = "potato";
      ING_NAME_MAP["large baking potatoes"] = "potato";
      ING_NAME_MAP["radishes (thinly sliced)"] = "radish";
      ING_NAME_MAP["radish"] = "radish";
      ING_NAME_MAP["jalapeño (deseeded)"] = "jalapeño";
      ING_NAME_MAP["jalapeño (optional)"] = "jalapeño";
      ING_NAME_MAP["jalapeño (pickled or fresh)"] = "jalapeño";
      ING_NAME_MAP["jalapeño (sliced)"] = "jalapeño";
      ING_NAME_MAP["jalapeño slices"] = "jalapeño";
      ING_NAME_MAP["red chili (deseeded, chopped)"] = "chili_fresh";
      ING_NAME_MAP["red chili (sliced)"] = "chili_fresh";
      ING_NAME_MAP["red chili (optional)"] = "chili_fresh";
      ING_NAME_MAP["thai red chili (sliced)"] = "chili_fresh";
      ING_NAME_MAP["chili (sliced)"] = "chili_fresh";
      ING_NAME_MAP["chili (sliced, optional)"] = "chili_fresh";
      ING_NAME_MAP["dried red chilis"] = "dried_chili"; // whole dried chili pods (~2g each), not ground flakes
      ING_NAME_MAP["green pepper (diced)"] = "bell_pepper";
      ING_NAME_MAP["red bell pepper (diced)"] = "bell_pepper";
      ING_NAME_MAP["red bell pepper (finely diced)"] = "bell_pepper";
      ING_NAME_MAP["red bell pepper (sliced)"] = "bell_pepper";
      ING_NAME_MAP["romaine lettuce (chopped)"] = "lettuce";
      ING_NAME_MAP["iceberg lettuce"] = "lettuce";
      ING_NAME_MAP["edamame (frozen, shelled)"] = "edamame";
      ING_NAME_MAP["steamed broccoli or edamame"] = "edamame";
      ING_NAME_MAP["canned corn (drained)"] = "corn";
      ING_NAME_MAP["frozen peas"] = "frozen_peas";
      // === Herbs & Spices ===
      ING_NAME_MAP["fresh basil"] = "basil";
      ING_NAME_MAP["fresh basil or parsley"] = "basil";
      ING_NAME_MAP["fresh thai basil"] = "thai_basil";
      ING_NAME_MAP["fresh thai basil (or regular basil)"] = "thai_basil";
      ING_NAME_MAP["fresh coriander"] = "cilantro";
      ING_NAME_MAP["fresh coriander (chopped)"] = "cilantro";
      ING_NAME_MAP["fresh coriander or parsley"] = "cilantro";
      ING_NAME_MAP["coriander (chopped)"] = "cilantro";
      ING_NAME_MAP["fresh mint"] = "mint";
      ING_NAME_MAP["fresh mint (chopped)"] = "mint";
      ING_NAME_MAP["fresh mint leaves"] = "mint";
      ING_NAME_MAP["fresh mint & coriander"] = "mint";
      ING_NAME_MAP["fresh dill or mint"] = "mint";
      ING_NAME_MAP["dried mint"] = "mint";
      ING_NAME_MAP["fresh parsley"] = "parsley";
      ING_NAME_MAP["fresh parsley (chopped)"] = "parsley";
      ING_NAME_MAP["fresh flat-leaf parsley"] = "parsley";
      ING_NAME_MAP["fresh flat-leaf parsley (chopped)"] = "parsley";
      ING_NAME_MAP["fresh flat-leaf parsley (finely chopped)"] = "parsley";
      ING_NAME_MAP["fresh parsley or chives"] = "parsley";
      ING_NAME_MAP["fresh parsley or coriander"] = "parsley";
      ING_NAME_MAP["fresh chives (chopped)"] = "chives";
      ING_NAME_MAP["fresh ginger (grated)"] = "ginger";
      ING_NAME_MAP["fresh ginger (sliced)"] = "ginger";
      ING_NAME_MAP["ginger (grated)"] = "ginger";
      ING_NAME_MAP["ginger slices"] = "ginger";
      ING_NAME_MAP["galangal powder (or extra ginger)"] = "galangal";
      ING_NAME_MAP["dried oregano"] = "oregano";
      ING_NAME_MAP["oregano (dried)"] = "oregano";
      ING_NAME_MAP["dried thyme"] = "thyme";
      ING_NAME_MAP["dried rosemary"] = "rosemary";
      ING_NAME_MAP["garlic (crushed)"] = "garlic";
      ING_NAME_MAP["garlic (minced)"] = "garlic";
      ING_NAME_MAP["garlic clove (minced)"] = "garlic";
      ING_NAME_MAP["garlic cloves (minced)"] = "garlic";
      ING_NAME_MAP["garlic cloves (crushed)"] = "garlic";
      ING_NAME_MAP["lemongrass (finely minced)"] = "lemongrass";
      ING_NAME_MAP["lemongrass (minced, inner stalk)"] = "lemongrass";
      ING_NAME_MAP["lemongrass stalks (finely minced)"] = "lemongrass";
      ING_NAME_MAP["white pepper"] = "white_pepper";
      ING_NAME_MAP["salt & white pepper"] = "white_pepper";
      ING_NAME_MAP["coriander (ground)"] = "coriander";
      ING_NAME_MAP["cumin (ground)"] = "cumin";
      ING_NAME_MAP["cinnamon (ground)"] = "cinnamon";
      ING_NAME_MAP["cinnamon stick"] = "cinnamon";
      ING_NAME_MAP["gochujang paste"] = "gochujang";
      ING_NAME_MAP["gochugaru (chili flakes)"] = "gochugaru";
      ING_NAME_MAP["gochugaru (korean chili flakes)"] = "gochugaru";
      ING_NAME_MAP["gochugaru or chili flakes"] = "gochugaru";
      ING_NAME_MAP["harissa paste"] = "harissa";
      ING_NAME_MAP["chipotle paste"] = "chipotle_adobo";
      ING_NAME_MAP["chipotle paste or smoked paprika"] = "chipotle_adobo";
      ING_NAME_MAP["doubanjiang"] = "doubanjiang";
      ING_NAME_MAP["doubanjiang (spicy bean paste)"] = "doubanjiang";
      ING_NAME_MAP["doubanjiang (or chili paste)"] = "doubanjiang";
      ING_NAME_MAP["five-spice powder"] = "five_spice";
      ING_NAME_MAP["five spice powder"] = "five_spice";
      ING_NAME_MAP["za'atar or mixed herbs"] = "zaatar";
      // === Sauces & Condiments ===
      ING_NAME_MAP["hoisin sauce (optional)"] = "hoisin";
      ING_NAME_MAP["sriracha (optional)"] = "sriracha";
      ING_NAME_MAP["sriracha or spicy mayo"] = "sriracha";
      ING_NAME_MAP["hot sauce (optional)"] = "hot_sauce";
      ING_NAME_MAP["dijon mustard"] = "dijon";
      ING_NAME_MAP["mustard"] = "dijon";
      ING_NAME_MAP["mayonnaise (light)"] = "mayo_light";
      ING_NAME_MAP["light mayonnaise"] = "mayo_light";
      ING_NAME_MAP["white miso paste"] = "miso";
      ING_NAME_MAP["dashi powder (dissolved in 1 tbsp water)"] = "dashi";
      ING_NAME_MAP["worcestershire sauce"] = "worcestershire";
      ING_NAME_MAP["pickle juice"] = "pickle_juice";
      ING_NAME_MAP["gherkins / pickles"] = "gherkins";
      ING_NAME_MAP["gherkins"] = "gherkins";
      ING_NAME_MAP["pickled ginger"] = "pickled_veg";
      ING_NAME_MAP["pickled ginger (beni shōga)"] = "pickled_veg";
      ING_NAME_MAP["kimchi (optional)"] = "kimchi";
      ING_NAME_MAP["kimchi (store-bought)"] = "kimchi";
      // === Citrus ===
      ING_NAME_MAP["lemon juice"] = "lemon";
      ING_NAME_MAP["lemon wedge"] = "lemon";
      ING_NAME_MAP["lemon zest"] = "lemon";
      ING_NAME_MAP["lemon (zest + juice)"] = "lemon";
      ING_NAME_MAP["lime juice"] = "lime";
      ING_NAME_MAP["lime juice (for crema)"] = "lime";
      ING_NAME_MAP["lime juice (for rice)"] = "lime";
      ING_NAME_MAP["lime wedge"] = "lime";
      ING_NAME_MAP["lime wedges"] = "lime";
      // === Bread / Carbs ===
      ING_NAME_MAP["naan bread"] = "naan";
      ING_NAME_MAP["naan"] = "naan";
      ING_NAME_MAP["flatbread / fladenbrot"] = "naan";
      ING_NAME_MAP["flatbread or pitta"] = "naan";
      ING_NAME_MAP["turkish flatbread (yufka or thin pide)"] = "naan";
      ING_NAME_MAP["sourdough bread (thick slices)"] = "bread";
      ING_NAME_MAP["sourdough or crusty bread"] = "bread";
      ING_NAME_MAP["baguette or sandwich roll"] = "bread";
      ING_NAME_MAP["brioche burger buns"] = "bread";
      ING_NAME_MAP["large wheat tortilla wraps"] = "tortilla";
      ING_NAME_MAP["whole wheat tortilla wraps"] = "tortilla";
      ING_NAME_MAP["small corn or wheat tortillas"] = "tortilla";
      ING_NAME_MAP["large wheat tortilla"] = "tortilla";
      ING_NAME_MAP["plain flour"] = "flour";
      ING_NAME_MAP["panko breadcrumbs"] = "panko";
      ING_NAME_MAP["rigatoni or penne pasta (dry)"] = "pasta";
      ING_NAME_MAP["egg noodles (dry)"] = "noodle";
      ING_NAME_MAP["thick wheat noodles (dry)"] = "noodle";
      ING_NAME_MAP["short-grain rice (uncooked)"] = "white_rice";
      ING_NAME_MAP["short grain rice (dry)"] = "white_rice";
      ING_NAME_MAP["short grain japanese rice (dry)"] = "white_rice";
      // === Other ===
      ING_NAME_MAP["brown sugar"] = "brown_sugar";
      ING_NAME_MAP["rice_cooked"] = "rice_cooked";
      ING_NAME_MAP["day-old jasmine rice (cooked)"] = "rice_cooked";
      ING_NAME_MAP["cooked jasmine rice"] = "rice_cooked";
      ING_NAME_MAP["cooked rice"] = "rice_cooked";
      ING_NAME_MAP["day-old rice"] = "rice_cooked";
      ING_NAME_MAP["nori sheets (optional)"] = "nori";
      ING_NAME_MAP["canned chopped tomatoes"] = "canned_tomato";
      ING_NAME_MAP["canned crushed tomatoes"] = "canned_tomato";
      ING_NAME_MAP["parmesan (grated)"] = "cheese_parm";
      ING_NAME_MAP["parmesan (for serving)"] = "cheese_parm";
      ING_NAME_MAP["cheese (parmesan)"] = "cheese_parm";
      ING_NAME_MAP["cheddar cheese (grated)"] = "cheese_cheddar";
      ING_NAME_MAP["cheddar or gouda slices"] = "cheese_cheddar";
      ING_NAME_MAP["feta cheese (crumbled)"] = "cheese_feta";
      ING_NAME_MAP["pine nuts"] = "pine_nuts";
      ING_NAME_MAP["roasted peanuts"] = "peanuts";
      ING_NAME_MAP["crushed roasted peanuts"] = "peanuts";
      ING_NAME_MAP["peanuts"] = "peanuts";
      ING_NAME_MAP["kalamata olives (optional)"] = "black_olives";
      ING_NAME_MAP["kalamata olives (sliced)"] = "black_olives";
      ING_NAME_MAP["green olives (sliced)"] = "green_olives";
      // === Missing mappings (audit fix) ===
      ING_NAME_MAP["canned white beans (cannellini)"] = "white_beans";
      ING_NAME_MAP["white beans"] = "white_beans";
      ING_NAME_MAP["cannellini beans"] = "white_beans";
      ING_NAME_MAP["caraway seeds"] = "caraway_seeds";
      ING_NAME_MAP["cashews (raw)"] = "cashews";
      ING_NAME_MAP["cashews"] = "cashews";
      ING_NAME_MAP["crusty sourdough or ciabatta"] = "bread";
      ING_NAME_MAP["sourdough or crusty bread"] = "bread";
      ING_NAME_MAP["geflügel-nürnberger sausages"] = "chicken_sausage";
      ING_NAME_MAP["nürnberger"] = "chicken_sausage";
      ING_NAME_MAP["ground beef (15% fat)"] = "beef_regular";
      ING_NAME_MAP["orange juice"] = "orange_juice";
      ING_NAME_MAP["pickle brine"] = "pickled_veg";
      ING_NAME_MAP["rigatoni or spaghetti (dry)"] = "noodle";
      ING_NAME_MAP["rigatoni or spaghetti"] = "noodle";
      ING_NAME_MAP["spaghetti or linguine (dry)"] = "noodle";
      ING_NAME_MAP["spaghetti or linguine"] = "noodle";
      ING_NAME_MAP["roti or chapati (store-bought)"] = "bread";
      ING_NAME_MAP["roti or chapati"] = "bread";
      ING_NAME_MAP["salsa or pico de gallo"] = "canned_tomato";
      ING_NAME_MAP["salsa roja (jarred)"] = "canned_tomato";
      ING_NAME_MAP["pico de gallo"] = "canned_tomato";
      ING_NAME_MAP["low-fat quark (magerquark)"] = "quark_low_fat";
      ING_NAME_MAP["yoghurt (0% fat)"] = "yoghurt_nonfat";
      ING_NAME_MAP["yoghurt"] = "yoghurt_nonfat";
      ING_NAME_MAP["baking potato"] = "potato";
      ING_NAME_MAP["smoked bacon lardons"] = "smoked_bacon";
      ING_NAME_MAP["bacon lardons"] = "smoked_bacon";
      ING_NAME_MAP["smoked bacon"] = "smoked_bacon";
      // === Coverage check fixes (2026-09) — closes remaining silent-drop gaps ===
      ING_NAME_MAP["toasted rice powder"] = "flour"; // near-identical macros to rice, but "flour" has tsp/tbsp units defined — this is used a teaspoon at a time, not by the 100g+ "rice" typically means
      ING_NAME_MAP["celery"] = "celery";
      ING_NAME_MAP["celery stalks"] = "celery";
      ING_NAME_MAP["apple"] = "apple";
      ING_NAME_MAP["orange"] = "orange";
      ING_NAME_MAP["mixed salad leaves"] = "lettuce";
      ING_NAME_MAP["salad leaves"] = "lettuce";
      ING_NAME_MAP["piri piri sauce"] = "hot_sauce"; // closest chili-sauce proxy, no dedicated entry
      ING_NAME_MAP["gouda"] = "cheese_cheddar"; // closest semi-hard cheese proxy, no dedicated entry

		function findIngredientId(e) {                             
        if (!e) return null;
        const a = e.toLowerCase().trim();
        if (ING_NAME_MAP[a]) return ING_NAME_MAP[a];
        let t = null,
          i = 0;
        for (const [e, n] of Object.entries(ING_NAME_MAP)) a.includes(e) && e.length > i && ((t = n), (i = e.length));
        return t;
      }

		function buildIngredientRecipeMap() {
        // Auto-builds INGREDIENT_RECIPE_MAP from RECIPE_DETAILS at runtime
        // No manual maintenance needed — filters always match actual recipe ingredients
        if (typeof RECIPE_DETAILS === "undefined") return;
        Object.entries(RECIPE_DETAILS).forEach(([recipeId, detail]) => {
          if (!detail.ingredients) return;
          detail.ingredients.forEach(section => {
            (section.items || []).forEach(item => {
              const ingId = findIngredientId(item.name);
              if (!ingId) return;
              (RECIPE_INGREDIENT_IDS[recipeId] || (RECIPE_INGREDIENT_IDS[recipeId] = new Set())).add(ingId);
              if (!INGREDIENT_RECIPE_MAP[ingId]) INGREDIENT_RECIPE_MAP[ingId] = [];
              if (!INGREDIENT_RECIPE_MAP[ingId].includes(recipeId)) {
                INGREDIENT_RECIPE_MAP[ingId].push(recipeId);
              }
            });
          });
        });
        // Rebuild ALCOHOL_RECIPE_IDS based on updated map
        ALCOHOL_RECIPE_IDS.clear();
        [...(INGREDIENT_RECIPE_MAP.sake || []),
         ...(INGREDIENT_RECIPE_MAP.mirin || []),
         ...(INGREDIENT_RECIPE_MAP.white_wine || [])
        ].forEach(id => ALCOHOL_RECIPE_IDS.add(id));
        // Rebuild SPICY_RECIPE_IDS from recipe tags
        SPICY_RECIPE_IDS.clear();
        R.forEach(r => { if (r.tags && r.tags.includes("spicy")) SPICY_RECIPE_IDS.add(r.id); });
        DIP_RECIPE_IDS.clear();
        R.forEach(r => { if (r.tags && r.tags.includes("dip")) DIP_RECIPE_IDS.add(r.id); });
        // Auto-inject ingredient-based tags into recipe cards at runtime
        // Maps tag name → ingredient IDs that trigger it
        const INGREDIENT_AUTO_TAGS = {
          "beef":   ["beef_lean", "beef_regular"],
          "eggs":   ["eggs"],
          "fish":   ["salmon", "tuna_canned", "tuna_water", "cod", "anchovy_paste"],
          "shrimp": ["shrimp"],
          "tofu":   ["tofu"],
          "cheese": ["cheese_parm", "cheese_cheddar", "cheese_feta", "cheese_mozzarella", "cheese_gouda"],
          "turkey": ["turkey_mince"],
          "pork":   ["pork_tenderloin"],
        };
        Object.entries(INGREDIENT_AUTO_TAGS).forEach(([tag, ingIds]) => {
          ingIds.forEach(ingId => {
            (INGREDIENT_RECIPE_MAP[ingId] || []).forEach(recipeId => {
              const recipe = R.find(r => r.id === recipeId);
              if (recipe && !recipe.tags.includes(tag)) recipe.tags.push(tag);
            });
          });
        });
      }

      let compareSortKey = "default",
        compareSortDir = {};
      function setCompareSort(e) {
        (compareSortKey === e && "default" !== e
          ? (compareSortDir[e] = "asc" === compareSortDir[e] ? "desc" : "asc")
          : ((compareSortKey = e), compareSortDir[e] || (compareSortDir[e] = "satiety" === e ? "desc" : "asc")),
          document.querySelectorAll(".csort-btn").forEach((a) => {
            const t = a.dataset.sort === e;
            a.classList.toggle("active", t);
            const i = a.querySelector(".csort-arrow");
            i && (i.textContent = t ? ("asc" === compareSortDir[e] ? "↑" : "↓") : "↕");
          }),
          buildCompareTable());
      }
      function sortCompareData(e) {
        if ("default" === compareSortKey) return [...e];
        const a = "asc" === compareSortDir[compareSortKey] ? 1 : -1;
        return [...e].sort((e, t) => (e[compareSortKey] - t[compareSortKey]) * a);
      }
      const CARB_COMPARE = [
          {
            key: "potato",
            name: "Potato",
            icon: "🥔",
            sub: "raw, unpeeled",
            kcal: 77,
            p: 2,
            c: 17,
            f: 0.1,
            fiber: 2.2,
            gi: 65,
            giLabel: "med",
            satiety: 4,
            best: "Volume & fullness",
          },
          {
            key: "sweet_potato",
            name: "Sweet Potato",
            icon: "🍠",
            sub: "raw, unpeeled",
            kcal: 86,
            p: 1.6,
            c: 20,
            f: 0.1,
            fiber: 3,
            gi: 54,
            giLabel: "med",
            satiety: 4,
            best: "Micronutrients & fiber",
          },
          {
            key: "rice",
            name: "White Rice",
            icon: "🍚",
            sub: "white, dry weight",
            kcal: 365,
            p: 7.1,
            c: 80,
            f: 0.7,
            fiber: 0.4,
            gi: 73,
            giLabel: "high",
            satiety: 2,
            best: "Quick energy",
          },
          {
            key: "noodle",
            name: "Egg Noodle",
            icon: "🍜",
            sub: "egg noodle, dry weight",
            kcal: 357,
            p: 13,
            c: 71,
            f: 1.5,
            fiber: 2.1,
            gi: 55,
            giLabel: "med",
            satiety: 3,
            best: "Higher protein carb",
          },
          {
            key: "pasta",
            name: "Pasta",
            icon: "🍝",
            sub: "durum wheat, dry weight",
            kcal: 357,
            p: 13,
            c: 71,
            f: 1.5,
            fiber: 2.7,
            gi: 50,
            giLabel: "med",
            satiety: 3,
            best: "Protein-rich carb",
          },
          {
            key: "bread",
            name: "White Bread",
            icon: "🫓",
            sub: "white wheat, baked",
            kcal: 265,
            p: 9,
            c: 51,
            f: 3.2,
            fiber: 2.7,
            gi: 70,
            giLabel: "high",
            satiety: 3,
            best: "Convenience & portability",
          },
          {
            key: "tortilla",
            name: "Tortilla",
            icon: "🌯",
            sub: "flour tortilla, baked",
            kcal: 312,
            p: 8,
            c: 51,
            f: 8,
            fiber: 2.4,
            gi: 52,
            giLabel: "med",
            satiety: 3,
            best: "Wraps & bowls",
          },
          {
            key: "oats",
            name: "Oats",
            icon: "🌾",
            sub: "rolled oats, dry weight",
            kcal: 389,
            p: 17,
            c: 66,
            f: 7,
            fiber: 10.6,
            gi: 55,
            giLabel: "med",
            satiety: 5,
            best: "Best satiety & fiber",
          },
          {
            key: "quinoa",
            name: "Quinoa",
            icon: "🌱",
            sub: "dry weight",
            kcal: 368,
            p: 14,
            c: 64,
            f: 6,
            fiber: 7,
            gi: 53,
            giLabel: "med",
            satiety: 4,
            best: "Complete protein carb",
          },
        ],
        PROTEIN_COMPARE = [
          {
            key: "chicken",
            name: "Chicken Thigh",
            icon: "🍗",
            sub: "boneless, skinless, raw",
            kcal: 149,
            p: 18.6,
            c: 0,
            f: 7.92,
            satiety: 4,
            best: "Flavor & moisture",
          },
          {
            key: "chicken_breast",
            name: "Chicken Breast",
            icon: "🍗",
            sub: "boneless, skinless, raw",
            kcal: 112,
            p: 22.5,
            c: 0,
            f: 1.93,
            satiety: 5,
            best: "Leanest protein",
          },
          {
            key: "beef",
            name: "Beef (Regular)",
            icon: "🥩",
            sub: "ground beef ~20% fat, raw",
            kcal: 248,
            p: 17.5,
            c: 0,
            f: 19.4,
            satiety: 4,
            best: "Flavor & iron",
          },
          {
            key: "beef_lean",
            name: "Beef (Lean)",
            icon: "🥩",
            sub: "ground beef ~5% fat, raw",
            kcal: 137,
            p: 21.4,
            c: 0,
            f: 5.5,
            satiety: 4,
            best: "Lean + high protein",
          },
          {
            key: "steak_ribeye",
            name: "Steak (Ribeye)",
            icon: "🥩",
            sub: "raw, bone-out",
            kcal: 270,
            p: 21,
            c: 0,
            f: 21,
            satiety: 4,
            best: "Flavor & richness",
          },
          {
            key: "steak_sirloin",
            name: "Steak (Sirloin)",
            icon: "🥩",
            sub: "raw, trimmed",
            kcal: 175,
            p: 26,
            c: 0,
            f: 8,
            satiety: 4,
            best: "Lean & high protein",
          },
          {
            key: "steak_flank",
            name: "Steak (Flank)",
            icon: "🥩",
            sub: "raw, trimmed",
            kcal: 160,
            p: 27,
            c: 0,
            f: 5,
            satiety: 4,
            best: "Very lean, stir-fry",
          },
          {
            key: "eggs",
            name: "Eggs",
            icon: "🥚",
            sub: "whole egg, raw (~58g each)",
            kcal: 147,
            p: 12.4,
            c: 0.96,
            f: 9.96,
            satiety: 4,
            best: "Micronutrients & versatility",
          },
          {
            key: "salmon",
            name: "Salmon",
            icon: "🐟",
            sub: "atlantic salmon, raw",
            kcal: 208,
            p: 20,
            c: 0,
            f: 13,
            satiety: 4,
            best: "Omega-3 & heart health",
          },
          {
            key: "tofu",
            name: "Tofu",
            icon: "🫘",
            sub: "firm tofu",
            kcal: 144,
            p: 17.3,
            c: 2.78,
            f: 8.72,
            satiety: 3,
            best: "Plant-based option",
          },
          {
            key: "edamame",
            name: "Edamame",
            icon: "🫘",
            sub: "shelled, frozen, per 100g",
            kcal: 109,
            p: 11.2,
            c: 7.61,
            f: 4.73,
            satiety: 4,
            best: "Plant protein + fiber",
          },
          {
            key: "tuna",
            name: "Tuna (Canned)",
            icon: "🐟",
            sub: "in water, drained",
            kcal: 116,
            p: 25.5,
            c: 0,
            f: 1.0,
            satiety: 3,
            best: "Leanest protein, no cook",
          },
          {
            key: "shrimp",
            name: "Shrimp",
            icon: "🦐",
            sub: "raw, peeled",
            kcal: 85,
            p: 18.0,
            c: 0.2,
            f: 0.9,
            satiety: 3,
            best: "Ultra-lean, fast to cook",
          },
          {
            key: "cod",
            name: "Cod",
            icon: "🐟",
            sub: "raw fillet",
            kcal: 82,
            p: 17.8,
            c: 0,
            f: 0.7,
            satiety: 3,
            best: "Leanest white fish",
          },
          {
            key: "turkey_mince",
            name: "Turkey Mince",
            icon: "🦃",
            sub: "lean, raw",
            kcal: 114,
            p: 22.0,
            c: 0,
            f: 2.7,
            satiety: 4,
            best: "Lean beef alternative",
          },
          {
            key: "cottage_cheese",
            name: "Cottage Cheese",
            icon: "🧀",
            sub: "low-fat",
            kcal: 72,
            p: 12.4,
            c: 2.7,
            f: 1.0,
            satiety: 3,
            best: "High protein, low cal",
          },
          {
            key: "skyr",
            name: "Skyr",
            icon: "🥛",
            sub: "plain, 0% fat",
            kcal: 63,
            p: 11.0,
            c: 4.0,
            f: 0.2,
            satiety: 3,
            best: "Creamy, gut-friendly",
          },
          {
            key: "quark",
            name: "Quark (Low-Fat)",
            icon: "🥛",
            sub: "Magerquark",
            kcal: 67,
            p: 12.0,
            c: 4.0,
            f: 0.2,
            satiety: 3,
            best: "High protein, German staple",
          },
        ];
      function buildCompareTable() {
        const e = { low: "gi-low", med: "gi-med", high: "gi-high" },
          a = { low: "Low GI", med: "Med GI", high: "High GI" };
        function t(e) {
          return [1, 2, 3, 4, 5].map((a) => `<div class="satiety-dot ${a <= e ? "on" : ""}"></div>`).join("");
        }
        const i = document.getElementById("carbCards");
        if (!i) return;
        i.innerHTML = sortCompareData(CARB_COMPARE)
          .map(
            (i) =>
              `\n    <div class="ccard c-${i.key}">\n      <div class="ccard-name">${i.icon} ${i.name}</div>\n      <div class="ccard-sub">${i.sub}</div>\n      <div class="ccard-macros">\n        <div class="ccard-macro mk"><span class="mv">${i.kcal}</span><span class="ml">kcal</span></div>\n        <div class="ccard-macro mp"><span class="mv">${i.p}g</span><span class="ml">protein</span></div>\n        <div class="ccard-macro mc"><span class="mv">${i.c}g</span><span class="ml">carbs</span></div>\n        <div class="ccard-macro mf"><span class="mv">${i.f}g</span><span class="ml">fat</span></div>\n      </div>\n      <div class="ccard-meta">\n        <div class="satiety-dots">${t(i.satiety)}</div>\n        <span class="satiety-label">Saturation</span>\n        <span class="gi-badge ${e[i.giLabel]}">${a[i.giLabel]}</span>\n        <span class="best-tag">${i.best}</span>\n      </div>\n    </div>\n  `,
          )
          .join("");
        const n = document.getElementById("proteinCards");
        n &&
          (n.innerHTML = sortCompareData(PROTEIN_COMPARE)
            .map((e) => {
              const a = 4 * e.p + 4 * e.c + 9 * e.f,
                i = a > 0 ? Math.round(((4 * e.p) / a) * 100) : 0;
              return `\n    <div class="ccard c-${e.key}">\n      <div class="ccard-name">${e.icon} ${e.name}</div>\n      <div class="ccard-sub">${e.sub}</div>\n      <div class="ccard-macros">\n        <div class="ccard-macro mk"><span class="mv">${e.kcal}</span><span class="ml">kcal</span></div>\n        <div class="ccard-macro mp"><span class="mv">${e.p}g</span><span class="ml">protein</span></div>\n        <div class="ccard-macro mc"><span class="mv">${e.c}g</span><span class="ml">carbs</span></div>\n        <div class="ccard-macro mf"><span class="mv">${e.f}g</span><span class="ml">fat</span></div>\n      </div>\n      <div class="ccard-meta">\n        <div class="satiety-dots">${t(e.satiety)}</div>\n        <span class="satiety-label">Saturation</span>\n        <span class="pct-badge" title="% of total calories from protein">${i}% of kcal from protein</span>\n        <span class="best-tag">${e.best}</span>\n      </div>\n    </div>\n  `;
            })
            .join(""));
      }
      function shareRecipe() {
        if (!currentModalRecipe) return;
        // Share the static /r/<id> page (correct per-recipe social preview),
        // not the ?recipe= app link (crawlers can't run JS to see it).
        const url = new URL("/r/" + currentModalRecipe.id, window.location.origin).toString();
        const btn = document.getElementById("modalShareBtn");
        function markCopied() {
          btn.classList.add("copied");
          btn.innerHTML = '<span class="share-icon">✓</span> Copied!';
          setTimeout(() => { btn.classList.remove("copied"); btn.innerHTML = '<span class="share-icon">🔗</span> Share'; }, 2000);
        }
        function fallbackCopy() {
          try {
            const ta = document.createElement("textarea");
            ta.value = url;
            ta.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;";
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            ta.setSelectionRange(0, 99999);
            const ok = document.execCommand("copy");
            document.body.removeChild(ta);
            if (ok) { markCopied(); } else { prompt("Copy this link:", url); }
          } catch(err) { prompt("Copy this link:", url); }
        }
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(url).then(markCopied).catch(fallbackCopy);
        } else {
          fallbackCopy();
        }
      }
      function openHowItWorksModal() {
        (document.getElementById("hiwOverlay").classList.add("open"), (document.body.style.overflow = "hidden"));
      }
      function closeHowItWorksModal() {
        (document.getElementById("hiwOverlay").classList.remove("open"), (document.body.style.overflow = ""));
      }
      // Keep the mobile browser UI tint in sync with the active theme.
      function syncThemeColor() {
        const m = document.getElementById("themeColorMeta");
        if (m) m.content = document.documentElement.classList.contains("light") ? "#f4f4ef" : "#0e0e0e";
      }
      function toggleTheme() {
        const e = document.documentElement.classList.toggle("light");
        ((document.getElementById("themeIcon").textContent = e ? "🌙" : "☀️"),
          (document.getElementById("themeLabel").textContent = e ? "Dark" : "Light"),
          localStorage.setItem("fitniikiter_theme", e ? "light" : "dark"));
        syncThemeColor();
      }
      (!(function () {
        const e = new URLSearchParams(window.location.search).get("recipe");
        e &&
          requestAnimationFrame(() => {
            setTimeout(() => {
              const a = R.find((a) => a.id === e || String(a.displayNum) === e);
              a && openModal(a.id);
            }, 100);
          });
      })(),
        document.addEventListener("keydown", (e) => {
          "Escape" === e.key &&
            document.getElementById("hiwOverlay")?.classList.contains("open") &&
            closeHowItWorksModal();
        }),
        (function () {
          const e = localStorage.getItem("fitniikiter_theme"),
            a = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches,
            t = e ? "light" === e : !a;
          t && document.documentElement.classList.add("light");
          const i = document.getElementById("themeIcon"),
            n = document.getElementById("themeLabel");
          (i && (i.textContent = t ? "🌙" : "☀️"),
            n && (n.textContent = t ? "Dark" : "Light"),
            syncThemeColor(),
            window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
              if (localStorage.getItem("fitniikiter_theme")) return;
              const a = !e.matches;
              document.documentElement.classList.toggle("light", a);
              const t = document.getElementById("themeIcon"),
                i = document.getElementById("themeLabel");
              (t && (t.textContent = a ? "🌙" : "☀️"), i && (i.textContent = a ? "Dark" : "Light"));
              syncThemeColor();
            }));
        })(),
        autoCalcCarbs(),
        buildIngredientRecipeMap(),
        buildAllCards(),
        buildDisplayNumbers(),
        updateCardMacros(),
        filterRecipes(),
        (function () {
          const visibleCards = Array.from(document.querySelectorAll("#recipeGrid .card")).filter(
            (c) => c.style.display !== "none"
          );
          anime({
            targets: visibleCards,
            opacity: [0, 1],
            translateY: [28, 0],
            delay: anime.stagger(35, { start: 60 }),
            duration: 420,
            easing: "easeOutQuad"
          });
        })(),
        updatePillStates(),
        buildDietaryGrid(),
        document.querySelectorAll('#page-recipes .filter-section').forEach(s => s.classList.add('open')));
      _c2RestoreInputs();
