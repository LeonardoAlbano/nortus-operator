# Progress Report — Nortus Operator

- **Repository:** https://github.com/LeonardoAlbano/nortus-operator
- **Live Demo:** https://nortus-operator.vercel.app/login

## Scope Delivered

### Core UX and Pages

- **Login** with robust client-side validation (Zod + React Hook Form) and consistent error handling.
- **Dashboard** consuming KPI and map endpoints.
- **Tickets** listing with filtering and create/edit flows.
- **Chat** page consuming API data.
- **Simulator** page with interactive pricing/coverage behavior.
- **User** page.

### API Integration

- **BFF pattern** via Next.js Route Handlers (`/api/...`) to centralize:
  - outbound API calls to the challenge backend
  - auth/session handling
  - error mapping and payload normalization

### Quality Gates

- **Unit + UI tests** with Vitest + Testing Library covering critical flows (login validation, tickets data loading, store behaviors).
- **Static checks**: ESLint + TypeScript `--noEmit`.
- **Pre-commit quality**: husky + lint-staged + commitlint.

## Deployment Notes (Vercel)

This app requires the following environment variable:

```bash
NORTUS_API_BASE_URL="https://nortus-challenge.api.stage.loomi.com.br"
```

If it is not configured, the build may fail during `next build` because the runtime env schema validation (Zod) will reject missing variables.

## How AI Was Used

AI was used as a productivity and quality multiplier, not as a replacement for engineering judgment:

- **Planning and decomposition:** translating requirements into a task breakdown, defining milestones, and validating the sequencing.
- **Architecture review:** sanity-checking App Router patterns, BFF boundaries, and state management decisions (Zustand).
- **Refactoring support:** identifying opportunities to tighten typing, reduce duplication, and improve testability.
- **Testing guidance:** suggestions for stable test structure (arrange/act/assert), mocking strategy, and coverage priorities.

Controls applied to keep the work trustworthy:

- Code changes were **validated locally** via `pnpm test --run`, `pnpm lint`, and `pnpm typecheck`.
- Suggested approaches were adopted only when they aligned with the project constraints and were verified by tests.
- Commit history was kept clean via conventional commits and PR-based merges.

## Trade-offs and Known Constraints

- The project intentionally validates required environment configuration early to fail fast in misconfigured deploys.
- Some endpoints and datasets are inherently coupled to the challenge API contract; the BFF layer is used to keep that coupling in a single place.
