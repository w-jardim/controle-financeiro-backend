# CTFlow — Runtime Port Map

**Date**: 2026-05-15  
**Purpose**: map repository-declared ports against observed runtime behavior and identify which project owns each binding.

---

## 1. Repository-declared port map

| Source | Service | Binding | Notes |
|---|---|---:|---|
| `docker-compose.yml` | `mysql` | `3307:3306` | Dev/default MySQL |
| `docker-compose.yml` | `backend` | `3000:3000` | Dev/default backend |
| `docker-compose.yml` | `frontend` | `5173:5173` | Vite dev |
| `docker-compose.yml` | `adminer` | `8080:8080` | Dev DB UI |
| `docker-compose.dev.yml` | `mysql` | `3307:3306` | Same as default compose |
| `docker-compose.dev.yml` | `backend` | `3000:3000` | Same as default compose |
| `docker-compose.dev.yml` | `frontend` | `5173:5173` | Same as default compose |
| `docker-compose.dev.yml` | `adminer` | `8080:8080` | Same as default compose |
| `docker-compose.prod.yml` | `backend` | `127.0.0.1:3001:3000` | Repo-declared prod backend |
| `docker-compose.prod.yml` | `frontend` | `127.0.0.1:8087:80` | Repo-declared prod frontend |
| `docker-compose.test.yml` | `mysql_test` | `3308:3306` | Test DB; currently blocked on host |

---

## 2. Observed runtime map with ownership

| Runtime service | Owner | Observed binding | Observed behavior | Alignment with CTFlow repo |
|---|---|---:|---|---|
| `virazul-backend` | VirAzul | `0.0.0.0:3000->3000` | `/saude`, `/ready`, `/ping` return `404` | Divergent |
| `orchestrator-backend` | Orchestrator | `0.0.0.0:3002->3000` | `/saude` returns `200 OK` | Not represented in this repo |
| `virazul-frontend` | VirAzul | `127.0.0.1:8080->80` | `/api/*` returns SPA HTML | Divergent from repo nginx config |
| `orchestrator-frontend` | Orchestrator | `0.0.0.0:3003->80` | `/` serves; healthcheck false-negative likely | Not represented in this repo |
| `virazul-mysql` | VirAzul | `0.0.0.0:3307->3306` | Running | Overlaps CTFlow dev/default MySQL port |
| `viraazul-mysql-dev` | VirAzul dev | `0.0.0.0:3308->3306` | Occupies test DB port | Conflicts with repo test compose |
| `virazul-api-dev` | VirAzul dev | `0.0.0.0:3001->3000` | Running dev API | Collides conceptually with repo prod backend binding |
| `virazul-app-dev` | VirAzul dev | `0.0.0.0:5173->5173` | Running dev frontend | Aligns with dev/default compose |

---

## 3. Ownership and Compose source map

| Runtime group | Compose project label | Working dir label | Network | Notes |
|---|---|---|---|---|
| CTFlow repo declaration | `ctflow-app` expected | `/opt/apps/projects/ctflow-app` expected | none active found | No active containers found |
| VirAzul | `virazul` | `/opt/apps/projects/virazul` | `virazul_default` | Production-like stack |
| VirAzul dev | `api-virazul` | `/opt/apps/projects/virazul-dev/api-virazul` | `api-virazul_default` | Dev stack occupying `3001`, `3308`, `5173` |
| Orchestrator | `orchestrator` | `/opt/apps/projects/orchestrator` | `orchestrator_orchestrator` | Separate application stack |

CTFlow-specific residual artifact found:

- Docker volume `ctflow-app_ctflow_mysql_data`

No active containers were found for:

- `ctflow-backend`
- `ctflow-frontend`
- `ctflow-mysql`
- `financeiro-backend-dev`
- `financeiro-frontend-dev`
- `mysql-financeiro-dev`

---

## 4. Route and proxy map

| Endpoint | Expected from repo | Observed in runtime | Interpretation |
|---|---|---|---|
| `127.0.0.1:3000/saude` | `200` from backend health route | `404` from VirAzul backend | Running image does not match repo route surface |
| `127.0.0.1:3000/ready` | `200` or `503` from readiness route | `404` from VirAzul backend | Same divergence |
| `127.0.0.1:3000/ping` | `200` | `404` from VirAzul backend | Same divergence |
| `127.0.0.1:3002/saude` | Not defined by this repo's compose | `200` from Orchestrator backend | Adjacent stack, not CTFlow |
| `127.0.0.1:8080/api/*` | Backend proxy via frontend nginx | SPA `index.html` from VirAzul frontend | Running frontend config differs from repo |
| `127.0.0.1:3003/api/*` | Not defined by this repo | SPA `index.html` from Orchestrator frontend | Missing/wrong internal API proxy in that runtime |

---

## 5. Key mismatches to resolve before implementation

1. Repo prod ports are `3001` and `8087`, but the main observed production-like runtime used `3000` and `8080` under VirAzul ownership.
2. Repo frontend nginx config declares `/api/` proxying, but observed frontend runtimes did not proxy `/api/*`.
3. Repo backend declares root health routes, but observed service on port `3000` did not expose them.
4. Repo test DB assumes host port `3308`, which is currently occupied by the VirAzul dev stack.
5. The CTFlow repo currently has no active runtime on this host, so port comparisons are against adjacent stacks, not a deployed CTFlow stack.

---

## 6. Operational conclusion

The host is running multiple overlapping application stacks, and the CTFlow repository does not currently map 1:1 to any active runtime observed on the host.

Before any build, test, or deployment work:

- choose whether CTFlow will become its own runtime or reconcile against VirAzul,
- confirm which ports are intentionally reserved,
- and decide whether the repo should follow runtime or runtime should be recreated from the repo.

---

## 7. Reactivation planning note

From a reactivation perspective, the current versioned CTFlow port layout is not directly startable on this host.

Safe reactivation therefore requires:

1. a deliberate non-conflicting port allocation,
2. an isolation strategy separate from VirAzul and Orchestrator,
3. and a later approved implementation step to introduce that isolated mapping.

---

## 8. Phase 6A validation note

Compose validation in this phase confirmed:

- all Compose files resolve successfully
- the declared CTFlow ports still conflict with active host bindings
- candidate isolated ports such as `3101`, `3317`, `3318`, `8187`, and `8188` were not listening at inspection time

Those candidate ports remain planning inputs only and must be revalidated immediately before any actual reactivation step.

---

## 9. Phase 7B runtime update

The first approved CTFlow runtime service is now active:

| Runtime service | Owner | Observed binding | State | Notes |
|---|---|---:|---|---|
| `ctflow-reactivation-mysql` | CTFlow reactivation | `127.0.0.1:3318->3306` | healthy | fresh isolated startup |

This changes the local candidate-port status as follows:

- `3318` is no longer just a planning candidate
- `3318` is now actively allocated to CTFlow reactivation MySQL

Important:

- this does not change the ownership of `3000`, `3001`, `3002`, `3003`, `3307`, `3308`, `5173`, or `8080`
- CTFlow backend and frontend are still not running

---

## 10. Phase 6B proposal note

A proposal-only Compose override
[docker-compose.reactivation.yml](/opt/apps/projects/ctflow-app/docker-compose.reactivation.yml)
introduces an isolated CTFlow stack with the following host bindings,
all on `127.0.0.1` only:

| Service | Host bind | Container port | Notes |
|---|---|---:|---|
| `mysql` | `127.0.0.1:3318` | `3306` | Not exposed publicly; loopback only |
| `backend` | `127.0.0.1:3101` | `3000` | Loopback only |
| `frontend` | `127.0.0.1:8187` | `80` | Loopback only |
| `cloudbeaver` (optional, commented out) | `127.0.0.1:8188` | `8978` | Disabled in file |

These bindings are designed to:

- avoid every currently observed host binding owned by VirAzul or Orchestrator,
- avoid every binding declared by the existing CTFlow Compose files,
- and keep all surface invisible off-host until Phase 7 review.

The override does **not** mount the residual volume
`ctflow-app_ctflow_mysql_data`. It uses a dedicated volume namespaced
under the pinned project name `ctflow-reactivation`. No existing
Compose file was modified to introduce these bindings.

---

## 11. Phase 7C readiness note

The active CTFlow runtime service on `127.0.0.1:3318` has now passed both:

- Docker health validation
- container-local read-only SQL readiness validation

Operationally, this means:

- `3318` is not just bound; it is serving a queryable CTFlow MySQL instance
- the service is suitable as the database dependency for a future backend-only start, subject to separate approval

---

## 12. Phase 8A planning note (backend-only)

A backend-only startup plan has been drafted at
[docs/backend-startup-plan.md](/opt/apps/projects/ctflow-app/docs/backend-startup-plan.md).
The planned binding for the backend service is unchanged from the
Phase 6B proposal:

| Service | Planned host bind | Container port | State at planning time |
|---|---|---:|---|
| `ctflow-reactivation-backend` | `127.0.0.1:3101` | `3000` | not listening (port free) |

Important nuances for this phase:

- `127.0.0.1:3101` was re-checked during Phase 8A planning and was not
  listening at inspection time. This is a planning observation, not a
  reservation; it must be re-verified immediately before any approved
  start.
- The backend container reaches MySQL through the isolated network
  `ctflow-reactivation_ctflow-reactivation-net` using service DNS
  `mysql:3306` — **not** through the host-published `127.0.0.1:3318`.
  This means `DB_PORT` inside the container must be `3306`, regardless
  of the host port.
- Phase 8A does not change the ownership of any of
  `3000`, `3001`, `3002`, `3003`, `3307`, `3308`, `5173`, `8080`,
  `8087`, `8187`, or `8188`. Only `127.0.0.1:3101` would transition
  from "planning candidate" to "actively bound" upon eventual approval
  and execution.
