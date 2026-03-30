const conexao = require('../../../shared/database/connection');
const AppError = require('../../../shared/errors/AppError');

class PresencaRepository {
  async listar({ limite, offset, accountId }) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const consulta = `SELECT p.* FROM presencas p WHERE p.account_id = ? ORDER BY p.registrado_em DESC LIMIT ? OFFSET ?`;
    const params = [accountId, limite, offset];

    const [dados] = await conexao.query(consulta, params);
    const [count] = await conexao.query('SELECT COUNT(*) AS total FROM presencas WHERE account_id = ?', [accountId]);

    return { dados, total: Number(count[0].total) };
  }

  async buscarPorId(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const [linhas] = await conexao.query('SELECT * FROM presencas WHERE id = ? AND account_id = ?', [id, accountId]);
    return linhas[0] || null;
  }

  async existePorAgendamento(agendamentoId, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const [linhas] = await conexao.query('SELECT id FROM presencas WHERE account_id = ? AND agendamento_id = ? LIMIT 1', [accountId, agendamentoId]);
    return linhas.length > 0;
  }

  async criar({ accountId, agendamentoId, status, observacao }) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [resultado] = await conexao.query(
      'INSERT INTO presencas (account_id, agendamento_id, status, observacao, registrado_em) VALUES (?, ?, ?, ?, NOW())',
      [accountId, agendamentoId, status, observacao]
    );

    return { id: resultado.insertId };
  }

  async atualizar(id, accountId, dados) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const campos = [];
    const valores = [];

    if (dados.status !== undefined) { campos.push('status = ?'); valores.push(dados.status); }
    if (dados.observacao !== undefined) { campos.push('observacao = ?'); valores.push(dados.observacao); }

    if (campos.length === 0) throw new AppError('Nenhum campo para atualizar', 400);

    valores.push(id, accountId);

    const consulta = `UPDATE presencas SET ${campos.join(', ')} WHERE id = ? AND account_id = ?`;
    const [resultado] = await conexao.query(consulta, valores);

    return { afetadas: resultado.affectedRows };
  }
}

module.exports = new PresencaRepository();
