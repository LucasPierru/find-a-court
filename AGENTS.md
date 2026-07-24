# find-a-court

npm workspaces monorepo with three packages:

- `frontend/` — Next.js 16 (App Router) + React 19 + Tailwind CSS 4. See `frontend/AGENTS.md` for frontend-specific rules.
- `backend/` — Express 4 API server (TypeScript, `tsx` for dev). Entry point `backend/src/index.ts`.
- `shared/` — Shared TypeScript types/schemas (Zod) consumed by both `frontend` and `backend` via the `shared` workspace package.

## Commands

Run from the repo root unless noted otherwise.

- `npm install` — installs all workspace dependencies.
- `npm run dev --workspace=frontend` — Next.js dev server (http://localhost:3000).
- `npm run dev --workspace=backend` — Express dev server with watch (http://localhost:4000).
- `npm run build --workspace=<name>` / `npm run typecheck --workspace=<name>` / `npm run lint --workspace=<name>` — per-package build, typecheck, lint. `shared` has no `lint` script.

`shared` must be built (`npm run build --workspace=shared`) for its compiled `dist/` output to be picked up by consumers; it does not use live TypeScript source resolution.

## Conventions

- All packages are TypeScript with `strict` mode on.
- Shared data contracts (e.g. domain schemas) belong in `shared/src`, defined with Zod, exporting both the schema and its inferred type.
