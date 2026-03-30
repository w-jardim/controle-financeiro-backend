const presencaService = require('../services/presencaService');
const asyncHandler = require('../../../shared/utils/asyncHandler');

const listarPresencas = asyncHandler(async (req, res) => {
  const resultado = await presencaService.listar(req.query, req.user.accountId);
  return res.status(200).json(resultado);
});

const buscarPresencaPorId = asyncHandler(async (req, res) => {
  const resultado = await presencaService.buscarPorId(req.params.id, req.user.accountId);
  return res.status(200).json(resultado);
});

const criarPresenca = asyncHandler(async (req, res) => {
  const resultado = await presencaService.criar(req.body, req.user.accountId);
  return res.status(201).json(resultado);
});

const atualizarPresenca = asyncHandler(async (req, res) => {
  const resultado = await presencaService.atualizar(req.params.id, req.body, req.user.accountId);
  return res.status(200).json(resultado);
});

const atualizarStatusPresenca = asyncHandler(async (req, res) => {
  const resultado = await presencaService.atualizarStatus(req.params.id, req.body.status, req.user.accountId);
  return res.status(200).json(resultado);
});

module.exports = {
  listarPresencas,
  buscarPresencaPorId,
  criarPresenca,
  atualizarPresenca,
  atualizarStatusPresenca
};
