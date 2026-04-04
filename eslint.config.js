import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        browser: true,
        document: true,
        console: true,
        setTimeout: true,
        fetch: true,
        Uint8Array: true,
        localStorage: true,
        HTMLSelectElement: true,
        HTMLElement: true,
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
    },
    ignores: ['dist/', 'node_modules/', 'coverage/'],
  },
];
