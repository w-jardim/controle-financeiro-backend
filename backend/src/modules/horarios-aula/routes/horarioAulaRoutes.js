const express = require('express');
const roteador = express.Router();

const {
  listarHorarios,
  buscarHorarioPorId,
  criarHorario,
  atualizarHorario,
  desativarHorario,
  ativarHorario
} = require('../controllers/horarioAulaController');

const validarIdNumerico = require('../../../shared/middlewares/validarIdNumerico');

roteador.get('/', listarHorarios);
roteador.post('/', criarHorario);
roteador.patch('/:id/desativar', validarIdNumerico, desativarHorario);
roteador.patch('/:id/ativar', validarIdNumerico, ativarHorario);
roteador.get('/:id', validarIdNumerico, buscarHorarioPorId);
roteador.put('/:id', validarIdNumerico, atualizarHorario);

module.exports = roteador;
