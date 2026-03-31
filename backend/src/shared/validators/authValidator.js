const { z } = require('zod');

const cadastroSchema = z.object({
  nomeResponsavel: z.string().min(1, 'Nome do responsável é obrigatório'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  nomeAccount: z.string().min(1, 'Nome da conta é obrigatório'),
  tipoAccount: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha é obrigatória')
});

module.exports = { cadastroSchema, loginSchema };
