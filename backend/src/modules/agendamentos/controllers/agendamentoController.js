const agendamentoService = require('../services/agendamentoService');
const asyncHandler = require('../../../shared/utils/asyncHandler');

const listarAgendamentos = asyncHandler(async (req, res) => {
  const resultado = await agendamentoService.listar(req.query, req.user.accountId);
  return res.status(200).json(resultado);
});

const buscarAgendamentoPorId = asyncHandler(async (req, res) => {
  const resultado = await agendamentoService.buscarPorId(req.params.id, req.user.accountId);
  return res.status(200).json(resultado);
});

const criarAgendamento = asyncHandler(async (req, res) => {
  const resultado = await agendamentoService.criar(req.body, req.user.accountId);
  return res.status(201).json(resultado);
});

const atualizarAgendamento = asyncHandler(async (req, res) => {
  const resultado = await agendamentoService.atualizar(req.params.id, req.body, req.user.accountId);
  return res.status(200).json(resultado);
});

const cancelarAgendamento = asyncHandler(async (req, res) => {
  const resultado = await agendamentoService.cancelar(req.params.id, req.user.accountId);
  return res.status(200).json(resultado);
});

const atualizarStatusAgendamento = asyncHandler(async (req, res) => {
  const resultado = await agendamentoService.atualizarStatus(req.params.id, req.body.status, req.user.accountId);
  return res.status(200).json(resultado);
});

module.exports = {
  listarAgendamentos,
  buscarAgendamentoPorId,
  criarAgendamento,
  atualizarAgendamento,
  cancelarAgendamento,
  atualizarStatusAgendamento
};
