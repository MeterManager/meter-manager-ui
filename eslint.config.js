import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default {
  ignorePatterns: ['dist', 'node_modules', 'build', '.env'],
  files: ['**/*.{js,jsx}'],
  extends: [js.configs.recommended, reactHooks.configs['recommended-latest'], reactRefresh.configs.vite, prettier],
  plugins: {
    prettier: prettierPlugin,
  },
  languageOptions: {
    ecmaVersion: 2020,
    globals: globals.browser,
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
  rules: {
    'no-unused-vars': [
      'error',
      {
        varsIgnorePattern: '^[A-Z_]|^selected',
        argsIgnorePattern: '^_',
      },
    ],
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'no-console': 'warn',
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
  },
};
