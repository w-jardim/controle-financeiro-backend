const conexao = require('../../../shared/database/connection');
const AppError = require('../../../shared/errors/AppError');

class HorarioAulaRepository {
  async listar({ limite, offset, accountId }) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const filtros = ['account_id = ?'];
    const params = [accountId];

    const where = ` WHERE ${filtros.join(' AND ')}`;
    const consulta = `SELECT * FROM horarios_aula${where} ORDER BY dia_semana ASC, hora_inicio ASC LIMIT ? OFFSET ?`;
    const paramsWithLimit = params.concat([limite, offset]);

    const [dados] = await conexao.query(consulta, paramsWithLimit);
    const [count] = await conexao.query(`SELECT COUNT(*) AS total FROM horarios_aula${where}`, params);

    return { dados, total: Number(count[0].total) };
  }

  async buscarPorId(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const [linhas] = await conexao.query('SELECT * FROM horarios_aula WHERE id = ? AND account_id = ?', [id, accountId]);
    return linhas[0] || null;
  }

  async existeConflitoProfissional(profissionalId, diaSemana, horaInicio, horaFim, accountId, ignoreId = null) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    let consulta = `SELECT id FROM horarios_aula WHERE account_id = ? AND profissional_id = ? AND dia_semana = ? AND ((hora_inicio < ? AND hora_fim > ?) OR (hora_inicio < ? AND hora_fim > ?) OR (hora_inicio >= ? AND hora_fim <= ?))`;
    const params = [accountId, profissionalId, diaSemana, horaFim, horaInicio, horaFim, horaInicio, horaInicio, horaFim];

    if (ignoreId) {
      consulta += ' AND id <> ?';
      params.push(ignoreId);
    }

    consulta += ' LIMIT 1';

    const [linhas] = await conexao.query(consulta, params);
    return linhas.length > 0;
  }

  async criar({ accountId, ctId, profissionalId, modalidadeId, diaSemana, horaInicio, horaFim, limiteVagas }) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const [resultado] = await conexao.query(
      'INSERT INTO horarios_aula (account_id, ct_id, profissional_id, modalidade_id, dia_semana, hora_inicio, hora_fim, limite_vagas) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [accountId, ctId, profissionalId, modalidadeId, diaSemana, horaInicio, horaFim, limiteVagas]
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
    if (dados.dia_semana !== undefined) { campos.push('dia_semana = ?'); valores.push(dados.dia_semana); }
    if (dados.hora_inicio !== undefined) { campos.push('hora_inicio = ?'); valores.push(dados.hora_inicio); }
    if (dados.hora_fim !== undefined) { campos.push('hora_fim = ?'); valores.push(dados.hora_fim); }
    if (dados.limite_vagas !== undefined) { campos.push('limite_vagas = ?'); valores.push(dados.limite_vagas); }
    if (dados.ativo !== undefined) { campos.push('ativo = ?'); valores.push(dados.ativo ? 1 : 0); }

    if (campos.length === 0) throw new AppError('Nenhum campo para atualizar', 400);

    valores.push(id, accountId);

    const consulta = `UPDATE horarios_aula SET ${campos.join(', ')} WHERE id = ? AND account_id = ?`;
    const [resultado] = await conexao.query(consulta, valores);

    return { afetadas: resultado.affectedRows };
  }

  async alterarStatus(id, accountId, ativo) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const [resultado] = await conexao.query('UPDATE horarios_aula SET ativo = ? WHERE id = ? AND account_id = ?', [ativo ? 1 : 0, id, accountId]);
    return { afetadas: resultado.affectedRows };
  }
}

module.exports = new HorarioAulaRepository();
