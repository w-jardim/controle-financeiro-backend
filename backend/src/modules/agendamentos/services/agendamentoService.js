const agendamentoRepository = require('../repositories/agendamentoRepository');
const alunoRepository = require('../../alunos/repositories/alunoRepository');
const horarioRepository = require('../../horarios-aula/repositories/horarioAulaRepository');
const agendaAulasRepository = require('../../agenda-aulas/repositories/agendaAulasRepository');
const AppError = require('../../../shared/errors/AppError');
const conexao = require('../../../shared/database/connection');

const STATUS_VALIDOS = ['agendado', 'cancelado', 'compareceu', 'faltou'];

class AgendamentoService {
  async listar(query, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const pagina = Number(query.page || query.pagina || 1);
    const limite = Number(query.limit || query.limite || 10);

    if (!Number.isInteger(pagina) || pagina <= 0) throw new AppError('Parâmetro page deve ser um número maior que zero', 400);
    if (!Number.isInteger(limite) || limite <= 0) throw new AppError('Parâmetro limit deve ser um número maior que zero', 400);

    const offset = (pagina - 1) * limite;

    const resultado = await agendamentoRepository.listar({ limite, offset, accountId });

    return {
      pagina,
      limite,
      total: resultado.total,
      totalPaginas: Math.ceil(resultado.total / limite),
      dados: resultado.dados
    };
  }

  async buscarPorId(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const idNumero = Number(id);
    if (!Number.isInteger(idNumero) || idNumero <= 0) throw new AppError('ID inválido', 400);

    const ag = await agendamentoRepository.buscarPorId(idNumero, accountId);
    if (!ag) throw new AppError('Agendamento não encontrado', 404);
    return ag;
  }

  async criar(dados, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const alunoId = Number(dados.aluno_id);
    const horarioId = dados.horario_aula_id !== undefined && dados.horario_aula_id !== null ? Number(dados.horario_aula_id) : null;
    const agendaAulaId = dados.agenda_aula_id !== undefined && dados.agenda_aula_id !== null ? Number(dados.agenda_aula_id) : null;
    const dataAula = dados.data_aula; // expect 'YYYY-MM-DD'
    const observacao = dados.observacao || null;
    const status = dados.status || 'agendado';

    if (!alunoId || (!horarioId && !agendaAulaId) || !dataAula) throw new AppError('Campos obrigatórios ausentes', 400);
    if (!STATUS_VALIDOS.includes(status)) throw new AppError('Status inválido', 400);

    // Verificar pertença dos recursos à mesma account
    const aluno = await alunoRepository.buscarPorId(alunoId, accountId);
    if (!aluno) throw new AppError('Aluno não encontrado ou não pertence à conta', 404);

    let horario = null;
    if (horarioId) {
      horario = await horarioRepository.buscarPorId(horarioId, accountId);
      if (!horario) throw new AppError('Horário não encontrado ou não pertence à conta', 404);
    }

    let agendaAula = null;
    if (agendaAulaId) {
      agendaAula = await agendaAulasRepository.buscarPorId(agendaAulaId, accountId);
      if (!agendaAula) throw new AppError('Agenda_aula não encontrada ou não pertence à conta', 404);
    }

    // Quando existe limite de vagas fazemos fluxo transacional para evitar TOCTOU
    if (horario && horario.limite_vagas !== null && horario.limite_vagas !== undefined) {
      const conn = await conexao.getConnection();
      try {
        await conn.beginTransaction();

        const total = await agendamentoRepository.contarPorHorarioData(horarioId, dataAula, accountId, conn);
        if (horario.limite_vagas > 0 && total >= horario.limite_vagas) {
          throw new AppError('Limite de vagas atingido para esse horário', 409);
        }

        const resultado = await agendamentoRepository.criar({ accountId, alunoId, horarioAulaId: horarioId, agendaAulaId: null, dataAula, status, observacao }, conn);
        await conn.commit();
        return { mensagem: 'Agendamento criado com sucesso', id: resultado.id };
      } catch (err) {
        try { await conn.rollback(); } catch (_) {}
        throw err;
      } finally {
        conn.release();
      }
    }

    // Check duplicity depending on which id is provided
    if (agendaAulaId) {
      const exists = await agendamentoRepository.existeDuplicidadeAlunoAgenda(alunoId, agendaAulaId, dataAula, accountId);
      if (exists) throw new AppError('Aluno já agendado para essa aula', 409);
      const resultado = await agendamentoRepository.criar({ accountId, alunoId, horarioAulaId: null, agendaAulaId, dataAula, status, observacao });
      return { mensagem: 'Agendamento criado com sucesso', id: resultado.id };
    }

    // Path sem limite de vagas — INSERT direto (UNIQUE protege contra duplicidade)
    const resultado = await agendamentoRepository.criar({ accountId, alunoId, horarioAulaId: horarioId, agendaAulaId: null, dataAula, status, observacao });
    return { mensagem: 'Agendamento criado com sucesso', id: resultado.id };
  }

  async atualizar(id, dados, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const idNumero = Number(id);
    if (!Number.isInteger(idNumero) || idNumero <= 0) throw new AppError('ID inválido', 400);

    const existente = await agendamentoRepository.buscarPorId(idNumero, accountId);
    if (!existente) throw new AppError('Agendamento não encontrado', 404);

    if (dados.status !== undefined && !STATUS_VALIDOS.includes(dados.status)) throw new AppError('Status inválido', 400);

    const payload = {};
    if (dados.status !== undefined) payload.status = dados.status;
    if (dados.observacao !== undefined) payload.observacao = dados.observacao;
    if (dados.data_aula !== undefined) payload.data_aula = dados.data_aula;

    const resultado = await agendamentoRepository.atualizar(idNumero, accountId, payload);
    if (!resultado.afetadas) throw new AppError('Não foi possível atualizar o agendamento', 400);

    const atualizado = await agendamentoRepository.buscarPorId(idNumero, accountId);
    return atualizado;
  }

  async cancelar(id, accountId) {
    return this.atualizar(id, { status: 'cancelado' }, accountId);
  }

  async atualizarStatus(id, status, accountId) {
    if (!STATUS_VALIDOS.includes(status)) throw new AppError('Status inválido', 400);
    return this.atualizar(id, { status }, accountId);
  }
}

module.exports = new AgendamentoService();
