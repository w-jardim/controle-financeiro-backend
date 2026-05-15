# CTFlow — Roadmap de Módulos por Fase

Status: planejamento (somente documentação). Toda fase exige plano detalhado, aprovação humana e checklist de validação antes da execução, conforme [AGENTS.md](../AGENTS.md) e [CLAUDE.md](../CLAUDE.md).

Cada fase descreve:
- **Objetivo**
- **Módulos afetados**
- **Arquivos prováveis**
- **Risco**
- **Validação requerida**
- **Aprovação requerida**

---

## Fase 0 — Governança e diagnóstico
**Objetivo:** estabelecer regras de operação para agentes, mapear estado atual sem tocar em código.

**Módulos afetados:** nenhum (somente documentação).

**Arquivos prováveis:**
- `AGENTS.md`
- `CLAUDE.md`
- `claude/rules/*.md`
- `docs/current-state.md`
- `docs/architecture.md`
- `docs/decisions.md`

**Risco:** baixo (somente documentação).

**Validação requerida:**
- Leitura cruzada por humano para confirmar fatos vs. suposições.
- Inventário inicial dos containers em execução (read-only).

**Aprovação requerida:** humana, antes de prosseguir para Fase 1.

**Status:** já em curso/concluído (arquivos existem na branch atual).

---

## Fase 1 — Documentação e blueprint de produto
**Objetivo:** transformar o CTFlow em um produto com visão, modelo de domínio, mapa de features, roles, escopo de MVP e roadmap claros.

**Módulos afetados:** nenhum (somente documentação).

**Arquivos prováveis:**
- `docs/product-vision.md` ✅
- `docs/domain-model.md` ✅
- `docs/feature-map.md` ✅
- `docs/user-roles.md` ✅
- `docs/mvp-scope.md` ✅
- `docs/modules-roadmap.md` ✅ (este arquivo)

**Risco:** baixo (somente documentação).

**Validação requerida:**
- Revisão dos seis documentos por humano.
- Verificar que nenhum arquivo fora de `docs/` foi alterado (`git status` limpo fora de `docs/`).

**Aprovação requerida:** humana, antes de qualquer ação que envolva código ou infra.

**Status:** em entrega nesta sessão.

---

## Fase 2 — Quality gate e diagnóstico de saúde
**Objetivo:** auditar estado real do sistema (containers, rotas, banco, logs) e estabelecer um "portão de qualidade" antes de evoluir features.

**Módulos afetados:**
- Roteamento de API (`/api` vs `/` legado).
- Health/readiness endpoints (`/saude`, `/ping`, `/ready`, `/teste-banco`).
- Container do frontend reportado `unhealthy` (diagnóstico).
- Logs e observabilidade básica.

**Arquivos prováveis (somente leitura nesta fase — qualquer mudança volta para aprovação):**
- `backend/src/**` (mapa de rotas)
- `backend/server.js` ou equivalente (montagem de rotas)
- `frontend/nginx.conf`, `frontend/vite.config.ts`
- `docker-compose*.yml`
- `nginx/*.conf` (se existir em raiz)
- `mysql-init/*.sql`

**Produtos esperados:**
- `docs/health-diagnosis.md` (já existe — atualizar com achados).
- `docs/quality-gate.md` (já existe — definir critérios de pass/fail).
- `docs/refactor-backlog.md` (já existe — popular com dívidas confirmadas).

**Risco:** médio. Inspeção é read-only, mas qualquer correção sugerida (por exemplo, ajustar Nginx ou healthcheck) entra como proposta sob aprovação humana, não execução automática.

**Validação requerida:**
- `docker ps` e `docker inspect` para containers (read-only).
- Listagem de rotas backend (read-only via leitura de código).
- Logs recentes (sem expor secrets).
- Backup do banco antes de qualquer mudança futura.

**Aprovação requerida:** humana para qualquer correção; somente diagnóstico pode ser feito sem aprovação adicional.

---

## Fase 3 — Alunos / Planos / Subscriptions / Mensalidades
**Objetivo:** consolidar o núcleo financeiro/operacional do MVP. Auditar e estabilizar (não reescrever) os módulos existentes para atender ao [docs/mvp-scope.md](mvp-scope.md).

**Módulos afetados:**
- `alunos`
- `modalidades` (dependência de planos)
- Planos (verificar se já existe módulo nomeado; caso contrário, mapear e nomear formalmente)
- Subscriptions (mapear — pode estar embutido em `mensalidades`)
- `mensalidades`
- `transacoes` (apenas o caminho mensalidade-paga → transação)

**Arquivos prováveis:**
- `backend/src/alunos/**`
- `backend/src/modalidades/**`
- `backend/src/mensalidades/**`
- `backend/src/transacoes/**`
- `frontend/src/**` correspondentes (formulários e listas)
- `mysql-init/*.sql` (somente se schema precisar de ajuste — exige plano de migração)

**Risco:** alto. Mexe em dados financeiros sensíveis e em fluxo principal de operação do CT. Qualquer mudança no schema é alto risco.

**Validação requerida:**
- Backup completo do MySQL antes de qualquer execução.
- Testes Jest existentes verdes; ampliar cobertura para regras de mensalidade (geração, pagamento, inadimplência).
- Validação manual em ambiente de staging (não produção) com dados sintéticos.
- Comparativo before/after de contagens (alunos ativos, mensalidades em aberto, receita do mês).

**Aprovação requerida:** humana, por entrega vertical (alunos → planos → subscriptions → mensalidades), uma de cada vez.

---

## Fase 4 — Modalidades / Aulas / Horários / Presença
**Objetivo:** consolidar a operação de aulas e presença, desambiguando `agenda-aulas` vs `agendamentos`.

**Módulos afetados:**
- `agenda-aulas`
- `agendamentos`
- `horarios-aula`
- `presencas`
- `modalidades` (já consolidado na Fase 3)

**Arquivos prováveis:**
- `backend/src/agenda-aulas/**`
- `backend/src/agendamentos/**`
- `backend/src/horarios-aula/**`
- `backend/src/presencas/**`
- Frontend correspondente

**Risco:** médio. Não toca em dinheiro, mas toca em rotina diária da recepção/coach; regressão impacta operação.

**Validação requerida:**
- Decisão documentada em [docs/decisions.md](decisions.md) sobre o papel de cada módulo (manter ambos? unificar? deprecar um?).
- Testes de presença em volume (registrar 50+ presenças sem duplicação).
- Validação em staging com horário recorrente real.

**Aprovação requerida:** humana, especialmente para qualquer renomeação/unificação de módulos.

---

## Fase 5 — Profissionais / Roles / Permissões
**Objetivo:** introduzir multi-role (owner, admin, finance, coach, reception) e aplicar permissões granulares.

**Módulos afetados:**
- `auth` (claims do JWT, middleware de autorização)
- `profissionais`
- Todos os módulos protegidos (todos do backend, para aplicar middleware)
- Frontend (controle de visibilidade de menus e ações por role)

**Arquivos prováveis:**
- `backend/src/auth/**`
- `backend/src/middleware/**` (middleware de role/permission, possivelmente novo)
- `backend/src/profissionais/**`
- Todos os routers de domínio (para adicionar middleware de autorização)
- Frontend: `frontend/src/auth/**`, componentes de menu, hooks de autorização

**Risco:** alto. Mudança transversal em todos os endpoints; risco de quebrar acesso de usuários reais.

**Validação requerida:**
- Matriz de permissões revisada e aprovada (ver [docs/user-roles.md](user-roles.md)).
- Testes automatizados cobrindo cada combinação `role × endpoint`.
- Migração de usuários existentes para o novo modelo de roles com mapeamento explícito.
- Auditoria básica (logs de acesso) ativa antes do release.

**Aprovação requerida:** humana, com plano de migração detalhado de usuários existentes.

---

## Fase 6 — Dashboard financeiro e relatórios
**Objetivo:** entregar visão financeira agregada (fluxo de caixa, inadimplência, DRE simplificado, ocupação, hora-aula).

**Módulos afetados:**
- `transacoes`
- `mensalidades`
- `presencas` (relatórios operacionais)
- Frontend (páginas de relatório e dashboard ampliado)

**Arquivos prováveis:**
- `backend/src/transacoes/**`
- Novos endpoints de relatório (provavelmente `backend/src/relatorios/**` — módulo novo, sob aprovação)
- Frontend: páginas de relatório

**Risco:** médio. Não altera dado-fonte; só agrega. Risco de divergência entre relatórios e dados detalhados se queries não forem cuidadosas.

**Validação requerida:**
- Cada relatório validado contra cálculo manual em pequena amostra.
- Performance: queries de relatório devem terminar em < 2s para CTs com até 2.000 alunos.
- Cache controlado quando aplicável (sem cache se prejudicar consistência).

**Aprovação requerida:** humana por relatório (cada relatório é uma entrega).

---

## Fase 7 — Notificações
**Objetivo:** notificar alunos e gestores sobre eventos relevantes (vencimento, atraso, ausência, aniversário).

**Módulos afetados:**
- Novo módulo `notificacoes` (sob aprovação).
- Integrações externas (email — SMTP/SES; WhatsApp — API parceira).
- `mensalidades` (gatilho de notificação de vencimento).
- `presencas` (gatilho de ausência prolongada).

**Arquivos prováveis:**
- `backend/src/notificacoes/**` (novo)
- `backend/src/integrations/email/**` (novo)
- `backend/src/integrations/whatsapp/**` (novo, futuro)
- Configurações sensíveis em `.env` (criação/leitura — nunca exposição)

**Risco:** alto. Toca em comunicação externa com alunos; erros geram spam ou exposição de dados pessoais. LGPD aplicável.

**Validação requerida:**
- Throttling e idempotência (uma notificação por evento).
- Opt-out documentado e respeitado.
- Templates revisados por humano antes de envio em produção.
- Logs de envio sem expor conteúdo sensível.

**Aprovação requerida:** humana, com checklist LGPD e revisão de templates.

---

## Fase 8 — Portal do Aluno
**Objetivo:** expor uma área pública/restrita para alunos consultarem mensalidades, agenda e fazerem check-in.

**Módulos afetados:**
- `auth` (novo fluxo de login do aluno, separado dos usuários do CT).
- `alunos`, `mensalidades`, `presencas`, `horarios-aula` (endpoints somente-leitura para o aluno).
- Frontend: novo bundle ou rotas dedicadas (avaliar PWA).

**Arquivos prováveis:**
- `backend/src/portal-aluno/**` (novo)
- Frontend: `frontend/src/portal/**` ou novo app
- `nginx/*.conf` (rotear `/portal` ou subdomínio)

**Risco:** alto. Expõe dados pessoais a usuários finais; superfície de ataque cresce; LGPD aplicável.

**Validação requerida:**
- Pen-test básico antes de release público.
- Rate limiting nos endpoints públicos.
- Política de senhas e recuperação revisada.
- Termo de uso e política de privacidade publicados.

**Aprovação requerida:** humana, com checklist de segurança e LGPD assinado.

---

## Fase 9 — SaaS multi-tenant e billing
**Objetivo:** transformar o CTFlow em um SaaS comercial, com múltiplos CTs isolados, billing por CT e onboarding self-service.

**Módulos afetados:**
- Todos os módulos (passam a obedecer `ct_id` em queries e middleware).
- Novo módulo `billing` (planos do SaaS, faturamento dos CTs).
- Auth (cadastro de novo CT, owner inicial).
- Banco: revisão de índices e constraints multi-tenant.

**Arquivos prováveis:**
- Todos os routers e services backend.
- `backend/src/billing/**` (novo)
- `mysql-init/*.sql` (migração de schema com `ct_id` consistente — alto risco).
- Infra: possível separação de tenants em bancos lógicos diferentes (decisão arquitetural pendente).

**Risco:** muito alto. Mudança arquitetural profunda; vazamento de dados entre tenants é cenário inaceitável.

**Validação requerida:**
- Decisão arquitetural prévia em [docs/decisions.md](decisions.md): tenant-per-row vs. tenant-per-schema vs. tenant-per-database.
- Testes automatizados de isolamento (tenant A não enxerga dados de tenant B).
- Migração de dados existentes com plano de rollback.
- Auditoria de queries para garantir que toda consulta filtra por `ct_id`.
- Pen-test focado em multi-tenancy.

**Aprovação requerida:** humana, com revisão arquitetural formal e plano de migração detalhado.

---

## Resumo visual

```
Fase 0 → Governança e diagnóstico        (somente docs)
Fase 1 → Blueprint de produto            (somente docs)
Fase 2 → Quality gate e saúde            (diagnóstico read-only + propostas)
─────── Linha de corte para mudanças no código ───────
Fase 3 → Alunos / Planos / Mensalidades  (núcleo MVP)
Fase 4 → Aulas / Horários / Presença     (operação diária)
Fase 5 → Roles e permissões              (multi-role)
Fase 6 → Dashboard e relatórios          (visão agregada)
Fase 7 → Notificações                    (comunicação externa)
Fase 8 → Portal do Aluno                 (público)
Fase 9 → SaaS multi-tenant               (arquitetura)
```

## Princípios transversais a todas as fases
- **Mínima invasão**: não tocar no que não for objeto da fase.
- **Backup antes de migrar**: qualquer alteração de schema exige dump do MySQL prévio.
- **Plano + aprovação + validação**: nenhuma fase começa sem os três.
- **Rollback documentado**: cada fase entra com plano de reversão em [docs/decisions.md](decisions.md).
- **Sem mudanças em `.env`** sem aprovação explícita.
- **Sem alterações em Nginx de produção** sem revisão humana.
