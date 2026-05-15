Estado inicial conhecido (confirmado por inspeção read-only)

- Local do projeto: /opt/apps/projects/ctflow-app
- Branch atual observado: backup/vps-2026-04-10-zod-prod-align
- Stack confirmado:
	- Frontend: React + Vite + TypeScript + Axios + Zod (+ Tailwind)
	- Backend: Node.js + Express + mysql2 + jsonwebtoken
	- Banco: MySQL (scripts em `mysql-init/`)
	- Infra: Docker Compose + Nginx (reverse proxy) + Certbot (presumido)
- Principais pastas do repositório: `frontend/`, `backend/`, `mysql-init/`, `docs/`, `skills/`, `codex/`, `claude/`, `prompts/`
- Containers e runtime observados (exemplos): `virazul-backend`, `virazul-frontend`, `virazul-mysql`, `orchestrator-*` (vários ambientes/variantes);
	- Alguns containers reportados como `healthy`; ao menos um frontend container aparece `unhealthy` — requer diagnóstico de logs/config.

Health endpoints confirmados no backend (leitura de código): `/saude`, `/ping`, `/ready`, `/teste-banco`.

Domínios prováveis (a confirmar): app.ctflowsystem.com.br, api.ctflowsystem.com.br, ctflowsystem.com.br

Riscos conhecidos:
- Presença de `.env` em repositório (não expor nem alterar).
- Rotas montadas tanto em `/api` quanto em `/` (compatibilidade legada) — risco de inconsistência e regressão.
- Exposição de portas MySQL em host em alguns ambientes (verificar controle de acesso).
- Container frontend `unhealthy` indica risco de disponibilidade.

O que ainda é desconhecido / precisa confirmação:
- Quais hosts/nomes de domínio estão ativos em produção (Nginx server_name reais).
- Políticas de backup e procedimento atual para migrações em produção.
- Fluxos de CI/CD e onde as imagens são construídas/armazenadas.
- Detalhes das credenciais e segredos (não inspecionados por política).

Status: fatos acima foram confirmados via inspeção read-only do repositório e dos containers visíveis; qualquer alteração exige aprovação humana conforme `AGENTS.md`.
