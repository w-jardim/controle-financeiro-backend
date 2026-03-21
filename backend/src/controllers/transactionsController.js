const transacaoService = require('../services/transacaoService');

async function listarTransacoes(req, res, next) {
  try {
    const resultado = await transacaoService.listar(req.query);

    return res.status(200).json(resultado);
  } catch (erro) {
    next(erro);
  }
}

async function buscarTransacaoPorId(req, res, next) {
  try {
    const resultado = await transacaoService.buscarPorId(req.params.id);

    return res.status(200).json(resultado);
  } catch (erro) {
    next(erro);
  }
}

async function criarTransacao(req, res, next) {
  try {
    const resultado = await transacaoService.criar(req.body);

    return res.status(201).json(resultado);
  } catch (erro) {
    next(erro);
  }
}

async function atualizarTransacao(req, res, next) {
  try {
    const resultado = await transacaoService.atualizar(req.params.id, req.body);

    return res.status(200).json(resultado);
  } catch (erro) {
    next(erro);
  }
}

async function deletarTransacao(req, res, next) {
  try {
    const resultado = await transacaoService.deletar(req.params.id);

    return res.status(200).json(resultado);
  } catch (erro) {
    next(erro);
  }
}

async function resumoTransacoes(req, res, next) {
  try {
    const resultado = await transacaoService.resumo(req.query);

    return res.status(200).json(resultado);
  } catch (erro) {
    next(erro);
  }
}

async function resumoMensalTransacoes(req, res, next) {
  try {
    const resultado = await transacaoService.resumoMensal(req.query);

    return res.status(200).json(resultado);
  } catch (erro) {
    next(erro);
  }
}

module.exports = {
  listarTransacoes,
  buscarTransacaoPorId,
  criarTransacao,
  atualizarTransacao,
  deletarTransacao,
  resumoTransacoes,
  resumoMensalTransacoes
};