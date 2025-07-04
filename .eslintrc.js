module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'boundaries'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  env: {
    node: true,
    es2022: true
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    'boundaries/element-types': [
      2,
      {
        default: 'disallow',
        message: '${file.type} is not allowed to import ${dependency.type}',
        rules: [
          {
            from: 'domain',
            allow: ['domain']
          },
          {
            from: 'application',
            allow: ['domain', 'application']
          },
          {
            from: 'infrastructure', 
            allow: ['domain', 'application', 'infrastructure']
          },
          {
            from: 'ui-react',
            allow: ['domain', 'application', 'infrastructure', 'ui-react']
          },
          {
            from: 'cli',
            allow: ['domain', 'application', 'infrastructure', 'cli']
          }
        ]
      }
    ]
  },
  settings: {
    'boundaries/elements': [
      { type: 'domain', pattern: 'packages/domain/**' },
      { type: 'application', pattern: 'packages/application/**' },
      { type: 'infrastructure', pattern: 'packages/infrastructure/**' },
      { type: 'ui-react', pattern: 'packages/ui-react/**' },
      { type: 'cli', pattern: 'packages/cli/**' }
    ]
  }
};