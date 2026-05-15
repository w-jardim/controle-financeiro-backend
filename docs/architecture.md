Arquitetura (fatos confirmados vs. suposições)

## Fatos confirmados (inspeção read-only)
- Frontend: código em `frontend/` — React + Vite; proxy de `/api` para backend configurado em `frontend/vite.config.ts` e `frontend/nginx.conf`.
- Backend: código em `backend/` — Node.js + Express; rotas registradas em módulos por domínio (ex.: `agenda-aulas`, `alunos`, `auth`, etc.).
- Banco: MySQL usado; scripts de inicialização/migração em `mysql-init/`.
- Infra: compose files presentes (`docker-compose.yml`, `docker-compose.dev.yml`, `docker-compose.prod.yml`, `docker-compose.test.yml`) e Dockerfiles para frontend/backend.
- Health endpoints presentes no backend: `/saude`, `/ping`, `/ready`, `/teste-banco`.

## Suposições (a confirmar antes de mudanças)
- Nginx em produção atua como reverse proxy e terminador TLS via Certbot (presumido a partir dos arquivos e práticas do projeto).
- Existem variantes de deployment (nomes de container `virazul-*`, `orchestrator-*`) indicando múltiplos perfis/environments.

## Componentes e responsabilidades
- Frontend container: serve SPA React, configuração de proxy em dev e Nginx para produção.
- Backend container: expõe API REST; rota principal montada em `/api` e rotas legadas em `/` para compatibilidade.
- Database container: MySQL com scripts em `mysql-init/` para provisionamento.
- Reverse proxy (Nginx): roteia tráfego para frontend e backend, cuida de TLS.

## Observações operacionais
- Consolidar roteamento para `/api` é recomendado, mantendo adaptadores legados durante migração.
- Validar e padronizar health/readiness endpoints para cada serviço.

Status: informações acima derivam de inspeção de arquivos, rotas e containers; todas as mudanças exigem aprovação humana conforme `AGENTS.md`.
