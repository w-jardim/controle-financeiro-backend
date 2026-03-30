const conexao = require('../../../shared/database/connection');
const AppError = require('../../../shared/errors/AppError');

class ProfissionalRepository {
  async listar({ limite, offset, accountId }) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const filtros = ['account_id = ?'];
    const params = [accountId];

    const where = ` WHERE ${filtros.join(' AND ')}`;
    const consulta = `SELECT * FROM profissionais${where} ORDER BY id ASC LIMIT ? OFFSET ?`;
    const paramsWithLimit = params.concat([limite, offset]);

    const [dados] = await conexao.query(consulta, paramsWithLimit);
    const [count] = await conexao.query(`SELECT COUNT(*) AS total FROM profissionais${where}`, params);

    return {
      dados,
      total: Number(count[0].total)
    };
  }

  async buscarPorId(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [linhas] = await conexao.query(
      'SELECT * FROM profissionais WHERE id = ? AND account_id = ?',
      [id, accountId]
    );

    return linhas[0] || null;
  }

  async existePorNomeETelefone(nome, telefone, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [linhas] = await conexao.query(
      'SELECT id FROM profissionais WHERE account_id = ? AND nome = ? AND telefone = ? LIMIT 1',
      [accountId, nome, telefone]
    );

    return linhas.length > 0;
  }

  async existePorNomeETelefoneIgnorandoId(nome, telefone, accountId, id) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [linhas] = await conexao.query(
      'SELECT id FROM profissionais WHERE account_id = ? AND nome = ? AND telefone = ? AND id <> ? LIMIT 1',
      [accountId, nome, telefone, id]
    );

    return linhas.length > 0;
  }

  async criar({ accountId, nome, email, telefone, especialidade }) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [resultado] = await conexao.query(
      'INSERT INTO profissionais (account_id, nome, email, telefone, especialidade) VALUES (?, ?, ?, ?, ?)',
      [accountId, nome, email || null, telefone || null, especialidade || null]
    );

    return {
      id: resultado.insertId,
      nome,
      email,
      telefone,
      especialidade
    };
  }

  async atualizar(id, accountId, dados) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const campos = [];
    const valores = [];

    if (dados.nome !== undefined) {
      campos.push('nome = ?');
      valores.push(dados.nome);
    }

    if (dados.email !== undefined) {
      campos.push('email = ?');
      valores.push(dados.email || null);
    }

    if (dados.telefone !== undefined) {
      campos.push('telefone = ?');
      valores.push(dados.telefone || null);
    }

    if (dados.especialidade !== undefined) {
      campos.push('especialidade = ?');
      valores.push(dados.especialidade || null);
    }

    if (dados.ativo !== undefined) {
      campos.push('ativo = ?');
      valores.push(dados.ativo ? 1 : 0);
    }

    if (campos.length === 0) {
      throw new AppError('Nenhum campo para atualizar', 400);
    }

    valores.push(id, accountId);

    const consulta = `UPDATE profissionais SET ${campos.join(', ')} WHERE id = ? AND account_id = ?`;

    const [resultado] = await conexao.query(consulta, valores);

    return {
      afetadas: resultado.affectedRows
    };
  }

  async alterarStatus(id, accountId, ativo) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [resultado] = await conexao.query(
      'UPDATE profissionais SET ativo = ? WHERE id = ? AND account_id = ?',
      [ativo ? 1 : 0, id, accountId]
    );

    return {
      afetadas: resultado.affectedRows
    };
  }
}

module.exports = new ProfissionalRepository();
