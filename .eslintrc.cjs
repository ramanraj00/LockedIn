module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:react/recommended', 'prettier'],
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react'],
  rules: {
    'no-console': 'warn',
    'react/react-in-jsx-scope': 'off', // using React 17+ JSX transform
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
  settings: {
    react: { version: 'detect' },
  },
};
