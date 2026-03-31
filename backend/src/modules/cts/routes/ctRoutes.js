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
const validate = require('../../../shared/middlewares/validate');
const { idParamSchema } = require('../../../shared/validators/common');
const { criarCtSchema, atualizarCtSchema } = require('../../../shared/validators/ctValidator');

roteador.get('/', listarCts);
roteador.post('/', validate(criarCtSchema), criarCt);
roteador.patch('/:id/desativar', validarIdNumerico, validate(idParamSchema, 'params'), desativarCt);
roteador.patch('/:id/ativar', validarIdNumerico, validate(idParamSchema, 'params'), ativarCt);
roteador.get('/:id', validarIdNumerico, validate(idParamSchema, 'params'), buscarCtPorId);
roteador.put('/:id', validarIdNumerico, validate(idParamSchema, 'params'), validate(atualizarCtSchema), atualizarCt);

module.exports = roteador;