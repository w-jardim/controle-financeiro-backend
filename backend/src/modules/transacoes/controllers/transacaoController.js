const transacaoService = require('../services/transacaoService');
const asyncHandler = require('../../../shared/utils/asyncHandler');

const listarTransacoes = asyncHandler(async (req, res) => {
  const resultado = await transacaoService.listar(req.query);
  return res.status(200).json(resultado);
});

const buscarTransacaoPorId = asyncHandler(async (req, res) => {
  const resultado = await transacaoService.buscarPorId(req.params.id);
  return res.status(200).json(resultado);
});

const criarTransacao = asyncHandler(async (req, res) => {
  const resultado = await transacaoService.criar(req.body);
  return res.status(201).json(resultado);
});

const atualizarTransacao = asyncHandler(async (req, res) => {
  const resultado = await transacaoService.atualizar(req.params.id, req.body);
  return res.status(200).json(resultado);
});

const deletarTransacao = asyncHandler(async (req, res) => {
  const resultado = await transacaoService.deletar(req.params.id);
  return res.status(200).json(resultado);
});

const resumoTransacoes = asyncHandler(async (req, res) => {
  const resultado = await transacaoService.resumo(req.query);
  return res.status(200).json(resultado);
});

const resumoMensalTransacoes = asyncHandler(async (req, res) => {
  const resultado = await transacaoService.resumoMensal(req.query);
  return res.status(200).json(resultado);
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
