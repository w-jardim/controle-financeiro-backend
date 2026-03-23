const conexao = require('../../../shared/database/connection');
const AppError = require('../../../shared/errors/AppError');

class CtRepository {
  async listar({ limite, offset, accountId }) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const consulta =
      'SELECT * FROM cts WHERE account_id = ? ORDER BY id ASC LIMIT ? OFFSET ?';
    const params = [accountId, limite, offset];

    const [dados] = await conexao.query(consulta, params);
    const [count] = await conexao.query(
      'SELECT COUNT(*) AS total FROM cts WHERE account_id = ?',
      [accountId]
    );

    return {
      dados,
      total: Number(count[0].total)
    };
  }

  async buscarPorId(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [linhas] = await conexao.query(
      'SELECT * FROM cts WHERE id = ? AND account_id = ?',
      [id, accountId]
    );

    return linhas[0] || null;
  }

  async existePorNome(nome, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [linhas] = await conexao.query(
      'SELECT id FROM cts WHERE account_id = ? AND nome = ? LIMIT 1',
      [accountId, nome]
    );

    return linhas.length > 0;
  }

  async existePorNomeIgnorandoId(nome, id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [linhas] = await conexao.query(
      'SELECT id FROM cts WHERE account_id = ? AND nome = ? AND id <> ? LIMIT 1',
      [accountId, nome, id]
    );

    return linhas.length > 0;
  }

  async criar({ accountId, nome }) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [resultado] = await conexao.query(
      'INSERT INTO cts (account_id, nome, ativo) VALUES (?, ?, TRUE)',
      [accountId, nome]
    );

    return { id: resultado.insertId };
  }

  async atualizar(id, accountId, { nome, ativo }) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [resultado] = await conexao.query(
      'UPDATE cts SET nome = ?, ativo = ? WHERE id = ? AND account_id = ?',
      [nome, ativo, id, accountId]
    );

    return { afetadas: resultado.affectedRows };
  }

  async desativar(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [resultado] = await conexao.query(
      'UPDATE cts SET ativo = FALSE WHERE id = ? AND account_id = ?',
      [id, accountId]
    );

    return { afetadas: resultado.affectedRows };
  }

  async ativar(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [resultado] = await conexao.query(
      'UPDATE cts SET ativo = TRUE WHERE id = ? AND account_id = ?',
      [id, accountId]
    );

    return { afetadas: resultado.affectedRows };
  }
}

module.exports = new CtRepository();