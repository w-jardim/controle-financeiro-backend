# CTFlow — Backend Environment Requirements

**Date**: 2026-05-15
**Phase**: 8A — Backend-Only Startup Planning
**Status**: read-only inspection; no values printed; no `.env` modified.

---

## 1. Purpose

Catalog every environment variable the CTFlow backend reads at startup or
at request time, so that a backend-only reactivation against the
already-healthy isolated MySQL (`ctflow-reactivation-mysql`,
`127.0.0.1:3318`) can be approved with full visibility of the required
configuration surface.

This document records **variable names and roles only**. It deliberately
does not reproduce any value from `.env`, `.env.example`, or container
runtime.

---

## 2. Sources inspected (read-only)

| Path | Role |
|---|---|
| [backend/src/index.js](/opt/apps/projects/ctflow-app/backend/src/index.js) | Process bootstrap; calls `validarEnv()`; reads `PORT`, `NODE_ENV` |
| [backend/src/app.js](/opt/apps/projects/ctflow-app/backend/src/app.js) | Express app; reads `NODE_ENV` for info route |
| [backend/src/shared/utils/validarEnv.js](/opt/apps/projects/ctflow-app/backend/src/shared/utils/validarEnv.js) | Fail-fast list of required vars |
| [backend/src/shared/database/connection.js](/opt/apps/projects/ctflow-app/backend/src/shared/database/connection.js) | mysql2 pool; reads `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` |
| [backend/src/shared/utils/logger.js](/opt/apps/projects/ctflow-app/backend/src/shared/utils/logger.js) | pino; reads `LOG_LEVEL`, `NODE_ENV` |
| [backend/src/shared/middlewares/corsConfig.js](/opt/apps/projects/ctflow-app/backend/src/shared/middlewares/corsConfig.js) | CORS header; reads `CORS_ORIGIN` |
| [backend/.env.example](/opt/apps/projects/ctflow-app/backend/.env.example) | Documented variable surface (template only) |
| [docker-compose.reactivation.yml](/opt/apps/projects/ctflow-app/docker-compose.reactivation.yml) | `env_file: .env` + `environment:` overrides for backend |

---

## 3. Required variables (hard fail at startup)

`validarEnv.js` aborts the process if any of these are missing:

| Name | Used by | Notes |
|---|---|---|
| `DB_HOST` | `connection.js` | In the reactivation compose, this is **overridden to `mysql`** by the service `environment:` block, so the value in `.env` is ignored at runtime. |
| `DB_USER` | `connection.js` | Inherited from `.env`. Must correspond to a MySQL user inside `ctflow-reactivation-mysql` that can access `gestao_ct_financeiro`. |
| `DB_PASSWORD` | `connection.js` | Inherited from `.env`. Secret — not printed here. |
| `DB_NAME` | `connection.js` | Inherited from `.env`. Should equal `gestao_ct_financeiro` (the database confirmed to exist in Phase 7C). |
| `JWT_SECRET` | `utils/jwt.js` (consumed via `authMiddleware`) | Inherited from `.env`. Secret. Required even before any login route is exercised because `validarEnv()` blocks startup. |

---

## 4. Optional variables (with documented defaults)

| Name | Default | Used by | Notes |
|---|---|---|---|
| `DB_PORT` | `3306` | `connection.js` | **Container-internal** MySQL port inside `ctflow-reactivation-net`. Must be `3306` — not `3318`. See §6 blocker. |
| `PORT` | `3000` | `index.js` | Backend listen port **inside** the container. The compose maps `127.0.0.1:3101 -> 3000`, so this should remain `3000`. |
| `NODE_ENV` | `development` | `index.js`, `app.js`, `logger.js` | Compose overrides to `production` for the reactivation backend. |
| `LOG_LEVEL` | `info` | `logger.js` | Pino level. |
| `CORS_ORIGIN` | `*` | `corsConfig.js` | First-boot acceptable as `*`; tighten later when the frontend host is known. |
| `JWT_EXPIRES_IN` | — | `utils/jwt.js` (presumed) | Present in `.env.example` as `7d`. Read-only inspection here; behavior beyond token issuance is out of Phase 8A scope. |

---

## 5. Variables consumed by MySQL (already running, for reference only)

Listed for context — already satisfied by the running
`ctflow-reactivation-mysql` container. Do **not** modify in this phase.

| Name | Used by | Notes |
|---|---|---|
| `MYSQL_ROOT_PASSWORD` | MySQL image, healthcheck | Loaded from `.env`. |
| `MYSQL_DATABASE` | MySQL image | Loaded from `.env`. Resolves to `gestao_ct_financeiro` per Phase 7C. |

---

## 6. Effective configuration shape for backend reactivation

For the `backend` service in
[docker-compose.reactivation.yml](/opt/apps/projects/ctflow-app/docker-compose.reactivation.yml),
Compose merges `env_file:` (lower precedence) with `environment:`
(higher precedence):

| Variable | Source at runtime | Effective value |
|---|---|---|
| `DB_HOST` | `environment:` override | `mysql` (service DNS on the isolated network) |
| `NODE_ENV` | `environment:` override | `production` |
| `DB_PORT` | `.env` (no override) | inherited from `.env` — **must be `3306` for container-to-container access** |
| `DB_USER` | `.env` | inherited |
| `DB_PASSWORD` | `.env` | inherited |
| `DB_NAME` | `.env` | inherited; should be `gestao_ct_financeiro` |
| `JWT_SECRET` | `.env` | inherited |
| `JWT_EXPIRES_IN` | `.env` | inherited |
| `PORT` | `.env` | inherited; should be `3000` to match the compose port mapping |
| `LOG_LEVEL` | `.env` | inherited |
| `CORS_ORIGIN` | `.env` | inherited |

### Confirmed presence (names-only) in `.env`

The following names are present in the repository `.env` (values not
shown):

```
CORS_ORIGIN
DB_HOST
DB_NAME
DB_PASSWORD
DB_PORT
DB_USER
JWT_EXPIRES_IN
JWT_SECRET
MYSQL_DATABASE
MYSQL_ROOT_PASSWORD
NODE_ENV
PORT
```

`LOG_LEVEL` is documented in `backend/.env.example` but not present in
`.env`. The backend defaults it to `info`, so this is acceptable.

---

## 7. Open confirmations required before approval

These are **not** fixes — they are read-only confirmations the operator
must make before the backend is started. The agent must not modify
`.env` or the compose file to resolve them.

1. **`DB_PORT` value in `.env` must equal `3306`.**
   The container connects to MySQL on the isolated docker network using
   service DNS `mysql`, where MySQL listens on its internal port `3306`.
   The host-side port `3318` is **not** reachable from inside the
   `ctflow-reactivation-net` network. If `.env` currently sets
   `DB_PORT=3318` (a plausible mis-set after Phase 7B/7C debugging),
   the backend pool will fail to connect.
   - Approval-time check: have the operator verify the value privately.

2. **`DB_NAME` value in `.env` must equal `gestao_ct_financeiro`.**
   This is the database confirmed to exist with 16 tables in Phase 7C.
   Any other value would point the backend at a missing database.

3. **`DB_USER` and `DB_PASSWORD` in `.env` must correspond to a MySQL
   user that exists inside `ctflow-reactivation-mysql` and can access
   `gestao_ct_financeiro`.**
   Phase 7C confirmed `root@%` and `root@localhost` exist in the running
   container. If `.env` references an application user that was created
   in the historical production database but is **not** in the fresh
   isolated volume, the pool will be rejected.

4. **`JWT_SECRET` must be non-empty.**
   `validarEnv()` rejects an empty string. Required even before any
   protected route is exercised.

5. **`PORT` should remain `3000` (or unset, to use the default).**
   The compose maps `127.0.0.1:3101 -> 3000`. Any other internal port
   would break the host port mapping.

If any of (1)–(3) is misaligned, this is a **Phase 8A blocker**. The
remediation requires explicit approval to either:

- edit `.env` to align the value, **or**
- add a corresponding `environment:` override to the `backend` service
  in `docker-compose.reactivation.yml`.

Both options are out of scope for this phase.

---

## 8. What this document does not cover

- Frontend env vars (frontend is not in scope for Phase 8A).
- CloudBeaver env vars (CloudBeaver is not in scope for Phase 8A).
- Migration runner env vars (no migrations will be executed in Phase 8A).
- Test-suite env vars (no tests will be run in Phase 8A).
- Secret values themselves.
