const express = require('express');
const roteador = express.Router();

const {
  listarAgenda,
  buscarAgendaPorId,
  criarAula,
  atualizarAula,
  liberarAula,
  cancelarAula,
  encerrarAula,
  gerarPorEscala
} = require('../controllers/agendaAulasController');

const validarIdNumerico = require('../../../shared/middlewares/validarIdNumerico');
const validate = require('../../../shared/middlewares/validate');
const { idParamSchema } = require('../../../shared/validators/common');
const { criarAgendaSchema, atualizarAgendaSchema, gerarPorEscalaSchema } = require('../../../shared/validators/agendaAulaValidator');

roteador.get('/', listarAgenda);
roteador.post('/', validate(criarAgendaSchema), criarAula);
roteador.post('/gerar-por-escala', validate(gerarPorEscalaSchema), gerarPorEscala);
roteador.patch('/:id/liberar', validarIdNumerico, validate(idParamSchema, 'params'), liberarAula);
roteador.patch('/:id/cancelar', validarIdNumerico, validate(idParamSchema, 'params'), cancelarAula);
roteador.patch('/:id/encerrar', validarIdNumerico, validate(idParamSchema, 'params'), encerrarAula);
roteador.get('/:id', validarIdNumerico, validate(idParamSchema, 'params'), buscarAgendaPorId);
roteador.put('/:id', validarIdNumerico, validate(idParamSchema, 'params'), validate(atualizarAgendaSchema), atualizarAula);

module.exports = roteador;
