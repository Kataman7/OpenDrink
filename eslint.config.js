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
        clearTimeout: true,
        setInterval: true,
        clearInterval: true,
        fetch: true,
        Uint8Array: true,
        localStorage: true,
        HTMLSelectElement: true,
        HTMLElement: true,
        speechSynthesis: true,
        SpeechSynthesisUtterance: true,
        process: true,
        window: true,
        navigator: true,
        history: true,
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
