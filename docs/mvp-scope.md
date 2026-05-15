# CTFlow — Escopo do MVP

Status: planejamento de escopo do primeiro MVP robusto (somente documentação). Nenhuma alteração de código foi feita. A execução depende de aprovação humana fase a fase (ver [docs/modules-roadmap.md](modules-roadmap.md)).

## Objetivo do MVP
Substituir planilhas e WhatsApp para o ciclo **aluno → plano → mensalidade → aula → presença**, com dados consistentes, auditáveis e visíveis em um dashboard inicial.

Premissa: o CTFlow já existe em produção como sistema legado; o MVP é uma **consolidação confiável**, não um lançamento do zero. Mudanças seguem o princípio de mínima invasão.

---

## O que ENTRA no MVP

### Autenticação e governança básica
- Login com email/senha (já existente — apenas validar e estabilizar).
- Sessão via JWT.
- Logout.
- Recuperar senha (envio de link — pode ser manual via admin no MVP).
- Um único role efetivo no MVP: **admin** (todos os usuários do CT operam como admin). Multi-role entra na Fase 5.

### Cadastros
- CRUD de **CT** (uma instância — o próprio CT do cliente).
- CRUD de **Aluno**: nome, contato, status, data de matrícula, observações.
- CRUD de **Modalidade**.
- CRUD de **Plano**: nome, valor, periodicidade, modalidades cobertas.
- CRUD de **Profissional**: nome, contato, modalidades, status.

### Matrícula e mensalidades
- Criar **Subscription** (vincular aluno a plano com dia de vencimento e valor acordado).
- Cancelar/encerrar Subscription.
- **Gerar mensalidades** mensalmente a partir de Subscriptions ativas (rotina executada por admin — automação fica para Pro).
- Listar mensalidades por aluno e por mês de competência.
- **Marcar mensalidade como paga**: forma de pagamento, data de pagamento, valor pago.
- **Listar inadimplentes** (mensalidades vencidas em aberto).

### Aulas, horários e presença
- CRUD de **Aula/Turma** (modalidade + profissional + capacidade).
- CRUD de **Horários** (recorrência semanal: dia da semana + hora início/fim).
- **Registrar presença** manualmente: selecionar turma + data → marcar alunos presentes.
- Listar presença por aluno em um período.

### Dashboard e visões agregadas
- Card: total de alunos ativos.
- Card: total de mensalidades em aberto (quantidade e valor).
- Card: receita do mês corrente (mensalidades pagas).
- Card: aulas do dia.
- Lista: inadimplentes (top N).

### Operação e infra (já existente — manter)
- Endpoints de saúde: `/saude`, `/ping`, `/ready`, `/teste-banco`.
- Docker Compose para frontend, backend, MySQL, Nginx.

---

## O que NÃO ENTRA no MVP
- Pagamento online (PIX, cartão, boleto) — fica para Future.
- Notificações automáticas (email, WhatsApp) — Pro/Future.
- Portal do Aluno — Fase 8.
- Multi-tenant SaaS com billing — Fase 9.
- Multi-role com permissões granulares (owner/finance/coach/reception) — Fase 5.
- Escala completa de profissionais com substituições — Pro.
- Relatórios avançados (DRE, churn, LTV) — Pro/Future.
- Auditoria detalhada (quem alterou o quê) — Pro.
- Aplicação automática de juros/multa — Pro.
- Importação em massa de alunos via planilha — Pro (avaliar).
- App mobile — Future.
- Integrações de terceiros (NFe, gateways) — Future.

---

## Critérios de aceitação do MVP
O MVP é considerado entregue quando, em um CT real piloto:

1. **Aluno é cadastrado** com nome, contato, status e data de matrícula.
2. **Aluno é matriculado em um plano** com dia de vencimento definido.
3. **Mensalidades são geradas para o mês corrente** a partir das matrículas ativas, sem duplicação.
4. **Recepção marca uma mensalidade como paga** e o valor aparece imediatamente na receita do mês.
5. **Turma é criada** com modalidade, professor e horário recorrente semanal.
6. **Presença é registrada** para 10 alunos em uma sessão sem erros.
7. **Inadimplentes aparecem na listagem** dentro de 24h após o vencimento.
8. **Dashboard mostra valores consistentes** com as listagens detalhadas (alunos ativos, em aberto, receita).
9. **Login funciona com JWT**, sessão expira corretamente.
10. **Health endpoints respondem 200** em produção.
11. **Nenhuma rota duplicada `/api` vs `/`** causa divergência de comportamento (consolidação prévia exigida — ver Fase 2).
12. **Container frontend permanece `healthy`** por 7 dias consecutivos em produção.

---

## Telas requeridas (frontend)
Inventário-alvo das telas do MVP. Cruzamento com o que já existe em `frontend/src` será feito em fase posterior.

### Acesso
- Tela de login.
- Tela de recuperação de senha (mínima — pode ser estática + admin reseta).

### Layout principal
- Header com identidade do CT, usuário logado, toggle de tema (já implementado), logout.
- Menu lateral com módulos do MVP.

### Dashboard
- Página inicial pós-login com cards e listas resumidas.

### Alunos
- Lista de alunos com busca, filtro por status, paginação.
- Detalhe/edição de aluno (dados, subscriptions, mensalidades, presenças).
- Formulário de novo aluno.

### Modalidades
- Lista + formulário.

### Planos
- Lista + formulário (com seleção de modalidades cobertas).

### Profissionais
- Lista + formulário (com modalidades que leciona).

### Aulas/Turmas
- Lista de turmas.
- Formulário de turma + horários (sub-formulário com recorrência semanal).
- Visão de agenda da semana (grade simples — opcional no MVP, recomendado).

### Mensalidades
- Lista de mensalidades (com filtros: status, mês, aluno).
- Ação rápida: marcar como paga.
- Visão por aluno (no detalhe do aluno).
- Página de inadimplentes.

### Presença
- Seleção de turma + data → checklist de alunos matriculados → confirmar.
- Histórico de presença por aluno.

### Configuração mínima
- Página de configurações do CT (dados do CT, dia de vencimento padrão).

---

## Módulos backend requeridos
Os módulos atuais cobrem a maioria das necessidades — o MVP **consolida e estabiliza**, não recria.

| Módulo MVP                       | Módulo atual provável         | Status |
|----------------------------------|-------------------------------|--------|
| Auth (JWT)                       | `auth`                        | Existe — validar/estabilizar |
| CT                               | `cts`                         | Existe — validar |
| Alunos                           | `alunos`                      | Existe — validar |
| Modalidades                      | `modalidades`                 | Existe — validar |
| Planos                           | (verificar — pode estar em outro nome) | Auditar |
| Subscriptions (matrículas)       | (verificar)                   | Auditar — pode estar implícito em `mensalidades` |
| Mensalidades / Payments          | `mensalidades`                | Existe — validar |
| Profissionais                    | `profissionais`               | Existe — validar |
| Aulas                            | `agenda-aulas` ou `agendamentos` | Existe — desambiguar |
| Horários                         | `horarios-aula`               | Existe — validar |
| Presença                         | `presencas`                   | Existe — validar |
| Transações                       | `transacoes`                  | Existe — validar |
| Health                           | `saude`                       | Existe — manter |
| Escalas (Pro, fora do MVP)       | `escalas`                     | Manter como está |

**Tarefa transversal obrigatória antes do MVP**: consolidar roteamento (`/api` vs `/`) sem regressão — ver Fase 2.

---

## Relatórios requeridos no MVP
- Lista de **inadimplentes** (alunos com mensalidades em aberto após vencimento).
- Lista de **mensalidades pagas no mês** (com totais).
- **Frequência por aluno** (consulta no detalhe do aluno: presenças no período X).
- **Receita do mês** (soma das mensalidades pagas no mês corrente).

Sem exportação CSV/XLSX no MVP (entra no Pro).

---

## Checklist de validação (antes de declarar MVP entregue)
Execução de cada item exige aprovação humana e validação read-only quando possível.

### Funcional
- [ ] Login JWT funciona; token expira corretamente.
- [ ] Cadastrar aluno → aparece na lista.
- [ ] Matricular aluno em plano → Subscription criada.
- [ ] Gerar mensalidades do mês → quantidade bate com Subscriptions ativas.
- [ ] Marcar mensalidade como paga → reflete no dashboard.
- [ ] Cadastrar turma + horários → aparece na agenda/lista.
- [ ] Registrar presença → consulta por aluno mostra registro correto.
- [ ] Inadimplentes listados batem com mensalidades vencidas em aberto.

### Não-funcional
- [ ] Health endpoints `/saude`, `/ping`, `/ready` retornam 200.
- [ ] Frontend container `healthy` em produção.
- [ ] Nenhuma rota duplicada causa divergência (`/api` vs `/`).
- [ ] Tempo de resposta P95 de listagens de alunos e mensalidades < 800ms em produção.
- [ ] Logs do backend não exibem secrets nem stack traces sensíveis ao usuário final.
- [ ] `.env` não foi alterado nem versionado.

### Governança
- [ ] Plano de migração de dados (se houver) aprovado por humano.
- [ ] Rollback documentado para cada mudança em [docs/decisions.md](decisions.md).
- [ ] Backup do MySQL realizado antes de qualquer migração.

### Documentação
- [ ] [docs/product-vision.md](product-vision.md), [docs/domain-model.md](domain-model.md), [docs/feature-map.md](feature-map.md), [docs/user-roles.md](user-roles.md), [docs/mvp-scope.md](mvp-scope.md), [docs/modules-roadmap.md](modules-roadmap.md) revisados.
- [ ] [docs/current-state.md](current-state.md) atualizado após cada fase.

---

## Riscos do MVP
- **Divergência `/api` vs `/`**: pode causar comportamento inconsistente entre clientes; consolidação prévia obrigatória.
- **Frontend container unhealthy**: indica risco de disponibilidade; diagnosticar antes de qualquer release.
- **Schema atual pode não cobrir** o modelo lógico de Subscriptions cleanly; auditar antes de prometer entrega.
- **Geração de mensalidades** pode não existir no código atual ou estar acoplada; auditar e isolar como módulo claro.
- **Mistura de domínios** (`agenda-aulas` vs `agendamentos`): desambiguar antes de evoluir.
