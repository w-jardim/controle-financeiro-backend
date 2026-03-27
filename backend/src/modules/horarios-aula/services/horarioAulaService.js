const horarioRepository = require('../repositories/horarioAulaRepository');
const ctRepository = require('../../cts/repositories/ctRepository');
const profissionalRepository = require('../../profissionais/repositories/profissionalRepository');
const modalidadeRepository = require('../../modalidades/repositories/modalidadeRepository');
const AppError = require('../../../shared/errors/AppError');

class HorarioAulaService {
  async listar(query, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const pagina = Number(query.page || query.pagina || 1);
    const limite = Number(query.limit || query.limite || 10);

    if (!Number.isInteger(pagina) || pagina <= 0) throw new AppError('Parâmetro page deve ser um número maior que zero', 400);
    if (!Number.isInteger(limite) || limite <= 0) throw new AppError('Parâmetro limit deve ser um número maior que zero', 400);

    const offset = (pagina - 1) * limite;

    const resultado = await horarioRepository.listar({ limite, offset, accountId });

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

    const horario = await horarioRepository.buscarPorId(idNumero, accountId);
    if (!horario) throw new AppError('Horário não encontrado', 404);
    return horario;
  }

  async criar(dados, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const ctId = Number(dados.ct_id);
    const profissionalId = Number(dados.profissional_id);
    const modalidadeId = Number(dados.modalidade_id);
    const diaSemana = dados.dia_semana;
    const horaInicio = dados.hora_inicio; // expect 'HH:MM:SS'
    const horaFim = dados.hora_fim;
    const limiteVagas = dados.limite_vagas !== undefined ? Number(dados.limite_vagas) : null;

    if (!ctId || !profissionalId || !modalidadeId || !diaSemana || !horaInicio || !horaFim) {
      throw new AppError('Campos obrigatórios ausentes', 400);
    }

    if (horaFim <= horaInicio) {
      throw new AppError('hora_fim deve ser maior que hora_inicio', 400);
    }

    // Verificar pertença dos recursos à mesma account
    const ct = await ctRepository.buscarPorId(ctId, accountId);
    if (!ct) throw new AppError('CT não encontrado ou não pertence à conta', 404);

    const prof = await profissionalRepository.buscarPorId(profissionalId, accountId);
    if (!prof) throw new AppError('Profissional não encontrado ou não pertence à conta', 404);

    const mod = await modalidadeRepository.buscarPorId(modalidadeId, accountId);
    if (!mod) throw new AppError('Modalidade não encontrada ou não pertence à conta', 404);

    // Checar conflito de horário para o profissional
    const conflito = await horarioRepository.existeConflitoProfissional(profissionalId, diaSemana, horaInicio, horaFim, accountId);
    if (conflito) throw new AppError('Conflito de horário para o profissional', 409);

    const resultado = await horarioRepository.criar({ accountId, ctId, profissionalId, modalidadeId, diaSemana, horaInicio, horaFim, limiteVagas });

    return { mensagem: 'Horário criado com sucesso', id: resultado.id };
  }

  async atualizar(id, dados, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const idNumero = Number(id);
    if (!Number.isInteger(idNumero) || idNumero <= 0) throw new AppError('ID inválido', 400);

    const existente = await horarioRepository.buscarPorId(idNumero, accountId);
    if (!existente) throw new AppError('Horário não encontrado', 404);

    const horaInicio = dados.hora_inicio !== undefined ? dados.hora_inicio : existente.hora_inicio;
    const horaFim = dados.hora_fim !== undefined ? dados.hora_fim : existente.hora_fim;

    if (horaFim <= horaInicio) throw new AppError('hora_fim deve ser maior que hora_inicio', 400);

    const profissionalId = dados.profissional_id !== undefined ? Number(dados.profissional_id) : existente.profissional_id;
    const diaSemana = dados.dia_semana !== undefined ? dados.dia_semana : existente.dia_semana;

    const conflito = await horarioRepository.existeConflitoProfissional(profissionalId, diaSemana, horaInicio, horaFim, accountId, idNumero);
    if (conflito) throw new AppError('Conflito de horário para o profissional', 409);

    const dadosAtualizacao = {};
    if (dados.ct_id !== undefined) dadosAtualizacao.ct_id = Number(dados.ct_id);
    if (dados.profissional_id !== undefined) dadosAtualizacao.profissional_id = Number(dados.profissional_id);
    if (dados.modalidade_id !== undefined) dadosAtualizacao.modalidade_id = Number(dados.modalidade_id);
    if (dados.dia_semana !== undefined) dadosAtualizacao.dia_semana = dados.dia_semana;
    if (dados.hora_inicio !== undefined) dadosAtualizacao.hora_inicio = dados.hora_inicio;
    if (dados.hora_fim !== undefined) dadosAtualizacao.hora_fim = dados.hora_fim;
    if (dados.limite_vagas !== undefined) dadosAtualizacao.limite_vagas = dados.limite_vagas !== null ? Number(dados.limite_vagas) : null;
    if (dados.ativo !== undefined) dadosAtualizacao.ativo = Boolean(dados.ativo);

    const resultado = await horarioRepository.atualizar(idNumero, accountId, dadosAtualizacao);
    if (!resultado.afetadas) throw new AppError('Não foi possível atualizar o horário', 400);

    const atualizado = await horarioRepository.buscarPorId(idNumero, accountId);
    return atualizado;
  }

  async desativar(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const idNumero = Number(id);
    if (!Number.isInteger(idNumero) || idNumero <= 0) throw new AppError('ID inválido', 400);

    const existente = await horarioRepository.buscarPorId(idNumero, accountId);
    if (!existente) throw new AppError('Horário não encontrado', 404);

    await horarioRepository.alterarStatus(idNumero, accountId, false);
    return { mensagem: 'Horário desativado com sucesso' };
  }

  async ativar(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const idNumero = Number(id);
    if (!Number.isInteger(idNumero) || idNumero <= 0) throw new AppError('ID inválido', 400);

    const existente = await horarioRepository.buscarPorId(idNumero, accountId);
    if (!existente) throw new AppError('Horário não encontrado', 404);

    await horarioRepository.alterarStatus(idNumero, accountId, true);
    return { mensagem: 'Horário ativado com sucesso' };
  }
}

module.exports = new HorarioAulaService();
