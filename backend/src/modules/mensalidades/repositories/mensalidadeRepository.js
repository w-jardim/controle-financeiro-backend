const conexao = require('../../../shared/database/connection');
const AppError = require('../../../shared/errors/AppError');

class MensalidadeRepository {
  async listar({ limite, offset, accountId, filters }) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const filtros = ['account_id = ?'];
    const params = [accountId];

    if (filters) {
      if (filters.status) { filtros.push('status = ?'); params.push(filters.status); }
      if (filters.aluno_id) { filtros.push('aluno_id = ?'); params.push(filters.aluno_id); }
      if (filters.competencia) { filtros.push('competencia = ?'); params.push(filters.competencia); }
    }

    const where = ` WHERE ${filtros.join(' AND ')}`;
    const consulta = `SELECT * FROM mensalidades${where} ORDER BY vencimento DESC LIMIT ? OFFSET ?`;
    const paramsWithLimit = params.concat([limite, offset]);

    const [dados] = await conexao.query(consulta, paramsWithLimit);
    const [countRows] = await conexao.query(`SELECT COUNT(*) AS total FROM mensalidades${where}`, params);

    dados.forEach(d => { if (d.valor != null) d.valor = Number(d.valor); });

    return { dados, total: Number(countRows[0].total) };
  }

  async buscarPorId(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const [linhas] = await conexao.query('SELECT * FROM mensalidades WHERE id = ? AND account_id = ?', [id, accountId]);
    const row = linhas[0] || null;
    if (row && row.valor != null) row.valor = Number(row.valor);
    return row;
  }

  async existePorAlunoCompetencia(alunoId, competencia, accountId) {
    const [linhas] = await conexao.query('SELECT id FROM mensalidades WHERE account_id = ? AND aluno_id = ? AND competencia = ? LIMIT 1', [accountId, alunoId, competencia]);
    return linhas.length > 0;
  }

  async buscarPorAlunoCompetencia(alunoId, competencia, accountId) {
    const [linhas] = await conexao.query('SELECT * FROM mensalidades WHERE account_id = ? AND aluno_id = ? AND competencia = ? LIMIT 1', [accountId, alunoId, competencia]);
    return linhas[0] || null;
  }

  async criar({ accountId, alunoId, competencia, valor, vencimento, status, data_pagamento, observacao }) {
    const [resultado] = await conexao.query(
      'INSERT INTO mensalidades (account_id, aluno_id, competencia, valor, vencimento, status, data_pagamento, observacao, criado_em) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [accountId, alunoId, competencia, valor, vencimento, status, data_pagamento, observacao]
    );
    return { id: resultado.insertId };
  }

  async atualizar(id, accountId, dados) {
    const campos = [];
    const valores = [];

    if (dados.competencia !== undefined) { campos.push('competencia = ?'); valores.push(dados.competencia); }
    if (dados.valor !== undefined) { campos.push('valor = ?'); valores.push(dados.valor); }
    if (dados.vencimento !== undefined) { campos.push('vencimento = ?'); valores.push(dados.vencimento); }
    if (dados.status !== undefined) { campos.push('status = ?'); valores.push(dados.status); }
    if (dados.data_pagamento !== undefined) { campos.push('data_pagamento = ?'); valores.push(dados.data_pagamento); }
    if (dados.observacao !== undefined) { campos.push('observacao = ?'); valores.push(dados.observacao); }

    if (campos.length === 0) throw new AppError('Nenhum campo para atualizar', 400);

    valores.push(id, accountId);
    const consulta = `UPDATE mensalidades SET ${campos.join(', ')} WHERE id = ? AND account_id = ?`;
    const [resultado] = await conexao.query(consulta, valores);
    return { afetadas: resultado.affectedRows };
  }

  async marcarPago(id, accountId, dataPagamento) {
    const [resultado] = await conexao.query('UPDATE mensalidades SET status = ?, data_pagamento = ? WHERE id = ? AND account_id = ?', ['pago', dataPagamento, id, accountId]);
    return { afetadas: resultado.affectedRows };
  }

  async cancelar(id, accountId) {
    const [resultado] = await conexao.query('UPDATE mensalidades SET status = ? WHERE id = ? AND account_id = ?', ['cancelado', id, accountId]);
    return { afetadas: resultado.affectedRows };
  }
}

module.exports = new MensalidadeRepository();
