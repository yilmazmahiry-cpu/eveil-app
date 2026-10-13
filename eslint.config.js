// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // supabase/functions : code Deno déployé sur Supabase, hors de l'app (imports "jsr:" non résolus par ESLint).
    ignores: ["dist/*", "supabase/functions/**"],
  }
]);
