const { z } = require('zod');

const toMinutes = (t) => {
  if (typeof t !== 'string') return null;
  const parts = t.split(':');
  if (parts.length !== 2) return null;

  const h = Number(parts[0]);
  const m = Number(parts[1]);

  if (!Number.isInteger(h) || !Number.isInteger(m)) return null;
  return h * 60 + m;
};

const escalaBaseSchema = z.object({
  ct_id: z.coerce.number().int().positive('CT é obrigatório'),
  modalidade_id: z.coerce.number().int().positive('Modalidade é obrigatória'),
  profissional_id: z.coerce.number().int().positive('Profissional é obrigatório'),
  dias_semana: z.array(z.number().int().min(0).max(6)).nonempty('Ao menos um dia é obrigatório'),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
  hora_fim: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
});

const criarEscalaSchema = escalaBaseSchema.refine(
  (data) => {
    const inicio = toMinutes(data.hora_inicio);
    const fim = toMinutes(data.hora_fim);

    if (inicio === null || fim === null) return false;
    return fim > inicio;
  },
  { message: 'hora_fim deve ser maior que hora_inicio' }
);

const atualizarEscalaSchema = escalaBaseSchema
  .partial()
  .refine(
    (data) => {
      if (data.hora_inicio == null || data.hora_fim == null) return true;

      const inicio = toMinutes(data.hora_inicio);
      const fim = toMinutes(data.hora_fim);

      if (inicio === null || fim === null) return false;
      return fim > inicio;
    },
    { message: 'hora_fim deve ser maior que hora_inicio' }
  );

module.exports = { criarEscalaSchema, atualizarEscalaSchema };
