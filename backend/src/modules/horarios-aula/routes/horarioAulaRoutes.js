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
const validate = require('../../../shared/middlewares/validate');
const { idParamSchema } = require('../../../shared/validators/common');
const { criarHorarioSchema, atualizarHorarioSchema } = require('../../../shared/validators/horarioAulaValidator');

roteador.get('/', listarHorarios);
roteador.post('/', validate(criarHorarioSchema), criarHorario);
roteador.patch('/:id/desativar', validarIdNumerico, validate(idParamSchema, 'params'), desativarHorario);
roteador.patch('/:id/ativar', validarIdNumerico, validate(idParamSchema, 'params'), ativarHorario);
roteador.get('/:id', validarIdNumerico, validate(idParamSchema, 'params'), buscarHorarioPorId);
roteador.put('/:id', validarIdNumerico, validate(idParamSchema, 'params'), validate(atualizarHorarioSchema), atualizarHorario);

module.exports = roteador;
