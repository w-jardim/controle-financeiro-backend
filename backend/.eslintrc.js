module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  parserOptions: {
    ecmaVersion: 2021
  },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^(next|_)' }],
    'no-undef': 'error',
    'no-const-assign': 'error',
    'no-dupe-keys': 'error',
    'no-duplicate-case': 'error',
    'no-unreachable': 'warn',
    'no-process-exit': 'off',
    'eqeqeq': ['warn', 'always'],
    'no-var': 'warn'
  }
};
