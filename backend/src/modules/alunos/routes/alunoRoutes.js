const express = require('express');
const roteador = express.Router();
const authMiddleware = require('../../../shared/middlewares/authMiddleware');

// Protege todas as rotas de alunos
roteador.use(authMiddleware);

const {
  listarAlunos,
  buscarAlunoPorId,
  criarAluno,
  atualizarAluno,
  desativarAluno,
  ativarAluno
} = require('../controllers/alunoController');

roteador.get('/', listarAlunos);
roteador.post('/', criarAluno);

// Rotas específicas (nenhuma adicional por enquanto)

// Rotas dinâmicas
roteador.get('/:id', buscarAlunoPorId);
roteador.put('/:id', atualizarAluno);
roteador.delete('/:id', desativarAluno);
roteador.patch('/:id/ativar', ativarAluno);

module.exports = roteador;
