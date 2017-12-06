module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:eslint-comments/recommended',
    'airbnb',
  ],
  rules: {
    'no-console': ['error', { allow: ['error'] }],
  },
};
