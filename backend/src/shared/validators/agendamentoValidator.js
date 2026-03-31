const { z } = require('zod');

const criarAgendamentoSchema = z.object({
  aluno_id: z.coerce.number().int().positive('aluno_id é obrigatório'),
  horario_aula_id: z.coerce.number().int().positive('horario_aula_id é obrigatório'),
  data_aula: z.string().min(1, 'data_aula é obrigatória'),
  status: z.enum(['agendado', 'cancelado', 'compareceu', 'faltou']).optional(),
  observacao: z.string().optional().nullable()
});

const atualizarAgendamentoSchema = z.object({
  status: z.enum(['agendado', 'cancelado', 'compareceu', 'faltou']).optional(),
  observacao: z.string().optional().nullable(),
  data_aula: z.string().optional()
});

const statusAgendamentoSchema = z.object({
  status: z.enum(['agendado', 'cancelado', 'compareceu', 'faltou'], { message: 'Status inválido' })
});

module.exports = { criarAgendamentoSchema, atualizarAgendamentoSchema, statusAgendamentoSchema };
