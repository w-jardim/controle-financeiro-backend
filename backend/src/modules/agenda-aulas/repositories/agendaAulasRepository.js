const conexao = require('../../../shared/database/connection');
const AppError = require('../../../shared/errors/AppError');

class AgendaAulasRepository {
  async listar({ limite, offset, accountId, filtros = {} }) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const whereClauses = ['a.account_id = ?'];
    const params = [accountId];

    if (filtros.escala_id) { whereClauses.push('a.escala_id = ?'); params.push(filtros.escala_id); }
    if (filtros.ct_id) { whereClauses.push('a.ct_id = ?'); params.push(filtros.ct_id); }
    if (filtros.modalidade_id) { whereClauses.push('a.modalidade_id = ?'); params.push(filtros.modalidade_id); }
    if (filtros.profissional_id) { whereClauses.push('a.profissional_id = ?'); params.push(filtros.profissional_id); }
    if (filtros.status) { whereClauses.push('a.status = ?'); params.push(filtros.status); }
    if (filtros.data_inicio) { whereClauses.push('a.data_aula >= ?'); params.push(filtros.data_inicio); }
    if (filtros.data_fim) { whereClauses.push('a.data_aula <= ?'); params.push(filtros.data_fim); }

    const where = ` WHERE ${whereClauses.join(' AND ')}`;
    const consulta = `
      SELECT
        a.*,
        p.nome  AS profissional_nome,
        m.nome  AS modalidade_nome,
        c.nome  AS ct_nome,
        e.hora_inicio AS escala_hora_inicio,
        e.hora_fim    AS escala_hora_fim
      FROM agenda_aulas a
      LEFT JOIN profissionais p  ON p.id = a.profissional_id
      LEFT JOIN modalidades m    ON m.id = a.modalidade_id
      LEFT JOIN cts c            ON c.id = a.ct_id
      LEFT JOIN escalas e        ON e.id = a.escala_id
      ${where}
      ORDER BY a.data_aula DESC, a.hora_inicio DESC
      LIMIT ? OFFSET ?`;
    const paramsWithLimit = params.concat([limite, offset]);

    const [dados] = await conexao.query(consulta, paramsWithLimit);
    const [count] = await conexao.query(`SELECT COUNT(*) AS total FROM agenda_aulas a${where}`, params);

    return { dados, total: Number(count[0].total) };
  }

  async buscarPorId(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const [linhas] = await conexao.query(
      `SELECT
        a.*,
        p.nome  AS profissional_nome,
        m.nome  AS modalidade_nome,
        c.nome  AS ct_nome,
        e.hora_inicio AS escala_hora_inicio,
        e.hora_fim    AS escala_hora_fim
      FROM agenda_aulas a
      LEFT JOIN profissionais p  ON p.id = a.profissional_id
      LEFT JOIN modalidades m    ON m.id = a.modalidade_id
      LEFT JOIN cts c            ON c.id = a.ct_id
      LEFT JOIN escalas e        ON e.id = a.escala_id
      WHERE a.id = ? AND a.account_id = ?`,
      [id, accountId]
    );
    return linhas[0] || null;
  }

  async verificarExistente(accountId, escalaId, dataAula) {
    const [linhas] = await conexao.query(
      'SELECT id FROM agenda_aulas WHERE account_id = ? AND escala_id = ? AND data_aula = ? LIMIT 1',
      [accountId, escalaId, dataAula]
    );
    return linhas[0] || null;
  }

  async cancelarAulasFuturasDeEscala(accountId, escalaId, hoje) {
    const [resultado] = await conexao.query(
      `UPDATE agenda_aulas SET status = 'cancelada'
       WHERE account_id = ? AND escala_id = ? AND data_aula >= ? AND status IN ('rascunho', 'liberada')`,
      [accountId, escalaId, hoje]
    );
    return { afetadas: resultado.affectedRows };
  }

  async criar({ accountId, ctId, escalaId, profissionalId, modalidadeId, dataAula, horaInicio, horaFim, observacao }) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [resultado] = await conexao.query(
      'INSERT INTO agenda_aulas (account_id, ct_id, escala_id, profissional_id, modalidade_id, data_aula, hora_inicio, hora_fim, observacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [accountId, ctId, escalaId, profissionalId, modalidadeId, dataAula, horaInicio, horaFim, observacao]
    );

    return { id: resultado.insertId };
  }

  async atualizar(id, accountId, dados) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const campos = [];
    const valores = [];

    if (dados.ct_id !== undefined) { campos.push('ct_id = ?'); valores.push(dados.ct_id); }
    if (dados.profissional_id !== undefined) { campos.push('profissional_id = ?'); valores.push(dados.profissional_id); }
    if (dados.modalidade_id !== undefined) { campos.push('modalidade_id = ?'); valores.push(dados.modalidade_id); }
    if (dados.data_aula !== undefined) { campos.push('data_aula = ?'); valores.push(dados.data_aula); }
    if (dados.hora_inicio !== undefined) { campos.push('hora_inicio = ?'); valores.push(dados.hora_inicio); }
    if (dados.hora_fim !== undefined) { campos.push('hora_fim = ?'); valores.push(dados.hora_fim); }
    if (dados.status !== undefined) { campos.push('status = ?'); valores.push(dados.status); }
    if (dados.observacao !== undefined) { campos.push('observacao = ?'); valores.push(dados.observacao); }

    if (campos.length === 0) throw new AppError('Nenhum campo para atualizar', 400);

    valores.push(id, accountId);

    const consulta = `UPDATE agenda_aulas SET ${campos.join(', ')} WHERE id = ? AND account_id = ?`;
    const [resultado] = await conexao.query(consulta, valores);

    return { afetadas: resultado.affectedRows };
  }

  async alterarStatus(id, accountId, status) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const [resultado] = await conexao.query('UPDATE agenda_aulas SET status = ? WHERE id = ? AND account_id = ?', [status, id, accountId]);
    return { afetadas: resultado.affectedRows };
  }
}

module.exports = new AgendaAulasRepository();
