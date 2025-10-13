import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['dist/**', 'node_modules/**', 'supabase:functions/**'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        process: 'readonly',
        Deno: 'readonly',
        Response: 'readonly',
        __dirname: 'readonly',
        NodeJS: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-empty': 'off',
      'no-func-assign': 'off',
      'no-prototype-builtins': 'off',
      'no-unsafe-finally': 'off',
      'no-useless-escape': 'off',
      // Clean Architecture boundaries
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/core/domain',
              from: './src/core/infrastructure',
              message: 'Domain layer cannot depend on infrastructure layer'
            },
            {
              target: './src/core/domain',
              from: './src/presentation',
              message: 'Domain layer cannot depend on presentation layer'
            },
            {
              target: './src/core/domain',
              from: './src/state',
              message: 'Domain layer cannot depend on state layer'
            },
            {
              target: './src/core/application',
              from: './src/presentation',
              message: 'Application layer cannot depend on presentation layer'
            },
            {
              target: './src/core/application',
              from: './src/state',
              message: 'Application layer cannot depend on state layer'
            }
          ]
        }
      ],
    },
  },
];
