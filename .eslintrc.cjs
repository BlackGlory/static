module.exports = {
  root: true
, parser: '@typescript-eslint/parser'
, parserOptions: {
    project: ['./tsconfig.json']
  , tsconfigRootDir: __dirname
  }
, plugins: [
    '@typescript-eslint'
  ]
, extends: [
    'eslint:recommended'
  , 'plugin:@typescript-eslint/recommended'
  , 'plugin:@typescript-eslint/recommended-requiring-type-checking'
  ]
, rules: {
    'no-constant-condition': 'off'
  , '@typescript-eslint/ban-ts-comment': 'off'
  , '@typescript-eslint/require-await': 'off'
  , '@typescript-eslint/restrict-template-expressions': 'off'
  }
}
