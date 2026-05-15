# Quality Gate — CTFlow (Phase 2, Read-Only Mapping)

**Date**: 2026-05-15  
**Branch**: backup/vps-2026-04-10-zod-prod-align  
**Status**: Mapped via read-only inspection. No tests executed yet.

---

## 1. Available Scripts

### Backend (`backend/package.json`)

| Script | Command | Purpose |
|---|---|---|
| `start` | `node src/index.js` | Production start |
| `dev` | `nodemon -L src/index.js` | Development hot-reload |
| `test` | `cross-env NODE_ENV=test jest --runInBand` | Run all Jest tests (serial) |
| `test:watch` | `cross-env NODE_ENV=test jest --watch` | Watch mode |
| `test:ci` | `cross-env NODE_ENV=test jest --runInBand --coverage` | CI: tests + coverage |
| `db:test:up` | `docker compose -f ../docker-compose.test.yml up -d` | Start MySQL test container |
| `db:test:down` | `docker compose -f ../docker-compose.test.yml down -v` | Tear down test DB |
| `lint` | `eslint src/ tests/` | Lint source and tests |
| `lint:fix` | `eslint src/ tests/ --fix` | Auto-fix lint issues |
| `test:with-db` | PowerShell + docker + jest | **Windows-only** (PowerShell); not portable on Linux/VPS |

### Frontend (`frontend/package.json`)

| Script | Command | Purpose |
|---|---|---|
| `dev` | `vite` | Vite dev server |
| `build` | `vite build` | Production build (TypeScript + Vite) |
| `preview` | `vite preview` | Preview production build locally |
| `lint` | `eslint ./src --ext .ts,.tsx` | Lint TypeScript sources |
| `format` | `prettier --write "src/**/*.{ts,tsx,css,scss,md}"` | Auto-format |
| `test` | `vitest` | Run Vitest tests |
| `test:ui` | `vitest --ui` | Vitest with browser UI |

---

## 2. Test Infrastructure

### Backend: Jest

- **Framework**: Jest with `supertest`
- **Config**: `backend/jest.config.js`
  - `testEnvironment: 'node'`
  - Test match: `tests/**/*.test.js`, `tests/**/*.spec.js`
  - Coverage collected from: `src/**/*.js`
  - `testTimeout: 10000`
  - Setup file: `tests/setup/jest.setup.js`
- **Isolation**: `--runInBand` (serial) — required for integration tests sharing a DB

#### Test file inventory (16 files)

**Unit (3 files)**
- `tests/unit/escalasService.test.js`
- `tests/unit/agendaAulasService.test.js`
- `tests/unit/agendamentoService.test.js`

**Integration (13 files)**
- `tests/integration/saude.spec.js` — smoke tests: `/saude`, `/ping`, `/`
- `tests/integration/auth.spec.js`
- `tests/integration/alunos.spec.js`
- `tests/integration/cts.spec.js`
- `tests/integration/profissionais.spec.js`
- `tests/integration/modalidades.spec.js`
- `tests/integration/horarios-aula.spec.js`
- `tests/integration/agendamentos.spec.js`
- `tests/integration/presencas.spec.js`
- `tests/integration/mensalidades.spec.js`
- `tests/integration/transacoes.spec.js`
- `tests/integration/escalas.spec.js` (via module)
- `tests/integration/fase3-infra.spec.js` — infra-level checks
- `tests/integration/fase4-encerramento.spec.js` — end-state validation

### Frontend: Vitest

- **Framework**: Vitest (inline with Vite)
- **Config**: embedded in `frontend/vite.config.ts` (no separate vitest.config)

#### Test file inventory (5 files)
- `src/__tests__/App.test.tsx`
- `src/__tests__/auth.test.tsx`
- `src/__tests__/pages/Alunos.test.tsx`
- `src/__tests__/pages/Modalidades.test.tsx`
- `src/__tests__/pages/Cts.test.tsx`

---

## 3. Pre-Conditions Required to Run Tests

### Backend integration tests
1. A running `mysql_test` container (via `docker-compose.test.yml`)
   - Port: `3308:3306` on host
   - DB: `gestao_ct_financeiro_test`
   - Credentials: `root / root_test`, user `test_user / test_pass`
   - Has a healthcheck with 30 retries at 2s intervals
2. `NODE_ENV=test` must be set (handled by `cross-env` in scripts)
3. Dependencies must be installed (`node_modules` present)

### Backend unit tests
- No external DB required (service-layer tests with mocks)

### Frontend tests
- Dependencies must be installed (`node_modules` present)
- No external services required for unit/component tests

---

## 4. Portability Issues Identified

| Issue | Severity | Detail |
|---|---|---|
| `test:with-db` uses PowerShell | High | Uses `powershell -Command "..."` — not runnable on Linux/VPS |
| Missing Linux equivalent of `test:with-db` | Medium | No `npm run db:test:up && sleep X && npm test && npm run db:test:down` for Linux |

**Recommendation (requires approval)**: Create a Linux-compatible `test:with-db:linux` script using a bash `until` loop to wait for MySQL health before running tests.

---

## 5. Build Validation

### Frontend build
- `npm run build` → runs `vite build` with TypeScript compilation
- Requires `frontend/node_modules` (not installed in this workspace state)
- Output: `frontend/dist/` (not present in repo, built in Docker image)

### Backend build
- No compile step — pure Node.js
- `npm start` runs directly from `src/`

### Docker production build
- Frontend: `frontend/Dockerfile.prod` — multi-stage: node:20-alpine (build) → nginx:1.27-alpine (serve)
- Backend: `backend/Dockerfile` (not inspected yet)

---

## 6. CI/CD Status

- `.github/` directory exists but contains only `copilot-instructions.md`
- **No GitHub Actions workflow files found** — CI/CD pipeline is not configured
- No automated quality gate runs on push/PR

---

## 7. Recommended Quality Gate Commands (not yet executed)

Order of safe execution (each requires human approval before running):

```bash
# Step A — Backend lint (no DB, no build)
cd backend && npm run lint

# Step B — Backend unit tests only (no DB)
cd backend && cross-env NODE_ENV=test npx jest tests/unit --runInBand

# Step C — Start test DB
cd backend && npm run db:test:up
# Wait for healthy, then:

# Step D — Full backend integration tests + coverage
cd backend && npm run test:ci

# Step E — Tear down test DB
cd backend && npm run db:test:down

# Step F — Frontend lint
cd frontend && npm run lint

# Step G — Frontend tests (Vitest)
cd frontend && npm test
```

---

## 8. Risk Summary

| Area | Risk | Status |
|---|---|---|
| `node_modules` | Not present in workspace (not installed) | Not checked; do NOT run npm install without approval |
| Test DB | Requires port 3308 free or `mysql_test` container | Not verified; may conflict with `viraazul-mysql-dev` on 3308 |
| Port 3308 conflict | `viraazul-mysql-dev` is already using host port 3308 | **CONFLICT** — test DB cannot start without port resolution |
| PowerShell script | `test:with-db` is not runnable on Linux | Use Linux alternative |

### Port 3308 Conflict Detail
The test compose file (`docker-compose.test.yml`) maps `mysql_test` to host port 3308.  
The container `viraazul-mysql-dev` is already occupying port 3308 on this host.  
**Integration tests cannot start without resolving this conflict** (requires human approval to stop one or remap the port).

## Phase 2 — Live checks (2026-05-15)

- **Containers observed:** `virazul-backend` (3000, healthy), `orchestrator-backend` (3002, healthy), `virazul-frontend` (8080, serves SPA), `orchestrator-frontend` (3003, reported UNHEALTHY), multiple MySQL containers on 3307/3308.
- **Health probes (host -> service):**
  - `http://127.0.0.1:3000/saude` → 404 Not Found
  - `http://127.0.0.1:3000/ready` → 404 Not Found
  - `http://127.0.0.1:3000/ping` → 404 Not Found
  - `http://127.0.0.1:3002/saude` → 200 OK
  - `http://127.0.0.1:8080/` → 200 OK (SPA index.html)
  - `http://127.0.0.1:3003/` → 200 OK (nginx)
- **Implication:** the code in the running backend on port 3000 does not expose the documented health routes; another service on 3002 does respond correctly. This reinforces repository vs runtime divergence and the need to validate which image/source is authoritative before running tests or refactors.
