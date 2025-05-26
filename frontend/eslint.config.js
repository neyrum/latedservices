const vue = require('eslint-plugin-vue');

module.exports = [
  {
    files: ['**/*.js', '**/*.vue'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      vue,
    },
    rules: {
      'no-unused-vars': 'warn',
      'semi': ['error', 'always'],
      'no-undef': 'error',
      'vue/multi-word-component-names': 'off',
    },
    processor: vue.processors['.vue'],
  },
];