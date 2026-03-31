import { z } from 'zod';

export const criarModalidadeSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').trim(),
  descricao: z.string().optional().nullable(),
});

export const atualizarModalidadeSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').trim().optional(),
  descricao: z.string().optional().nullable(),
  ativo: z.boolean().optional(),
});

export type CriarModalidadeFormData = z.infer<typeof criarModalidadeSchema>;
export type AtualizarModalidadeFormData = z.infer<typeof atualizarModalidadeSchema>;
