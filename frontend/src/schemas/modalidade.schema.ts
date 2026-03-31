import { z } from 'zod';

export const criarModalidadeSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').trim(),
  descricao: z.string().optional(),
});

export const atualizarModalidadeSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').trim().optional(),
  descricao: z.string().optional(),
  ativo: z.boolean().optional(),
});

export type CriarModalidadeFormData = z.infer<typeof criarModalidadeSchema>;
export type AtualizarModalidadeFormData = z.infer<typeof atualizarModalidadeSchema>;
