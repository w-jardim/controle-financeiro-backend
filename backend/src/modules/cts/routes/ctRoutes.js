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

roteador.get('/', listarCts);
roteador.post('/', criarCt);
roteador.patch('/:id/desativar', desativarCt);
roteador.patch('/:id/ativar', ativarCt);
roteador.get('/:id', buscarCtPorId);
roteador.put('/:id', atualizarCt);

module.exports = roteador;