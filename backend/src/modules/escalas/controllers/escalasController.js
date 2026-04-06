const escalaService = require('../services/escalasService');
const asyncHandler = require('../../../shared/utils/asyncHandler');
const { sucesso } = require('../../../shared/utils/response');

const listarEscalas = asyncHandler(async (req, res) => {
  const { dados, ...meta } = await escalaService.listar(req.query, req.user.accountId);
  return sucesso(res, dados, meta);
});

const buscarEscalaPorId = asyncHandler(async (req, res) => {
  const resultado = await escalaService.buscarPorId(req.params.id, req.user.accountId);
  return sucesso(res, resultado);
});

const criarEscala = asyncHandler(async (req, res) => {
  const resultado = await escalaService.criar(req.body, req.user.accountId);
  return sucesso(res, resultado, null, 201);
});

const atualizarEscala = asyncHandler(async (req, res) => {
  const resultado = await escalaService.atualizar(req.params.id, req.body, req.user.accountId);
  return sucesso(res, resultado);
});

const desativarEscala = asyncHandler(async (req, res) => {
  const resultado = await escalaService.desativar(req.params.id, req.user.accountId);
  return sucesso(res, resultado);
});

const ativarEscala = asyncHandler(async (req, res) => {
  const resultado = await escalaService.ativar(req.params.id, req.user.accountId);
  return sucesso(res, resultado);
});

module.exports = {
  listarEscalas,
  buscarEscalaPorId,
  criarEscala,
  atualizarEscala,
  desativarEscala,
  ativarEscala
};
