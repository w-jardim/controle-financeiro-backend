import { z } from 'zod';

export const criarCtSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
});

export const atualizarCtSchema = criarCtSchema.extend({
  ativo: z.boolean().optional(),
});

export type CriarCtForm = z.infer<typeof criarCtSchema>;
export type AtualizarCtForm = z.infer<typeof atualizarCtSchema>;
