const express = require('express');
const roteador = express.Router();

const validarTransacao = require('../middlewares/validarTransacao');
const {
  listarTransacoes,
  buscarTransacaoPorId,
  criarTransacao,
  atualizarTransacao,
  deletarTransacao,
  resumoTransacoes,
  resumoMensalTransacoes
} = require('../controllers/transacaoController');

// Rotas de resumo (devem vir antes das rotas parametrizadas)
roteador.get('/resumo/mensal', resumoMensalTransacoes);
roteador.get('/resumo', resumoTransacoes);

// Rotas de CRUD
roteador.get('/', listarTransacoes);
roteador.get('/:id', buscarTransacaoPorId);
roteador.post('/', validarTransacao, criarTransacao);
roteador.put('/:id', validarTransacao, atualizarTransacao);
roteador.delete('/:id', deletarTransacao);

module.exports = roteador;
