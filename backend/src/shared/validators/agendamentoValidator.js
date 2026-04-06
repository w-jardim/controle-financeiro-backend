const { z } = require('zod');

const criarAgendamentoSchema = z
  .object({
    aluno_id: z.coerce.number().int().positive('aluno_id é obrigatório'),
    horario_aula_id: z.coerce.number().int().positive().optional(),
    agenda_aula_id: z.coerce.number().int().optional(),
    data_aula: z.string().min(1, 'data_aula é obrigatória'),
    status: z.enum(['agendado', 'cancelado', 'compareceu', 'faltou']).optional(),
    observacao: z.string().optional().nullable()
  })
  .refine((data) => {
    // Require at least one of horario_aula_id or agenda_aula_id
    return (data.horario_aula_id !== undefined && data.horario_aula_id !== null) || (data.agenda_aula_id !== undefined && data.agenda_aula_id !== null);
  }, { message: 'Ao menos horario_aula_id ou agenda_aula_id deve ser fornecido' });

const atualizarAgendamentoSchema = z.object({
  status: z.enum(['agendado', 'cancelado', 'compareceu', 'faltou']).optional(),
  observacao: z.string().optional().nullable(),
  data_aula: z.string().optional()
});

const statusAgendamentoSchema = z.object({
  status: z.enum(['agendado', 'cancelado', 'compareceu', 'faltou'], { message: 'Status inválido' })
});

module.exports = { criarAgendamentoSchema, atualizarAgendamentoSchema, statusAgendamentoSchema };
