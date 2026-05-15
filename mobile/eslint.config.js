// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    plugins: {
      // Plugins are typically objects in flat config, but if using standard string loading it needs specific setup.
      // Assuming expo handles standard prettier, but let's fix the syntax.
    },
    rules: {
      "prettier/prettier": ["error"],
    },
    ignores: ["dist/*"],
  }
]);
