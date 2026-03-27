const horarioService = require('../services/horarioAulaService');
const asyncHandler = require('../../../shared/utils/asyncHandler');

const listarHorarios = asyncHandler(async (req, res) => {
  const resultado = await horarioService.listar(req.query, req.user.accountId);
  return res.status(200).json(resultado);
});

const buscarHorarioPorId = asyncHandler(async (req, res) => {
  const resultado = await horarioService.buscarPorId(req.params.id, req.user.accountId);
  return res.status(200).json(resultado);
});

const criarHorario = asyncHandler(async (req, res) => {
  const resultado = await horarioService.criar(req.body, req.user.accountId);
  return res.status(201).json(resultado);
});

const atualizarHorario = asyncHandler(async (req, res) => {
  const resultado = await horarioService.atualizar(req.params.id, req.body, req.user.accountId);
  return res.status(200).json(resultado);
});

const desativarHorario = asyncHandler(async (req, res) => {
  const resultado = await horarioService.desativar(req.params.id, req.user.accountId);
  return res.status(200).json(resultado);
});

const ativarHorario = asyncHandler(async (req, res) => {
  const resultado = await horarioService.ativar(req.params.id, req.user.accountId);
  return res.status(200).json(resultado);
});

module.exports = {
  listarHorarios,
  buscarHorarioPorId,
  criarHorario,
  atualizarHorario,
  desativarHorario,
  ativarHorario
};
