const { z } = require('zod');

const criarMensalidadeSchema = z.object({
  aluno_id: z.coerce.number().int().positive('aluno_id é obrigatório'),
  competencia: z.string().regex(/^[0-9]{4}-(0[1-9]|1[0-2])$/, 'Competência inválida. Use YYYY-MM'),
  valor: z.coerce.number().positive('Valor deve ser um número maior que zero'),
  vencimento: z.string().min(1, 'vencimento é obrigatório'),
  observacao: z.string().optional().nullable(),
  data_pagamento: z.string().optional().nullable()
});

const atualizarMensalidadeSchema = z.object({
  competencia: z.string().regex(/^[0-9]{4}-(0[1-9]|1[0-2])$/, 'Competência inválida. Use YYYY-MM').optional(),
  valor: z.coerce.number().positive('Valor deve ser um número maior que zero').optional(),
  vencimento: z.string().optional(),
  status: z.enum(['pendente', 'pago', 'cancelado']).optional(),
  data_pagamento: z.string().optional().nullable(),
  observacao: z.string().optional().nullable(),
  aluno_id: z.coerce.number().int().positive().optional()
});

module.exports = { criarMensalidadeSchema, atualizarMensalidadeSchema };
