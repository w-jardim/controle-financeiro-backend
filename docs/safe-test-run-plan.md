# CTFlow — Safe Test Run Plan

**Date**: 2026-05-15  
**Status**: plan only; no tests executed.

---

## 1. Goal

Provide the safest order to validate CTFlow after Phase 3 alignment work, while avoiding:

- accidental production impact,
- false conclusions caused by repo/runtime divergence,
- and known infrastructure conflicts such as the occupied host port `3308`.

---

## 2. Hard preconditions

No test execution should start until all items below are explicitly approved:

1. The authoritative runtime has been identified.
2. The `3308` port conflict has been resolved by approved action.
3. Test scope has been chosen:
   `lint only`, `unit only`, or `full integration`.
4. Approval exists for any Docker/container command needed by the selected scope.

If any of these remain unresolved, stop at documentation and read-only inspection only.

---

## 3. Known blockers

### Blocker A — Port `3308` conflict

[docker-compose.test.yml](/opt/apps/projects/ctflow-app/docker-compose.test.yml) requires:

```yaml
ports:
  - "3308:3306"
```

Phase 2 found that `viraazul-mysql-dev` is already using host port `3308`.

Effect:
- backend integration tests that depend on `mysql_test` cannot start safely as currently declared.

### Blocker B — Repo/runtime divergence

Observed runtime behavior on ports `3000` and `8080` does not match:

- [backend/src/app.js](/opt/apps/projects/ctflow-app/backend/src/app.js)
- [frontend/nginx.conf](/opt/apps/projects/ctflow-app/frontend/nginx.conf)

Effect:
- endpoint checks against live host ports may validate the wrong runtime.
- integration test failures may reflect environment mismatch, not application defects.

---

## 4. Safe validation order

### Stage 0 — Documentation and approval

Purpose:
- confirm target environment and authorize next actions.

Allowed evidence:
- the three Phase 3 docs
- compose declarations
- Phase 2 findings

### Stage 1 — Static checks with lowest operational risk

Run only after explicit approval.

Recommended order:

```bash
cd backend && npm run lint
cd frontend && npm run lint
```

Why first:
- no DB required
- no container changes required
- fast signal on codebase hygiene

### Stage 2 — Backend unit tests only

Run only after explicit approval.

Recommended command:

```bash
cd backend && cross-env NODE_ENV=test npx jest tests/unit --runInBand
```

Why second:
- no external DB dependency
- validates service-layer behavior before infrastructure complexity

### Stage 3 — Test DB isolation

Run only after explicit approval and after deciding how to handle `3308`.

Approved options should be one of:

1. Temporarily free host port `3308`.
2. Change the test DB host port mapping in the repo and corresponding test config.
3. Run the test DB in an isolated environment where `3308` is free.

Do not start the test DB until one option is explicitly chosen.

### Stage 4 — Backend integration tests

Run only after explicit approval and after Stage 3 is resolved.

Planned sequence:

```bash
cd backend && npm run db:test:up
cd backend && npm run test:ci
cd backend && npm run db:test:down
```

Guardrail:
- if runtime alignment is still unresolved, this stage should be postponed because failures may not be trustworthy.

### Stage 5 — Frontend tests

Run only after explicit approval.

Recommended command:

```bash
cd frontend && npm test
```

Why last:
- frontend tests are lower operational risk, but backend/runtime alignment should already be clear so API assumptions are easier to interpret.

---

## 5. Decision matrix

| Situation | Safe next step |
|---|---|
| Only want low-risk signal now | Run lint only |
| Want code validation without Docker | Run lint + backend unit tests |
| Need integration confidence | Resolve `3308` first, then run backend integration tests |
| Runtime is still divergent and unexplained | Do not run full tests yet |

---

## 6. Recommended approval package

If the next phase is approved, the safest narrow package is:

1. Approve healthcheck/proxy alignment investigation and config edits only.
2. Approve test DB port resolution only.
3. Approve `lint` and backend `unit` tests only.
4. Defer full integration tests until the first two items are validated.

This keeps the blast radius smaller than approving code, build, test DB, and redeploy together.

---

## 7. Commands intentionally not run in this phase

- `npm test`
- `npm run test:ci`
- `npm run build`
- `docker compose up`
- `docker compose down`
- container restarts
- migrations
- deploy/reload actions

This document is a runbook proposal only.
