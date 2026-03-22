# Dois Compose Files: Prod vs Dev

Este projeto usa **dois arquivos docker-compose** para diferentes ambientes.

---

## 📦 docker-compose.yml (PRODUÇÃO)

```bash
docker-compose up -d
```

**Configuração:**
- Usa **imagem pré-compilada** do Docker Hub: `wjardim/controle-financeiro-backend:1.2.0`
- Container: `financeiro-backend` (sem sufixo -dev)
- Volume: **NÃO** monta código local
- Ambiente: `NODE_ENV` vem do `.env`
- **Ideal para:** Produção, staging, ambientes estáveis

**Características:**
- ✅ Rápido de fazer deploy (pull image)
- ✅ Imagem testada e versionada
- ✅ Consistência garantida
- ✅ Seguro (sem volumes de código local)

---

## 🛠️ docker-compose.dev.yml (DESENVOLVIMENTO)

```bash
docker-compose -f docker-compose.dev.yml up -d
```

**Configuração:**
- Faz **build local** do backend: `./backend/Dockerfile`
- Container: `financeiro-backend-dev` (com sufixo -dev)
- Volumes: 
  - `./backend:/app` - Monta todo código
  - `/app/node_modules` - Evita conflito de dependências
- Comando: `npm run dev` (nodemon com hot-reload)
- Ambiente: `NODE_ENV: development`
- **Ideal para:** Desenvolvimento local, testes

**Características:**
- ✅ Hot-reload automático ao editar código
- ✅ Logs em tempo real
- ✅ Fácil debugar
- ✅ Rápido iterar
- ✅ Vê mudanças sem rebuild

---

## 🎯 Qual Usar

| Situação | Use |
|----------|-----|
| Desenvolvendo localmente | `docker-compose.dev.yml` |
| Testando antes de fazer deploy | `docker-compose.dev.yml` |
| Ambiente de produção | `docker-compose.yml` |
| Staging/QA | `docker-compose.yml` |
| Demo para cliente | `docker-compose.yml` |

---

## 🚀 Workflow Típico

### 1. Desenvolvimento Local

```bash
# Primeiro clone/setup
docker-compose -f docker-compose.dev.yml up -d --build

# Editar código livremente
# Hot-reload funciona automaticamente

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f backend

# Parar quando terminar
docker-compose -f docker-compose.dev.yml down
```

### 2. Preparar para Produção

```bash
# Build imagem local com versão
docker build -t wjardim/controle-financeiro-backend:1.2.0 ./backend

# Testar imagem antes de publicar
docker run -it wjardim/controle-financeiro-backend:1.2.0 npm run dev

# Publicar no Docker Hub
docker push wjardim/controle-financeiro-backend:1.2.0
docker tag wjardim/controle-financeiro-backend:1.2.0 wjardim/controle-financeiro-backend:latest
docker push wjardim/controle-financeiro-backend:latest
```

### 3. Deploy em Produção

```bash
# Usar docker-compose.yml (já com imagem 1.2.0)
docker-compose up -d
```

---

## 📝 Diferenças Técnicas

### docker-compose.yml (Prod)

```yaml
backend:
  image: wjardim/controle-financeiro-backend:1.2.0    # ← Imagem publicada
  container_name: financeiro-backend                   # ← Sem -dev
  # SEM volumes
  # SEM volumes bind mount
  # app.js é fixo, não muda sem rebuild
```

### docker-compose.dev.yml (Dev)

```yaml
backend:
  build:                                               # ← Build local
    context: ./backend
  container_name: financeiro-backend-dev               # ← Com -dev
  volumes:
    - ./backend:/app                                   # ← Código local
    - /app/node_modules                                # ← Evita conflito
  command: npm run dev                                 # ← Nodemon hot-reload
```

---

## 🔄 Switching Entre Ambientes

### Sair do Dev para Prod

```bash
# 1. Parar dev
docker-compose -f docker-compose.dev.yml down

# 2. Limpar volumes dev (opcional)
docker-compose -f docker-compose.dev.yml down -v

# 3. Iniciar prod
docker-compose up -d
```

### Sair do Prod para Dev

```bash
# 1. Parar prod
docker-compose down

# 2. Iniciar dev
docker-compose -f docker-compose.dev.yml up -d
```

---

## 🐛 Troubleshooting

### "Cannot find module 'bcrypt'" em prod

→ Significa que a imagem no Docker Hub está desatualizada
→ Solução: Fazer rebuild e push da versão 1.2.0+

```bash
docker build -t wjardim/controle-financeiro-backend:1.2.0 ./backend
docker push wjardim/controle-financeiro-backend:1.2.0
```

### Hot-reload não está funcionando em dev

→ Verificar se o volume está correto:

```bash
docker-compose -f docker-compose.dev.yml exec backend bash
# Dentro do container:
# ls /app/src/  # deve listar os arquivos do backend local
```

### Port 3000 ocupada

```bash
# Dev
docker-compose -f docker-compose.dev.yml down

# Ou prod
docker-compose down
```

### MySQL containers diferentes em dev e prod

→ Completamente normais, cada um tem seu próprio:
- `mysql-financeiro` (prod)
- `mysql-financeiro-dev` (dev)
- Seus próprios volumes de dados

---

## 🎓 Conceitos Docker

- **Image**: Modelo imutável (como ISO de Linux)
- **Container**: Instância rodando uma imagem (como VM bootada)
- **Dockerfile**: Receita para criar uma image
- **docker-compose**: Orquestração de múltiplos containers
- **Bind Mount**: Pasta local mapeada para dentro do container (/app em dev)

---

## ✅ Checklist para Deploy

1. [ ] Testar em dev localmente: `docker-compose -f docker-compose.dev.yml up -d`
2. [ ] Rodar testes se houver
3. [ ] Fazer build local: `docker build -t ... ./backend`
4. [ ] Testar imagem: `docker run -it ... npm run dev`
5. [ ] Fazer login: `docker login`
6. [ ] Fazer push: `docker push ...`
7. [ ] Atualizar versão em `docker-compose.yml` se necessário
8. [ ] Fazer deploy: `docker-compose up -d`
9. [ ] Verificar logs: `docker-compose logs -f backend`

---

## 🔗 Comandos Rápidos

```bash
# DEV - Build, up, logs
docker-compose -f docker-compose.dev.yml up -d --build
docker-compose -f docker-compose.dev.yml logs -f backend

# PROD - Pull, up, logs
docker-compose pull
docker-compose up -d
docker-compose logs -f backend

# Para ambos
docker-compose [-f docker-compose.dev.yml] down -v  # remove tudo + volumes
docker-compose [-f docker-compose.dev.yml] ps       # listar containers
docker-compose [-f docker-compose.dev.yml] exec backend bash  # shell
```

---

**Versão**: 1.2.0+  
**Última atualização**: Março 2026
