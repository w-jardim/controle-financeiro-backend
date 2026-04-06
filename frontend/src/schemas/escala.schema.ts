import { z } from 'zod';

export const criarEscalaSchema = z.object({
  ct_id: z.coerce.number().int().positive('CT é obrigatório'),
  modalidade_id: z.coerce.number().int().positive('Modalidade é obrigatória'),
  profissional_id: z.coerce.number().int().positive('Profissional é obrigatório'),
  dias_semana: z.array(z.coerce.number().int().min(0).max(6)).min(1, 'Escolha pelo menos um dia'),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
  hora_fim: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
}).refine((data) => {
  const [h1, m1] = data.hora_inicio.split(':').map(Number);
  const [h2, m2] = data.hora_fim.split(':').map(Number);
  if (Number.isNaN(h1) || Number.isNaN(h2)) return false;
  const t1 = h1 * 60 + m1;
  const t2 = h2 * 60 + m2;
  return t2 > t1;
}, {
  message: 'Hora fim deve ser maior que hora início',
  path: ['hora_fim'],
});

export const atualizarEscalaSchema = criarEscalaSchema.partial().refine((data) => {
  if (!data.hora_inicio || !data.hora_fim) return true;
  const [h1, m1] = data.hora_inicio!.split(':').map(Number);
  const [h2, m2] = data.hora_fim!.split(':').map(Number);
  if (Number.isNaN(h1) || Number.isNaN(h2)) return false;
  const t1 = h1 * 60 + m1;
  const t2 = h2 * 60 + m2;
  return t2 > t1;
}, {
  message: 'Hora fim deve ser maior que hora início',
  path: ['hora_fim'],
});

export type CriarEscalaForm = z.infer<typeof criarEscalaSchema>;
export type AtualizarEscalaForm = z.infer<typeof atualizarEscalaSchema>;
