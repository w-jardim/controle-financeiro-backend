const express = require('express');
const roteador = express.Router();

const {
  listarAlunos,
  buscarAlunoPorId,
  criarAluno,
  atualizarAluno,
  desativarAluno,
  ativarAluno
} = require('../controllers/alunoController');

const validarIdNumerico = require('../../../shared/middlewares/validarIdNumerico');

roteador.get('/', listarAlunos);
roteador.post('/', criarAluno);
roteador.patch('/:id/desativar', validarIdNumerico, desativarAluno);
roteador.patch('/:id/ativar', validarIdNumerico, ativarAluno);
roteador.get('/:id', validarIdNumerico, buscarAlunoPorId);
roteador.put('/:id', validarIdNumerico, atualizarAluno);

module.exports = roteador;
