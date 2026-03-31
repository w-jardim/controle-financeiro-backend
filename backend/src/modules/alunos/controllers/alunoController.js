const alunoService = require('../services/alunoService');
const asyncHandler = require('../../../shared/utils/asyncHandler');
const { sucesso } = require('../../../shared/utils/response');

const listarAlunos = asyncHandler(async (req, res) => {
  const resultado = await alunoService.listar(req.query, req.user.accountId);
  return sucesso(res, resultado);
});

const buscarAlunoPorId = asyncHandler(async (req, res) => {
  const resultado = await alunoService.buscarPorId(req.params.id, req.user.accountId);
  return sucesso(res, resultado);
});

const criarAluno = asyncHandler(async (req, res) => {
  const resultado = await alunoService.criar(req.body, req.user.accountId);
  return sucesso(res, resultado, null, 201);
});

const atualizarAluno = asyncHandler(async (req, res) => {
  const resultado = await alunoService.atualizar(req.params.id, req.body, req.user.accountId);
  return sucesso(res, resultado);
});

const desativarAluno = asyncHandler(async (req, res) => {
  const resultado = await alunoService.desativar(req.params.id, req.user.accountId);
  return sucesso(res, resultado);
});

const ativarAluno = asyncHandler(async (req, res) => {
  const resultado = await alunoService.ativar(req.params.id, req.user.accountId);
  return sucesso(res, resultado);
});

module.exports = {
  listarAlunos,
  buscarAlunoPorId,
  criarAluno,
  atualizarAluno,
  desativarAluno,
  ativarAluno
};
