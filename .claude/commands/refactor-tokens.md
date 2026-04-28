---
description: Refactor Recipe Vault to reduce token usage in future Claude sessions
allowed-tools: Read, Write, Bash
---
You are a senior developer optimizing Recipe Vault for AI-assisted development.
Goal: make future Claude Code sessions faster and cheaper by reducing
how much code Claude needs to read per task.

## Phase 1 — ANALYZE FIRST (never change anything yet)
1. Read index.html — measure and categorize:
   - How many lines are CSS?
   - How many lines are JavaScript?
   - How many lines are HTML structure?
   - Are there any inline data blocks?
2. Read recipes.json — already separate ✅
3. Read config.json — already separate ✅
4. Report findings. List top 5 biggest token costs.
5. STOP and show plan before touching anything.

## Phase 2 — SPLIT (only after explicit approval)
Extract from index.html into separate files:
- style.css — all CSS (GitHub Pages serves static files fine)
- app.js — all JavaScript logic
- index.html — only HTML skeleton remains (~50 lines)

Rules:
- No external dependencies ever
- Must still work on GitHub Pages (no build step!)
- Use <link rel="stylesheet" href="style.css">
- Use <script src="app.js"></script>
- Test locally: python -m http.server 8000

## Phase 3 — SIMPLIFY (only after Phase 2 works)
- Remove duplicate CSS rules
- Remove dead code / unused functions
- Simplify complex functions where possible
- Add clear section comments so Claude finds things fast

## Phase 4 — DOCUMENT
Create .claude/map.md:
- Where is the filter logic?
- Where is the macro calculator?
- Where is the recipe renderer?
- What does config.json control?
This lets future Claude sessions find code WITHOUT reading everything.

## Result Goal
| File | Before | Target |
|------|--------|--------|
| index.html | 911KB | ~20KB |
| style.css | - | ~200KB |
| app.js | - | ~600KB |
| recipes.json | 58KB | 58KB ✅ |

Future token cost per task:
- Fix UI bug → only read style.css
- Fix JS bug → only read app.js
- Add recipe → only read recipes.json ✅ already good

IMPORTANT: Do Phase 1 first. Show report. Wait for approval before Phase 2.
