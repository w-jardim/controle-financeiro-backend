const escalaRepository = require('../repositories/escalasRepository');
const agendaRepository = require('../../agenda-aulas/repositories/agendaAulasRepository');
const ctRepository = require('../../cts/repositories/ctRepository');
const profissionalRepository = require('../../profissionais/repositories/profissionalRepository');
const modalidadeRepository = require('../../modalidades/repositories/modalidadeRepository');
const AppError = require('../../../shared/errors/AppError');

class EscalasService {
  async listar(query, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const pagina = Number(query.page || query.pagina || 1);
    const limite = Number(query.limit || query.limite || 10);

    if (!Number.isInteger(pagina) || pagina <= 0) throw new AppError('Parâmetro page deve ser um número maior que zero', 400);
    if (!Number.isInteger(limite) || limite <= 0) throw new AppError('Parâmetro limit deve ser um número maior que zero', 400);

    const offset = (pagina - 1) * limite;

    // collect optional filters from query
    const filtros = {};
    if (query.ct_id) filtros.ct_id = Number(query.ct_id);
    if (query.modalidade_id) filtros.modalidade_id = Number(query.modalidade_id);
    if (query.profissional_id) filtros.profissional_id = Number(query.profissional_id);
    if (query.dia_semana !== undefined) {
      // accept comma-separated or single value
      if (Array.isArray(query.dia_semana)) filtros.dia_semana = query.dia_semana.map(Number);
      else if (String(query.dia_semana).includes(',')) filtros.dia_semana = String(query.dia_semana).split(',').map(Number);
      else filtros.dia_semana = [Number(query.dia_semana)];
    }

    const resultado = await escalaRepository.listar({ limite, offset, accountId, filtros });

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

    const escala = await escalaRepository.buscarPorId(idNumero, accountId);
    if (!escala) throw new AppError('Escala não encontrada', 404);
    return escala;
  }

  async criar(dados, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const ctId = Number(dados.ct_id);
    const profissionalId = Number(dados.profissional_id);
    const modalidadeId = Number(dados.modalidade_id);
    const diasSemana = Array.isArray(dados.dias_semana) ? dados.dias_semana : [];
    const horaInicio = dados.hora_inicio;
    const horaFim = dados.hora_fim;

    if (!ctId || !profissionalId || !modalidadeId || diasSemana.length === 0 || !horaInicio || !horaFim) {
      throw new AppError('Campos obrigatórios ausentes', 400);
    }

    if (horaFim <= horaInicio) {
      throw new AppError('hora_fim deve ser maior que hora_inicio', 400);
    }

    // validações de pertença
    const ct = await ctRepository.buscarPorId(ctId, accountId);
    if (!ct) throw new AppError('CT não encontrado ou não pertence à conta', 404);

    const prof = await profissionalRepository.buscarPorId(profissionalId, accountId);
    if (!prof) throw new AppError('Profissional não encontrado ou não pertence à conta', 404);

    const mod = await modalidadeRepository.buscarPorId(modalidadeId, accountId);
    if (!mod) throw new AppError('Modalidade não encontrada ou não pertence à conta', 404);

    const resultado = await escalaRepository.criar({ accountId, ctId, profissionalId, modalidadeId, diasSemana, horaInicio, horaFim });

    return { mensagem: 'Escala criada com sucesso', id: resultado.id };
  }

  async atualizar(id, dados, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const idNumero = Number(id);
    if (!Number.isInteger(idNumero) || idNumero <= 0) throw new AppError('ID inválido', 400);

    const existente = await escalaRepository.buscarPorId(idNumero, accountId);
    if (!existente) throw new AppError('Escala não encontrada', 404);

    const horaInicio = dados.hora_inicio !== undefined ? dados.hora_inicio : existente.hora_inicio;
    const horaFim = dados.hora_fim !== undefined ? dados.hora_fim : existente.hora_fim;

    if (horaFim <= horaInicio) throw new AppError('hora_fim deve ser maior que hora_inicio', 400);

    const dadosAtualizacao = {};
    if (dados.ct_id !== undefined) dadosAtualizacao.ct_id = Number(dados.ct_id);
    if (dados.profissional_id !== undefined) dadosAtualizacao.profissional_id = Number(dados.profissional_id);
    if (dados.modalidade_id !== undefined) dadosAtualizacao.modalidade_id = Number(dados.modalidade_id);
    if (dados.hora_inicio !== undefined) dadosAtualizacao.hora_inicio = dados.hora_inicio;
    if (dados.hora_fim !== undefined) dadosAtualizacao.hora_fim = dados.hora_fim;
    if (dados.ativo !== undefined) dadosAtualizacao.ativo = Boolean(dados.ativo);
    if (dados.dias_semana !== undefined) dadosAtualizacao.dias_semana = Array.isArray(dados.dias_semana) ? dados.dias_semana : [];

    const resultado = await escalaRepository.atualizar(idNumero, accountId, dadosAtualizacao);
    if (!resultado.afetadas) throw new AppError('Não foi possível atualizar a escala', 400);

    const atualizado = await escalaRepository.buscarPorId(idNumero, accountId);
    return atualizado;
  }

  async desativar(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const idNumero = Number(id);
    if (!Number.isInteger(idNumero) || idNumero <= 0) throw new AppError('ID inválido', 400);

    const existente = await escalaRepository.buscarPorId(idNumero, accountId);
    if (!existente) throw new AppError('Escala não encontrada', 404);

    await escalaRepository.alterarStatus(idNumero, accountId, false);

    // cancelar automaticamente aulas futuras pendentes vinculadas a esta escala
    const hoje = new Date().toISOString().slice(0, 10);
    const { afetadas } = await agendaRepository.cancelarAulasFuturasDeEscala(accountId, idNumero, hoje);

    return { mensagem: 'Escala desativada com sucesso', aulasCanceladas: afetadas };
  }

  async ativar(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const idNumero = Number(id);
    if (!Number.isInteger(idNumero) || idNumero <= 0) throw new AppError('ID inválido', 400);

    const existente = await escalaRepository.buscarPorId(idNumero, accountId);
    if (!existente) throw new AppError('Escala não encontrada', 404);

    await escalaRepository.alterarStatus(idNumero, accountId, true);
    return { mensagem: 'Escala ativada com sucesso' };
  }

  async listarAulas(id, query, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const idNumero = Number(id);
    if (!Number.isInteger(idNumero) || idNumero <= 0) throw new AppError('ID inválido', 400);

    const escala = await escalaRepository.buscarPorId(idNumero, accountId);
    if (!escala) throw new AppError('Escala não encontrada', 404);

    const pagina = Number(query.page || query.pagina || 1);
    const limite = Number(query.limit || query.limite || 20);
    if (!Number.isInteger(pagina) || pagina <= 0) throw new AppError('Parâmetro page inválido', 400);
    if (!Number.isInteger(limite) || limite <= 0) throw new AppError('Parâmetro limit inválido', 400);
    const offset = (pagina - 1) * limite;

    const filtros = { escala_id: idNumero };
    if (query.status) filtros.status = query.status;
    if (query.data_inicio) filtros.data_inicio = query.data_inicio;
    if (query.data_fim) filtros.data_fim = query.data_fim;

    const resultado = await agendaRepository.listar({ limite, offset, accountId, filtros });
    return {
      pagina,
      limite,
      total: resultado.total,
      totalPaginas: Math.ceil(resultado.total / limite),
      escala,
      dados: resultado.dados,
    };
  }
}

module.exports = new EscalasService();
