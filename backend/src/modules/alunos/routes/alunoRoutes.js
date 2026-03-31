const express = require('express');
const roteador = express.Router();
const authMiddleware = require('../../../shared/middlewares/authMiddleware');
const validate = require('../../../shared/middlewares/validate');
const { idParamSchema } = require('../../../shared/validators/common');
const { criarAlunoSchema, atualizarAlunoSchema } = require('../../../shared/validators/alunoValidator');

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
roteador.post('/', validate(criarAlunoSchema), criarAluno);

roteador.get('/:id', validate(idParamSchema, 'params'), buscarAlunoPorId);
roteador.put('/:id', validate(idParamSchema, 'params'), validate(atualizarAlunoSchema), atualizarAluno);
roteador.delete('/:id', validate(idParamSchema, 'params'), desativarAluno);
roteador.patch('/:id/ativar', validate(idParamSchema, 'params'), ativarAluno);

module.exports = roteador;
