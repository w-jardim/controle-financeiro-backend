const mensalidadeService = require('../services/mensalidadeService');
const asyncHandler = require('../../../shared/utils/asyncHandler');

const listarMensalidades = asyncHandler(async (req, res) => {
  const resultado = await mensalidadeService.listar(req.query, req.user.accountId);
  return res.status(200).json(resultado);
});

const buscarMensalidadePorId = asyncHandler(async (req, res) => {
  const resultado = await mensalidadeService.buscarPorId(req.params.id, req.user.accountId);
  return res.status(200).json(resultado);
});

const criarMensalidade = asyncHandler(async (req, res) => {
  const resultado = await mensalidadeService.criar(req.body, req.user.accountId);
  return res.status(201).json(resultado);
});

const atualizarMensalidade = asyncHandler(async (req, res) => {
  const resultado = await mensalidadeService.atualizar(req.params.id, req.body, req.user.accountId);
  return res.status(200).json(resultado);
});

const pagarMensalidade = asyncHandler(async (req, res) => {
  const resultado = await mensalidadeService.pagar(req.params.id, req.body.data_pagamento, req.user.accountId);
  return res.status(200).json(resultado);
});

const cancelarMensalidade = asyncHandler(async (req, res) => {
  const resultado = await mensalidadeService.cancelar(req.params.id, req.user.accountId);
  return res.status(200).json(resultado);
});

module.exports = {
  listarMensalidades,
  buscarMensalidadePorId,
  criarMensalidade,
  atualizarMensalidade,
  pagarMensalidade,
  cancelarMensalidade
};
