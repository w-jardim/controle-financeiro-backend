function validarTransacao(req, res, next) {
  const { tipo, descricao, valor } = req.body;

  if (tipo === undefined || descricao === undefined || valor === undefined) {
    return res.status(400).json({
      erro: 'Campos obrigatórios: tipo, descricao, valor'
    });
  }

  if (!['receita', 'despesa'].includes(tipo)) {
    return res.status(400).json({
      erro: 'Tipo deve ser receita ou despesa'
    });
  }

  if (typeof descricao !== 'string' || descricao.trim() === '') {
    return res.status(400).json({
      erro: 'Descrição inválida'
    });
  }

  if (isNaN(valor) || Number(valor) <= 0) {
    return res.status(400).json({
      erro: 'Valor deve ser um número maior que zero'
    });
  }

  req.body.descricao = descricao.trim();
  req.body.valor = Number(valor);

  next();
}

module.exports = validarTransacao;