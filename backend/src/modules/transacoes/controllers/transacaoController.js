const transacaoService = require('../services/transacaoService');
const asyncHandler = require('../../../shared/utils/asyncHandler');
const { sucesso } = require('../../../shared/utils/response');

const listarTransacoes = asyncHandler(async (req, res) => {
  const { dados, ...meta } = await transacaoService.listar(req.query, req.user.accountId);
  return sucesso(res, dados, meta);
});

const buscarTransacaoPorId = asyncHandler(async (req, res) => {
  const resultado = await transacaoService.buscarPorId(req.params.id, req.user.accountId);
  return sucesso(res, resultado);
});

const criarTransacao = asyncHandler(async (req, res) => {
  const resultado = await transacaoService.criar(req.body, req.user.accountId);
  return sucesso(res, resultado, null, 201);
});

const atualizarTransacao = asyncHandler(async (req, res) => {
  const resultado = await transacaoService.atualizar(req.params.id, req.body, req.user.accountId);
  return sucesso(res, resultado);
});

const deletarTransacao = asyncHandler(async (req, res) => {
  const resultado = await transacaoService.deletar(req.params.id, req.user.accountId);
  return sucesso(res, resultado);
});

const resumoTransacoes = asyncHandler(async (req, res) => {
  const resultado = await transacaoService.resumo(req.query, req.user.accountId);
  return sucesso(res, resultado);
});

const resumoMensalTransacoes = asyncHandler(async (req, res) => {
  const resultado = await transacaoService.resumoMensal(req.query, req.user.accountId);
  return sucesso(res, resultado);
});

module.exports = {
  listarTransacoes,
  buscarTransacaoPorId,
  criarTransacao,
  atualizarTransacao,
  deletarTransacao,
  resumoTransacoes,
  resumoMensalTransacoes
};