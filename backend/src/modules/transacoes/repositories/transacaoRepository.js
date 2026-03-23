const conexao = require('../../../shared/database/connection');
const AppError = require('../../../shared/errors/AppError');

class TransacaoRepository {
  async listar({ tipo, descricao, ordenar, direcao, limite, offset, accountId }) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    let consulta = 'SELECT * FROM transacoes';
    let consultaContagem = 'SELECT COUNT(*) AS total FROM transacoes';

    const filtros = ['account_id = ?'];
    const params = [accountId];
    const paramsCount = [accountId];

    if (tipo) {
      filtros.push('tipo = ?');
      params.push(tipo);
      paramsCount.push(tipo);
    }

    if (descricao) {
      filtros.push('descricao LIKE ?');
      params.push(`%${descricao}%`);
      paramsCount.push(`%${descricao}%`);
    }

    const where = ` WHERE ${filtros.join(' AND ')}`;
    consulta += where;
    consultaContagem += where;

    consulta += ` ORDER BY ${ordenar} ${direcao} LIMIT ? OFFSET ?`;
    params.push(limite, offset);

    const [dados] = await conexao.query(consulta, params);
    const [count] = await conexao.query(consultaContagem, paramsCount);

    return {
      dados,
      total: Number(count[0].total)
    };
  }

  async buscarPorId(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [linhas] = await conexao.query(
      'SELECT * FROM transacoes WHERE id = ? AND account_id = ?',
      [id, accountId]
    );

    return linhas[0] || null;
  }

  async existePorTipoEDescricao(tipo, descricao, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [linhas] = await conexao.query(
      'SELECT id FROM transacoes WHERE account_id = ? AND tipo = ? AND descricao = ? LIMIT 1',
      [accountId, tipo, descricao]
    );

    return linhas.length > 0;
  }

  async existePorTipoEDescricaoIgnorandoId(tipo, descricao, id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [linhas] = await conexao.query(
      'SELECT id FROM transacoes WHERE account_id = ? AND tipo = ? AND descricao = ? AND id <> ? LIMIT 1',
      [accountId, tipo, descricao, id]
    );

    return linhas.length > 0;
  }

  async criar({ tipo, descricao, valor, accountId, ctId = null }) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [resultado] = await conexao.query(
      'INSERT INTO transacoes (account_id, ct_id, tipo, descricao, valor) VALUES (?, ?, ?, ?, ?)',
      [accountId, ctId, tipo, descricao, valor]
    );

    return {
      id: resultado.insertId
    };
  }

  async atualizar(id, accountId, { tipo, descricao, valor }) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [resultado] = await conexao.query(
      'UPDATE transacoes SET tipo = ?, descricao = ?, valor = ? WHERE id = ? AND account_id = ?',
      [tipo, descricao, valor, id, accountId]
    );

    return {
      afetadas: resultado.affectedRows
    };
  }

  async deletar(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [resultado] = await conexao.query(
      'DELETE FROM transacoes WHERE id = ? AND account_id = ?',
      [id, accountId]
    );

    return {
      afetadas: resultado.affectedRows
    };
  }

  async contarPorPeriodo({ mes, ano, accountId }) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    let clausulaWhere = 'WHERE account_id = ?';
    const parametros = [accountId];

    if (mes && ano) {
      clausulaWhere += ' AND MONTH(criado_em) = ? AND YEAR(criado_em) = ?';
      parametros.push(mes, ano);
    }

    const [linhas] = await conexao.query(
      `SELECT COUNT(*) AS totalRegistros FROM transacoes ${clausulaWhere}`,
      parametros
    );

    return Number(linhas[0].totalRegistros);
  }

  async resumoPorPeriodo({ mes, ano, accountId }) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    let clausulaWhere = 'WHERE account_id = ?';
    const parametros = [accountId];

    if (mes && ano) {
      clausulaWhere += ' AND MONTH(criado_em) = ? AND YEAR(criado_em) = ?';
      parametros.push(mes, ano);
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

    return {
      totalReceitas: Number(linhas[0].totalReceitas),
      totalDespesas: Number(linhas[0].totalDespesas)
    };
  }

  async resumoMensalPorAno(accountId, ano) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [linhas] = await conexao.query(
      `
      SELECT
        MONTH(criado_em) AS mes,
        COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END), 0) AS totalReceitas,
        COALESCE(SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END), 0) AS totalDespesas
      FROM transacoes
      WHERE account_id = ? AND YEAR(criado_em) = ?
      GROUP BY MONTH(criado_em)
      ORDER BY MONTH(criado_em) ASC
      `,
      [accountId, ano]
    );

    return linhas.map((linha) => ({
      mes: Number(linha.mes),
      totalReceitas: Number(linha.totalReceitas),
      totalDespesas: Number(linha.totalDespesas)
    }));
  }
}

module.exports = new TransacaoRepository();