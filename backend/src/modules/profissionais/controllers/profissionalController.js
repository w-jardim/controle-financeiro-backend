const profissionalService = require('../services/profissionalService');
const asyncHandler = require('../../../shared/utils/asyncHandler');

const listarProfissionais = asyncHandler(async (req, res) => {
  const resultado = await profissionalService.listar(req.query, req.user.accountId);
  return res.status(200).json(resultado);
});

const buscarProfissionalPorId = asyncHandler(async (req, res) => {
  const resultado = await profissionalService.buscarPorId(
    req.params.id,
    req.user.accountId
  );
  return res.status(200).json(resultado);
});

const criarProfissional = asyncHandler(async (req, res) => {
  const resultado = await profissionalService.criar(req.body, req.user.accountId);
  return res.status(201).json(resultado);
});

const atualizarProfissional = asyncHandler(async (req, res) => {
  const resultado = await profissionalService.atualizar(
    req.params.id,
    req.body,
    req.user.accountId
  );
  return res.status(200).json(resultado);
});

const desativarProfissional = asyncHandler(async (req, res) => {
  const resultado = await profissionalService.desativar(
    req.params.id,
    req.user.accountId
  );
  return res.status(200).json(resultado);
});

const ativarProfissional = asyncHandler(async (req, res) => {
  const resultado = await profissionalService.ativar(
    req.params.id,
    req.user.accountId
  );
  return res.status(200).json(resultado);
});

module.exports = {
  listarProfissionais,
  buscarProfissionalPorId,
  criarProfissional,
  atualizarProfissional,
  desativarProfissional,
  ativarProfissional
};
