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
const validate = require('../../../shared/middlewares/validate');
const { idParamSchema } = require('../../../shared/validators/common');
const { criarProfissionalSchema, atualizarProfissionalSchema } = require('../../../shared/validators/profissionalValidator');

roteador.get('/', listarProfissionais);
roteador.post('/', validate(criarProfissionalSchema), criarProfissional);
roteador.patch('/:id/desativar', validarIdNumerico, validate(idParamSchema, 'params'), desativarProfissional);
roteador.patch('/:id/ativar', validarIdNumerico, validate(idParamSchema, 'params'), ativarProfissional);
roteador.get('/:id', validarIdNumerico, validate(idParamSchema, 'params'), buscarProfissionalPorId);
roteador.put('/:id', validarIdNumerico, validate(idParamSchema, 'params'), validate(atualizarProfissionalSchema), atualizarProfissional);

module.exports = roteador;
