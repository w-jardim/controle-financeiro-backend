import { z } from 'zod';

export const criarAlunoSchema = z.object({
  // ct_id will be resolved by the frontend automatically; keep optional for form validation
  ct_id: z.coerce.number().optional(),
  nome: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().optional().nullable(),
  data_nascimento: z.string().optional().nullable(),
  sexo: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  email: z.string().email('Email inválido').optional().nullable(),
  nome_responsavel: z.string().optional().nullable(),
  telefone_responsavel: z.string().optional().nullable(),
});

export const atualizarAlunoSchema = criarAlunoSchema.partial();

export type CriarAlunoForm = z.infer<typeof criarAlunoSchema>;
export type AtualizarAlunoForm = z.infer<typeof atualizarAlunoSchema>;
