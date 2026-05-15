# CTFlow — Mapa de Funcionalidades

Status: planejamento de produto (somente documentação). Nenhuma feature listada aqui está garantida no código atual — este é o **mapa-alvo**, organizado por prioridade.

Legenda de prioridade:
- **P0** — bloqueante do MVP, sem isso o produto não opera.
- **P1** — alto valor, esperado logo após o MVP.
- **P2** — diferencial competitivo, depois das fundações.
- **P3** — visão futura, exige base sólida antes.

---

## MVP (lançamento robusto inicial)
Foco: substituir planilhas para o ciclo **aluno → plano → mensalidade → aula → presença**.

| # | Funcionalidade | Prioridade |
|---|---|---|
| 1 | Login com email/senha (JWT) | P0 |
| 2 | CRUD de CT (cadastro do próprio centro) | P0 |
| 3 | CRUD de Alunos com status (ativo/inativo/inadimplente) | P0 |
| 4 | CRUD de Modalidades | P0 |
| 5 | CRUD de Planos (valor, periodicidade, modalidades cobertas) | P0 |
| 6 | Matrícula: vincular Aluno → Plano (Subscription) | P0 |
| 7 | Geração mensal de mensalidades a partir de Subscriptions ativas | P0 |
| 8 | Listagem de mensalidades por aluno, com status e vencimento | P0 |
| 9 | Marcar mensalidade como paga (forma de pagamento, data, valor) | P0 |
| 10 | CRUD de Profissionais | P0 |
| 11 | CRUD de Aulas/Turmas (modalidade + profissional + capacidade) | P0 |
| 12 | CRUD de Horários (recorrência semanal) | P0 |
| 13 | Registro manual de presença em aula | P0 |
| 14 | Dashboard inicial: alunos ativos, mensalidades em aberto, receita do mês | P0 |
| 15 | Listagem de inadimplentes | P0 |
| 16 | Filtros e busca em listas (alunos, mensalidades) | P0 |
| 17 | Health/readiness endpoints já existentes (`/saude`, `/ping`, `/ready`) | P0 |

---

## Pro (próxima fatia após MVP)
Foco: financeiro completo, escalas, dashboards, qualidade de operação.

| # | Funcionalidade | Prioridade |
|---|---|---|
| 18 | Lançamento manual de Transações (receitas/despesas avulsas) | P1 |
| 19 | Fluxo de caixa por período (entradas vs. saídas) | P1 |
| 20 | DRE simplificado mensal | P1 |
| 21 | Escala de profissionais (semanal, com substituições) | P1 |
| 22 | Reposição/cancelamento de aulas com histórico | P1 |
| 23 | Relatório de presença por aluno (frequência, faltas consecutivas) | P1 |
| 24 | Relatório de ocupação por turma/modalidade | P1 |
| 25 | Hora-aula por profissional (base para pagamento) | P1 |
| 26 | Aplicação de juros/multa em mensalidades atrasadas | P1 |
| 27 | Desconto e isenção em mensalidades com justificativa | P1 |
| 28 | Trancamento e reativação de alunos | P1 |
| 29 | Exportação de listas e relatórios (CSV/XLSX) | P1 |
| 30 | Papéis e permissões (owner, admin, finance, coach, reception) | P1 |
| 31 | Auditoria básica (quem alterou o quê, quando) | P1 |
| 32 | Configurações do CT (vencimento padrão, juros, logo) | P1 |
| 33 | Aniversariantes do mês | P2 |
| 34 | Indicador de retenção (churn mensal) | P2 |

---

## Future (visão de longo prazo)
Foco: portal do aluno, automações, multi-tenant SaaS, integrações de pagamento.

| # | Funcionalidade | Prioridade |
|---|---|---|
| 35 | Portal do Aluno (web): ver mensalidades, próximas aulas, fazer check-in | P2 |
| 36 | App mobile do Aluno (PWA ou nativo) | P3 |
| 37 | Check-in por QR Code na recepção | P2 |
| 38 | Notificações por email (vencimento, atraso, ausência) | P2 |
| 39 | Notificações por WhatsApp (integração via API) | P2 |
| 40 | Integração com PIX (cobrança automática) | P2 |
| 41 | Integração com gateway de cartão recorrente (Asaas, Pagar.me, Iugu) | P2 |
| 42 | Boleto bancário registrado | P3 |
| 43 | Avaliação física e medidas corporais por aluno | P3 |
| 44 | Plano de treino individual (cadastro de séries por aluno) | P3 |
| 45 | Multi-tenant SaaS (cada CT é um tenant isolado, com billing próprio) | P3 |
| 46 | Painel do dono da rede (multi-unidade, comparativos entre CTs) | P3 |
| 47 | API pública para integrações de terceiros | P3 |
| 48 | App do Coach (registrar presença pelo celular, ver agenda) | P3 |
| 49 | LTV e CAC por aluno/canal | P3 |
| 50 | Marketing: campanhas de reativação automática de inativos | P3 |

---

## Not now (explicitamente fora de escopo)
Decisões conscientes de **não fazer** — para evitar dispersão.

| # | Funcionalidade | Motivo |
|---|---|---|
| 51 | E-commerce de produtos (suplementos, uniformes) | Fora do core; complexidade alta, valor baixo no MVP. |
| 52 | Controle de estoque | Fora do core operacional do CT. |
| 53 | Plataforma de aulas em vídeo / EAD | Produto distinto; não é foco. |
| 54 | CRM de leads completo (funil, automação de marketing) | Substituível por ferramenta externa; foco é gestão pós-matrícula. |
| 55 | Folha de pagamento completa (encargos, INSS, FGTS) | Domínio contábil próprio; integraremos com export, não substituiremos. |
| 56 | Emissão de NFe/NFSe | Integração futura via parceiro, não desenvolvimento próprio. |
| 57 | Biometria/catraca física | Hardware-dependente; só após base de software consolidada. |
| 58 | App para venda de planos avulsos (drop-in marketplace) | Não é o modelo do CT-alvo. |
| 59 | Comunidade/feed social entre alunos | Fora do core; alto custo de moderação. |

---

## Critérios de promoção entre faixas
- **Not now → Future**: validação de pelo menos 3 CTs reais demandando explicitamente.
- **Future → Pro**: especificação detalhada, mockup, e estimativa cabendo em uma fase do roadmap.
- **Pro → MVP**: só por reordenação consciente do MVP, com aprovação humana e impacto no escopo registrado em [docs/decisions.md](decisions.md).

## Notas
- Esta lista é **alvo de produto**, não inventário atual. O cruzamento com o código existente (módulos `agenda-aulas`, `agendamentos`, `alunos`, etc.) será feito em fase posterior, em [docs/refactor-backlog.md](refactor-backlog.md), com aprovação humana.
- Toda alteração nesta priorização deve ser registrada em [docs/decisions.md](decisions.md).
