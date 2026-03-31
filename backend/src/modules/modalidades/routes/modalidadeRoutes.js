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
const validate = require('../../../shared/middlewares/validate');
const { idParamSchema } = require('../../../shared/validators/common');
const { criarModalidadeSchema, atualizarModalidadeSchema } = require('../../../shared/validators/modalidadeValidator');

roteador.get('/', listarModalidades);
roteador.post('/', validate(criarModalidadeSchema), criarModalidade);
roteador.patch('/:id/desativar', validarIdNumerico, validate(idParamSchema, 'params'), desativarModalidade);
roteador.patch('/:id/ativar', validarIdNumerico, validate(idParamSchema, 'params'), ativarModalidade);
roteador.get('/:id', validarIdNumerico, validate(idParamSchema, 'params'), buscarModalidadePorId);
roteador.put('/:id', validarIdNumerico, validate(idParamSchema, 'params'), validate(atualizarModalidadeSchema), atualizarModalidade);

module.exports = roteador;
