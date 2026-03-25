const alunoService = require('../services/alunoService');
const asyncHandler = require('../../../shared/utils/asyncHandler');

const listarAlunos = asyncHandler(async (req, res) => {
  const resultado = await alunoService.listar(req.query, req.user.accountId);
  return res.status(200).json(resultado);
});

const buscarAlunoPorId = asyncHandler(async (req, res) => {
  const resultado = await alunoService.buscarPorId(req.params.id, req.user.accountId);
  return res.status(200).json(resultado);
});

const criarAluno = asyncHandler(async (req, res) => {
  const resultado = await alunoService.criar(req.body, req.user.accountId);
  return res.status(201).json(resultado);
});

const atualizarAluno = asyncHandler(async (req, res) => {
  const resultado = await alunoService.atualizar(req.params.id, req.body, req.user.accountId);
  return res.status(200).json(resultado);
});

const desativarAluno = asyncHandler(async (req, res) => {
  const resultado = await alunoService.desativar(req.params.id, req.user.accountId);
  return res.status(200).json(resultado);
});

const ativarAluno = asyncHandler(async (req, res) => {
  const resultado = await alunoService.ativar(req.params.id, req.user.accountId);
  return res.status(200).json(resultado);
});

module.exports = {
  listarAlunos,
  buscarAlunoPorId,
  criarAluno,
  atualizarAluno,
  desativarAluno,
  ativarAluno
};
