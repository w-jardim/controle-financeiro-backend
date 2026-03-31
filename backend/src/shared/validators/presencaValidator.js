const { z } = require('zod');

const criarPresencaSchema = z.object({
  agendamento_id: z.coerce.number().int().positive('agendamento_id é obrigatório'),
  status: z.string().min(1, 'status é obrigatório'),
  observacao: z.string().optional().nullable()
});

const statusPresencaSchema = z.object({
  status: z.string().min(1, 'status é obrigatório')
});

module.exports = { criarPresencaSchema, statusPresencaSchema };
