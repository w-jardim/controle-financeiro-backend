const ctService = require('../services/ctService');
const asyncHandler = require('../../../shared/utils/asyncHandler');

const listarCts = asyncHandler(async (req, res) => {
  const resultado = await ctService.listar(req.query, req.user.accountId);
  return res.status(200).json(resultado);
});

const buscarCtPorId = asyncHandler(async (req, res) => {
  const resultado = await ctService.buscarPorId(
    req.params.id,
    req.user.accountId
  );
  return res.status(200).json(resultado);
});

const criarCt = asyncHandler(async (req, res) => {
  const resultado = await ctService.criar(req.body, req.user.accountId);
  return res.status(201).json(resultado);
});

const atualizarCt = asyncHandler(async (req, res) => {
  const resultado = await ctService.atualizar(
    req.params.id,
    req.body,
    req.user.accountId
  );
  return res.status(200).json(resultado);
});

const desativarCt = asyncHandler(async (req, res) => {
  const resultado = await ctService.desativar(
    req.params.id,
    req.user.accountId
  );
  return res.status(200).json(resultado);
});

const ativarCt = asyncHandler(async (req, res) => {
  const resultado = await ctService.ativar(
    req.params.id,
    req.user.accountId
  );
  return res.status(200).json(resultado);
});

module.exports = {
  listarCts,
  buscarCtPorId,
  criarCt,
  atualizarCt,
  desativarCt,
  ativarCt
};