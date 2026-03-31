module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    'vitest-globals/env': true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:vitest-globals/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['react', 'react-hooks', '@typescript-eslint'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
    ]
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}
