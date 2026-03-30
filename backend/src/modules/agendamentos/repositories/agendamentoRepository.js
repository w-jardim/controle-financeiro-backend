const conexao = require('../../../shared/database/connection');
const AppError = require('../../../shared/errors/AppError');

class AgendamentoRepository {
  async listar({ limite, offset, accountId }) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const consulta = `SELECT a.* FROM agendamentos a WHERE a.account_id = ? ORDER BY a.data_aula DESC LIMIT ? OFFSET ?`;
    const params = [accountId, limite, offset];

    const [dados] = await conexao.query(consulta, params);
    const [count] = await conexao.query('SELECT COUNT(*) AS total FROM agendamentos WHERE account_id = ?', [accountId]);

    return { dados, total: Number(count[0].total) };
  }

  async buscarPorId(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const [linhas] = await conexao.query('SELECT * FROM agendamentos WHERE id = ? AND account_id = ?', [id, accountId]);
    return linhas[0] || null;
  }

  async existeDuplicidadeAlunoHorario(alunoId, horarioAulaId, dataAula, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const [linhas] = await conexao.query(
      'SELECT id FROM agendamentos WHERE account_id = ? AND aluno_id = ? AND horario_aula_id = ? AND data_aula = ? LIMIT 1',
      [accountId, alunoId, horarioAulaId, dataAula]
    );
    return linhas.length > 0;
  }

  async contarPorHorarioData(horarioAulaId, dataAula, accountId) {
    const [linhas] = await conexao.query(
      'SELECT COUNT(*) AS total FROM agendamentos WHERE account_id = ? AND horario_aula_id = ? AND data_aula = ? AND status <> ?',
      [accountId, horarioAulaId, dataAula, 'cancelado']
    );
    return Number(linhas[0].total);
  }

  async criar({ accountId, alunoId, horarioAulaId, dataAula, status, observacao }) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [resultado] = await conexao.query(
      'INSERT INTO agendamentos (account_id, aluno_id, horario_aula_id, data_aula, status, observacao, criado_em) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [accountId, alunoId, horarioAulaId, dataAula, status, observacao]
    );

    return { id: resultado.insertId };
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
