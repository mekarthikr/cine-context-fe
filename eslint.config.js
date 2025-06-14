import globals from 'globals';
import pluginJs from '@eslint/js';
import eslintConfigLove from 'eslint-config-love';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginJest from 'eslint-plugin-jest';

// import importOrder from './import-order.mjs';

export default [
  // Global settings
  {
    languageOptions: {
      globals: {
        ...globals.node, // Node.js globals (includes process, __dirname, etc.)
        ...globals.browser, // Browser globals (includes window, document, etc.)
        NodeJS: true,
        jest: true,
      },
    },
  },

  // JavaScript, TypeScript & Import Order Configurations
  pluginJs.configs.recommended,
  eslintPluginPrettierRecommended, // Enable Prettier plugin
  eslintConfigPrettier, // Resolve Prettier conflicts
  {
    ...eslintConfigLove,
    files: ['src/**/*.{js,ts,tsx}'],
    rules: {
      ...eslintConfigLove.rules,
      // 'import/order': importOrder(), // Custom import order configuration
      'promise/always-return': 'off',
      'no-constant-binary-expression': 'off',
      '@typescript-eslint/max-params': ['error', { max: 5 }],
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/init-declarations': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/promise-function-async': 'off',
      '@typescript-eslint/class-methods-use-this': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/non-nullable-type-assertion-style': 'off',
    },
  },

  // Unit Testing Config
  {
    files: ['src/**/*.test.{js,ts,tsx}', 'src/tests/**/*.{js,ts,tsx}'],
    ...eslintPluginJest.configs['flat/recommended'],
    rules: {
      ...eslintPluginJest.configs['flat/recommended'].rules,
      'import/order': 'off',
    },
  },
  {
    files: ['src/store/**/*.test.{js,ts,tsx}'],
    rules: {
      'jest/no-standalone-expect': 'off',
    },
  },

  // React Config
  {
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: {
        version: 'detect',
        pragma: 'React', // Default pragma
        fragment: 'Fragment', // Default Fragment
      },
    },
  },
  {
    files: ['src/store/**/*.{js,ts,tsx}'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },

  // Custom Plugins (React-Hooks)
  {
    plugins: {
      'react-hooks': pluginReactHooks,
    },
  },
];
