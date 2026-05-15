# CTFlow — Compose Validation

**Date**: 2026-05-15  
**Status**: validation only; no containers started.

---

## 1. Scope

Validated in read-only / non-runtime mode:

- [docker-compose.yml](/opt/apps/projects/ctflow-app/docker-compose.yml)
- [docker-compose.dev.yml](/opt/apps/projects/ctflow-app/docker-compose.dev.yml)
- [docker-compose.prod.yml](/opt/apps/projects/ctflow-app/docker-compose.prod.yml)
- [docker-compose.test.yml](/opt/apps/projects/ctflow-app/docker-compose.test.yml)

Commands used:

- `docker compose config`
- `docker compose config --services`
- `docker compose config --volumes`
- `docker compose config --networks`

No `up`, `down`, `build`, `restart`, tests, or migrations were executed.

---

## 2. Validation result

### Overall result

All four Compose files resolve successfully through `docker compose config`.

That means:

- syntax is valid
- referenced services are structurally valid
- declared volumes and networks resolve
- environment interpolation is working with the current local `.env`

### Resolved services

| Compose file | Services |
|---|---|
| `docker-compose.yml` | `mysql`, `adminer`, `backend`, `frontend` |
| `docker-compose.dev.yml` | `mysql`, `adminer`, `backend`, `frontend` |
| `docker-compose.prod.yml` | `mysql`, `backend`, `frontend` |
| `docker-compose.test.yml` | `mysql_test` |

### Resolved volumes

| Compose file | Volumes |
|---|---|
| `docker-compose.yml` | `mysql_data_dev` |
| `docker-compose.dev.yml` | `mysql_data_dev` |
| `docker-compose.prod.yml` | `ctflow_mysql_data` |
| `docker-compose.test.yml` | none named |

### Resolved networks

| Compose file | Networks |
|---|---|
| `docker-compose.yml` | `default` |
| `docker-compose.dev.yml` | `default` |
| `docker-compose.prod.yml` | `ctflow-net` |
| `docker-compose.test.yml` | `default` |

---

## 3. Key findings

### A. Compose project name resolution

The resolved project name is `ctflow-app`.

This is important because Docker-created resources would be namespaced under that project, for example:

- network `ctflow-app_default`
- network `ctflow-app_ctflow-net`
- volume `ctflow-app_mysql_data_dev`
- volume `ctflow-app_ctflow_mysql_data`

### B. Production compose resolves to isolated resource names

The production file resolves to:

- containers `ctflow-mysql`, `ctflow-backend`, `ctflow-frontend`
- network `ctflow-app_ctflow-net`
- volume `ctflow-app_ctflow_mysql_data`

This aligns with the residual CTFlow volume found during runtime ownership mapping.

### C. Test compose has no named volume

`docker-compose.test.yml` uses only a bind mount for `mysql-init` and would create anonymous data storage by default.

This is consistent with the file comment and reduces long-lived persistence risk for tests.

---

## 4. Secret-handling warning

`docker compose config` expands environment variables from `.env`.

Two important safety implications were observed:

1. Environment values such as DB and JWT secrets become visible in resolved config output.
2. The MySQL healthcheck command in dev/default compose interpolates the MySQL root password directly into the command arguments.

This means future validation logs must be handled carefully.

### Sensitive patterns confirmed in resolved config

- DB password variables
- JWT secret variables
- MySQL root password variables
- MySQL test password variables
- healthcheck command argument containing MySQL password

### Reporting rule followed here

This document intentionally does **not** reproduce any secret value.

---

## 5. Structural readiness observations

### Dev/default compose

Strengths:

- backend waits for MySQL health
- frontend points to internal backend service name
- bind mounts support fast local iteration

Readiness concerns:

- all main host ports declared here are currently occupied on this host
- MySQL healthcheck uses `localhost` and embeds password in the command string
- frontend depends on backend `service_started`, not health

### Production compose

Strengths:

- frontend and backend use CTFlow-specific container names
- frontend bind is loopback-only on `127.0.0.1:8087`
- MySQL is internal-only by default
- dedicated bridge network is declared

Readiness concerns:

- backend bind `127.0.0.1:3001` is currently occupied by VirAzul dev/API
- no backend healthcheck is declared
- no frontend healthcheck is declared
- `depends_on` uses start ordering, not health/readiness guarantees

### Test compose

Strengths:

- minimal service footprint
- healthcheck exists
- no named persistent volume

Readiness concerns:

- host port `3308` is currently occupied
- test credentials are static in file content
- healthcheck command includes password in command args

---

## 6. Non-runtime blockers discovered by validation

1. Current CTFlow port bindings are not startable on this host without remapping.
2. Resolved config output contains sensitive values and must be redacted in any shared logs.
3. Dev/default and test MySQL healthchecks expose passwords in command arguments.
4. Production compose has no healthcheck coverage for backend or frontend readiness.
5. Production `depends_on` sequencing does not guarantee app readiness before dependent services start.

---

## 7. Conclusion

CTFlow Compose files are **syntactically valid and resolvable**, but **not operationally ready to start on this host as-is**.

The main reasons are:

- host port collisions
- lack of readiness/health orchestration in production compose
- and secret exposure risk when using resolved Compose output operationally

See [reactivation-readiness.md](/opt/apps/projects/ctflow-app/docs/reactivation-readiness.md) for the rollout-facing blocker list.
