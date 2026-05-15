# CTFlow — Backend Image Build Plan

**Date**: 2026-05-15  
**Phase**: 8B.1 — Backend Image Build Approval Plan  
**Status**: planning only; no image built.

---

## 1. Objective

Prepare the narrowest safe approval package to build the CTFlow backend image required for isolated backend startup.

This phase does **not** build anything. It only documents what would be built, from where, with which risks, and with which acceptance checks.

---

## 2. Why this plan is needed

Phase 8B stopped correctly before runtime start because:

- `docker-compose.reactivation.yml` defines the backend with a `build:` block
- no local CTFlow backend image currently exists
- `docker compose up backend` would therefore trigger an implicit build
- Phase 8B explicitly forbade builds

So the next approval gate is not backend startup itself. It is **backend image build approval**.

---

## 3. Build source of truth

### Compose source

From [docker-compose.reactivation.yml](/opt/apps/projects/ctflow-app/docker-compose.reactivation.yml):

- service: `backend`
- build context: `./backend`
- dockerfile: `Dockerfile`

### Dockerfile source

From [backend/Dockerfile](/opt/apps/projects/ctflow-app/backend/Dockerfile):

```dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Package source

From [backend/package.json](/opt/apps/projects/ctflow-app/backend/package.json):

- runtime start command: `node src/index.js`
- dependencies and devDependencies are both installed by plain `npm install`

---

## 4. Build context findings

### Included in build context

Because Compose points to `./backend` as build context, Docker will send backend project contents such as:

- `Dockerfile`
- `package.json`
- `package-lock.json`
- `src/`
- `tests/`
- repo-local backend docs/config files that are inside `backend/`

### Excluded from build context

From [backend/.dockerignore](/opt/apps/projects/ctflow-app/backend/.dockerignore):

- `node_modules`
- `npm-debug.log`

This is important because:

- host `backend/node_modules` will **not** be copied into the image
- the image will install dependencies fresh via `RUN npm install`

### Context size observation

Observed backend directory size on host:

- approximately `13M`

That is moderate and not itself a blocker, especially because `node_modules` is excluded from the sent context.

---

## 5. Expected build behavior

If approved later, the build would:

1. pull or reuse base image `node:20`
2. copy `package.json` and `package-lock.json`
3. run `npm install` **inside the image build**
4. copy backend source tree into `/app`
5. produce an image suitable to run `npm start`

Important distinction:

- host-side `npm install` remains forbidden
- image-layer `npm install` is part of the Docker build and is the expected behavior here

---

## 6. Known risks and considerations

### Risk A — Healthcheck tooling mismatch

The backend service healthcheck in [docker-compose.reactivation.yml](/opt/apps/projects/ctflow-app/docker-compose.reactivation.yml) uses:

```sh
curl -fsS http://127.0.0.1:3000/ping >/dev/null || exit 1
```

But [backend/Dockerfile](/opt/apps/projects/ctflow-app/backend/Dockerfile) does not explicitly install `curl`.

Implication:

- the image may build successfully
- but backend container health could still fail later if `curl` is absent

This is not a build blocker, but it is a post-build validation requirement.

### Risk B — Dev dependencies are installed

`RUN npm install` will install both dependencies and devDependencies.

Implication:

- image will be larger than a production-pruned image
- acceptable for controlled reactivation, but worth noting

### Risk C — No dedicated image tag in compose

The compose file relies on `build:` and not an explicit named `image:` tag.

Implication:

- Docker Compose will generate a project/service-derived image name
- reviewer should expect a Compose-managed local image, not a pre-named registry artifact

### Risk D — Build network access

The build depends on fetching npm packages unless already cached.

Implication:

- build success depends on registry/network availability at execution time

---

## 7. Proposed approved build command

If a future phase approves the build, the narrowest command should be:

```bash
docker compose -p ctflow-reactivation -f docker-compose.reactivation.yml build backend
```

Why this exact command:

- targets only the backend service
- does not start any container
- does not build frontend
- does not touch CloudBeaver

Commands that should remain out of scope for this approval:

- `docker compose up --build`
- `docker compose build` without service name
- any frontend image build

---

## 8. Post-build validation plan

If build is approved later, the minimum post-build checks should be:

1. confirm backend image now exists locally
2. inspect build success exit code
3. confirm image can report runtime tool availability if needed

Suggested checks:

```bash
docker images --format 'table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.CreatedSince}}' | rg 'ctflow-reactivation|backend'
docker run --rm <built-image-id-or-name> node --version
docker run --rm <built-image-id-or-name> curl --version || echo "curl not present"
```

The `curl` check is especially relevant because of the current backend healthcheck choice.

---

## 9. Approval checklist

- [ ] Approve building only the `backend` service from `docker-compose.reactivation.yml`
- [ ] Approve Docker-driven `npm install` inside the image build
- [ ] Approve no frontend build in the same phase
- [ ] Approve post-build verification of image existence
- [ ] Approve post-build verification of `curl` availability or explicit acknowledgement of that risk

---

## 10. Conclusion

The backend build path is well understood and isolated.

Nothing in the repository currently blocks a controlled backend image build except the approval boundary itself. The next safe action, if approved, is:

1. build backend image only
2. verify image exists
3. verify healthcheck tooling expectations
4. return for separate approval before backend startup
