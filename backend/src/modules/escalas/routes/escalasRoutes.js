const express = require('express');
const roteador = express.Router();

const {
  listarEscalas,
  buscarEscalaPorId,
  criarEscala,
  atualizarEscala,
  desativarEscala,
  ativarEscala
} = require('../controllers/escalasController');

const validarIdNumerico = require('../../../shared/middlewares/validarIdNumerico');
const validate = require('../../../shared/middlewares/validate');
const { idParamSchema } = require('../../../shared/validators/common');
const { criarEscalaSchema, atualizarEscalaSchema } = require('../../../shared/validators/escalaValidator');

roteador.get('/', listarEscalas);
roteador.post('/', validate(criarEscalaSchema), criarEscala);
roteador.patch('/:id/desativar', validarIdNumerico, validate(idParamSchema, 'params'), desativarEscala);
roteador.patch('/:id/ativar', validarIdNumerico, validate(idParamSchema, 'params'), ativarEscala);
roteador.get('/:id', validarIdNumerico, validate(idParamSchema, 'params'), buscarEscalaPorId);
roteador.put('/:id', validarIdNumerico, validate(idParamSchema, 'params'), validate(atualizarEscalaSchema), atualizarEscala);

module.exports = roteador;
