import globals from 'globals';
import pluginJs from '@eslint/js';
import eslintConfigLove from 'eslint-config-love';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginJest from 'eslint-plugin-jest';

export default [
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        NodeJS: true,
        jest: true,
      },
    },
  },

  pluginJs.configs.recommended,
  eslintPluginPrettierRecommended,
  eslintConfigPrettier,
  {
    ...eslintConfigLove,
    files: ['src/**/*.{js,ts,tsx}'],
    rules: {
      ...eslintConfigLove.rules,
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

  {
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: {
        version: 'detect',
        pragma: 'React',
        fragment: 'Fragment',
      },
    },
  },
  {
    files: ['src/store/**/*.{js,ts,tsx}'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },

  {
    plugins: {
      'react-hooks': pluginReactHooks,
    },
  },
];
