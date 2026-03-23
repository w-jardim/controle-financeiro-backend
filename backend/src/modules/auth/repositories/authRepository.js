const conexao = require('../../../shared/database/connection');

class AuthRepository {
  async buscarUsuarioPorEmail(email) {
    const [rows] = await conexao.execute(
      'SELECT id, nome, email, senha_hash, ativo FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    return rows[0] || null;
  }

  async criarAccount({ nome, tipo, plano, status }) {
    const [result] = await conexao.execute(
      'INSERT INTO accounts (nome, tipo, plano, status, criado_em) VALUES (?, ?, ?, ?, NOW())',
      [nome, tipo, plano, status]
    );
    return result.insertId;
  }

  async criarUsuario({ nome, email, senhaHash }) {
    const [result] = await conexao.execute(
      'INSERT INTO users (nome, email, senha_hash, criado_em) VALUES (?, ?, ?, NOW())',
      [nome, email, senhaHash]
    );
    return result.insertId;
  }

  async vincularUsuarioNaConta({ accountId, userId, role }) {
    const [result] = await conexao.execute(
      'INSERT INTO account_users (account_id, user_id, role, criado_em) VALUES (?, ?, ?, NOW())',
      [accountId, userId, role]
    );
    return result.insertId;
  }

  async criarCtInicial({ accountId, nome }) {
    const [result] = await conexao.execute(
      'INSERT INTO cts (account_id, nome, status, criado_em) VALUES (?, ?, ?, NOW())',
      [accountId, nome, 'ativo']
    );
    return result.insertId;
  }
}

module.exports = new AuthRepository();
