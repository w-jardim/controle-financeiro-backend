const express = require('express');
const roteador = express.Router();

const {
  listarProfissionais,
  buscarProfissionalPorId,
  criarProfissional,
  atualizarProfissional,
  desativarProfissional,
  ativarProfissional
} = require('../controllers/profissionalController');

const validarIdNumerico = require('../../../shared/middlewares/validarIdNumerico');

roteador.get('/', listarProfissionais);
roteador.post('/', criarProfissional);
roteador.patch('/:id/desativar', validarIdNumerico, desativarProfissional);
roteador.patch('/:id/ativar', validarIdNumerico, ativarProfissional);
roteador.get('/:id', validarIdNumerico, buscarProfissionalPorId);
roteador.put('/:id', validarIdNumerico, atualizarProfissional);

module.exports = roteador;
