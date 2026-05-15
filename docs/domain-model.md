# CTFlow — Modelo de Domínio

Status: modelo conceitual de produto (somente documentação). Não reflete necessariamente o schema atual do MySQL; é o **alvo** desejado, a ser conciliado com `mysql-init/` em fase posterior, com aprovação humana.

Entidades centrais e suas relações lógicas.

---

## 1. CT (Centro de Treinamento)
**Propósito:** unidade lógica de tenancy. Tudo no sistema pertence a um CT (alunos, profissionais, mensalidades, aulas).

**Campos-chave:**
- `id`
- `nome`
- `cnpj` (opcional)
- `endereco`
- `telefone`, `email`
- `timezone`
- `status` (ativo/inativo/suspenso)
- `criado_em`, `atualizado_em`

**Relações:**
- 1:N → User, Student, Professional, Modality, Plan, Class, Transaction, Settings

**Status:** `ativo`, `inativo`, `suspenso`

---

## 2. User
**Propósito:** identidade que faz login no sistema. Pode ser owner, admin, finance, coach, reception (ou student no futuro).

**Campos-chave:**
- `id`
- `ct_id` (FK)
- `nome`
- `email` (único por CT)
- `senha_hash`
- `role` (ver [docs/user-roles.md](user-roles.md))
- `professional_id` (FK opcional — se o user também é coach)
- `status`
- `ultimo_login`

**Relações:**
- N:1 → CT
- 0..1:1 → Professional

**Status:** `ativo`, `inativo`, `bloqueado`

---

## 3. Student (Aluno)
**Propósito:** pessoa que treina no CT. Núcleo operacional do produto.

**Campos-chave:**
- `id`
- `ct_id` (FK)
- `nome_completo`
- `cpf` (opcional, único por CT quando preenchido)
- `data_nascimento`
- `telefone`, `email`
- `endereco`
- `responsavel` (para menores)
- `data_matricula`
- `status`
- `observacoes`
- `criado_em`, `atualizado_em`

**Relações:**
- N:1 → CT
- 1:N → Subscription, Payment, Attendance

**Status:** `ativo`, `inativo`, `inadimplente`, `trancado`, `cancelado`

---

## 4. Professional (Profissional / Coach)
**Propósito:** instrutor/coach que ministra aulas ou atua no CT.

**Campos-chave:**
- `id`
- `ct_id` (FK)
- `nome_completo`
- `cpf` (opcional)
- `cref` (opcional — registro profissional)
- `telefone`, `email`
- `modalidades_id[]` (modalidades que leciona)
- `tipo_contrato` (clt, pj, autonomo, voluntario)
- `valor_hora_aula` (opcional)
- `status`

**Relações:**
- N:1 → CT
- N:N → Modality
- 1:N → Class (como responsável)
- 0..1:1 → User

**Status:** `ativo`, `afastado`, `desligado`

---

## 5. Modality (Modalidade)
**Propósito:** tipo de atividade ofertada pelo CT (BJJ, Muay Thai, Pilates, CrossFit, Funcional, Natação, etc.).

**Campos-chave:**
- `id`
- `ct_id` (FK)
- `nome`
- `descricao`
- `cor` (para UI/agenda)
- `idade_minima`, `idade_maxima` (opcional)
- `status`

**Relações:**
- N:1 → CT
- N:N → Professional
- 1:N → Class, Plan (via plano que libera modalidade)

**Status:** `ativa`, `inativa`

---

## 6. Plan (Plano)
**Propósito:** oferta comercial (mensal, trimestral, anual; ilimitado ou por número de aulas; uma ou múltiplas modalidades).

**Campos-chave:**
- `id`
- `ct_id` (FK)
- `nome` (ex.: "Mensal BJJ Ilimitado")
- `descricao`
- `valor`
- `periodicidade` (mensal, trimestral, semestral, anual, avulso)
- `modalidades_id[]` (modalidades cobertas)
- `aulas_por_semana_max` (opcional, NULL = ilimitado)
- `duracao_meses` (opcional, contratos com prazo)
- `status`

**Relações:**
- N:1 → CT
- N:N → Modality
- 1:N → Subscription

**Status:** `ativo`, `inativo`, `descontinuado`

---

## 7. Subscription (Matrícula / Assinatura)
**Propósito:** vínculo ativo entre Student e Plan. Gera mensalidades periodicamente.

**Campos-chave:**
- `id`
- `ct_id` (FK)
- `student_id` (FK)
- `plan_id` (FK)
- `data_inicio`
- `data_fim` (opcional)
- `dia_vencimento` (1–28)
- `valor_acordado` (pode diferir do valor do plano — descontos)
- `forma_pagamento_preferida`
- `status`
- `observacoes`

**Relações:**
- N:1 → Student
- N:1 → Plan
- 1:N → Payment (mensalidades geradas)

**Status:** `ativa`, `suspensa`, `cancelada`, `encerrada`

---

## 8. Payment (Mensalidade / Pagamento)
**Propósito:** cobrança gerada a partir de uma Subscription. Núcleo financeiro do produto.

**Campos-chave:**
- `id`
- `ct_id` (FK)
- `subscription_id` (FK)
- `student_id` (FK denormalizado para queries rápidas)
- `competencia` (mês de referência, YYYY-MM)
- `valor`
- `data_vencimento`
- `data_pagamento` (NULL se em aberto)
- `valor_pago` (pode diferir — descontos/juros)
- `forma_pagamento` (pix, dinheiro, cartao, boleto)
- `status`
- `observacoes`

**Relações:**
- N:1 → Subscription
- N:1 → Student
- 1:1 → Transaction (quando pago, espelha em transação financeira)

**Status:** `em_aberto`, `pago`, `atrasado`, `cancelado`, `isento`

---

## 9. Class (Aula / Turma)
**Propósito:** unidade de aula ofertada — vinculada a modalidade, professor e horário. Pode ser uma turma recorrente ou aula avulsa.

**Campos-chave:**
- `id`
- `ct_id` (FK)
- `modality_id` (FK)
- `professional_id` (FK responsável)
- `nome` (ex.: "BJJ Iniciantes — Seg/Qua 19h")
- `capacidade_maxima`
- `nivel` (iniciante, intermediário, avançado, livre)
- `status`

**Relações:**
- N:1 → CT, Modality, Professional
- 1:N → Schedule (horários da turma)
- 1:N → Attendance

**Status:** `ativa`, `inativa`, `cancelada`

---

## 10. Schedule (Horário de Aula)
**Propósito:** ocorrência da aula no calendário — recorrência semanal ou instância específica.

**Campos-chave:**
- `id`
- `ct_id` (FK)
- `class_id` (FK)
- `dia_semana` (0–6) — para recorrência
- `hora_inicio`, `hora_fim`
- `data_especifica` (opcional, para aula avulsa/reposição)
- `professional_id` (override do professor padrão, opcional)
- `status`

**Relações:**
- N:1 → Class
- 1:N → Attendance (uma sessão pode ter N presenças)

**Status:** `agendada`, `realizada`, `cancelada`, `substituida`

---

## 11. Attendance (Presença / Check-in)
**Propósito:** registro de que um aluno compareceu a uma sessão de aula.

**Campos-chave:**
- `id`
- `ct_id` (FK)
- `student_id` (FK)
- `schedule_id` (FK) — ou `class_id` + `data`
- `data_aula`
- `checkin_em` (timestamp)
- `metodo` (manual, qr, app — futuro)
- `status`

**Relações:**
- N:1 → Student, Schedule

**Status:** `presente`, `ausente_justificado`, `falta`

---

## 12. Transaction (Transação Financeira)
**Propósito:** lançamento no caixa do CT — receita ou despesa. Mensalidades pagas geram transação automaticamente.

**Campos-chave:**
- `id`
- `ct_id` (FK)
- `tipo` (receita, despesa)
- `categoria` (mensalidade, matrícula, produto, salário, aluguel, etc.)
- `valor`
- `data`
- `descricao`
- `forma_pagamento`
- `payment_id` (FK opcional — se origem é mensalidade)
- `professional_id` (FK opcional — se é pagamento a profissional)
- `status`

**Relações:**
- N:1 → CT
- 0..1:1 → Payment
- N:1 → Professional (opcional)

**Status:** `confirmada`, `prevista`, `cancelada`

---

## 13. Report (Relatório)
**Propósito:** visão agregada (não é uma tabela persistida, mas uma entidade lógica do produto). Cada relatório é uma consulta materializada sob demanda.

**Tipos previstos:**
- Inadimplência (alunos com mensalidades atrasadas)
- Fluxo de caixa (entradas/saídas por período)
- Ocupação de turmas (presenças por modalidade/aula)
- Retenção (alunos ativos/cancelados por mês)
- Receita por modalidade
- Hora-aula por profissional

**Campos lógicos:**
- `tipo`
- `periodo` (data_inicio, data_fim)
- `filtros` (modalidade, profissional, status)
- `resultado` (estrutura específica por tipo)

**Relações:** consome dados de Payment, Transaction, Attendance, Subscription.

---

## 14. Settings (Configurações do CT)
**Propósito:** parâmetros operacionais por CT.

**Campos-chave:**
- `ct_id` (FK PK)
- `dia_vencimento_padrao`
- `tolerancia_atraso_dias`
- `juros_atraso_percentual`
- `multa_atraso_percentual`
- `notificacoes_ativas` (futuro)
- `logo_url` (opcional)
- `cor_primaria` (UI)

**Relações:**
- 1:1 → CT

**Status:** N/A (registro único por CT).

---

## Diagrama lógico resumido

```
CT ──┬── User
     ├── Student ──┬── Subscription ── Plan ── Modality
     │             ├── Payment ── Transaction
     │             └── Attendance ── Schedule ── Class ── Professional
     ├── Professional ── Modality
     ├── Modality
     ├── Plan
     ├── Transaction
     └── Settings
```

## Notas de implementação (planejamento)
- Os módulos atuais (`agenda-aulas`, `agendamentos`, `alunos`, `cts`, `escalas`, `horarios-aula`, `mensalidades`, `modalidades`, `presencas`, `profissionais`, `transacoes`, `auth`) **mapeiam parcialmente** o modelo acima. A reconciliação detalhada entrará em [docs/refactor-backlog.md](refactor-backlog.md) em fase posterior, sob aprovação humana.
- Status enums acima são **alvo de produto**; valores reais no banco devem ser auditados antes de qualquer migração.
- Multi-tenant via `ct_id` em todas as tabelas é a estratégia recomendada (ver fase 9 em [docs/modules-roadmap.md](modules-roadmap.md)).
