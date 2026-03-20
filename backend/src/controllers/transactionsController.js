const conexao = require('../database');

async function listarTransactions(req, res, next) {
  try {
    const {
      tipo,
      descricao,
      page = 1,
      limit = 10,
      sort = 'id',
      order = 'asc'
    } = req.query;

    const pagina = Number(page);
    const limite = Number(limit);
    const offset = (pagina - 1) * limite;

    if (isNaN(pagina) || pagina <= 0) {
      return res.status(400).json({
        erro: 'Parâmetro page deve ser um número maior que zero'
      });
    }

    if (isNaN(limite) || limite <= 0) {
      return res.status(400).json({
        erro: 'Parâmetro limit deve ser um número maior que zero'
      });
    }

    const camposPermitidos = ['id', 'tipo', 'descricao', 'valor', 'criado_em'];
    if (!camposPermitidos.includes(sort)) {
      return res.status(400).json({
        erro: 'Parâmetro sort inválido'
      });
    }

    const direcao = order.toLowerCase();
    if (!['asc', 'desc'].includes(direcao)) {
      return res.status(400).json({
        erro: 'Parâmetro order deve ser asc ou desc'
      });
    }

    let query = 'SELECT * FROM transactions';
    let countQuery = 'SELECT COUNT(*) AS total FROM transactions';
    const filtros = [];
    const params = [];
    const countParams = [];

    if (tipo) {
      if (!['receita', 'despesa'].includes(tipo)) {
        return res.status(400).json({
          erro: 'Filtro tipo deve ser receita ou despesa'
        });
      }

      filtros.push('tipo = ?');
      params.push(tipo);
      countParams.push(tipo);
    }

    if (descricao) {
      filtros.push('descricao LIKE ?');
      params.push(`%${descricao}%`);
      countParams.push(`%${descricao}%`);
    }

    if (filtros.length > 0) {
      const whereClause = ` WHERE ${filtros.join(' AND ')}`;
      query += whereClause;
      countQuery += whereClause;
    }

    query += ` ORDER BY ${sort} ${direcao} LIMIT ? OFFSET ?`;
    params.push(limite, offset);

    const [rows] = await conexao.query(query, params);
    const [countResult] = await conexao.query(countQuery, countParams);

    const total = countResult[0].total;
    const totalPaginas = Math.ceil(total / limite);

    res.status(200).json({
      pagina,
      limite,
      total,
      totalPaginas,
      filtros: {
        tipo: tipo || null,
        descricao: descricao || null
      },
      ordenacao: {
        campo: sort,
        direcao
      },
      dados: rows
    });
  } catch (erro) {
    next(erro);
  }
}
async function buscarTransactionPorId(req, res, next) {
  try {
    const { id } = req.params;

    const [rows] = await conexao.query(
      'SELECT * FROM transactions WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        erro: 'Transação não encontrada'
      });
    }

    res.status(200).json(rows[0]);
  } catch (erro) {
    next(erro);
  }
}

async function criarTransaction(req, res, next) {
  try {
    const { tipo, descricao, valor } = req.body;

    const [result] = await conexao.query(
      'INSERT INTO transactions (tipo, descricao, valor) VALUES (?, ?, ?)',
      [tipo, descricao, valor]
    );

    res.status(201).json({
      mensagem: 'Transação criada com sucesso',
      id: result.insertId
    });
  } catch (erro) {
    next(erro);
  }
}

async function atualizarTransaction(req, res, next) {
  try {
    const { id } = req.params;
    const { tipo, descricao, valor } = req.body;

    const [resultado] = await conexao.query(
      'UPDATE transactions SET tipo = ?, descricao = ?, valor = ? WHERE id = ?',
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

async function deletarTransaction(req, res, next) {
  try {
    const { id } = req.params;

    const [resultado] = await conexao.query(
      'DELETE FROM transactions WHERE id = ?',
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
async function resumoTransactions(req, res, next) {
  try {
    const { mes, ano } = req.query;

    if ((mes && !ano) || (!mes && ano)) {
      return res.status(400).json({
        erro: 'Informe mes e ano juntos'
      });
    }

    let whereClause = '';
    const params = [];
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

      whereClause = 'WHERE MONTH(criado_em) = ? AND YEAR(criado_em) = ?';
      params.push(mesNumero, anoNumero);
    }

    const [countRows] = await conexao.query(
      `SELECT COUNT(*) AS totalRegistros FROM transactions ${whereClause}`,
      params
    );

    const totalRegistros = Number(countRows[0].totalRegistros);

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

    const [rows] = await conexao.query(
      `
      SELECT
        COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END), 0) AS totalReceitas,
        COALESCE(SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END), 0) AS totalDespesas
      FROM transactions
      ${whereClause}
      `,
      params
    );

    const totalReceitas = Number(rows[0].totalReceitas);
    const totalDespesas = Number(rows[0].totalDespesas);
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
async function resumoMensalTransactions(req, res, next) {
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

    const [rows] = await conexao.query(
      `
      SELECT
        MONTH(criado_em) AS mes,
        COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END), 0) AS totalReceitas,
        COALESCE(SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END), 0) AS totalDespesas
      FROM transactions
      WHERE YEAR(criado_em) = ?
      GROUP BY MONTH(criado_em)
      ORDER BY MONTH(criado_em) ASC
      `,
      [anoNumero]
    );

    const mapaMeses = {};

    for (const row of rows) {
      const mes = Number(row.mes);
      const totalReceitas = Number(row.totalReceitas);
      const totalDespesas = Number(row.totalDespesas);

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
  listarTransactions,
  buscarTransactionPorId,
  criarTransaction,
  atualizarTransaction,
  deletarTransaction,
  resumoTransactions,
  resumoMensalTransactions
};