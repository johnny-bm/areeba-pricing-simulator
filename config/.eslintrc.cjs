module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: [
    'dist/**/*',
    '.eslintrc.cjs',
    'supabase:functions/**/*',
    'scripts/**/*',
    'node_modules/**/*',
    '**/supabase:functions/**/*',
    '**/scripts/**/*',
    'scripts/analyze-bundle.js',
    'supabase:functions/send-invite/index.ts',
    'supabase:functions/server/index.tsx',
    'supabase:functions/server/kv_store.tsx'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}
