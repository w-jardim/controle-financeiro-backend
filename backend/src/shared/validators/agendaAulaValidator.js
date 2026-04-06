const { z } = require('zod');

const criarAgendaSchema = z.object({
  ct_id: z.coerce.number().int().positive('CT é obrigatório'),
  modalidade_id: z.coerce.number().int().positive('Modalidade é obrigatória'),
  profissional_id: z.coerce.number().int().positive('Profissional é obrigatório'),
  data_aula: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (YYYY-MM-DD)'),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
  hora_fim: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
  escala_id: z.number().int().optional().nullable(),
  observacao: z.string().optional().nullable()
});

const atualizarAgendaSchema = criarAgendaSchema.partial();

const gerarPorEscalaSchema = z.object({
  escala_id: z.coerce.number().int().positive('escala_id é obrigatório'),
  data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (YYYY-MM-DD)'),
  data_fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (YYYY-MM-DD)')
});

module.exports = { criarAgendaSchema, atualizarAgendaSchema, gerarPorEscalaSchema };
