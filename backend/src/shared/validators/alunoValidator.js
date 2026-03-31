const { z } = require('zod');

const criarAlunoSchema = z.object({
  nome: z.string().trim().min(1, 'O campo nome é obrigatório'),
  ct_id: z.coerce.number().int().positive('ct_id é obrigatório'),
  cpf: z.string().optional().nullable(),
  data_nascimento: z.string().optional().nullable(),
  sexo: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  email: z.string().email('Email inválido').optional().nullable(),
  nome_responsavel: z.string().optional().nullable(),
  telefone_responsavel: z.string().optional().nullable()
});

const atualizarAlunoSchema = criarAlunoSchema.partial();

module.exports = { criarAlunoSchema, atualizarAlunoSchema };
