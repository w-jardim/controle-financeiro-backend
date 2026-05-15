# CTFlow — Papéis de Usuário (User Roles)

Status: definição conceitual (somente documentação). Permissões reais no código serão implementadas em fase posterior (ver Fase 5 em [docs/modules-roadmap.md](modules-roadmap.md)) com aprovação humana.

Cada papel pertence a **um CT** (escopo de tenant). Um User tem **um role principal** por CT; combinações ficam para o futuro (matriz de permissões).

---

## 1. owner (Dono / Proprietário do CT)
**Responsabilidades:**
- Configurar o CT (dados cadastrais, parâmetros, logo).
- Definir planos comerciais e modalidades.
- Convidar e remover usuários do CT.
- Acompanhar resultado financeiro e indicadores estratégicos.

**Ações permitidas:**
- Acesso total a todos os módulos.
- CRUD de qualquer entidade dentro do seu CT.
- Visualizar relatórios financeiros sensíveis (receita, despesa, DRE).
- Convidar, editar e desativar outros usuários (qualquer role).
- Alterar configurações do CT.
- Exportar dados.

**Ações proibidas:**
- Acessar dados de outros CTs (multi-tenant strict).
- Alterar configurações globais da plataforma SaaS (no futuro — isso é do admin de plataforma, fora do escopo deste documento).

**Notas para permissões futuras:**
- Pode delegar partes da gestão financeira para um `finance`.
- Em redes multi-unidade (futuro), `owner` será extensível a `network_owner` com visão sobre múltiplos CTs.

---

## 2. admin (Administrador do CT)
**Responsabilidades:**
- Operar o dia a dia do sistema em nome do owner.
- Manter cadastros atualizados (alunos, planos, profissionais).
- Acompanhar inadimplência e operação geral.

**Ações permitidas:**
- CRUD de Aluno, Profissional, Modalidade, Plano, Aula, Horário.
- Gerenciar Subscriptions e Payments.
- Lançar Transactions manuais.
- Ver todos os relatórios operacionais e financeiros.
- Convidar usuários `coach`, `reception` (não pode promover ninguém a `owner`).

**Ações proibidas:**
- Alterar dados cadastrais do CT (CNPJ, razão social).
- Remover ou rebaixar o `owner`.
- Excluir registros financeiros já confirmados (apenas estornar/cancelar com motivo).
- Acessar logs de auditoria de outros admins sem permissão explícita do owner (futuro).

**Notas para permissões futuras:**
- Pode existir `admin_readonly` para auditores externos.

---

## 3. finance (Financeiro)
**Responsabilidades:**
- Controlar mensalidades, inadimplência e transações.
- Confirmar pagamentos, aplicar descontos/juros, emitir relatórios financeiros.

**Ações permitidas:**
- Visualizar e editar Payments (marcar como pago, aplicar desconto/isenção, estornar).
- Lançar Transactions (receitas e despesas).
- Ver relatórios financeiros (inadimplência, fluxo de caixa, DRE).
- Visualizar Subscriptions e Students (somente leitura suficiente para entender contexto financeiro).
- Exportar dados financeiros.

**Ações proibidas:**
- Criar/editar/excluir Alunos, Profissionais, Modalidades, Planos.
- Editar Aulas, Horários, Presenças.
- Convidar ou alterar outros usuários.
- Alterar configurações do CT.

**Notas para permissões futuras:**
- Acesso somente-leitura a dados pessoais sensíveis dos alunos (LGPD).
- Permissão granular para "aprovar estorno" como ação reservada ao `owner`.

---

## 4. coach (Instrutor / Professor)
**Responsabilidades:**
- Conduzir aulas das suas modalidades.
- Registrar presença dos alunos.
- Consultar sua agenda de aulas e escala.

**Ações permitidas:**
- Ver suas próprias aulas, horários e escala.
- Registrar presença de alunos nas suas aulas.
- Ver lista de alunos matriculados nas suas turmas (nome, status, observações operacionais).
- Atualizar seu próprio perfil (telefone, foto — futuro).
- Cancelar ou solicitar substituição em aula sua (com confirmação).

**Ações proibidas:**
- CRUD de Aluno (apenas leitura limitada).
- Acessar dados financeiros (mensalidades, transações).
- Editar planos, modalidades, profissionais (incluindo outros coaches).
- Ver aulas/escalas de outros profissionais (a menos que o owner libere).
- Convidar ou alterar usuários.

**Notas para permissões futuras:**
- App dedicado do coach com check-in rápido.
- Permissão para registrar avaliações físicas e planos de treino (P3 — ver [docs/feature-map.md](feature-map.md)).

---

## 5. reception (Recepção / Front desk)
**Responsabilidades:**
- Atender o aluno na chegada e por telefone.
- Cadastrar novos alunos, abrir matrículas, registrar pagamentos no balcão.
- Realizar check-in manual de alunos em aula.

**Ações permitidas:**
- CRUD de Aluno (criar, editar dados cadastrais, status básico).
- Criar Subscriptions (matricular aluno em plano existente).
- Registrar pagamento de mensalidade (forma, valor, data).
- Registrar check-in/presença em qualquer aula do dia.
- Consultar agenda do dia (todas as aulas, todos os coaches).
- Consultar inadimplência do aluno na hora do atendimento.

**Ações proibidas:**
- Criar/editar Planos, Modalidades, Aulas, Horários.
- Estornar pagamento confirmado (apenas registrar; ajustes ficam com finance/admin).
- Ver relatórios financeiros agregados (fluxo de caixa, DRE).
- Editar Profissionais e Escalas.
- Convidar usuários.

**Notas para permissões futuras:**
- Permissão para emitir recibo/comprovante.
- Permissão para vender produtos avulsos (se módulo de produtos existir — atualmente "not now").

---

## 6. student (Aluno) — futuro
**Responsabilidades:**
- Consultar suas próprias informações: mensalidades, próximas aulas, plano vigente.
- Fazer check-in em aulas (via portal/app).

**Ações permitidas (futuro):**
- Ver suas Subscriptions ativas.
- Ver suas Payments (status, vencimento, valor).
- Ver agenda de aulas das suas modalidades.
- Fazer check-in/reserva em aulas (com regras de capacidade).
- Atualizar dados pessoais (telefone, email, endereço).
- Iniciar pagamento via PIX/cartão (integração futura).

**Ações proibidas:**
- Ver dados de outros alunos.
- Editar Plano, valor da mensalidade.
- Acessar qualquer relatório do CT.
- Confirmar manualmente um pagamento (só via gateway).

**Notas para permissões futuras:**
- Esse role só será habilitado quando o **Portal do Aluno** entrar (Fase 8 em [docs/modules-roadmap.md](modules-roadmap.md)).
- LGPD: aluno pode solicitar exportação e exclusão dos seus dados — fluxo dedicado.

---

## Matriz resumida (alvo de produto)

| Capacidade                            | owner | admin | finance | coach | reception | student |
|--------------------------------------|:-----:|:-----:|:-------:|:-----:|:---------:|:-------:|
| Config do CT                          | ✅    | ⚠️    | ❌      | ❌    | ❌        | ❌      |
| CRUD Aluno                           | ✅    | ✅    | ❌      | ❌    | ✅        | ❌      |
| Ver Aluno (leitura limitada)         | ✅    | ✅    | ✅      | ✅    | ✅        | (self)  |
| CRUD Plano / Modalidade              | ✅    | ✅    | ❌      | ❌    | ❌        | ❌      |
| CRUD Subscription                    | ✅    | ✅    | ❌      | ❌    | ✅        | ❌      |
| Confirmar pagamento mensalidade      | ✅    | ✅    | ✅      | ❌    | ✅        | ❌      |
| Estornar/isentar mensalidade         | ✅    | ✅    | ✅      | ❌    | ❌        | ❌      |
| Lançar Transaction manual            | ✅    | ✅    | ✅      | ❌    | ❌        | ❌      |
| CRUD Profissional                    | ✅    | ✅    | ❌      | ❌    | ❌        | ❌      |
| CRUD Aula / Horário                  | ✅    | ✅    | ❌      | ❌    | ❌        | ❌      |
| Registrar presença                   | ✅    | ✅    | ❌      | ✅    | ✅        | (self)  |
| Relatórios financeiros agregados     | ✅    | ✅    | ✅      | ❌    | ❌        | ❌      |
| Relatórios operacionais (presença)   | ✅    | ✅    | ❌      | ⚠️    | ❌        | ❌      |
| Convidar usuários                    | ✅    | ⚠️    | ❌      | ❌    | ❌        | ❌      |

Legenda: ✅ permitido · ⚠️ permitido com restrições (sem promover acima do próprio nível, sem editar dados estratégicos) · ❌ negado · (self) só os próprios dados.

## Princípios gerais
- **Tenant isolation**: nenhum role enxerga dados de outro CT.
- **Privilégio mínimo**: cada role só vê o necessário para sua função.
- **Auditoria**: ações sensíveis (estorno, exclusão, mudança de role) são logadas — implementação na Fase 5.
- **Promoção controlada**: somente `owner` pode promover alguém a `admin`.
