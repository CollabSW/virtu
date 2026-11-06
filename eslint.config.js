const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  prettierRecommended,
  globalIgnores(['node_modules/*', '.expo/*', 'dist/*', 'web-build/*', 'android/*', 'ios/*']),
]);
