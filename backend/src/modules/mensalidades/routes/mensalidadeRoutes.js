const express = require('express');
const roteador = express.Router();

roteador.use(require('../../../shared/middlewares/authMiddleware'));

const validate = require('../../../shared/middlewares/validate');
const { idParamSchema } = require('../../../shared/validators/common');
const { criarMensalidadeSchema, atualizarMensalidadeSchema } = require('../../../shared/validators/mensalidadeValidator');

const {
  listarMensalidades,
  buscarMensalidadePorId,
  criarMensalidade,
  atualizarMensalidade,
  pagarMensalidade,
  cancelarMensalidade
} = require('../controllers/mensalidadeController');

roteador.get('/', listarMensalidades);
roteador.post('/', validate(criarMensalidadeSchema), criarMensalidade);
roteador.get('/:id', validate(idParamSchema, 'params'), buscarMensalidadePorId);
roteador.put('/:id', validate(idParamSchema, 'params'), validate(atualizarMensalidadeSchema), atualizarMensalidade);
roteador.patch('/:id/pagar', validate(idParamSchema, 'params'), pagarMensalidade);
roteador.patch('/:id/cancelar', validate(idParamSchema, 'params'), cancelarMensalidade);

module.exports = roteador;
