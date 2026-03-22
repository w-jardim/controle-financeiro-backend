const conexao = require('../../../shared/database/connection');

class TransacaoRepository {
  async listar({ tipo, descricao, ordenar, direcao, limite, offset }) {
    let consulta = 'SELECT * FROM transacoes';
    let consultaContagem = 'SELECT COUNT(*) AS total FROM transacoes';

    const filtros = [];
    const params = [];
    const paramsCount = [];

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

    if (filtros.length > 0) {
      const where = ` WHERE ${filtros.join(' AND ')}`;
      consulta += where;
      consultaContagem += where;
    }

    consulta += ` ORDER BY ${ordenar} ${direcao} LIMIT ? OFFSET ?`;
    params.push(limite, offset);

    const [dados] = await conexao.query(consulta, params);
    const [count] = await conexao.query(consultaContagem, paramsCount);

    return {
      dados,
      total: Number(count[0].total)
    };
  }

  async buscarPorId(id) {
    const [linhas] = await conexao.query(
      'SELECT * FROM transacoes WHERE id = ?',
      [id]
    );

    return linhas[0] || null;
  }

  async existePorTipoEDescricao(tipo, descricao) {
    const [linhas] = await conexao.query(
      'SELECT id FROM transacoes WHERE tipo = ? AND descricao = ? LIMIT 1',
      [tipo, descricao]
    );

    return linhas.length > 0;
  }

  async existePorTipoEDescricaoIgnorandoId(tipo, descricao, id) {
    const [linhas] = await conexao.query(
      'SELECT id FROM transacoes WHERE tipo = ? AND descricao = ? AND id <> ? LIMIT 1',
      [tipo, descricao, id]
    );

    return linhas.length > 0;
  }

  async criar({ tipo, descricao, valor }) {
    const [resultado] = await conexao.query(
      'INSERT INTO transacoes (tipo, descricao, valor) VALUES (?, ?, ?)',
      [tipo, descricao, valor]
    );

    return {
      id: resultado.insertId
    };
  }

  async atualizar(id, { tipo, descricao, valor }) {
    const [resultado] = await conexao.query(
      'UPDATE transacoes SET tipo = ?, descricao = ?, valor = ? WHERE id = ?',
      [tipo, descricao, valor, id]
    );

    return {
      afetadas: resultado.affectedRows
    };
  }

  async deletar(id) {
    const [resultado] = await conexao.query(
      'DELETE FROM transacoes WHERE id = ?',
      [id]
    );

    return {
      afetadas: resultado.affectedRows
    };
  }

  async contarPorPeriodo({ mes, ano }) {
    let clausulaWhere = '';
    const parametros = [];

    if (mes && ano) {
      clausulaWhere = 'WHERE MONTH(criado_em) = ? AND YEAR(criado_em) = ?';
      parametros.push(mes, ano);
    }

    const [linhas] = await conexao.query(
      `SELECT COUNT(*) AS totalRegistros FROM transacoes ${clausulaWhere}`,
      parametros
    );

    return Number(linhas[0].totalRegistros);
  }

  async resumoPorPeriodo({ mes, ano }) {
    let clausulaWhere = '';
    const parametros = [];

    if (mes && ano) {
      clausulaWhere = 'WHERE MONTH(criado_em) = ? AND YEAR(criado_em) = ?';
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

  async resumoMensalPorAno(ano) {
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
      [ano]
    );

    return linhas.map((linha) => ({
      mes: Number(linha.mes),
      totalReceitas: Number(linha.totalReceitas),
      totalDespesas: Number(linha.totalDespesas)
    }));
  }
}

module.exports = new TransacaoRepository();
