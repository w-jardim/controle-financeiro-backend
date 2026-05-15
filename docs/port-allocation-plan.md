# CTFlow — Port Allocation Plan

**Date**: 2026-05-15  
**Status**: planning only.

---

## 1. Goal

Reserve a safe, non-conflicting port strategy for CTFlow reactivation on a host that already has active neighboring stacks.

---

## 2. Known occupied ports

| Port | Current owner | Purpose |
|---|---|---|
| `3000` | VirAzul | backend |
| `3001` | VirAzul dev/API | backend |
| `3002` | Orchestrator | backend |
| `3003` | Orchestrator | frontend |
| `3307` | VirAzul | MySQL |
| `3308` | VirAzul dev | MySQL |
| `5173` | VirAzul dev | Vite frontend |
| `8080` | VirAzul | frontend |

Additional repository-declared CTFlow ports currently not used by CTFlow runtime:

| Repo-declared CTFlow port | Declared purpose | Current situation |
|---|---|---|
| `8087` | CTFlow prod frontend | appears free from current mapping |

Candidate reactivation ports previously proposed and observed as currently free during this phase:

| Candidate port | Intended use | Observed status |
|---|---|---|
| `3101` | isolated backend | not listening at validation time |
| `3317` | isolated MySQL (earlier candidate, superseded) | not listening at validation time |
| `3318` | isolated MySQL (Phase 6B selection) | not listening at validation time |
| `8187` | isolated frontend | not listening at validation time |
| `8188` | isolated CloudBeaver / DB UI | not listening at validation time |

Phase 6B refinement: the Phase 6B brief consolidated the MySQL host port
to `3318` for the isolated reactivation stack. The earlier `3317`
candidate is retained here only as a historical option and is not used
by [docker-compose.reactivation.yml](/opt/apps/projects/ctflow-app/docker-compose.reactivation.yml).

---

## 3. Port collision assessment

Current versioned CTFlow bindings conflict as follows:

| CTFlow file | Service | Declared binding | Collision status |
|---|---|---|---|
| `docker-compose.yml` | backend | `3000:3000` | blocked by VirAzul |
| `docker-compose.yml` | frontend | `5173:5173` | blocked by VirAzul dev |
| `docker-compose.yml` | mysql | `3307:3306` | blocked by VirAzul |
| `docker-compose.yml` | adminer | `8080:8080` | blocked by VirAzul |
| `docker-compose.prod.yml` | backend | `127.0.0.1:3001:3000` | blocked by VirAzul dev |
| `docker-compose.prod.yml` | frontend | `127.0.0.1:8087:80` | no conflict currently observed |
| `docker-compose.test.yml` | mysql_test | `3308:3306` | blocked by VirAzul dev |

Implication:

- neither the dev/default nor the prod CTFlow profile can be started safely as-is

---

## 4. Recommended allocation approach

### Strategy

Use a dedicated CTFlow reactivation port range rather than trying to reclaim currently occupied bindings.

Suggested principles:

- keep CTFlow grouped in a recognizable range
- prefer loopback binds for prod-like validation
- avoid all currently occupied ports

### Candidate reserved range

The Phase 6B selection (now reflected in
[docker-compose.reactivation.yml](/opt/apps/projects/ctflow-app/docker-compose.reactivation.yml))
is:

- backend: `127.0.0.1:3101`
- frontend: `127.0.0.1:8187`
- mysql: `127.0.0.1:3318`
- CloudBeaver / DB UI if enabled later: `127.0.0.1:8188`

A separate `3317` was considered earlier for MySQL but was not chosen;
`3318` is the active candidate.

These are **planning candidates only**, not applied changes.

Validation note:

- these candidate ports were checked during this phase and were not found listening at the time of inspection
- that does **not** reserve them; they must be rechecked immediately before any future activation

---

## 5. Recommended mappings by activation mode

### Mode A — isolated dev smoke run

Suggested target mapping:

| Service | Current repo default | Candidate isolated host port |
|---|---|---|
| backend | `3000` | `3101` |
| frontend | `5173` | `5174` or `5175` |
| mysql | `3307` | `3317` |
| adminer | `8080` | `8188` |

### Mode B — isolated prod-like validation

Suggested target mapping:

| Service | Current repo prod | Candidate isolated host port |
|---|---|---|
| backend | `127.0.0.1:3001` | `127.0.0.1:3101` |
| frontend | `127.0.0.1:8087` | keep `127.0.0.1:8087` if still free, otherwise `127.0.0.1:8187` |
| mysql | internal only in prod compose | optional external debug bind only if explicitly approved |

### Mode C — isolated test DB

Suggested target mapping:

| Service | Current repo test | Candidate isolated host port |
|---|---|---|
| mysql_test | `3308` | `3318` |

---

## 6. Approval guidance

Before any port change is implemented later, approval should specify:

1. which activation mode is being used
2. whether loopback-only binds are required
3. whether test DB needs a dedicated host port at all
4. whether any reverse proxy integration is expected in the same phase

---

## 7. Recommendation

For the first CTFlow reactivation:

- prefer isolated prod-like or dev-like bindings
- avoid every currently occupied port
- keep frontend off public `0.0.0.0` unless there is a specific approved reason
- keep any initial backend bind on loopback if prod-like validation is the goal

This gives the cleanest path to a low-blast-radius first boot.

---

## 8. Phase 6A note

Compose validation confirmed that the current versioned CTFlow port layout is not runnable on this host without remapping, while the previously proposed candidate isolated ports were free at inspection time.

---

## 9. Phase 6B note

A proposal-only Compose override
[docker-compose.reactivation.yml](/opt/apps/projects/ctflow-app/docker-compose.reactivation.yml)
has been added. It binds:

| Service | Host bind |
|---|---|
| backend | `127.0.0.1:3101` |
| mysql | `127.0.0.1:3318` |
| frontend | `127.0.0.1:8187` |
| cloudbeaver (commented out) | `127.0.0.1:8188` |

The four candidate host ports were re-checked during Phase 6B and were
observed not listening at inspection time. This is not a reservation:
they must be re-checked again immediately before any Phase 7 start.
