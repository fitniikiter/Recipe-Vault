// Load recipes.js and dump R[] and RECIPE_DETAILS as JSON to stdout
// We only need the card data (R) and details (RECIPE_DETAILS)

const fs = require('fs');
let src = fs.readFileSync('/home/user/Recipe-Vault/recipes.js', 'utf8');

// Execute the JS in a controlled sandbox using Function()
// to get R and RECIPE_DETAILS defined
let R, RECIPE_DETAILS;
const define = new Function('require', src + '\nreturn {R, RECIPE_DETAILS};');
try {
  const result = define(require);
  R = result.R;
  RECIPE_DETAILS = result.RECIPE_DETAILS;
} catch(e) {
  // Strip the anime.js reference if any, then retry
  src = src.replace(/require\s*\([^)]+\)/g, '{}');
  const define2 = new Function(src + '\nreturn {R, RECIPE_DETAILS};');
  const result = define2();
  R = result.R;
  RECIPE_DETAILS = result.RECIPE_DETAILS;
}

// Dump to files
fs.writeFileSync('/tmp/vault_R.json', JSON.stringify(R, null, 0));
fs.writeFileSync('/tmp/vault_RD.json', JSON.stringify(RECIPE_DETAILS, null, 0));
console.log('R:', R.length, 'recipes');
console.log('RECIPE_DETAILS:', Object.keys(RECIPE_DETAILS).length, 'entries');
