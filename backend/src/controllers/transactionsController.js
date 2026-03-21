const conexao = require('../database');

async function listarTransacoes(req, res, next) {
  try {
    const {
      tipo,
      descricao,
      pagina = 1,
      limite = 10,
      ordenar = 'id',
      direcao = 'asc'
    } = req.query;

    const numeroPagina = Number(pagina);
    const numeroLimite = Number(limite);
    const deslocamento = (numeroPagina - 1) * numeroLimite;

    if (isNaN(numeroPagina) || numeroPagina <= 0) {
      return res.status(400).json({
        erro: 'Parâmetro pagina deve ser um número maior que zero'
      });
    }

    if (isNaN(numeroLimite) || numeroLimite <= 0) {
      return res.status(400).json({
        erro: 'Parâmetro limite deve ser um número maior que zero'
      });
    }

    const camposPermitidos = ['id', 'tipo', 'descricao', 'valor', 'criado_em'];
    if (!camposPermitidos.includes(ordenar)) {
      return res.status(400).json({
        erro: 'Parâmetro ordenar inválido'
      });
    }

    const direcaoFormatada = direcao.toLowerCase();
    if (!['asc', 'desc'].includes(direcaoFormatada)) {
      return res.status(400).json({
        erro: 'Parâmetro direcao deve ser asc ou desc'
      });
    }

    let consulta = 'SELECT * FROM transacoes';
    let consultaContagem = 'SELECT COUNT(*) AS total FROM transacoes';
    const filtros = [];
    const parametros = [];
    const parametrosContagem = [];

    if (tipo) {
      if (!['receita', 'despesa'].includes(tipo)) {
        return res.status(400).json({
          erro: 'Filtro tipo deve ser receita ou despesa'
        });
      }

      filtros.push('tipo = ?');
      parametros.push(tipo);
      parametrosContagem.push(tipo);
    }

    if (descricao) {
      filtros.push('descricao LIKE ?');
      parametros.push(`%${descricao}%`);
      parametrosContagem.push(`%${descricao}%`);
    }

    if (filtros.length > 0) {
      const clausulaWhere = ` WHERE ${filtros.join(' AND ')}`;
      consulta += clausulaWhere;
      consultaContagem += clausulaWhere;
    }

    consulta += ` ORDER BY ${ordenar} ${direcaoFormatada} LIMIT ? OFFSET ?`;
    parametros.push(numeroLimite, deslocamento);

    const [linhas] = await conexao.query(consulta, parametros);
    const [resultadoContagem] = await conexao.query(consultaContagem, parametrosContagem);

    const total = resultadoContagem[0].total;
    const totalPaginas = Math.ceil(total / numeroLimite);

    res.status(200).json({
      pagina: numeroPagina,
      limite: numeroLimite,
      total,
      totalPaginas,
      filtros: {
        tipo: tipo || null,
        descricao: descricao || null
      },
      ordenacao: {
        campo: ordenar,
        direcao: direcaoFormatada
      },
      dados: linhas
    });
  } catch (erro) {
    next(erro);
  }
}
async function buscarTransacaoPorId(req, res, next) {
  try {
    const { id } = req.params;

    if (isNaN(id) || Number(id) <= 0) {
      return res.status(400).json({
        erro: 'ID deve ser um número válido e maior que zero'
      });
    }

    const [linhas] = await conexao.query(
      'SELECT * FROM transacoes WHERE id = ?',
      [id]
    );

    if (linhas.length === 0) {
      return res.status(404).json({
        erro: 'Transação não encontrada'
      });
    }

    res.status(200).json(linhas[0]);
  } catch (erro) {
    next(erro);
  }
}

async function criarTransacao(req, res, next) {
  try {
    const { tipo, descricao, valor } = req.body;

    const [resultado] = await conexao.query(
      'INSERT INTO transacoes (tipo, descricao, valor) VALUES (?, ?, ?)',
      [tipo, descricao, valor]
    );

    res.status(201).json({
      mensagem: 'Transação criada com sucesso',
      id: resultado.insertId
    });
  } catch (erro) {
    next(erro);
  }
}

async function atualizarTransacao(req, res, next) {
  try {
    const { id } = req.params;
    const { tipo, descricao, valor } = req.body;

    if (isNaN(id) || Number(id) <= 0) {
      return res.status(400).json({
        erro: 'ID deve ser um número válido e maior que zero'
      });
    }

    const [resultado] = await conexao.query(
      'UPDATE transacoes SET tipo = ?, descricao = ?, valor = ? WHERE id = ?',
      [tipo, descricao, valor, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        erro: 'Transação não encontrada'
      });
    }

    res.status(200).json({
      mensagem: 'Transação atualizada com sucesso'
    });
  } catch (erro) {
    next(erro);
  }
}

async function deletarTransacao(req, res, next) {
  try {
    const { id } = req.params;

    if (isNaN(id) || Number(id) <= 0) {
      return res.status(400).json({
        erro: 'ID deve ser um número válido e maior que zero'
      });
    }

    const [resultado] = await conexao.query(
      'DELETE FROM transacoes WHERE id = ?',
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        erro: 'Transação não encontrada'
      });
    }

    res.status(200).json({
      mensagem: 'Transação deletada com sucesso'
    });
  } catch (erro) {
    next(erro);
  }
}
async function resumoTransacoes(req, res, next) {
  try {
    const { mes, ano } = req.query;

    if ((mes && !ano) || (!mes && ano)) {
      return res.status(400).json({
        erro: 'Informe mes e ano juntos'
      });
    }

    let clausulaWhere = '';
    const parametros = [];
    let mesNumero = null;
    let anoNumero = null;

    if (mes && ano) {
      mesNumero = Number(mes);
      anoNumero = Number(ano);

      if (!Number.isInteger(mesNumero) || mesNumero < 1 || mesNumero > 12) {
        return res.status(400).json({
          erro: 'Parâmetro mes deve ser um número inteiro entre 1 e 12'
        });
      }

    const anoAtual = new Date().getFullYear();

if (
  !Number.isInteger(anoNumero) ||
  anoNumero < 2000 ||
  anoNumero > anoAtual + 1
) {
  return res.status(400).json({
    erro: `Parâmetro ano deve estar entre 2000 e ${anoAtual + 1}`
  });
}

      clausulaWhere = 'WHERE MONTH(criado_em) = ? AND YEAR(criado_em) = ?';
      parametros.push(mesNumero, anoNumero);
    }

    const [linhasContagem] = await conexao.query(
      `SELECT COUNT(*) AS totalRegistros FROM transacoes ${clausulaWhere}`,
      parametros
    );

    const totalRegistros = Number(linhasContagem[0].totalRegistros);

    if (totalRegistros === 0) {
      return res.status(200).json({
        filtro: {
          mes: mesNumero,
          ano: anoNumero
        },
        mensagem: 'Nenhum lançamento encontrado para o período informado',
        totalRegistros: 0,
        totalReceitas: 0,
        totalDespesas: 0,
        saldo: 0
      });
    }

    const [linhas] = await conexao.query(
      `
      SELECT
        COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END), 0) AS totalReceitas,
        COALESCE(SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END), 0) AS totalDespesas
      FROM transacoes
      ${clausulaWhere}
      `,
      parametros
    );

    const totalReceitas = Number(linhas[0].totalReceitas);
    const totalDespesas = Number(linhas[0].totalDespesas);
    const saldo = totalReceitas - totalDespesas;

    res.status(200).json({
      filtro: {
        mes: mesNumero,
        ano: anoNumero
      },
      totalRegistros,
      totalReceitas,
      totalDespesas,
      saldo
    });
  } catch (erro) {
    next(erro);
  }
}
async function resumoMensalTransacoes(req, res, next) {
  try {
    const { ano } = req.query;

    if (ano === undefined) {
      return res.status(400).json({
        erro: 'Parâmetro ano é obrigatório'
      });
    }

    const anoNumero = Number(ano);
    const anoAtual = new Date().getFullYear();

    if (
      !Number.isInteger(anoNumero) ||
      anoNumero < 2000 ||
      anoNumero > anoAtual + 1
    ) {
      return res.status(400).json({
        erro: `Parâmetro ano deve estar entre 2000 e ${anoAtual + 1}`
      });
    }

    const nomesMeses = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro'
    ];

    const [linhas] = await conexao.query(
      `
      SELECT
        MONTH(criado_em) AS mes,
        COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END), 0) AS totalReceitas,
        COALESCE(SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END), 0) AS totalDespesas
      FROM transacoes
      WHERE YEAR(criado_em) = ?
      GROUP BY MONTH(criado_em)
      ORDER BY MONTH(criado_em) ASC
      `,
      [anoNumero]
    );

    const mapaMeses = {};

    for (const linha of linhas) {
      const mes = Number(linha.mes);
      const totalReceitas = Number(linha.totalReceitas);
      const totalDespesas = Number(linha.totalDespesas);

      mapaMeses[mes] = {
        ano: anoNumero,
        mes,
        nomeMes: nomesMeses[mes - 1],
        totalReceitas,
        totalDespesas,
        saldo: totalReceitas - totalDespesas
      };
    }

    const resultado = [];

    for (let mes = 1; mes <= 12; mes++) {
      if (mapaMeses[mes]) {
        resultado.push(mapaMeses[mes]);
      } else {
        resultado.push({
          ano: anoNumero,
          mes,
          nomeMes: nomesMeses[mes - 1],
          totalReceitas: 0,
          totalDespesas: 0,
          saldo: 0
        });
      }
    }

    res.status(200).json(resultado);
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