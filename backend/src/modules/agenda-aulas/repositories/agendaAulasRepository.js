const conexao = require('../../../shared/database/connection');
const AppError = require('../../../shared/errors/AppError');

class AgendaAulasRepository {
  async listar({ limite, offset, accountId }) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const filtros = ['a.account_id = ?'];
    const params = [accountId];

    const where = ` WHERE ${filtros.join(' AND ')}`;
    const consulta = `SELECT a.* FROM agenda_aulas a ${where} ORDER BY data_aula DESC, hora_inicio DESC LIMIT ? OFFSET ?`;
    const paramsWithLimit = params.concat([limite, offset]);

    const [dados] = await conexao.query(consulta, paramsWithLimit);
    const [count] = await conexao.query(`SELECT COUNT(*) AS total FROM agenda_aulas a${where}`, params);

    return { dados, total: Number(count[0].total) };
  }

  async buscarPorId(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const [linhas] = await conexao.query('SELECT * FROM agenda_aulas WHERE id = ? AND account_id = ?', [id, accountId]);
    return linhas[0] || null;
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
