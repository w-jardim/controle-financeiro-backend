const agendaRepository = require('../repositories/agendaAulasRepository');
const escalaRepository = require('../../escalas/repositories/escalasRepository');
const ctRepository = require('../../cts/repositories/ctRepository');
const profissionalRepository = require('../../profissionais/repositories/profissionalRepository');
const modalidadeRepository = require('../../modalidades/repositories/modalidadeRepository');
const AppError = require('../../../shared/errors/AppError');

class AgendaAulasService {
  async listar(query, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const pagina = Number(query.page || query.pagina || 1);
    const limite = Number(query.limit || query.limite || 10);

    if (!Number.isInteger(pagina) || pagina <= 0) throw new AppError('Parâmetro page deve ser um número maior que zero', 400);
    if (!Number.isInteger(limite) || limite <= 0) throw new AppError('Parâmetro limit deve ser um número maior que zero', 400);

    const offset = (pagina - 1) * limite;

    const filtros = {};
    if (query.escala_id) filtros.escala_id = Number(query.escala_id);
    if (query.ct_id) filtros.ct_id = Number(query.ct_id);
    if (query.modalidade_id) filtros.modalidade_id = Number(query.modalidade_id);
    if (query.profissional_id) filtros.profissional_id = Number(query.profissional_id);
    if (query.status) filtros.status = query.status;
    if (query.data_inicio) filtros.data_inicio = query.data_inicio;
    if (query.data_fim) filtros.data_fim = query.data_fim;

    const resultado = await agendaRepository.listar({ limite, offset, accountId, filtros });

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

    const aula = await agendaRepository.buscarPorId(idNumero, accountId);
    if (!aula) throw new AppError('Aula não encontrada', 404);
    return aula;
  }

  async criar(dados, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const ctId = Number(dados.ct_id);
    const profissionalId = Number(dados.profissional_id);
    const modalidadeId = Number(dados.modalidade_id);
    const dataAula = dados.data_aula;
    const horaInicio = dados.hora_inicio;
    const horaFim = dados.hora_fim;
    const escalaId = dados.escala_id !== undefined && dados.escala_id !== null ? Number(dados.escala_id) : null;

    if (!ctId || !profissionalId || !modalidadeId || !dataAula || !horaInicio || !horaFim) {
      throw new AppError('Campos obrigatórios ausentes', 400);
    }

    if (horaFim <= horaInicio) throw new AppError('hora_fim deve ser maior que hora_inicio', 400);

    // validações de pertença
    const ct = await ctRepository.buscarPorId(ctId, accountId);
    if (!ct) throw new AppError('CT não encontrado ou não pertence à conta', 404);

    const prof = await profissionalRepository.buscarPorId(profissionalId, accountId);
    if (!prof) throw new AppError('Profissional não encontrado ou não pertence à conta', 404);

    const mod = await modalidadeRepository.buscarPorId(modalidadeId, accountId);
    if (!mod) throw new AppError('Modalidade não encontrada ou não pertence à conta', 404);

    // se escala_id for fornecido, valida vínculo e consistência
    if (escalaId) {
      const escala = await escalaRepository.buscarPorId(escalaId, accountId);
      if (!escala) throw new AppError('Escala não encontrada ou não pertence à conta', 404);
      if (!escala.ativo) throw new AppError('Escala está desativada', 400);

      // valida que o dia da semana da data_aula está nos dias da escala
      const diaDaAula = new Date(dataAula + 'T00:00:00').getDay();
      const diasEscala = Array.isArray(escala.dias_semana) ? escala.dias_semana : [];
      if (diasEscala.length > 0 && !diasEscala.includes(diaDaAula)) {
        throw new AppError(`O dia da semana de ${dataAula} (${diaDaAula}) não faz parte dos dias da escala`, 400);
      }
    }

    const resultado = await agendaRepository.criar({ accountId, ctId, escalaId, profissionalId, modalidadeId, dataAula, horaInicio, horaFim, observacao: dados.observacao });
    return { mensagem: 'Aula criada com sucesso', id: resultado.id };
  }

  async atualizar(id, dados, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const idNumero = Number(id);
    if (!Number.isInteger(idNumero) || idNumero <= 0) throw new AppError('ID inválido', 400);

    const existente = await agendaRepository.buscarPorId(idNumero, accountId);
    if (!existente) throw new AppError('Aula não encontrada', 404);

    const horaInicio = dados.hora_inicio !== undefined ? dados.hora_inicio : existente.hora_inicio;
    const horaFim = dados.hora_fim !== undefined ? dados.hora_fim : existente.hora_fim;

    if (horaFim <= horaInicio) throw new AppError('hora_fim deve ser maior que hora_inicio', 400);

    const dadosAtualizacao = {};
    if (dados.ct_id !== undefined) dadosAtualizacao.ct_id = Number(dados.ct_id);
    if (dados.profissional_id !== undefined) dadosAtualizacao.profissional_id = Number(dados.profissional_id);
    if (dados.modalidade_id !== undefined) dadosAtualizacao.modalidade_id = Number(dados.modalidade_id);
    if (dados.data_aula !== undefined) dadosAtualizacao.data_aula = dados.data_aula;
    if (dados.hora_inicio !== undefined) dadosAtualizacao.hora_inicio = dados.hora_inicio;
    if (dados.hora_fim !== undefined) dadosAtualizacao.hora_fim = dados.hora_fim;
    if (dados.status !== undefined) dadosAtualizacao.status = dados.status;
    if (dados.observacao !== undefined) dadosAtualizacao.observacao = dados.observacao;

    const resultado = await agendaRepository.atualizar(idNumero, accountId, dadosAtualizacao);
    if (!resultado.afetadas) throw new AppError('Não foi possível atualizar a aula', 400);

    const atualizado = await agendaRepository.buscarPorId(idNumero, accountId);
    return atualizado;
  }

  async liberar(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const idNumero = Number(id);
    if (!Number.isInteger(idNumero) || idNumero <= 0) throw new AppError('ID inválido', 400);

    const existente = await agendaRepository.buscarPorId(idNumero, accountId);
    if (!existente) throw new AppError('Aula não encontrada', 404);

    await agendaRepository.alterarStatus(idNumero, accountId, 'liberada');
    return { mensagem: 'Aula liberada com sucesso' };
  }

  async cancelar(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const idNumero = Number(id);
    if (!Number.isInteger(idNumero) || idNumero <= 0) throw new AppError('ID inválido', 400);

    const existente = await agendaRepository.buscarPorId(idNumero, accountId);
    if (!existente) throw new AppError('Aula não encontrada', 404);

    await agendaRepository.alterarStatus(idNumero, accountId, 'cancelada');
    return { mensagem: 'Aula cancelada com sucesso' };
  }

  async encerrar(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const idNumero = Number(id);
    if (!Number.isInteger(idNumero) || idNumero <= 0) throw new AppError('ID inválido', 400);

    const existente = await agendaRepository.buscarPorId(idNumero, accountId);
    if (!existente) throw new AppError('Aula não encontrada', 404);

    await agendaRepository.alterarStatus(idNumero, accountId, 'encerrada');
    return { mensagem: 'Aula encerrada com sucesso' };
  }

  async gerarPorEscala({ escala_id, data_inicio, data_fim }, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    if (!escala_id || !data_inicio || !data_fim) throw new AppError('Parâmetros inválidos', 400);

    const escala = await escalaRepository.buscarPorId(escala_id, accountId);
    if (!escala) throw new AppError('Escala não encontrada', 404);
    if (!escala.ativo) throw new AppError('Não é possível gerar agenda a partir de uma escala desativada', 400);

    // strategy: iterate dates between data_inicio and data_fim, match dias_semana and create agenda entries
    const inicio = new Date(data_inicio);
    const fim = new Date(data_fim);
    if (fim < inicio) throw new AppError('data_fim deve ser igual ou posterior a data_inicio', 400);

    const criadoIds = [];
    const ignorados = [];
    for (let d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
      const dia = d.getDay();
      if (escala.dias_semana.includes(dia)) {
        const iso = new Date(d).toISOString().slice(0, 10);
        // deduplicação: pular se já existe agenda para essa escala+data
        const existente = await agendaRepository.verificarExistente(accountId, escala.id, iso);
        if (existente) { ignorados.push(iso); continue; }
        const res = await agendaRepository.criar({
          accountId,
          ctId: escala.ct_id,
          escalaId: escala.id,
          profissionalId: escala.profissional_id,
          modalidadeId: escala.modalidade_id,
          dataAula: iso,
          horaInicio: escala.hora_inicio,
          horaFim: escala.hora_fim,
        });
        criadoIds.push(res.id);
      }
    }

    return {
      mensagem: 'Agenda gerada a partir da escala',
      criado: criadoIds.length,
      ignorados: ignorados.length,
      ids: criadoIds,
    };
  }
}

module.exports = new AgendaAulasService();
