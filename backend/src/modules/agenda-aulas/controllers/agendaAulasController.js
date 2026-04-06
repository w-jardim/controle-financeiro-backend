const agendaService = require('../services/agendaAulasService');
const asyncHandler = require('../../../shared/utils/asyncHandler');
const { sucesso } = require('../../../shared/utils/response');

const listarAgenda = asyncHandler(async (req, res) => {
  const { dados, ...meta } = await agendaService.listar(req.query, req.user.accountId);
  return sucesso(res, dados, meta);
});

const buscarAgendaPorId = asyncHandler(async (req, res) => {
  const resultado = await agendaService.buscarPorId(req.params.id, req.user.accountId);
  return sucesso(res, resultado);
});

const criarAula = asyncHandler(async (req, res) => {
  const resultado = await agendaService.criar(req.body, req.user.accountId);
  return sucesso(res, resultado, null, 201);
});

const atualizarAula = asyncHandler(async (req, res) => {
  const resultado = await agendaService.atualizar(req.params.id, req.body, req.user.accountId);
  return sucesso(res, resultado);
});

const liberarAula = asyncHandler(async (req, res) => {
  const resultado = await agendaService.liberar(req.params.id, req.user.accountId);
  return sucesso(res, resultado);
});

const cancelarAula = asyncHandler(async (req, res) => {
  const resultado = await agendaService.cancelar(req.params.id, req.user.accountId);
  return sucesso(res, resultado);
});

const encerrarAula = asyncHandler(async (req, res) => {
  const resultado = await agendaService.encerrar(req.params.id, req.user.accountId);
  return sucesso(res, resultado);
});

const gerarPorEscala = asyncHandler(async (req, res) => {
  const resultado = await agendaService.gerarPorEscala(req.body, req.user.accountId);
  return sucesso(res, resultado, null, 201);
});

module.exports = {
  listarAgenda,
  buscarAgendaPorId,
  criarAula,
  atualizarAula,
  liberarAula,
  cancelarAula,
  encerrarAula,
  gerarPorEscala
};
