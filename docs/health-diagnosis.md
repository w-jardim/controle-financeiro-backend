# Health Diagnosis — CTFlow (Phase 2, Read-Only)

**Date**: 2026-05-15  
**Branch**: backup/vps-2026-04-10-zod-prod-align  
**Method**: Read-only inspection — no containers restarted, no code modified.

---

## 1. Container Inventory

| Container | Image | Status | Ports | Health |
|---|---|---|---|---|
| `virazul-backend` | `virazul-virazul-backend` | Up 2 weeks | `0.0.0.0:3000→3000` | healthy |
| `virazul-frontend` | `virazul-virazul-frontend` | Up 2 weeks | `127.0.0.1:8080→80` | no healthcheck |
| `virazul-mysql` | `mysql:8.0` | Up 2 weeks | `0.0.0.0:3307→3306` | healthy |
| `virazul-api-dev` | `api-virazul-api` | Up 2 weeks | `0.0.0.0:3001→3000` | no healthcheck |
| `viraazul-mysql-dev` | `mysql:8.0` | Up 2 weeks | `0.0.0.0:3308→3306` | healthy |
| `virazul-app-dev` | `node:20-alpine` | Up 2 weeks | `0.0.0.0:5173→5173` | no healthcheck |
| `orchestrator-frontend` | `orchestrator-frontend` | Up 2 weeks | `0.0.0.0:3003→80` | **unhealthy** |
| `orchestrator-backend` | `orchestrator-backend` | Up 2 weeks | `0.0.0.0:3002→3000` | healthy |
| `orchestrator-mysql` | `mysql:8.0` | Up 2 weeks | internal only | healthy |
| `orchestrator-redis` | `redis:7.4-alpine` | Up 2 weeks | internal only | healthy |

---

## 2. CTFlow Production Backend — Code Version Mismatch

### Symptom
All health endpoints return HTTP 404 from the running production backend (`localhost:3000`):

```
GET /saude   → 404 {"data":null,"meta":null,"errors":[{"code":"NOT_FOUND","message":"Rota nao encontrada.","request_id":"..."}]}
GET /ping    → 404
GET /ready   → 404
GET /api/saude → 404
```

### Root Cause
The `virazul-backend` container was built from a **different project directory**:  
`/opt/apps/projects/virazul/` (confirmed via Docker labels: `project.working_dir=/opt/apps/projects/virazul`)

The current repository at `/opt/apps/projects/ctflow-app/` contains health routes registered at app level in `backend/src/app.js:50-94`. But the **running image** predates or diverges from these routes.

Evidence of divergence:
- **Current repo** 404 format: `{"erro":{"mensagem":"Rota não encontrada","codigo":"NOT_FOUND","status":404}}`
- **Running container** 404 format: `{"data":null,"meta":null,"errors":[{"code":"NOT_FOUND","message":"...","request_id":"..."}]}`

The `request_id` field in the running container's errors aligns with the `requestId` middleware in the current repo, but the envelope format is entirely different — indicating the running code has been further evolved or is from a parallel branch.

### Impact
- Docker `healthy` label on `virazul-backend` is from its own internal healthcheck (likely checking a different endpoint, e.g., `GET /`), not the named routes
- The documented health endpoints (`/saude`, `/ping`, `/ready`, `/teste-banco`) do **not work** on the currently deployed backend
- Monitoring tooling relying on these routes will report false negatives

### Rollback Checkpoint
No action taken. This is a read-only observation. Do not rebuild or restart without human approval.

---

## 3. CTFlow Production Frontend — Nginx Has No API Proxy

### Symptom
`GET http://localhost:8080/api/saude` returns HTTP 200 with the SPA `index.html`, not a JSON API response.

### Root Cause
The nginx config **inside the running `virazul-frontend` container** is:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
    location = /favicon.ico { ... }
}
```

There is **no `location /api/` proxy block**. All requests, including `/api/*`, fall through to `try_files` and return the SPA `index.html`.

Contrast with the **current repo's** `frontend/nginx.conf` which DOES have:
```nginx
location /api/ {
    proxy_pass http://backend:3000/api/;
    ...
}
```

The production container image was built from `/opt/apps/projects/virazul/app/` with a simpler nginx config — API traffic is expected to be routed by the **host-level Nginx reverse proxy** (outside Docker), not by the frontend container itself.

### Impact
- Direct access to port 8080 (`virazul-frontend`) cannot reach the API — all API responses are the SPA fallback
- If the host Nginx is correctly routing `/api/` traffic to the backend container, the application still works end-to-end through the public domain
- Port 8080 health checks for API endpoints will return false positives (HTTP 200 with HTML body)

### Rollback Checkpoint
No action taken. Read-only observation only.

---

## 4. `orchestrator-frontend` — Unhealthy (Root Cause Confirmed)

### Symptom
```
Status: unhealthy
FailingStreak: 57583
Health check output: "wget: can't connect to remote host: Connection refused"
Health check command: wget --quiet --tries=1 --spider http://localhost/
```

### Investigation

| Test | Result |
|---|---|
| `docker exec orchestrator-frontend wget --quiet --tries=1 --spider http://localhost/` | **Connection refused** (exit=1) |
| `docker exec orchestrator-frontend curl -s http://localhost/` | **HTTP 200** |
| nginx inside container — listening ports | `0.0.0.0:80 LISTEN` (PID 1, nginx master) |
| nginx config — listen directives | `listen 80;` and `listen [::]:80;` |
| nginx access logs | Serving real HTTP 200 traffic successfully |

### Root Cause
**BusyBox `wget` resolves `localhost` to `::1` (IPv6) first** (confirmed by `/etc/hosts` which maps both `127.0.0.1` and `::1` to `localhost`). BusyBox wget does not fall back to IPv4 when IPv6 connection is refused.

The nginx config declares `listen [::]:80;` but `netstat` inside the container only shows a single `tcp 0.0.0.0:80` socket — the IPv6 socket is either not bound or not shown by the BusyBox `netstat`. When BusyBox `wget` tries `::1:80`, it gets "Connection refused".

Meanwhile, `curl` resolves `localhost` to `127.0.0.1` (IPv4 preferred in this glibc context) and connects successfully.

**This container is functionally healthy** — nginx serves real traffic correctly. The unhealthy status is a false alarm caused by a healthcheck tool/target mismatch.

### Proposed Fix (requires human approval — Phase 3 or later)
Change the Docker healthcheck from:
```
wget --quiet --tries=1 --spider http://localhost/
```
to one of:
```
# Option A — force IPv4
wget --quiet --tries=1 --spider http://127.0.0.1/

# Option B — use curl if available
curl -f http://127.0.0.1/ -o /dev/null -s
```

This change requires modifying the `docker-compose.yml` for the orchestrator project — **not the CTFlow repo** — and redeploying the container. No action taken at this stage.

---

## 5. Health Endpoint Probe Summary

All probes performed via `curl` from the host. No modifications made.

| Endpoint | Port | HTTP Status | Body Summary |
|---|---|---|---|
| `GET /saude` | 3000 (virazul-backend) | 404 | NOT_FOUND (code mismatch) |
| `GET /ping` | 3000 | 404 | NOT_FOUND |
| `GET /ready` | 3000 | 404 | NOT_FOUND |
| `GET /teste-banco` | 3000 | 404 | NOT_FOUND |
| `GET /api/saude` | 3000 | 404 | NOT_FOUND |
| `GET /saude` | 3001 (virazul-api-dev) | 404 | NOT_FOUND |
| `GET /ping` | 3001 | 404 | NOT_FOUND |
| `GET /` | 8080 (virazul-frontend) | 200 | SPA index.html |
| `GET /api/saude` | 8080 | 200 | SPA index.html (no proxy) |
| `GET /api/ping` | 8080 | 200 | SPA index.html (no proxy) |

---

## 6. Security / Exposure Observations

| Finding | Risk | Containers Affected |
|---|---|---|
| Backend API exposed on `0.0.0.0:3000` (all interfaces) | Medium | `virazul-backend` |
| Dev API exposed on `0.0.0.0:3001` (all interfaces) | Medium | `virazul-api-dev` |
| Dev frontend (Vite) exposed on `0.0.0.0:5173` | Medium | `virazul-app-dev` |
| MySQL exposed on `0.0.0.0:3307`, `0.0.0.0:3308` | High | `virazul-mysql`, `viraazul-mysql-dev` |
| `orchestrator-frontend` exposed on `0.0.0.0:3003` (not `127.0.0.1`) | Medium | `orchestrator-frontend` |

Production services (`virazul-backend`, `virazul-mysql`) binding to `0.0.0.0` means they are reachable on the public IP unless protected by external firewall rules. This should be confirmed and tightened to `127.0.0.1:*` in the production compose file.

---

## 7. Production vs. Repository Divergence Summary

| Item | Current Repo (`ctflow-app`) | Running Containers |
|---|---|---|
| Backend project path | `/opt/apps/projects/ctflow-app/backend` | Built from `/opt/apps/projects/virazul/api` |
| Container names (prod) | `ctflow-backend`, `ctflow-frontend` | `virazul-backend`, `virazul-frontend` |
| Health endpoints | Defined at root (`/saude`, `/ping`) | Return 404 — not present or not exposed |
| Error response format | `{"erro":{...}}` | `{"data":null,"meta":null,"errors":[...]}` |
| Frontend nginx proxy | Has `/api/` → backend proxy | No API proxy — SPA only |
| Frontend nginx healthcheck | None in repo | None in running container |

**The repository branch does not reflect the current production runtime.** The running containers were deployed from a separate project tree (`/opt/apps/projects/virazul/`) and represent a diverged or older production state. Any rebuild from this branch would produce containers with different behavior.

---

## 8. Actions Required (human approval needed for all)

| Priority | Action | Risk |
|---|---|---|
| High | Align `orchestrator-frontend` healthcheck to use `http://127.0.0.1/` | Low (config change only, requires container recreate) |
| High | Confirm host Nginx routing rules are correctly forwarding to `virazul-backend` | Read-only (just confirm) |
| High | Restrict `virazul-backend` and `virazul-mysql` to `127.0.0.1` bindings | Medium (requires compose edit + recreate) |
| Medium | Reconcile repository code with running production containers | High (needs structured migration plan) |
| Medium | Add healthcheck to `virazul-frontend` container | Low (config change) |
| Low | Add health endpoints to running backend (or confirm `/api/saude` path) | Medium (code change to production) |
| Low | Fix `test:with-db` for Linux compatibility | Low (package.json change only) |

## Phase 2 — Quick Findings (2026-05-15)

- Host checks performed from the project host: observed `virazul-backend` returning 404 on named health routes while `orchestrator-backend` returns 200 on `/saude`.
- Frontend services (`8080`, `3003`) return `index.html` for `/api/*` indicating the frontend container does not proxy `/api/` internally.
- `orchestrator-frontend` healthcheck is failing due to BusyBox `wget` IPv6 vs IPv4 resolution mismatch; container serves traffic correctly via IPv4. Adjusting healthcheck to use `127.0.0.1` will resolve the false-negative.

No code or compose changes made in this phase — observations only. Next steps require human approval to modify compose or rebuild images.

---

## Phase 4B — Runtime Ownership Addendum (2026-05-15)

Additional read-only Docker metadata inspection clarified runtime ownership on this host.

### Ownership findings

| Runtime group | Evidence | Ownership conclusion |
|---|---|---|
| `virazul-*` | Compose labels `project=virazul`, working dir `/opt/apps/projects/virazul`, network `virazul_default` | Belongs to VirAzul |
| `virazul-api-dev`, `viraazul-mysql-dev`, `virazul-app-dev` | Compose labels `project=api-virazul`, working dir `/opt/apps/projects/virazul-dev/api-virazul`, network `api-virazul_default` | Belongs to VirAzul dev |
| `orchestrator-*` | Compose labels `project=orchestrator`, working dir `/opt/apps/projects/orchestrator`, network `orchestrator_orchestrator` | Belongs to Orchestrator |
| `ctflow-*` / `financeiro-*` expected from this repo | No active containers or networks found | No active CTFlow runtime found |

### CTFlow-specific artifact found

- Docker volume `ctflow-app_ctflow_mysql_data`
  - Compose project label: `ctflow-app`
  - This suggests prior CTFlow Compose usage, but not a currently running CTFlow stack

### Revised interpretation

The earlier Phase 2 runtime checks were useful operationally, but they were probing **adjacent stacks**, not a deployed CTFlow stack from `/opt/apps/projects/ctflow-app`.

Implications:

- The unhealthy frontend healthcheck belongs to **Orchestrator**, not CTFlow.
- The backend returning `404` on port `3000` belongs to **VirAzul**, not CTFlow.
- The test DB port conflict on `3308` is caused by **VirAzul dev**, not CTFlow.
- The CTFlow repository currently has **no active runtime owner on this host**.

### Updated risk framing

From a governance perspective, changing this repository alone will not change the currently running containers that were inspected in Phase 2.

Any future remediation must first choose one of these paths:

1. Deploy CTFlow as its own `ctflow-*` runtime.
2. Explicitly reconcile CTFlow with the VirAzul runtime tree.
3. Treat Orchestrator and VirAzul as external neighboring systems and keep CTFlow documentation-only until ownership is resolved.
