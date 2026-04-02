# FIT NIIKITER'S RECIPE VAULT 👨‍🍳

High-protein recipe database with interactive macro calculator, dietary filters, and admin editing.

## 📁 File Structure (NEW - Performance Optimized)

```
your-repo/
├── index.html          (UI + JavaScript logic - 911 KB)
├── recipes.json        (All 148 recipes - 58 KB) ⭐ Edit this for recipe changes
├── config.json         (Protein defs, dietary filters - 5.6 KB)
└── README.md          (This file)
```

### Why This Structure?

| Aspect | Before | After |
|--------|--------|-------|
| Total Size | 1,015 KB | 974 KB (4% smaller) |
| KI Edit Time | Reads 1,015 KB | Reads only 58 KB for recipes ✅ |
| GitHub Diff | Huge changes | Clean, focused diffs |
| Maintainability | Hard to find recipes | Easy to manage JSON |

---

## 🚀 Deployment to GitHub Pages

1. **Upload to GitHub:**
   ```bash
   git add index.html recipes.json config.json
   git commit -m "Refactor: separate recipes into JSON for performance"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to Settings → Pages
   - Source: Branch `main`
   - Your site will be live at `https://your-username.github.io/your-repo`

---

## ✏️ Editing Recipes (For AI/You)

### Add a New Recipe
Edit `recipes.json` and add:
```json
{
  "id": "recipe-slug-here",
  "displayNum": 149,
  "carb": "rice",
  "time": 25,
  "title": "Your Recipe Name",
  "desc": "Short description",
  "tags": ["korean", "comfort"],
  "flavor": "savory",
  "proteinOpts": {
    "chicken": { "g": 200, "kcal": 330, "p": 52, "c": 0, "f": 13 },
    "beef": { "g": 180, "kcal": 360, "p": 48, "c": 0, "f": 18 }
  },
  "carbs": {
    "rice": { "g": 200, "kcal": 262, "p": 5.4, "c": 58, "f": 0.3 }
  },
  "sauce": { "kcal": 80, "p": 1, "c": 8, "f": 4 },
  "ing": ["soy sauce", "garlic", "ginger"],
  "steps": ["Step 1", "Step 2", "Step 3"],
  "hacks": ["💡 Hack 1", "💡 Hack 2"],
  "notes": "Storage/variation tips"
}
```

### Update Config
Edit `config.json` to change:
- Protein definitions
- Dietary filters
- Color scheme

### Change UI/Logic
Edit `index.html` for:
- Styling (CSS)
- Layout/HTML structure
- JavaScript functions

---

## 🔧 Local Testing

1. Start a local server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Or Node.js
   npx http-server
   ```

2. Open `http://localhost:8000` in your browser

3. Check browser console for any load errors

---

## 📊 Data Format Reference

### recipes.json Structure
- `id` (string): Unique slug for URL params
- `displayNum` (number): Display order
- `carb` (string): Primary carb type (rice/potato/noodle/bread)
- `time` (number): Prep time in minutes
- `title` (string): Recipe name
- `desc` (string): Short description
- `tags` (array): Cuisine tags
- `flavor` (string): savory/sweet/spicy
- `proteinOpts` (object): Macros per protein type
- `carbs` (object): Carb macros
- `sauce` (object): Sauce macros (added on top)
- `ing` (array): Ingredient list
- `steps` (array): Cooking steps
- `hacks` (array): 80/20 optimization tips
- `notes` (string): Extra info

---

## 🎯 Performance Tips

- **recipes.json is cached** by browser after first load
- **Only edit the file you need** (recipes.json for recipes, config.json for constants)
- **GitHub automatically serves gzipped** files (~40% smaller over network)

---

## 🚨 Troubleshooting

**"Failed to load data files"** error?
- ✅ Make sure `recipes.json` and `config.json` are in the same folder as `index.html`
- ✅ Check browser DevTools → Network tab for 404 errors
- ✅ For local testing, use a real HTTP server (not `file://`)

**Recipe not showing up?**
- ✅ Check `displayNum` is unique and sequential
- ✅ Verify JSON syntax is valid (no trailing commas)
- ✅ Refresh browser cache (Ctrl+Shift+R)

---

## 📝 Notes

- Recipes are loaded asynchronously on page load
- Loading screen shows while data fetches
- All filtering/search works the same as before
- Admin mode still works for live edits (saved to browser localStorage)

---

Made with ❤️ and 🍗 by FitNiikiter
