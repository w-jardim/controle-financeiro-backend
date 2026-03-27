const conexao = require('../../../shared/database/connection');
const AppError = require('../../../shared/errors/AppError');

class AlunoRepository {
  async listar({ query = {}, accountId }) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const filtros = ['account_id = ?'];
    const params = [accountId];

    if (query.nome) {
      filtros.push('nome LIKE ?');
      params.push(`%${query.nome}%`);
    }

    if (query.cpf) {
      filtros.push('cpf = ?');
      params.push(query.cpf);
    }

    if (query.ativo !== undefined && query.ativo !== null) {
      filtros.push('ativo = ?');
      params.push(Number(query.ativo));
    }

    if (query.ct_id !== undefined && query.ct_id !== null) {
      filtros.push('ct_id = ?');
      params.push(query.ct_id);
    }

    const where = ` WHERE ${filtros.join(' AND ')}`;
    const consulta = `SELECT * FROM alunos${where} ORDER BY nome ASC`;

    const [rows] = await conexao.execute(consulta, params);
    return rows;
  }

  async buscarPorId(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [rows] = await conexao.execute(
      'SELECT * FROM alunos WHERE id = ? AND account_id = ? LIMIT 1',
      [id, accountId]
    );

    return rows[0] || null;
  }

  async criar({
    accountId,
    ct_id,
    nome,
    cpf,
    data_nascimento,
    sexo,
    telefone,
    email,
    nome_responsavel,
    telefone_responsavel
  }) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const consulta = `
      INSERT INTO alunos
      (account_id, ct_id, nome, cpf, data_nascimento, sexo, telefone, email, nome_responsavel, telefone_responsavel, ativo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
    `;
    const params = [
      accountId,
      ct_id,
      nome,
      cpf ?? null,
      data_nascimento ?? null,
      sexo ?? null,
      telefone ?? null,
      email ?? null,
      nome_responsavel ?? null,
      telefone_responsavel ?? null
    ];

    const [result] = await conexao.execute(consulta, params);
    const insertId = result.insertId;

    return this.buscarPorId(insertId, accountId);
  }

  async atualizar(id, accountId, dados) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const permitidos = [
      'ct_id',
      'nome',
      'cpf',
      'data_nascimento',
      'sexo',
      'telefone',
      'email',
      'nome_responsavel',
      'telefone_responsavel',
      'ativo'
    ];

    const sets = [];
    const params = [];

    for (const campo of permitidos) {
      if (Object.prototype.hasOwnProperty.call(dados, campo)) {
        sets.push(`${campo} = ?`);
        params.push(dados[campo] ?? null);
      }
    }

    if (sets.length === 0) {
      throw new AppError('Nenhum campo válido informado para atualização', 400);
    }

    const consulta = `UPDATE alunos SET ${sets.join(', ')} WHERE id = ? AND account_id = ?`;
    params.push(id, accountId);

    await conexao.execute(consulta, params);

    return this.buscarPorId(id, accountId);
  }

  async desativar(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    await conexao.execute('UPDATE alunos SET ativo = 0 WHERE id = ? AND account_id = ?', [
      id,
      accountId
    ]);

    return this.buscarPorId(id, accountId);
  }

  async ativar(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    await conexao.execute('UPDATE alunos SET ativo = 1 WHERE id = ? AND account_id = ?', [
      id,
      accountId
    ]);

    return this.buscarPorId(id, accountId);
  }

  async existePorCpf(cpf, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [rows] = await conexao.execute(
      'SELECT 1 FROM alunos WHERE account_id = ? AND cpf = ? LIMIT 1',
      [accountId, cpf]
    );

    return rows.length > 0;
  }

  async existePorCpfIgnorandoId(cpf, accountId, id) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [rows] = await conexao.execute(
      'SELECT 1 FROM alunos WHERE account_id = ? AND cpf = ? AND id <> ? LIMIT 1',
      [accountId, cpf, id]
    );

    return rows.length > 0;
  }

  async existePorNomeEDataNascimento(nome, dataNascimento, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [rows] = await conexao.execute(
      'SELECT 1 FROM alunos WHERE account_id = ? AND nome = ? AND data_nascimento = ? LIMIT 1',
      [accountId, nome, dataNascimento]
    );

    return rows.length > 0;
  }

  async existePorNomeEDataNascimentoIgnorandoId(nome, dataNascimento, accountId, id) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [rows] = await conexao.execute(
      'SELECT 1 FROM alunos WHERE account_id = ? AND nome = ? AND data_nascimento = ? AND id <> ? LIMIT 1',
      [accountId, nome, dataNascimento, id]
    );

    return rows.length > 0;
  }

  async existePorNomeETelefone(nome, telefone, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [rows] = await conexao.execute(
      'SELECT 1 FROM alunos WHERE account_id = ? AND nome = ? AND telefone = ? LIMIT 1',
      [accountId, nome, telefone]
    );

    return rows.length > 0;
  }

  async existePorNomeETelefoneIgnorandoId(nome, telefone, accountId, id) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [rows] = await conexao.execute(
      'SELECT 1 FROM alunos WHERE account_id = ? AND nome = ? AND telefone = ? AND id <> ? LIMIT 1',
      [accountId, nome, telefone, id]
    );

    return rows.length > 0;
  }
}

module.exports = new AlunoRepository();