module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
    jest: true
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: 'req|res|next' }],
    'no-console': 'off',
    semi: ['error', 'never'],
    'max-len': ['error', { code: 88 }]
  }
}
