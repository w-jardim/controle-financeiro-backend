import { z } from 'zod';

export const criarProfissionalSchema = z.object({
  nome: z.string().trim().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').optional(),
  telefone: z.string().optional(),
  especialidade: z.string().optional(),
});

export const atualizarProfissionalSchema = criarProfissionalSchema.partial();

export type CriarProfissionalFormData = z.infer<typeof criarProfissionalSchema>;
export type AtualizarProfissionalFormData = z.infer<typeof atualizarProfissionalSchema>;
