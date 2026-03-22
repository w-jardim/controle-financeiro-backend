# Docker Build & Deployment Guide

## Problema Resolvido

O `docker-compose.yml` foi atualizado para fazer **build local** do backend em vez de usar a imagem pré-compilada do Docker Hub.

**Por quê?** A imagem `wjardim/controle-financeiro-backend:1.1.0` foi compilada ANTES do módulo de autenticação ser criado. O novo módulo auth não existia naquela imagem.

---

## Como Usar Agora

### Para Desenvolvimento (Build Local - Recomendado)

```bash
# Está assim no docker-compose.yml:
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile
  container_name: financeiro-backend-dev
```

**Comandos:**
```bash
# Build e start
docker-compose up -d --build

# Ver logs
docker-compose logs -f backend

# Parar
docker-compose down
```

---

## Para Produção (Imagem Pré-compilada)

Se quiser usar uma imagem publicada no Docker Hub:

### 1. Build da imagem local com nova versão:

```bash
docker build -t wjardim/controle-financeiro-backend:1.2.0 ./backend
```

### 2. Publicar no Docker Hub:

```bash
docker login
docker push wjardim/controle-financeiro-backend:1.2.0
docker tag wjardim/controle-financeiro-backend:1.2.0 wjardim/controle-financeiro-backend:latest
docker push wjardim/controle-financeiro-backend:latest
```

### 3. Usar em docker-compose.yml:

Comentar a seção `build` e descomentar a linha `image`:

```yaml
backend:
  # Build local (comentado para produção)
  # build:
  #   context: ./backend
  #   dockerfile: Dockerfile
  
  # Usar imagem pré-compilada:
  image: wjardim/controle-financeiro-backend:1.2.0
  container_name: financeiro-backend
  restart: always
```

Depois rodar:
```bash
docker-compose up -d
```

---

## Checklist para Deploy

- [x] Módulo auth criado e testado
- [x] bcrypt instalado e no package.json
- [x] package-lock.json atualizado
- [x] docker-compose.yml configurado para build local
- [ ] Testar `docker-compose up -d --build` localmente
- [ ] Build imagem com versão 1.2.0 quando pronto
- [ ] Publicar imagem no Docker Hub
- [ ] Atualizar docker-compose.yml para produção

---

## Comandos Rápidos

### Clear everything and start fresh:
```bash
docker-compose down -v
docker-compose up -d --build
docker-compose logs -f backend
```

### Just rebuild backend service:
```bash
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Interactive shell in container:
```bash
docker-compose exec backend bash
# Inside:
# npm run dev
# npm test
```

### View all images:
```bash
docker images | grep controle-financeiro
```

### Remove old images:
```bash
docker rmi wjardim/controle-financeiro-backend:1.1.0
```

---

## Troubleshooting

### "Cannot find module 'bcrypt'"
→ Rebuild container: `docker-compose build --no-cache backend`

### Port 3000 already in use
→ Stop container: `docker-compose down`
→ Or change PORT in .env and docker-compose.yml

### MySQL connection refused
→ Check if mysql service is healthy: `docker-compose ps`
→ View MySQL logs: `docker-compose logs mysql`

### Want to use local code in container with hot-reload

Add volume mount to backend service in docker-compose.yml:

```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile
  volumes:
    - ./backend/src:/app/src        # ← Hot-reload código
  # ... rest of config
```

---

## Environment & Versioning

Current versions:
- **Node.js**: 20 LTS
- **Backend Image**: 1.2.0 (in progress)
- **npm packages**: bcrypt 6.0.0, express 5.1.0, mysql2 3.20.0

---

## Notes

- Build local = **Desenvolvimento** (mais rápido de atualizar)
- Imagem pré-compilada = **Produção** (mais seguro e consistente)
- package-lock.json **DEVE** estar no git para reproducibilidade
- .dockerignore previne node_modules ser copiado
- Dockerfile faz npm install no container (não usa node_modules local)
