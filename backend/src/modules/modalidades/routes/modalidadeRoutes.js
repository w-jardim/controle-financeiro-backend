const express = require('express');
const roteador = express.Router();

const {
  listarModalidades,
  buscarModalidadePorId,
  criarModalidade,
  atualizarModalidade,
  desativarModalidade,
  ativarModalidade
} = require('../controllers/modalidadeController');

const validarIdNumerico = require('../../../shared/middlewares/validarIdNumerico');

roteador.get('/', listarModalidades);
roteador.post('/', criarModalidade);
roteador.patch('/:id/desativar', validarIdNumerico, desativarModalidade);
roteador.patch('/:id/ativar', validarIdNumerico, ativarModalidade);
roteador.get('/:id', validarIdNumerico, buscarModalidadePorId);
roteador.put('/:id', validarIdNumerico, atualizarModalidade);

module.exports = roteador;
