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

  if (typeof descricao !== 'string') {
    return res.status(400).json({
      erro: 'Descrição deve ser um texto'
    });
  }

  const descricaoTrim = descricao.trim().replace(/\s+/g, ' ');

  if (descricaoTrim.length === 0) {
    return res.status(400).json({
      erro: 'Descrição não pode ser vazia'
    });
  }

  if (descricaoTrim.length > 255) {
    return res.status(400).json({
      erro: 'Descrição muito longa (máximo 255 caracteres)'
    });
  }

  const valorNumero = Number(valor);

  if (!Number.isFinite(valorNumero) || valorNumero <= 0) {
    return res.status(400).json({
      erro: 'Valor deve ser um número válido maior que zero'
    });
  }

  if (valorNumero > 999999999.99) {
    return res.status(400).json({
      erro: 'Valor muito alto'
    });
  }

  req.body.tipo = tipo;
  req.body.descricao = descricaoTrim;
  req.body.valor = valorNumero;

  next();
}

module.exports = validarTransacao;
