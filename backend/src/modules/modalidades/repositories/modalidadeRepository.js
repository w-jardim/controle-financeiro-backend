const conexao = require('../../../shared/database/connection');
const AppError = require('../../../shared/errors/AppError');

class ModalidadeRepository {
  async listar({ limite, offset, accountId }) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const filtros = ['account_id = ?'];
    const params = [accountId];

    const where = ` WHERE ${filtros.join(' AND ')}`;
    const consulta = `SELECT * FROM modalidades${where} ORDER BY id ASC LIMIT ? OFFSET ?`;
    const paramsWithLimit = params.concat([limite, offset]);

    const [dados] = await conexao.query(consulta, paramsWithLimit);
    const [count] = await conexao.query(`SELECT COUNT(*) AS total FROM modalidades${where}`, params);

    return { dados, total: Number(count[0].total) };
  }

  async buscarPorId(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [linhas] = await conexao.query('SELECT * FROM modalidades WHERE id = ? AND account_id = ?', [id, accountId]);
    return linhas[0] || null;
  }

  async existePorNome(nome, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [linhas] = await conexao.query('SELECT id FROM modalidades WHERE account_id = ? AND nome = ? LIMIT 1', [accountId, nome]);
    return linhas.length > 0;
  }

  async existePorNomeIgnorandoId(nome, accountId, id) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [linhas] = await conexao.query('SELECT id FROM modalidades WHERE account_id = ? AND nome = ? AND id <> ? LIMIT 1', [accountId, nome, id]);
    return linhas.length > 0;
  }

  async criar({ accountId, nome, descricao }) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [resultado] = await conexao.query(
      'INSERT INTO modalidades (account_id, nome, descricao) VALUES (?, ?, ?)',
      [accountId, nome, descricao || null]
    );

    return { id: resultado.insertId, nome, descricao };
  }

  async atualizar(id, accountId, dados) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const campos = [];
    const valores = [];

    if (dados.nome !== undefined) {
      campos.push('nome = ?');
      valores.push(dados.nome);
    }

    if (dados.descricao !== undefined) {
      campos.push('descricao = ?');
      valores.push(dados.descricao || null);
    }

    if (dados.ativo !== undefined) {
      campos.push('ativo = ?');
      valores.push(dados.ativo ? 1 : 0);
    }

    if (campos.length === 0) throw new AppError('Nenhum campo para atualizar', 400);

    valores.push(id, accountId);

    const consulta = `UPDATE modalidades SET ${campos.join(', ')} WHERE id = ? AND account_id = ?`;
    const [resultado] = await conexao.query(consulta, valores);

    return { afetadas: resultado.affectedRows };
  }

  async alterarStatus(id, accountId, ativo) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [resultado] = await conexao.query('UPDATE modalidades SET ativo = ? WHERE id = ? AND account_id = ?', [ativo ? 1 : 0, id, accountId]);
    return { afetadas: resultado.affectedRows };
  }
}

module.exports = new ModalidadeRepository();
