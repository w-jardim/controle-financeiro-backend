# Docker Build & Deployment Guide

## 🎯 Dois Docker Compose Files

Este projeto usa **duas configurações docker-compose**:

1. **docker-compose.yml** → **PRODUÇÃO** (imagem pré-compilada)
2. **docker-compose.dev.yml** → **DESENVOLVIMENTO** (build local + hot-reload)

**Veja [COMPOSE_FILES_GUIDE.md](./COMPOSE_FILES_GUIDE.md) para detalhes completos.**

---

## Como Usar Agora

### Para Desenvolvimento (Build Local - Recomendado)

```bash
# Com hot-reload automático
docker-compose -f docker-compose.dev.yml up -d --build

# Ver logs em tempo real
docker-compose -f docker-compose.dev.yml logs -f backend

# Parar
docker-compose -f docker-compose.dev.yml down
```

**Características:**
- ✅ Build local com Dockerfile
- ✅ Hot-reload automático ao editar código
- ✅ Logs em tempo real
- ✅ Novo módulo auth incluído
- ✅ MySQL dev isolado

---

### Para Produção (Imagem Pré-compilada)

```bash
docker-compose up -d        # Usa docker-compose.yml
docker-compose logs -f backend
docker-compose down
```

**Características:**
- ✅ Imagem versionada: `wjardim/controle-financeiro-backend:1.2.0`
- ✅ Rápido (apenas pull da imagem)
- ✅ Seguro (código encapsulado)
- ✅ MySQL prod isolado

---

## 🔧 Antes de Fazer Deploy para Prod

### 1. Build Local da Imagem

```bash
docker build -t wjardim/controle-financeiro-backend:1.2.0 ./backend
```

### 2. Testar a Imagem

```bash
docker run -it \
  -e DB_HOST=localhost \
  -e DB_USER=root \
  -e DB_PASSWORD=seu_usuario \
  -p 3000:3000 \
  wjardim/controle-financeiro-backend:1.2.0
```

### 3. Tag como Latest

```bash
docker tag wjardim/controle-financeiro-backend:1.2.0 \
           wjardim/controle-financeiro-backend:latest
```

### 4. Publicar no Docker Hub

```bash
docker login
docker push wjardim/controle-financeiro-backend:1.2.0
docker push wjardim/controle-financeiro-backend:latest
```

### 5. Usar em Produção

```bash
# docker-compose.yml agora usa:
# image: wjardim/controle-financeiro-backend:1.2.0

docker-compose up -d
```

---

## 📋 Problema Resolvido

O erro **"Cannot find module 'bcrypt'"** foi resolvido:

- ❌ **Antes**: docker-compose.yml usava imagem 1.1.0 (sem auth module)
- ✅ **Agora**: 
  - `docker-compose.yml` usa imagem 1.2.0 (quando publicada)
  - `docker-compose.dev.yml` faz build local (com auth module)

---

## 🚀 Workflow Recomendado

### Dev Local (Todo dia)

```bash
docker-compose -f docker-compose.dev.yml up -d --build
# Editar código livremente
# Hot-reload automático
docker-compose -f docker-compose.dev.yml down
```

### Antes de Deploy (1x por versão)

```bash
# Build imagem
docker build -t wjardim/controle-financeiro-backend:1.2.0 ./backend

# Testar
docker run -it ... # teste a imagem

# Publicar
docker push wjardim/controle-financeiro-backend:1.2.0
docker push wjardim/controle-financeiro-backend:latest
```

### Deploy em Produção (Raro)

```bash
docker-compose up -d
docker-compose logs -f backend
```

---

## 🐛 Troubleshooting

| Problema | Dev | Prod |
|----------|-----|------|
| "Cannot find 'bcrypt'" | Rebuild local | Atualizar imagem |
| Hot-reload não funciona | Check volume | N/A (não tem volumes) |
| Port 3000 ocupada | `docker-compose -f ... down` | `docker-compose down` |
| Logs não aparecem | `logs -f backend` | `logs -f backend` |
| Reset DB | `docker-compose -f ... down -v` | `docker-compose down -v` |

---

## ✨ Arquivos Relacionados

- [COMPOSE_FILES_GUIDE.md](./COMPOSE_FILES_GUIDE.md) - Guia completo dos dois compose files
- [PASSO3_AUTH_CADASTRO.md](./PASSO3_AUTH_CADASTRO.md) - Documentação do módulo auth
- `docker-compose.yml` - Produção
- `docker-compose.dev.yml` - Desenvolvimento
- `Dockerfile` - Receita da imagem

---

## 📦 Versões

- **Backend Image**: 1.2.0 (com auth module)
- **Node.js**: 20 LTS
- **npm packages**: bcrypt 6.0.0, express 5.1.0, mysql2 3.20.0


