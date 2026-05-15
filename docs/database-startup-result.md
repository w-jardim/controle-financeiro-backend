# CTFlow — Database Startup Result

**Date**: 2026-05-15  
**Phase**: 7B — Start Isolated MySQL Only  
**Status**: completed successfully.

---

## 1. Scope executed

The first controlled runtime action was executed with the approved scope:

- revalidated port `127.0.0.1:3318`
- validated standalone Compose resolution for `docker-compose.reactivation.yml`
- started only the `mysql` service
- inspected container status
- inspected published port
- inspected volume materialization

No backend, frontend, or CloudBeaver service was started.

---

## 2. Commands executed

Read-only validation:

```bash
docker compose -p ctflow-reactivation -f docker-compose.reactivation.yml config
ss -ltn '( sport = :3318 )'
```

Controlled runtime action:

```bash
docker compose -p ctflow-reactivation -f docker-compose.reactivation.yml up -d mysql
```

Post-start validation:

```bash
docker ps --filter name=ctflow-reactivation-mysql
docker inspect ctflow-reactivation-mysql
docker volume ls
ss -ltn '( sport = :3318 )'
docker logs --tail 40 ctflow-reactivation-mysql
```

Sensitive values are intentionally not reproduced in this document.

---

## 3. Result summary

### Startup outcome

The isolated MySQL container started successfully:

- container: `ctflow-reactivation-mysql`
- project: `ctflow-reactivation`
- final state: `running`
- health state: `healthy`

### Published port

Confirmed bind:

- `127.0.0.1:3318 -> 3306/tcp`

### Created resources

Confirmed created:

- network `ctflow-reactivation_ctflow-reactivation-net`
- volume `ctflow-reactivation_reactivation_mysql_data`

### Residual volume status

Confirmed still present and not reused:

- `ctflow-app_ctflow_mysql_data`

No action was taken against that residual volume.

---

## 4. Validation details

| Check | Result |
|---|---|
| Port `3318` free before start | yes |
| Standalone reactivation compose resolves | yes |
| Only `mysql` started | yes |
| Container entered `running` state | yes |
| Container reached `healthy` state | yes |
| Published port matches approved plan | yes |
| Fresh isolated volume created | yes |
| Residual CTFlow volume preserved | yes |

---

## 5. Observations

### MySQL init behavior

Container logs show the standard MySQL initialization flow completed and the init directory scripts executed on first boot.

### Healthcheck behavior

The container initially entered `health: starting` and then transitioned to `healthy`, which is the expected first-boot behavior for this image and healthcheck.

### Blast radius

The runtime action remained isolated:

- loopback-only port bind
- no neighboring stack ports altered
- no existing CTFlow residual data mounted
- no application services started

---

## 6. Conclusion

The first controlled CTFlow runtime action succeeded.

CTFlow now has:

- an isolated MySQL container running under `ctflow-reactivation`
- a fresh isolated data volume
- a healthy database service on `127.0.0.1:3318`

This completes the approved database-only first boot and provides a safe base for the next approval decision.
