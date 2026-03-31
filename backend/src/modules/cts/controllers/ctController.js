const ctService = require('../services/ctService');
const asyncHandler = require('../../../shared/utils/asyncHandler');
const { sucesso } = require('../../../shared/utils/response');

const listarCts = asyncHandler(async (req, res) => {
  const { dados, ...meta } = await ctService.listar(req.query, req.user.accountId);
  return sucesso(res, dados, meta);
});

const buscarCtPorId = asyncHandler(async (req, res) => {
  const resultado = await ctService.buscarPorId(req.params.id, req.user.accountId);
  return sucesso(res, resultado);
});

const criarCt = asyncHandler(async (req, res) => {
  const resultado = await ctService.criar(req.body, req.user.accountId);
  return sucesso(res, resultado, null, 201);
});

const atualizarCt = asyncHandler(async (req, res) => {
  const resultado = await ctService.atualizar(req.params.id, req.body, req.user.accountId);
  return sucesso(res, resultado);
});

const desativarCt = asyncHandler(async (req, res) => {
  const resultado = await ctService.desativar(req.params.id, req.user.accountId);
  return sucesso(res, resultado);
});

const ativarCt = asyncHandler(async (req, res) => {
  const resultado = await ctService.ativar(req.params.id, req.user.accountId);
  return sucesso(res, resultado);
});

module.exports = {
  listarCts,
  buscarCtPorId,
  criarCt,
  atualizarCt,
  desativarCt,
  ativarCt
};