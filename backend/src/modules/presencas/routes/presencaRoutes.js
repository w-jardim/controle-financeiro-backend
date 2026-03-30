const express = require('express');
const roteador = express.Router();

roteador.use(require('../../../shared/middlewares/authMiddleware'));

const {
  listarPresencas,
  buscarPresencaPorId,
  criarPresenca,
  atualizarPresenca,
  atualizarStatusPresenca
} = require('../controllers/presencaController');

roteador.get('/', listarPresencas);
roteador.post('/', criarPresenca);
roteador.get('/:id', buscarPresencaPorId);
roteador.put('/:id', atualizarPresenca);
roteador.patch('/:id/status', atualizarStatusPresenca);

module.exports = roteador;
