import { z } from 'zod';

const alunoBaseSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').optional(),
  telefone: z.string().optional(),
  cpf: z.string().optional(),
});

export const criarAlunoSchema = alunoBaseSchema;

export const atualizarAlunoSchema = alunoBaseSchema.partial();
