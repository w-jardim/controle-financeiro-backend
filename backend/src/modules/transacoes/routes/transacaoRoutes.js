const express = require('express');
const roteador = express.Router();

const validarTransacao = require('../middlewares/validarTransacao');
const validarIdNumerico = require('../../../shared/middlewares/validarIdNumerico');
const validate = require('../../../shared/middlewares/validate');
const { idParamSchema } = require('../../../shared/validators/common');
const { criarTransacaoSchema, atualizarTransacaoSchema } = require('../../../shared/validators/transacaoValidator');
const {
  listarTransacoes,
  buscarTransacaoPorId,
  criarTransacao,
  atualizarTransacao,
  deletarTransacao,
  resumoTransacoes,
  resumoMensalTransacoes
} = require('../controllers/transacaoController');

// ============================================
// ROTAS DE RESUMO (ESPECÍFICAS)
// ============================================

roteador.get('/resumo/mensal', resumoMensalTransacoes);
roteador.get('/resumo', resumoTransacoes);

// ============================================
// CRUD
// ============================================

roteador.get('/', listarTransacoes);
roteador.post('/', validate(criarTransacaoSchema), validarTransacao, criarTransacao);

roteador.get('/:id', validate(idParamSchema, 'params'), buscarTransacaoPorId);
roteador.put('/:id', validate(idParamSchema, 'params'), validate(atualizarTransacaoSchema), validarTransacao, atualizarTransacao);
roteador.delete('/:id', validate(idParamSchema, 'params'), deletarTransacao);

module.exports = roteador;