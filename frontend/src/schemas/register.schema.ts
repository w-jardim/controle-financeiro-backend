import { z } from 'zod';

export const registerSchema = z.object({
  nomeResponsavel: z.string().min(1, 'Nome do responsável é obrigatório'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  nomeAccount: z.string().min(1, 'Nome da conta é obrigatório'),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
