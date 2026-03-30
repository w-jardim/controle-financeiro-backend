const presencaRepository = require('../repositories/presencaRepository');
const agendamentoRepository = require('../../agendamentos/repositories/agendamentoRepository');
const AppError = require('../../../shared/errors/AppError');

const STATUS_VALIDOS = ['compareceu', 'faltou', 'reposicao', 'justificada'];

class PresencaService {
  async listar(query, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const pagina = Number(query.page || query.pagina || 1);
    const limite = Number(query.limit || query.limite || 10);

    if (!Number.isInteger(pagina) || pagina <= 0) throw new AppError('Parâmetro page deve ser um número maior que zero', 400);
    if (!Number.isInteger(limite) || limite <= 0) throw new AppError('Parâmetro limit deve ser um número maior que zero', 400);

    const offset = (pagina - 1) * limite;

    const resultado = await presencaRepository.listar({ limite, offset, accountId });

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

    const p = await presencaRepository.buscarPorId(idNumero, accountId);
    if (!p) throw new AppError('Presença não encontrada', 404);
    return p;
  }

  async criar(dados, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const agendamentoId = Number(dados.agendamento_id);
    const status = dados.status;
    const observacao = dados.observacao || null;

    if (!agendamentoId || !status) throw new AppError('Campos obrigatórios ausentes', 400);
    if (!STATUS_VALIDOS.includes(status)) throw new AppError('Status inválido', 400);

    // verificar agendamento pertence à conta
    const ag = await agendamentoRepository.buscarPorId(agendamentoId, accountId);
    if (!ag) throw new AppError('Agendamento não encontrado ou não pertence à conta', 404);

    // impedir duplicidade (uma presença por agendamento)
    const existe = await presencaRepository.existePorAgendamento(agendamentoId, accountId);
    if (existe) throw new AppError('Presença já registrada para este agendamento', 409);

    const resultado = await presencaRepository.criar({ accountId, agendamentoId, status, observacao });
    return { mensagem: 'Presença registrada com sucesso', id: resultado.id };
  }

  async atualizar(id, dados, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const idNumero = Number(id);
    if (!Number.isInteger(idNumero) || idNumero <= 0) throw new AppError('ID inválido', 400);

    const existente = await presencaRepository.buscarPorId(idNumero, accountId);
    if (!existente) throw new AppError('Presença não encontrada', 404);

    if (dados.status !== undefined && !STATUS_VALIDOS.includes(dados.status)) throw new AppError('Status inválido', 400);

    const payload = {};
    if (dados.status !== undefined) payload.status = dados.status;
    if (dados.observacao !== undefined) payload.observacao = dados.observacao;

    const resultado = await presencaRepository.atualizar(idNumero, accountId, payload);
    if (!resultado.afetadas) throw new AppError('Não foi possível atualizar a presença', 400);

    const atualizado = await presencaRepository.buscarPorId(idNumero, accountId);
    return atualizado;
  }

  async atualizarStatus(id, status, accountId) {
    if (!STATUS_VALIDOS.includes(status)) throw new AppError('Status inválido', 400);
    return this.atualizar(id, { status }, accountId);
  }
}

module.exports = new PresencaService();
