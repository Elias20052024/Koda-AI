# Koda AI

An AI-powered internship matching platform that connects IT students with companies using skill-based matching. Students discover internships based on their technical profile, companies find qualified interns, and universities verify and track student placements.

## Run & Operate

- `pnpm --filter @workspace/koda-ai run dev` — run the frontend (port varies, managed by workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19, Vite, Tailwind CSS, shadcn/ui, Framer Motion, wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/koda-ai/src/` — React frontend
  - `src/App.tsx` — router and layout
  - `src/index.css` — theme (navy/teal/violet brand colors)
  - `src/pages/` — all page components
  - `src/hooks/useAuth.ts` — auth state from localStorage (`koda_auth` key)
- `artifacts/api-server/src/routes/` — Express route handlers (auth, students, companies, universities, internships, applications, notifications, verification, dashboard)
- `lib/db/src/schema/` — Drizzle schema (users, students, companies, universities, internships, applications, notifications, verification_requests)
- `lib/api-spec/openapi.yaml` — OpenAPI source of truth
- `lib/api-client-react/src/generated/` — generated React Query hooks

## Architecture decisions

- Client-side auth: token + user stored in `localStorage` under `koda_auth`. No server-side session. `x-user-id` header sent on requests where identity is needed.
- AI matching is computed server-side by comparing student skills array against internship required skills array — skill intersection / union ratio as percentage.
- `api-zod/src/index.ts` only exports from `./generated/api` (not `./generated/types`) to avoid TS2308 collisions between Zod schema names and TypeScript type names. The codegen script patches this file after Orval runs.
- Role-based routing: `/dashboard` redirects to `/student/dashboard`, `/company/dashboard`, or `/university/dashboard` based on `user.role` in localStorage.

## Product

- **Landing page** — hero, features, how-it-works, benefits by role, testimonials, FAQ, footer
- **Student** — register/login, profile (skills, bio, GPA, resume), browse internships, AI match score per internship, apply, track applications
- **Company** — register/login, company profile, post/edit/close internships, view applicants with match scores, accept/reject
- **University** — register/login, view students, approve/reject verification requests, track placements
- **AI Matching** — skill overlap percentage with explanation and matched/missing skill lists

## Demo accounts (password: `123456`)

| Role | Email |
|------|-------|
| Student | student1@example.com |
| Student | student2@example.com |
| Company | company1@example.com |
| University | university1@example.com |

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any OpenAPI spec change, run `pnpm --filter @workspace/api-spec run codegen` — the script patches `lib/api-zod/src/index.ts` automatically.
- Array columns in Drizzle: use `.array()` as a method — `text("skills").array()`, not `array(text(...))`.
- `pnpm --filter @workspace/db run push-force` if push fails with column conflicts.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
