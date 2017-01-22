module.exports = {
  extends: 'airbnb',
  rules: {
    'no-console': ['error', { allow: ['error'] }],
    'new-cap': ['error', { 'capIsNewExceptions': ['Debug', 'express.Router'] }],
  },
};
