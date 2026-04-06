const conexao = require('../../../shared/database/connection');
const AppError = require('../../../shared/errors/AppError');

class AgendamentoRepository {
  async listar({ limite, offset, accountId }) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const filtros = ['a.account_id = ?'];
    const params = [accountId];

    const where = ` WHERE ${filtros.join(' AND ')}`;
    const consulta = `SELECT a.* FROM agendamentos a${where} ORDER BY a.data_aula DESC LIMIT ? OFFSET ?`;
    const paramsWithLimit = params.concat([limite, offset]);

    const [dados] = await conexao.query(consulta, paramsWithLimit);
    const [count] = await conexao.query(`SELECT COUNT(*) AS total FROM agendamentos a${where}`, params);

    return { dados, total: Number(count[0].total) };
  }

  async buscarPorId(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const [linhas] = await conexao.query('SELECT * FROM agendamentos WHERE id = ? AND account_id = ?', [id, accountId]);
    return linhas[0] || null;
  }

  async existeDuplicidadeAlunoHorario(alunoId, horarioAulaId, dataAula, accountId, conn = null) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const sql = 'SELECT id FROM agendamentos WHERE account_id = ? AND aluno_id = ? AND horario_aula_id = ? AND data_aula = ? LIMIT 1';
    const params = [accountId, alunoId, horarioAulaId, dataAula];
    const [linhas] = conn ? await conn.query(sql, params) : await conexao.query(sql, params);
    return linhas.length > 0;
  }

  async contarPorHorarioData(horarioAulaId, dataAula, accountId, conn = null) {
    const sql = 'SELECT COUNT(*) AS total FROM agendamentos WHERE account_id = ? AND horario_aula_id = ? AND data_aula = ? AND status <> ?';
    const params = [accountId, horarioAulaId, dataAula, 'cancelado'];
    const [linhas] = conn ? await conn.query(sql, params) : await conexao.query(sql, params);
    return Number(linhas[0].total);
  }

  async criar({ accountId, alunoId, horarioAulaId, agendaAulaId, dataAula, status, observacao }, conn = null) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    // Support dual-column insert: prefer agenda_aula_id when provided, otherwise use horario_aula_id
    let sql;
    let params;
    if (agendaAulaId !== undefined && agendaAulaId !== null) {
      sql = 'INSERT INTO agendamentos (account_id, aluno_id, agenda_aula_id, data_aula, status, observacao, criado_em) VALUES (?, ?, ?, ?, ?, ?, NOW())';
      params = [accountId, alunoId, agendaAulaId, dataAula, status, observacao];
    } else {
      sql = 'INSERT INTO agendamentos (account_id, aluno_id, horario_aula_id, data_aula, status, observacao, criado_em) VALUES (?, ?, ?, ?, ?, ?, NOW())';
      params = [accountId, alunoId, horarioAulaId, dataAula, status, observacao];
    }

    try {
      const [resultado] = conn ? await conn.query(sql, params) : await conexao.query(sql, params);
      return { id: resultado.insertId };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
        throw new AppError('Aluno já agendado para esse horário e data', 409);
      }
      throw error;
    }
  }

  async existeDuplicidadeAlunoAgenda(alunoId, agendaAulaId, dataAula, accountId, conn = null) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const sql = 'SELECT id FROM agendamentos WHERE account_id = ? AND aluno_id = ? AND agenda_aula_id = ? AND data_aula = ? LIMIT 1';
    const params = [accountId, alunoId, agendaAulaId, dataAula];
    const [linhas] = conn ? await conn.query(sql, params) : await conexao.query(sql, params);
    return linhas.length > 0;
  }

  async atualizar(id, accountId, dados) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const campos = [];
    const valores = [];

    if (dados.status !== undefined) { campos.push('status = ?'); valores.push(dados.status); }
    if (dados.observacao !== undefined) { campos.push('observacao = ?'); valores.push(dados.observacao); }
    if (dados.data_aula !== undefined) { campos.push('data_aula = ?'); valores.push(dados.data_aula); }

    if (campos.length === 0) throw new AppError('Nenhum campo para atualizar', 400);

    valores.push(id, accountId);

    const consulta = `UPDATE agendamentos SET ${campos.join(', ')} WHERE id = ? AND account_id = ?`;
    const [resultado] = await conexao.query(consulta, valores);

    return { afetadas: resultado.affectedRows };
  }
}

module.exports = new AgendamentoRepository();
