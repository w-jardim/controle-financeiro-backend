# CTFlow — Visão de Produto

Status: planejamento de produto (somente documentação). Nenhuma alteração de código, infra ou banco foi feita.

## Nome do produto
CTFlow — sistema de gestão para Centros de Treinamento (CTs).

## Posicionamento
CTFlow é um sistema operacional e financeiro projetado especificamente para Centros de Treinamento (academias, escolas de luta, clubes de modalidades, estúdios de Pilates/CrossFit, hubs esportivos). Concentra em um único produto:

- Gestão de alunos e planos
- Controle de mensalidades e inadimplência
- Agenda de aulas, horários e presença
- Gestão de profissionais (coaches/instrutores) e escalas
- Transações financeiras e relatórios

O produto se diferencia ao tratar o **CT como entidade central** (tenant lógico), e não como mero "estúdio genérico". O domínio reflete a operação real: modalidades, turmas, agendamentos, presença, mensalidades, escalas de profissionais.

## Mercado-alvo
- Centros de Treinamento de pequeno e médio porte (até ~2.000 alunos ativos)
- Academias independentes e redes regionais
- Escolas de luta (BJJ, Muay Thai, Boxe, MMA)
- Estúdios de Pilates, CrossFit, funcional, natação
- Hubs esportivos multi-modalidade

Perfil dominante: gestor-proprietário com pouca tolerância a sistemas complexos, alta sensibilidade a inadimplência e necessidade de operação no celular.

## Principais dores
1. **Inadimplência mal controlada** — mensalidades sem rastreio de status, sem cobrança ativa, sem visão de inadimplentes.
2. **Aulas e horários em planilhas/Whatsapp** — sem fonte única, sem registro de presença consolidado.
3. **Profissionais sem escala formal** — substituições e folgas mal comunicadas, sem histórico.
4. **Falta de visão financeira agregada** — sem fluxo de caixa, sem DRE simples, sem indicadores de retenção.
5. **Múltiplos sistemas desconectados** — financeiro num lugar, agenda noutro, alunos em planilha; retrabalho e divergência de dados.
6. **Cadastros frágeis** — duplicidade de alunos, status indefinido, dificuldade para reativar inativos.

## Promessa do produto
Em um único produto, o CT controla **quem é aluno, qual plano paga, em quais aulas treina, quem dá aula e quanto entra no caixa** — com indicadores claros, sem planilhas, sem dependência de WhatsApp.

## Proposta de valor do MVP
O MVP entrega o **núcleo operacional confiável**: cadastrar alunos, vincular planos, gerar mensalidades, registrar presença em aulas e visualizar receitas. O CT passa a operar sem planilhas para esses fluxos críticos, com dados consistentes e auditáveis.

Pilar do MVP: **substituir planilhas e WhatsApp para o ciclo aluno → plano → mensalidade → aula → presença.**

## Visão futura (SaaS)
O CTFlow evolui para um SaaS multi-tenant onde:

- Cada CT é um tenant isolado com sua base de alunos, planos, profissionais
- Existe um portal/app do aluno (check-in, agenda, pagamentos)
- Existe cobrança automatizada via gateways (PIX, cartão, boleto)
- Existem relatórios avançados (LTV, churn, ocupação, hora-aula)
- Existem notificações automáticas (vencimento, ausência, aniversário)
- Existe um modelo de billing por CT (planos do SaaS: Starter / Pro / Enterprise)

O caminho até lá é incremental e validado fase a fase (ver [docs/modules-roadmap.md](modules-roadmap.md)).

## Princípios de produto
- **Domínio primeiro**: modelar a realidade do CT antes de qualquer estética.
- **Operação no dia a dia**: cada tela deve resolver uma tarefa real (registrar presença, gerar mensalidade) em poucos cliques.
- **Confiabilidade financeira**: dados de mensalidades e transações são auditáveis; nada se perde silenciosamente.
- **Mobilidade**: reception/coach operam pelo celular.
- **Evolução conservadora**: o sistema atual é legado sensível; evoluímos por fatias verticais com validação humana.

## Restrições e governança
- Projeto tratado como legado sensível (ver [AGENTS.md](../AGENTS.md)).
- Nenhuma mudança automática sem plano e aprovação humana.
- `.env` e secrets nunca expostos ou alterados.
- Banco e infra só são alterados com aprovação explícita.
