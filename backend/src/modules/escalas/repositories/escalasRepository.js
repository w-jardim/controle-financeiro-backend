const conexao = require('../../../shared/database/connection');
const AppError = require('../../../shared/errors/AppError');

class EscalasRepository {
  async listar({ limite, offset, accountId, filtros = {} }) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const whereClauses = ['e.account_id = ?'];
    const params = [accountId];

    if (filtros.ct_id) {
      whereClauses.push('e.ct_id = ?');
      params.push(filtros.ct_id);
    }
    if (filtros.modalidade_id) {
      whereClauses.push('e.modalidade_id = ?');
      params.push(filtros.modalidade_id);
    }
    if (filtros.profissional_id) {
      whereClauses.push('e.profissional_id = ?');
      params.push(filtros.profissional_id);
    }
    // filter by day(s) via escala_dias
    if (filtros.dia_semana && Array.isArray(filtros.dia_semana) && filtros.dia_semana.length > 0) {
      whereClauses.push('ed.dia_semana IN (?)');
      params.push(filtros.dia_semana);
    }

    const where = ` WHERE ${whereClauses.join(' AND ')}`;
    const consulta = `SELECT e.*, GROUP_CONCAT(DISTINCT ed.dia_semana) AS dias_semana FROM escalas e LEFT JOIN escala_dias ed ON ed.escala_id = e.id ${where} GROUP BY e.id ORDER BY e.id DESC LIMIT ? OFFSET ?`;
    const paramsWithLimit = params.concat([limite, offset]);

    const [dados] = await conexao.query(consulta, paramsWithLimit);
    const [count] = await conexao.query(`SELECT COUNT(DISTINCT e.id) AS total FROM escalas e LEFT JOIN escala_dias ed ON ed.escala_id = e.id ${where}`, params);

    // map dias_semana to array of numbers
    const mapped = dados.map((row) => ({
      ...row,
      dias_semana: row.dias_semana ? row.dias_semana.split(',').map(Number) : []
    }));

    return { dados: mapped, total: Number(count[0].total) };
  }

  async buscarPorId(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const [linhas] = await conexao.query('SELECT * FROM escalas WHERE id = ? AND account_id = ?', [id, accountId]);
    const escala = linhas[0] || null;
    if (!escala) return null;
    const [dias] = await conexao.query('SELECT dia_semana FROM escala_dias WHERE escala_id = ? ORDER BY dia_semana', [id]);
    escala.dias_semana = dias.map((d) => d.dia_semana);
    return escala;
  }

  async criar({ accountId, ctId, profissionalId, modalidadeId, diasSemana, horaInicio, horaFim }) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    // If an identical escala (same ct/prof/modalidade and time) already exists,
    // attach the requested days to that escala instead of creating a new row.
    const [existentes] = await conexao.query(
      'SELECT id FROM escalas WHERE account_id = ? AND ct_id = ? AND profissional_id = ? AND modalidade_id = ? AND hora_inicio = ? AND hora_fim = ? AND ativo = 1',
      [accountId, ctId, profissionalId, modalidadeId, horaInicio, horaFim]
    );

    if (existentes && existentes.length > 0) {
      const escalaId = existentes[0].id;
      if (Array.isArray(diasSemana) && diasSemana.length > 0) {
        const valores = diasSemana.map((d) => [escalaId, d]);
        // use INSERT IGNORE to skip duplicate dia entries
        await conexao.query('INSERT IGNORE INTO escala_dias (escala_id, dia_semana) VALUES ?', [valores]);
      }
      return { id: escalaId };
    }

    const [resultado] = await conexao.query(
      'INSERT INTO escalas (account_id, ct_id, profissional_id, modalidade_id, hora_inicio, hora_fim) VALUES (?, ?, ?, ?, ?, ?)',
      [accountId, ctId, profissionalId, modalidadeId, horaInicio, horaFim]
    );

    const escalaId = resultado.insertId;
    if (Array.isArray(diasSemana) && diasSemana.length > 0) {
      const valores = diasSemana.map((d) => [escalaId, d]);
      await conexao.query('INSERT INTO escala_dias (escala_id, dia_semana) VALUES ?', [valores]);
    }

    return { id: escalaId };
  }

  async atualizar(id, accountId, dados) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const campos = [];
    const valores = [];

    if (dados.ct_id !== undefined) { campos.push('ct_id = ?'); valores.push(dados.ct_id); }
    if (dados.profissional_id !== undefined) { campos.push('profissional_id = ?'); valores.push(dados.profissional_id); }
    if (dados.modalidade_id !== undefined) { campos.push('modalidade_id = ?'); valores.push(dados.modalidade_id); }
    if (dados.hora_inicio !== undefined) { campos.push('hora_inicio = ?'); valores.push(dados.hora_inicio); }
    if (dados.hora_fim !== undefined) { campos.push('hora_fim = ?'); valores.push(dados.hora_fim); }
    if (dados.ativo !== undefined) { campos.push('ativo = ?'); valores.push(dados.ativo ? 1 : 0); }

    if (campos.length === 0 && dados.dias_semana === undefined) throw new AppError('Nenhum campo para atualizar', 400);

    if (campos.length > 0) {
      valores.push(id, accountId);
      const consulta = `UPDATE escalas SET ${campos.join(', ')} WHERE id = ? AND account_id = ?`;
      const [resultado] = await conexao.query(consulta, valores);
      // continue to dias
      if (!resultado.affectedRows) return { afetadas: 0 };
    }

    if (dados.dias_semana !== undefined) {
      // replace existing dias
      await conexao.query('DELETE FROM escala_dias WHERE escala_id = ?', [id]);
      if (Array.isArray(dados.dias_semana) && dados.dias_semana.length > 0) {
        const valoresDias = dados.dias_semana.map((d) => [id, d]);
        await conexao.query('INSERT INTO escala_dias (escala_id, dia_semana) VALUES ?', [valoresDias]);
      }
    }

    return { afetadas: 1 };
  }

  async alterarStatus(id, accountId, ativo) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const [resultado] = await conexao.query('UPDATE escalas SET ativo = ? WHERE id = ? AND account_id = ?', [ativo ? 1 : 0, id, accountId]);
    return { afetadas: resultado.affectedRows };
  }
}

module.exports = new EscalasRepository();
