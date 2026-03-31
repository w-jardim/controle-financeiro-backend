const horarioService = require('../services/horarioAulaService');
const asyncHandler = require('../../../shared/utils/asyncHandler');
const { sucesso } = require('../../../shared/utils/response');

const listarHorarios = asyncHandler(async (req, res) => {
  const { dados, ...meta } = await horarioService.listar(req.query, req.user.accountId);
  return sucesso(res, dados, meta);
});

const buscarHorarioPorId = asyncHandler(async (req, res) => {
  const resultado = await horarioService.buscarPorId(req.params.id, req.user.accountId);
  return sucesso(res, resultado);
});

const criarHorario = asyncHandler(async (req, res) => {
  const resultado = await horarioService.criar(req.body, req.user.accountId);
  return sucesso(res, resultado, null, 201);
});

const atualizarHorario = asyncHandler(async (req, res) => {
  const resultado = await horarioService.atualizar(req.params.id, req.body, req.user.accountId);
  return sucesso(res, resultado);
});

const desativarHorario = asyncHandler(async (req, res) => {
  const resultado = await horarioService.desativar(req.params.id, req.user.accountId);
  return sucesso(res, resultado);
});

const ativarHorario = asyncHandler(async (req, res) => {
  const resultado = await horarioService.ativar(req.params.id, req.user.accountId);
  return sucesso(res, resultado);
});

module.exports = {
  listarHorarios,
  buscarHorarioPorId,
  criarHorario,
  atualizarHorario,
  desativarHorario,
  ativarHorario
};
