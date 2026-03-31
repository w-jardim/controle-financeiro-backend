const profissionalService = require('../services/profissionalService');
const asyncHandler = require('../../../shared/utils/asyncHandler');
const { sucesso } = require('../../../shared/utils/response');

const listarProfissionais = asyncHandler(async (req, res) => {
  const { dados, ...meta } = await profissionalService.listar(req.query, req.user.accountId);
  return sucesso(res, dados, meta);
});

const buscarProfissionalPorId = asyncHandler(async (req, res) => {
  const resultado = await profissionalService.buscarPorId(req.params.id, req.user.accountId);
  return sucesso(res, resultado);
});

const criarProfissional = asyncHandler(async (req, res) => {
  const resultado = await profissionalService.criar(req.body, req.user.accountId);
  return sucesso(res, resultado, null, 201);
});

const atualizarProfissional = asyncHandler(async (req, res) => {
  const resultado = await profissionalService.atualizar(req.params.id, req.body, req.user.accountId);
  return sucesso(res, resultado);
});

const desativarProfissional = asyncHandler(async (req, res) => {
  const resultado = await profissionalService.desativar(req.params.id, req.user.accountId);
  return sucesso(res, resultado);
});

const ativarProfissional = asyncHandler(async (req, res) => {
  const resultado = await profissionalService.ativar(req.params.id, req.user.accountId);
  return sucesso(res, resultado);
});

module.exports = {
  listarProfissionais,
  buscarProfissionalPorId,
  criarProfissional,
  atualizarProfissional,
  desativarProfissional,
  ativarProfissional
};
