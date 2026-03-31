const { z } = require('zod');

const criarHorarioSchema = z.object({
  ct_id: z.coerce.number().int().positive('ct_id é obrigatório'),
  profissional_id: z.coerce.number().int().positive('profissional_id é obrigatório'),
  modalidade_id: z.coerce.number().int().positive('modalidade_id é obrigatório'),
  dia_semana: z.coerce.number().int().min(0).max(6, 'dia_semana deve ser entre 0 e 6'),
  hora_inicio: z.string().min(1, 'hora_inicio é obrigatório'),
  hora_fim: z.string().min(1, 'hora_fim é obrigatório'),
  limite_vagas: z.coerce.number().int().positive().optional().nullable()
});

const atualizarHorarioSchema = criarHorarioSchema.partial();

module.exports = { criarHorarioSchema, atualizarHorarioSchema };
