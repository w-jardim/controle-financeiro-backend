const { z } = require('zod');

const criarProfissionalSchema = z.object({
  nome: z.string().trim().min(1, 'O campo nome é obrigatório'),
  email: z.string().email('Email inválido').optional().nullable(),
  telefone: z.string().optional().nullable(),
  especialidade: z.string().optional().nullable()
});

const atualizarProfissionalSchema = criarProfissionalSchema.partial();

module.exports = { criarProfissionalSchema, atualizarProfissionalSchema };
