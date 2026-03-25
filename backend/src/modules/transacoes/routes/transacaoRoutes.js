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
roteador.get('/:id', buscarTransacaoPorId);
roteador.put('/:id', validarTransacao, atualizarTransacao);
roteador.delete('/:id', deletarTransacao);

module.exports = roteador;