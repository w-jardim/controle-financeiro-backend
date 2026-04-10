import { z } from 'zod';

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
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

export const criarEscalaSchema = escalaBaseSchema.refine((data) => {
  return toMinutes(data.hora_fim) > toMinutes(data.hora_inicio);
}, {
  message: 'hora_fim deve ser maior que hora_inicio',
  path: ['hora_fim'],
});

export const atualizarEscalaSchema = escalaBaseSchema.partial().refine((data) => {
  if (!data.hora_inicio || !data.hora_fim) return true;
  return toMinutes(data.hora_fim) > toMinutes(data.hora_inicio);
}, {
  message: 'hora_fim deve ser maior que hora_inicio',
  path: ['hora_fim'],
});
