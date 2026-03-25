const conexao = require('../../../shared/database/connection');

class AuthRepository {
  obterExecutor(connection) {
    return connection || conexao;
  }

  async buscarUsuarioPorEmail(email, connection = null) {
    const executor = this.obterExecutor(connection);

    const [rows] = await executor.execute(
      'SELECT id, nome, email, senha_hash, ativo FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    return rows[0] || null;
  }

  async criarAccount({ nome, tipo, plano, status }, connection = null) {
    const executor = this.obterExecutor(connection);

    const [result] = await executor.execute(
      'INSERT INTO accounts (nome, tipo, plano, status, criado_em) VALUES (?, ?, ?, ?, NOW())',
      [nome, tipo, plano, status]
    );

    return result.insertId;
  }

  async criarUsuario({ nome, email, senhaHash }, connection = null) {
    const executor = this.obterExecutor(connection);

    const [result] = await executor.execute(
      'INSERT INTO users (nome, email, senha_hash, ativo, criado_em) VALUES (?, ?, ?, TRUE, NOW())',
      [nome, email, senhaHash]
    );

    return result.insertId;
  }

  async vincularUsuarioNaConta({ accountId, userId, role }, connection = null) {
    const executor = this.obterExecutor(connection);

    const [result] = await executor.execute(
      'INSERT INTO account_users (account_id, user_id, role, ativo, criado_em) VALUES (?, ?, ?, TRUE, NOW())',
      [accountId, userId, role]
    );

    return result.insertId;
  }

  async criarCtInicial({ accountId, nome }, connection = null) {
    const executor = this.obterExecutor(connection);

    const [result] = await executor.execute(
      'INSERT INTO cts (account_id, nome, ativo, criado_em) VALUES (?, ?, TRUE, NOW())',
      [accountId, nome]
    );

    return result.insertId;
  }

  async buscarContextoPrincipalDoUsuario(userId, connection = null) {
    const executor = this.obterExecutor(connection);

    const [rows] = await executor.execute(
      `
        SELECT
          au.account_id,
          au.role,
          a.nome AS account_nome,
          a.tipo AS account_tipo,
          a.plano AS account_plano,
          a.status AS account_status
        FROM account_users au
        INNER JOIN accounts a ON a.id = au.account_id
        WHERE au.user_id = ?
          AND au.ativo = TRUE
        ORDER BY au.id ASC
        LIMIT 1
      `,
      [userId]
    );

    return rows[0] || null;
  }
}

module.exports = new AuthRepository();