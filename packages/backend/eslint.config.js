// ESLint config for the backend.
// Besides normal TypeScript linting, it ENFORCES THE LAYERED ARCHITECTURE with eslint-plugin-boundaries:
//
//   presentation  →  business  →  data  →  Prisma / PostgreSQL
//
// A layer may only import the layer directly below it, and modules talk to each other only
// through the other module's BUSINESS service. Breaking a rule makes `npm run lint` fail.

import js from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import tseslint from 'typescript-eslint';

const PRISMA_PACKAGES = ['@prisma/client', '@prisma/adapter-pg', 'pg'];
const HTTP_PACKAGES = ['express'];

export default tseslint.config(
  { ignores: ['dist/**', 'src/generated/**', 'eslint.config.js', 'prisma.config.ts'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['src/**/*.ts'],
    plugins: { boundaries },
    settings: {
      'import/resolver': {
        typescript: { alwaysTryTypes: true, project: './tsconfig.json' },
      },
      'boundaries/legacy-templates': false,

      // 1. Classify every folder in src/ as an architectural element.
      //    `capture: ['module']` remembers WHICH module (sessions, attendance, ...) a file belongs to.
      'boundaries/elements': [
        { type: 'presentation', pattern: 'src/presentation/*', capture: ['module'] },
        { type: 'business', pattern: 'src/business/*', capture: ['module'] },
        { type: 'data', pattern: 'src/data/*', capture: ['module'] },
        { type: 'database', pattern: 'src/common/database' },
        { type: 'common', pattern: 'src/common/*', capture: ['area'] },
        { type: 'generated', pattern: 'src/generated' },
      ],
      // app.ts / server.ts: the composition root that wires the modules together.
      'boundaries/files': [{ pattern: 'src/*.ts', category: 'bootstrap' }],
    },
    rules: {
      // Express error handlers need 4 params even when `next` is unused, so allow `_`-prefixed names.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      // Every file in src/ must belong to one of the elements above.
      'boundaries/no-unknown-files': 'error',

      // 2. The architecture rules.
      'boundaries/dependencies': [
        'error',
        {
          default: 'allow',
          checkAllOrigins: true, // also check npm packages (express, prisma), not just our own files
          policies: [
            // ---------- layer direction ----------
            {
              from: { element: { type: 'presentation' } },
              disallow: { to: { element: { types: ['data', 'database', 'generated'] } } },
              message:
                'Layer violation: presentation may only call the business layer, not "{{ to.element.types.[0] }}".',
            },
            {
              from: { element: { type: 'business' } },
              disallow: { to: { element: { types: ['presentation', 'database', 'generated'] } } },
              message:
                'Layer violation: business may not import "{{ to.element.types.[0] }}". Go through a repository in data/.',
            },
            {
              from: { element: { type: 'data' } },
              disallow: { to: { element: { types: ['presentation', 'business'] } } },
              message: 'Layer violation: data is the lowest layer and may not import "{{ to.element.types.[0] }}".',
            },
            {
              from: { element: { types: ['common', 'database'] } },
              disallow: { to: { element: { types: ['presentation', 'business', 'data'] } } },
              message: 'common/ is shared infrastructure and must not depend on a module.',
            },

            {
              // No layer may import app.ts / server.ts (server.ts importing app.ts is fine).
              from: { element: { types: ['presentation', 'business', 'data', 'common', 'database'] } },
              disallow: { to: { file: { categories: 'bootstrap' } } },
              message: 'app.ts / server.ts are the entry point; nothing may import them.',
            },

            // ---------- external packages per layer ----------
            {
              from: { element: { types: ['presentation', 'business', 'common'] } },
              disallow: { to: { module: { origin: 'external', source: PRISMA_PACKAGES } } },
              message: 'Only the data layer (and common/database) may use Prisma/pg ("{{ to.module.source }}").',
            },
            {
              from: { element: { types: ['business', 'data'] } },
              disallow: { to: { module: { origin: 'external', source: HTTP_PACKAGES } } },
              message: '"{{ to.module.source }}" is HTTP. Only presentation/ and common/http may use it.',
            },

            // ---------- module boundaries ----------
            {
              // A module may only call ANOTHER module through its business service.
              from: { element: { type: 'presentation' } },
              disallow: {
                to: {
                  element: { type: 'business', captured: { module: '!{{ from.element.captured.module }}' } },
                },
              },
              message:
                'presentation/{{ from.element.captured.module }} may only call business/{{ from.element.captured.module }}. Cross-module calls go business → business.',
            },
            {
              from: { element: { type: 'business' } },
              disallow: {
                to: { element: { type: 'data', captured: { module: '!{{ from.element.captured.module }}' } } },
              },
              message:
                'business/{{ from.element.captured.module }} may not use data/{{ to.element.captured.module }}. Call business/{{ to.element.captured.module }} (its service) instead.',
            },
            {
              from: { element: { type: 'data' } },
              disallow: {
                to: { element: { type: 'data', captured: { module: '!{{ from.element.captured.module }}' } } },
              },
              message: 'data/{{ from.element.captured.module }} may not use another module\'s repository.',
            },
          ],
        },
      ],
    },
  },
);
