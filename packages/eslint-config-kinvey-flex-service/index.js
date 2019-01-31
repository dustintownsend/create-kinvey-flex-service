'use strict';

module.exports = {
  root: true,
  extends: 'eslint:recommended',
  parser: 'babel-eslint',
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
    // ecmaFeatures: {}
  },
  rules: {
    // http://eslint.org/docs/rules/
    // semi: 1,
    // 'callback-return': 1,
    // 'no-console': 1,
  }
}