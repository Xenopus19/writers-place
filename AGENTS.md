# Writers Place — Agent Guidelines
This project is a article-sharing platform with comments, likes, and semantic search.

## Stack

- **Monorepo**: npm workspaces, TypeScript, ESM (`"type": "module"`), Node >= 20
- **Frontend**: React 19, Vite, Tailwind CSS 4, React Router, TanStack Query, react-hook-form + zod
- **Backend**: Node.js/Express, Sequelize, PostgreSQL (pgvector), JWT auth, zod
- **Tests**: Vitest (+ Testing Library on frontend, supertest on backend)
- **Package manager**: npm (never yarn/pnpm)

## Commands

Run from repo root:

| Command | Purpose |
|---|---|
| `npm run dev` | Start backend + frontend concurrently |
| `npm run build` | Build shared, backend, frontend |
| `npm test` | Run all tests |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm test -- -t "auth"` | Run tests matching pattern |
| `npm test -w backend -- path/to/file.test.ts` | Run single test file |

Single workspace: `npm run <script> -w backend` / `-w frontend` / `-w packages/shared`

## Code Rules

- **No `any`** — use precise types or `unknown` + narrowing
- **Strictly async/await** — never `.then()`/`.catch()` chains
- ESM only — `import`/`export`, no `require`
- Validate all external input (API bodies, env vars) with zod schemas
- Shared types between frontend/backend live in `packages/shared`
- In frontend don't use fetch for requests. Always use axios or api object created via axios for requests.
- Import shared logic only via workspace alias `@writers-place/shared` (never relative paths to `packages/shared`)

## Folder Structure

```
frontend/         React app
  src/components  UI components
  src/hooks       Custom hooks
  src/services    API calls
backend/          Express API
  src/routers     Route handlers
  src/models      Sequelize models
  src/schemas     Zod schemas
  src/migrations  DB migrations (umzug)
packages/shared/  Shared types & utilities
```

## DON'T

- Don't use `any` or `@ts-ignore`/`@ts-expect-error` to silence type errors
- Don't use promise chains or callbacks — async/await only
- Don't use Jest/Mocha — Vitest only
- Don't install packages at the root — always target a workspace with `-w`
- Don't edit `dist/` or other build output
- Don't commit `.env` files or secrets
- Don't use other approaches other than Tailwind CSS for styling
- Don't use default components if there is a shadcn/ui alternative present

