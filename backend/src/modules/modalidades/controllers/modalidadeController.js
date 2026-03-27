const modalidadeService = require('../services/modalidadeService');
const asyncHandler = require('../../../shared/utils/asyncHandler');

const listarModalidades = asyncHandler(async (req, res) => {
  const resultado = await modalidadeService.listar(req.query, req.user.accountId);
  return res.status(200).json(resultado);
});

const buscarModalidadePorId = asyncHandler(async (req, res) => {
  const resultado = await modalidadeService.buscarPorId(req.params.id, req.user.accountId);
  return res.status(200).json(resultado);
});

const criarModalidade = asyncHandler(async (req, res) => {
  const resultado = await modalidadeService.criar(req.body, req.user.accountId);
  return res.status(201).json(resultado);
});

const atualizarModalidade = asyncHandler(async (req, res) => {
  const resultado = await modalidadeService.atualizar(req.params.id, req.body, req.user.accountId);
  return res.status(200).json(resultado);
});

const desativarModalidade = asyncHandler(async (req, res) => {
  const resultado = await modalidadeService.desativar(req.params.id, req.user.accountId);
  return res.status(200).json(resultado);
});

const ativarModalidade = asyncHandler(async (req, res) => {
  const resultado = await modalidadeService.ativar(req.params.id, req.user.accountId);
  return res.status(200).json(resultado);
});

module.exports = {
  listarModalidades,
  buscarModalidadePorId,
  criarModalidade,
  atualizarModalidade,
  desativarModalidade,
  ativarModalidade
};
