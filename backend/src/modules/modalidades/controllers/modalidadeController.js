const modalidadeService = require('../services/modalidadeService');
const asyncHandler = require('../../../shared/utils/asyncHandler');
const { sucesso } = require('../../../shared/utils/response');

const listarModalidades = asyncHandler(async (req, res) => {
  const { dados, ...meta } = await modalidadeService.listar(req.query, req.user.accountId);
  return sucesso(res, dados, meta);
});

const buscarModalidadePorId = asyncHandler(async (req, res) => {
  const resultado = await modalidadeService.buscarPorId(req.params.id, req.user.accountId);
  return sucesso(res, resultado);
});

const criarModalidade = asyncHandler(async (req, res) => {
  const resultado = await modalidadeService.criar(req.body, req.user.accountId);
  return sucesso(res, resultado, null, 201);
});

const atualizarModalidade = asyncHandler(async (req, res) => {
  const resultado = await modalidadeService.atualizar(req.params.id, req.body, req.user.accountId);
  return sucesso(res, resultado);
});

const desativarModalidade = asyncHandler(async (req, res) => {
  const resultado = await modalidadeService.desativar(req.params.id, req.user.accountId);
  return sucesso(res, resultado);
});

const ativarModalidade = asyncHandler(async (req, res) => {
  const resultado = await modalidadeService.ativar(req.params.id, req.user.accountId);
  return sucesso(res, resultado);
});

module.exports = {
  listarModalidades,
  buscarModalidadePorId,
  criarModalidade,
  atualizarModalidade,
  desativarModalidade,
  ativarModalidade
};
