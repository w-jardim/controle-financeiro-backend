const { z } = require('zod');

const idParamSchema = z.object({
  id: z.coerce.number().int().positive({ message: 'ID deve ser um número inteiro positivo' })
});

module.exports = { idParamSchema };
