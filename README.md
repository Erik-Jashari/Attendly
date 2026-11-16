# Attendly

A QR-based attendance system for UBT. Professors open a class session that shows a rotating QR code. Active students log in and scan it to be marked present.

**Stack:** Node.js · TypeScript · Express · PostgreSQL · Prisma · React (Vite)
**Architecture:** layered (presentation → business → data)

## Tabela e përgjegjësive / Responsibility table

| Anëtari / Member | Moduli / Module | Paketat / Packages | Klasat / Classes |
|---|---|---|---|
| TBD | Sessions | `presentation/sessions`, `business/sessions`, `data/sessions`, `frontend/src/modules/sessions` | TBD |
| TBD | Attendance | `presentation/attendance`, `business/attendance`, `data/attendance`, `frontend/src/modules/attendance` | TBD |
| TBD | Reports | `presentation/reports`, `business/reports`, `data/reports`, `frontend/src/modules/reports` | TBD |
| TBD | Justifications | `presentation/justifications`, `business/justifications`, `data/justifications`, `frontend/src/modules/justifications` | TBD |
| All | Shared work | `common/` (auth, config, database), `prisma/schema.prisma`, `packages/shared` | `Database`, `HttpError` |

Backend paths are relative to `packages/backend/src/`.

## Getting started

```bash
npm install                       # installs all workspaces from the root
cp packages/backend/.env.example packages/backend/.env   # then set DATABASE_URL
npm run db:migrate                # apply Prisma migrations
npm run dev:backend               # http://localhost:3000/api/health
npm run dev:frontend
npm run lint                      # also checks the layered architecture rules
```

## Architecture rules

The backend enforces the layered architecture with ESLint (`eslint-plugin-boundaries`, see `packages/backend/eslint.config.js`):

- `presentation → business → data`: a layer may only import the layer directly below it.
- Only `data/` may use Prisma, and only `presentation/` may use Express.
- Modules call each other only through the other module's **business service**, never through its repository.

If you break a rule, `npm run lint` fails and tells you which rule.
