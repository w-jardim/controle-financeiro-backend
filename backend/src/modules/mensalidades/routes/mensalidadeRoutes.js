const express = require('express');
const roteador = express.Router();

roteador.use(require('../../../shared/middlewares/authMiddleware'));

const {
  listarMensalidades,
  buscarMensalidadePorId,
  criarMensalidade,
  atualizarMensalidade,
  pagarMensalidade,
  cancelarMensalidade
} = require('../controllers/mensalidadeController');

roteador.get('/', listarMensalidades);
roteador.post('/', criarMensalidade);
roteador.get('/:id', buscarMensalidadePorId);
roteador.put('/:id', atualizarMensalidade);
roteador.patch('/:id/pagar', pagarMensalidade);
roteador.patch('/:id/cancelar', cancelarMensalidade);

module.exports = roteador;
