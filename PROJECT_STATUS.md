# RESUMO EXECUTIVO

- Documento principal único do projeto: `PROJECT_STATUS.md`.
- Domínio oficial ativo: `escalas` + `agenda_aulas`.
- Compatibilidade ativa: `horario_aula_id`, `horarios_aula` e rotas sem prefixo `/api`.
- Status técnico: pronto para staging; não pronto para produção até concluir a remoção controlada do legado.

---

# ESTADO ATUAL DO SISTEMA

## Backend
- Stack: Node.js + Express + MySQL.
- Rotas montadas em `/api` e também em `/` para compatibilidade transitória.
- Módulos ativos em `backend/src/modules/*`: `auth`, `cts`, `alunos`, `profissionais`, `modalidades`, `horarios-aula`, `escalas`, `agenda-aulas`, `agendamentos`, `presencas`, `mensalidades`, `transacoes`.

## Frontend
- Stack: React + Vite + TypeScript.
- Navegação atual expõe `Escalas` e `Agenda Aulas` no menu.
- Rota/página legada de `Horários` ainda existe por compatibilidade.

## Banco
- Migrations chave em `mysql-init/`:
  - `02-create-escalas-agenda.sql`
  - `03-migrate-horarios-to-escalas.sql`
- Tabelas relevantes coexistindo: `horarios_aula`, `escalas`, `escala_dias`, `agenda_aulas`, `agendamentos`.

## Testes
- Backend: unit + integração.
- Frontend: testes de interface + build.

---

# ARQUITETURA E DOMÍNIO

## Modelo funcional
- Regra recorrente: `escalas`.
- Dias por regra: `escala_dias`.
- Ocorrência de aula: `agenda_aulas`.
- Vínculo de aluno em aula: `agendamentos`.

## Compatibilidade de referência
- `agendamentos` aceita ambos:
  - `agenda_aula_id` (novo)
  - `horario_aula_id` (legado/transitório)

---

# ESTADO DA TRANSIÇÃO (TABELA OBRIGATÓRIA)

| Tipo        | Item              | Status |
|-------------|-------------------|--------|
| Oficial     | escalas           | ativo  |
| Oficial     | agenda_aulas      | ativo  |
| Transitório | agenda_aula_id    | ativo  |
| Transitório | horario_aula_id   | ativo  |
| Legado      | horarios_aula     | ativo  |
| Temporário  | rotas "/"        | ativo  |

---

# BACKEND

- `agendamentos` opera em compatibilidade dual (`horario_aula_id`/`agenda_aula_id`).
- `escalas` e `agenda-aulas` estão implementados no backend com validações e serviços.
- `horarios-aula` permanece ativo apenas para compatibilidade durante o rollout.
- OpenAPI em `backend/src/shared/docs/openapi.yaml` documenta o cenário de transição.

---

# FRONTEND (REAL, NÃO SUPOSIÇÃO)

- Em uso ativo: rotas/menu para `Escalas` e `Agenda Aulas`.
- Ainda presente como transitório:
  - `frontend/src/pages/horarios/Horarios.tsx`
  - `frontend/src/services/api/horariosService.ts`
  - `frontend/src/hooks/useHorarios.ts`
- Situação: novo domínio exposto na UI, com legado mantido para não quebrar fluxo existente.

---

# BANCO E MIGRAÇÕES

- Criação do domínio novo (`escalas`, `escala_dias`, `agenda_aulas`) concluída via script de criação.
- Migração de `horarios_aula` para `escalas/agenda_aulas` implementada com mapeamento transitório.
- Coluna `agendamentos.agenda_aula_id` coexistindo com `agendamentos.horario_aula_id`.
- Estratégia atual: convivência controlada até remoção segura do legado.

---

# COMPATIBILIDADE TRANSITÓRIA

## OFICIAL
- `escalas`
- `agenda_aulas`

## TRANSITÓRIO
- `agenda_aula_id` em `agendamentos`
- `horario_aula_id` em `agendamentos`
- rotas backend em `/` além de `/api`
- frontend legado (`Horarios`, `horariosService`, `useHorarios`)

## LEGADO
- tabela `horarios_aula`
- módulo backend `horarios-aula`

## PENDENTE DE REMOÇÃO
1. rotas root `/` no backend após atualização completa dos consumidores para `/api`.
2. `horario_aula_id` e dependências no frontend/backend.
3. tabela `horarios_aula` após migração e validação final em staging/produção.

---

# TESTES E VALIDAÇÃO

- Backend deve permanecer verde em:
  - `npm test --silent`
  - `npx jest --runInBand tests/integration -i`
- Frontend deve permanecer verde em:
  - `npm test --silent`
  - `npm run build --silent`
  - `npm run lint` (script existe)

---

# DECISÕES ARQUITETURAIS

- Manter dual routing (`/api` + `/`) temporariamente para compatibilidade.
- Manter dual id (`agenda_aula_id` + `horario_aula_id`) até encerramento de rollout.
- Priorizar `escalas/agenda_aulas` como domínio oficial em backend e UI.

---

# RISCOS ABERTOS

- Duplicidade semântica durante convivência `horarios_aula` vs `escalas`.
- Consumidores externos ainda dependentes de `horario_aula_id`.
- Remoção precoce de rotas root pode quebrar clientes legados.

---

# CRITÉRIO DE PROMOÇÃO

- Pronto para staging: SIM.
- Pronto para produção: NÃO (pendências de remoção de legado e rollout controlado).

---

# STATUS DOS MÓDULOS (TABELA)

| Módulo        | Backend | Frontend | Status   |
|---------------|---------|----------|----------|
| auth          | ok      | ok       | fechado  |
| cts           | ok      | ok       | fechado  |
| alunos        | ok      | ok       | fechado  |
| profissionais | ok      | ok       | fechado  |
| modalidades   | ok      | ok       | fechado  |
| escalas       | ok      | parcial  | pendente |
| agenda-aulas  | ok      | não      | pendente |

---

# PRÓXIMOS PASSOS

1. Fechar frontend de `escalas` e implementar frontend completo de `agenda-aulas`.
2. Migrar uso de `useHorarios`/`horariosService` para camadas de `escalas` e `agenda-aulas`.
3. Definir janela de retirada de `horario_aula_id`, `horarios_aula` e rotas root `/`.
4. Validar em staging e executar descontinuação progressiva com monitoramento.
