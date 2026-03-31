const { z } = require('zod');

const criarModalidadeSchema = z.object({
  nome: z.string().trim().min(1, 'O campo nome é obrigatório'),
  descricao: z.string().optional().nullable()
});

const atualizarModalidadeSchema = criarModalidadeSchema.partial();

module.exports = { criarModalidadeSchema, atualizarModalidadeSchema };
