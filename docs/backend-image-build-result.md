# CTFlow — Backend Image Build Result

**Date**: 2026-05-15  
**Phase**: 8B.2 — Build Backend Image Only  
**Status**: completed successfully.

---

## 1. Scope executed

The following approved scope was executed:

- revalidated isolated MySQL status
- revalidated standalone Compose resolution
- built only the `backend` service image from
  [docker-compose.reactivation.yml](/opt/apps/projects/ctflow-app/docker-compose.reactivation.yml)
- inspected the resulting Docker image

No backend container was started.
No frontend or CloudBeaver service was started.
No runtime service besides the already-running MySQL was changed.

---

## 2. Commands executed

Read-only preflight:

```bash
docker ps --filter name=ctflow-reactivation-mysql
docker compose -p ctflow-reactivation -f docker-compose.reactivation.yml config
```

Build:

```bash
docker compose -p ctflow-reactivation -f docker-compose.reactivation.yml build backend
```

Post-build inspection:

```bash
docker images ctflow-reactivation-backend:latest
docker image inspect ctflow-reactivation-backend:latest
```

---

## 3. Build result

### Outcome

The backend image built successfully.

Resulting local image:

- repository: `ctflow-reactivation-backend`
- tag: `latest`
- image id: `8761af6863bb`

### Basic image metadata

Observed:

- exposed port: `3000/tcp`
- configured command: `["npm","start"]`
- working directory: `/app`
- approximate image size: `1.71GB`

These values match the current
[backend/Dockerfile](/opt/apps/projects/ctflow-app/backend/Dockerfile)
and reactivation Compose expectations.

---

## 4. Build observations

### Base image and dependency install

The build completed using:

- base image `node:20`
- `RUN npm install` inside the image build

### Warnings observed during build

The build output included:

- npm deprecation warnings for several packages
- npm audit summary reporting `4 vulnerabilities` (`2 moderate`, `2 high`)

Impact:

- these warnings did **not** fail the build
- they are not blockers for isolated backend startup
- they should be tracked as dependency-maintenance debt

### What was not done

- no container was started from the built image
- no runtime validation of `curl` inside the image was performed in this phase
- no code or Compose file was modified

---

## 5. Conclusion

The backend image build gate is now cleared.

What is now true:

- a local CTFlow backend image exists
- starting backend will no longer require an implicit build
- the next gate is a separate backend container startup approval

The remaining notable follow-up before relying on container health is:

- verify whether `curl` is available in the built image, because the
  backend healthcheck depends on it
