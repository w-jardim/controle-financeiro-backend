const presencaService = require('../services/presencaService');
const asyncHandler = require('../../../shared/utils/asyncHandler');
const { sucesso } = require('../../../shared/utils/response');

const listarPresencas = asyncHandler(async (req, res) => {
  const { dados, ...meta } = await presencaService.listar(req.query, req.user.accountId);
  return sucesso(res, dados, meta);
});

const buscarPresencaPorId = asyncHandler(async (req, res) => {
  const resultado = await presencaService.buscarPorId(req.params.id, req.user.accountId);
  return sucesso(res, resultado);
});

const criarPresenca = asyncHandler(async (req, res) => {
  const resultado = await presencaService.criar(req.body, req.user.accountId);
  return sucesso(res, resultado, null, 201);
});

const atualizarPresenca = asyncHandler(async (req, res) => {
  const resultado = await presencaService.atualizar(req.params.id, req.body, req.user.accountId);
  return sucesso(res, resultado);
});

const atualizarStatusPresenca = asyncHandler(async (req, res) => {
  const resultado = await presencaService.atualizarStatus(req.params.id, req.body.status, req.user.accountId);
  return sucesso(res, resultado);
});

module.exports = {
  listarPresencas,
  buscarPresencaPorId,
  criarPresenca,
  atualizarPresenca,
  atualizarStatusPresenca
};
