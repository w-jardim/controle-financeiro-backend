const { z } = require('zod');

const criarTransacaoSchema = z.object({
  tipo: z.enum(['receita', 'despesa'], { message: 'Campo tipo deve ser receita ou despesa' }),
  descricao: z.string().trim().min(1, 'Campo descricao é obrigatório'),
  valor: z.coerce.number().positive('Campo valor deve ser um número maior que zero'),
  ct_id: z.coerce.number().int().positive().optional().nullable()
});

const atualizarTransacaoSchema = criarTransacaoSchema;

module.exports = { criarTransacaoSchema, atualizarTransacaoSchema };
