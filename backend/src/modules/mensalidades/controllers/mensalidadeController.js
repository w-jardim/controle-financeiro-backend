const mensalidadeService = require('../services/mensalidadeService');
const asyncHandler = require('../../../shared/utils/asyncHandler');
const { sucesso } = require('../../../shared/utils/response');

const listarMensalidades = asyncHandler(async (req, res) => {
  const { dados, ...meta } = await mensalidadeService.listar(req.query, req.user.accountId);
  return sucesso(res, dados, meta);
});

const buscarMensalidadePorId = asyncHandler(async (req, res) => {
  const resultado = await mensalidadeService.buscarPorId(req.params.id, req.user.accountId);
  return sucesso(res, resultado);
});

const criarMensalidade = asyncHandler(async (req, res) => {
  const resultado = await mensalidadeService.criar(req.body, req.user.accountId);
  return sucesso(res, resultado, null, 201);
});

const atualizarMensalidade = asyncHandler(async (req, res) => {
  const resultado = await mensalidadeService.atualizar(req.params.id, req.body, req.user.accountId);
  return sucesso(res, resultado);
});

const pagarMensalidade = asyncHandler(async (req, res) => {
  const resultado = await mensalidadeService.pagar(req.params.id, req.body.data_pagamento, req.user.accountId);
  return sucesso(res, resultado);
});

const cancelarMensalidade = asyncHandler(async (req, res) => {
  const resultado = await mensalidadeService.cancelar(req.params.id, req.user.accountId);
  return sucesso(res, resultado);
});

module.exports = {
  listarMensalidades,
  buscarMensalidadePorId,
  criarMensalidade,
  atualizarMensalidade,
  pagarMensalidade,
  cancelarMensalidade
};
