import { z } from 'zod';

const profissionalBaseSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
});

export const criarProfissionalSchema = profissionalBaseSchema;

export const atualizarProfissionalSchema = profissionalBaseSchema.partial();
