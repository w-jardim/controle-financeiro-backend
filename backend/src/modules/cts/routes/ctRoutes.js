const express = require('express');
const roteador = express.Router();

const {
  listarCts,
  buscarCtPorId,
  criarCt,
  atualizarCt,
  desativarCt,
  ativarCt
} = require('../controllers/ctController');

const validarIdNumerico = require('../../../shared/middlewares/validarIdNumerico');

roteador.get('/', listarCts);
roteador.post('/', criarCt);
roteador.patch('/:id/desativar', validarIdNumerico, desativarCt);
roteador.patch('/:id/ativar', validarIdNumerico, ativarCt);
roteador.get('/:id', validarIdNumerico, buscarCtPorId);
roteador.put('/:id', validarIdNumerico, atualizarCt);

module.exports = roteador;