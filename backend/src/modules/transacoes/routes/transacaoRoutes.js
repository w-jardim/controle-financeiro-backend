const express = require('express');
const roteador = express.Router();

const validarTransacao = require('../middlewares/validarTransacao');
const validarIdNumerico = require('../../../shared/middlewares/validarIdNumerico');
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
roteador.post('/', validarTransacao, criarTransacao);

// ⚠️ ID NUMÉRICO (proteção contra colisão de rota)
roteador.get('/:id', validarIdNumerico, buscarTransacaoPorId);
roteador.put('/:id', validarIdNumerico, validarTransacao, atualizarTransacao);
roteador.delete('/:id', validarIdNumerico, deletarTransacao);

module.exports = roteador;