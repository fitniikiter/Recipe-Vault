---
name: sync-videos
description: Keep Recipe Vault recipes in sync with the FIT NIIKITER YouTube
  channel. Use when asked to sync videos, link YouTube videos to recipes, find
  recipes missing a video, or check that a recipe matches its video. Pulls the
  channel via vidIQ, matches video titles to recipes, fills in missing video
  IDs, and flags ingredient/macro mismatches.
allowed-tools: Read, Edit, Bash, mcp__vidIQ_for_Claude__vidiq_channel_videos, mcp__vidIQ_for_Claude__vidiq_get_videos_by_ids, mcp__vidIQ_for_Claude__vidiq_user_channels
---

# Sync Videos — Keep recipes current with YouTube

You sync FIT NIIKITER's Recipe Vault (`recipes.js`) with the YouTube channel so
every recipe shows the right video and the on-site recipe matches what's in the
video.

- Channel: **Fit Niikiter** — handle `@fitniikiter`, channelId `UCRC8tptJsWqPJBcdKhH8ndg`
- The `video` field in `RECIPE_DETAILS{}` holds the YouTube **video ID** (e.g.
  `"OlTOf0YZdMA"`), not a URL. `""` = no video yet, `null` = none.

## Why descriptions, not transcripts
Each Short's **description** already contains the full recipe — macros plus
ingredients grouped by section (Protein, Sauce, To Serve, …). That is the
source of truth for syncing. Prefer `vidiq_get_videos_by_ids` (returns
`description`) over transcripts. Only fall back to `vidiq_video_transcript` when
a description has no ingredient list.

## Steps

### 1. Pull the channel's videos
Call `vidiq_channel_videos` for `videoFormat: "short"` twice — once with
`popular: false` (recent uploads) and once with `popular: true` (top performers).
Merge and de-dupe by `videoId`.

Skip non-recipe uploads — teasers whose titles are generic, e.g. "follow for
recipes", "recipe on my profile", "food at home", emoji-only titles. Keep only
videos whose title names a dish.

### 2. Get the real recipe per video
Batch the kept video IDs into `vidiq_get_videos_by_ids` (up to 50 per call) and
read each `description` for the dish name, macros, and ingredient sections.

### 3. Load current recipes
Use Bash + node to read `recipes.js` and list every recipe's `id`, `title`, and
current `video`. Example:

```
node -e 'const fs=require("fs"),vm=require("vm");const s={};vm.createContext(s);
vm.runInContext(fs.readFileSync("recipes.js","utf8")+";this.R=R;this.D=RECIPE_DETAILS;",s);
for(const r of s.R) console.log(JSON.stringify({id:r.id,title:r.title,video:s.D[r.id]&&s.D[r.id].video}));'
```

### 4. Match videos to recipes
Match a video to a recipe by dish name (case-insensitive, ignore emojis, country
flags, and "XXg PROTEIN!!!" suffixes). A confident match needs the core dish
words to line up (e.g. "Mexican Chipotle Chicken Wrap" → `mexican-chipotle-chicken-wrap`).
If a video has no matching recipe, list it as a **candidate for a new recipe** —
do NOT invent a recipe (use the `add-recipe` skill for that).

### 5. Apply updates
For each confident match:
- If the recipe's `video` is `""`/`null` or different from the matched ID, set it
  to the matched video ID with Edit. One video ID maps to exactly ONE recipe — if
  an ID is already on another recipe, resolve the conflict (the title decides).
- Compare the recipe's ingredient sections + amounts against the video
  description. Flag any mismatch (different amount, missing/extra ingredient,
  changed macro). Do NOT silently rewrite recipe content — list mismatches and
  ask before changing ingredients/steps, since the video is the canonical version
  but a rewrite is a content decision.

### 6. Verify, then report
Re-run the node check to confirm `recipes.js` still parses and there are no
duplicate video IDs and no orphans:

```
node -e 'const fs=require("fs"),vm=require("vm");const s={};vm.createContext(s);
vm.runInContext(fs.readFileSync("recipes.js","utf8")+";this.R=R;this.D=RECIPE_DETAILS;",s);
const v={};for(const r of s.R){const id=s.D[r.id]&&s.D[r.id].video;if(id){(v[id]=v[id]||[]).push(r.id);}}
console.log("dups:",Object.entries(v).filter(([,a])=>a.length>1));console.log("OK",s.R.length);'
```

Then report a concise summary:
- ✅ video IDs newly linked (recipe → video title)
- ⚠️ recipes whose ingredients/macros differ from the video (with the diff)
- 🆕 videos with no recipe yet (candidates for `add-recipe`)
- 🎬 recipes still without any video

## Rules
- Edit `recipes.js` only. Never touch `index.html` rendering for a sync.
- Keep all recipe content in English.
- Never delete a recipe to "fix" a mismatch.
- After changes, commit with a clear message. Pushing follows the repo's branch
  rules for the current session.
