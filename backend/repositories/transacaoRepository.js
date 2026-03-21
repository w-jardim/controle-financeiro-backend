const conexao = require('../database');

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

    if (filtros.length) {
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
      total: count[0].total
    };
  }
}

module.exports = new TransacaoRepository();