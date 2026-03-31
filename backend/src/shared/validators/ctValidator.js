const { z } = require('zod');

const criarCtSchema = z.object({
  nome: z.string().trim().min(1, 'O campo nome é obrigatório')
});

const atualizarCtSchema = z.object({
  nome: z.string().trim().min(1, 'O campo nome é obrigatório'),
  ativo: z.boolean().optional()
});

module.exports = { criarCtSchema, atualizarCtSchema };
