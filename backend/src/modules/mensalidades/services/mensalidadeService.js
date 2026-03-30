const mensalidadeRepository = require('../repositories/mensalidadeRepository');
const alunoRepository = require('../../alunos/repositories/alunoRepository');
const AppError = require('../../../shared/errors/AppError');

const STATUS_VALIDOS = ['pendente', 'pago', 'cancelado'];

class MensalidadeService {
  async listar(query, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const pagina = Number(query.page || query.pagina || 1);
    const limite = Number(query.limit || query.limite || 10);

    if (!Number.isInteger(pagina) || pagina <= 0) throw new AppError('Parâmetro page deve ser um número maior que zero', 400);
    if (!Number.isInteger(limite) || limite <= 0) throw new AppError('Parâmetro limit deve ser um número maior que zero', 400);

    const offset = (pagina - 1) * limite;

    const filters = {};
    if (query.status) filters.status = query.status;
    if (query.aluno_id) filters.aluno_id = Number(query.aluno_id);
    if (query.competencia) filters.competencia = query.competencia;

    const resultado = await mensalidadeRepository.listar({ limite, offset, accountId, filters });

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

    const m = await mensalidadeRepository.buscarPorId(idNumero, accountId);
    if (!m) throw new AppError('Mensalidade não encontrada', 404);
    return m;
  }

  async criar(dados, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const alunoId = Number(dados.aluno_id);
    const competencia = dados.competencia;
    const valor = Number(dados.valor);
    const vencimento = dados.vencimento;
    const observacao = dados.observacao || null;
    const status = 'pendente';

    if (!alunoId || !competencia || dados.valor === undefined || !vencimento) throw new AppError('Campos obrigatórios ausentes', 400);

    // validar formato de competência YYYY-MM
    if (!/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(competencia)) throw new AppError('Competência inválida. Use YYYY-MM', 400);

    // validar valor maior que zero
    if (Number.isNaN(valor) || valor <= 0) throw new AppError('Valor deve ser um número maior que zero', 400);

    const aluno = await alunoRepository.buscarPorId(alunoId, accountId);
    if (!aluno) throw new AppError('Aluno não encontrado ou não pertence à conta', 404);

    const existe = await mensalidadeRepository.existePorAlunoCompetencia(alunoId, competencia, accountId);
    if (existe) throw new AppError('Mensalidade já cadastrada para esse aluno e competência', 409);

    const resultado = await mensalidadeRepository.criar({ accountId, alunoId, competencia, valor, vencimento, status, data_pagamento: dados.data_pagamento || null, observacao });
    return { mensagem: 'Mensalidade criada com sucesso', id: resultado.id };
  }

  async atualizar(id, dados, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const idNumero = Number(id);
    if (!Number.isInteger(idNumero) || idNumero <= 0) throw new AppError('ID inválido', 400);

    const existente = await mensalidadeRepository.buscarPorId(idNumero, accountId);
    if (!existente) throw new AppError('Mensalidade não encontrada', 404);

    if (dados.status !== undefined && !STATUS_VALIDOS.includes(dados.status)) throw new AppError('Status inválido', 400);

    // checar duplicidade se mudar aluno_id ou competencia
    const novoAlunoId = dados.aluno_id !== undefined ? Number(dados.aluno_id) : existente.aluno_id;
    const novaCompetencia = dados.competencia !== undefined ? dados.competencia : existente.competencia;
    if (dados.aluno_id !== undefined || dados.competencia !== undefined) {
      const found = await mensalidadeRepository.buscarPorAlunoCompetencia(novoAlunoId, novaCompetencia, accountId);
      if (found && found.id !== idNumero) throw new AppError('Mensalidade já cadastrada para esse aluno e competência', 409);
    }

    const resultado = await mensalidadeRepository.atualizar(idNumero, accountId, dados);
    if (!resultado.afetadas) throw new AppError('Não foi possível atualizar a mensalidade', 400);

    const atualizado = await mensalidadeRepository.buscarPorId(idNumero, accountId);
    return atualizado;
  }

  async pagar(id, dataPagamento, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const idNumero = Number(id);
    if (!Number.isInteger(idNumero) || idNumero <= 0) throw new AppError('ID inválido', 400);

    const existente = await mensalidadeRepository.buscarPorId(idNumero, accountId);
    if (!existente) throw new AppError('Mensalidade não encontrada', 404);

    // impedir pagar mensalidade cancelada
    if (existente.status === 'cancelado') throw new AppError('Não é possível pagar uma mensalidade cancelada', 400);

    // impedir pagar novamente se já está paga
    if (existente.status === 'pago') throw new AppError('Mensalidade já está marcada como paga', 400);

    const data = dataPagamento || new Date().toISOString().split('T')[0];
    const resultado = await mensalidadeRepository.marcarPago(idNumero, accountId, data);
    if (!resultado.afetadas) throw new AppError('Não foi possível marcar como paga', 400);

    const atualizado = await mensalidadeRepository.buscarPorId(idNumero, accountId);
    return atualizado;
  }

  async cancelar(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const idNumero = Number(id);
    if (!Number.isInteger(idNumero) || idNumero <= 0) throw new AppError('ID inválido', 400);

    const existente = await mensalidadeRepository.buscarPorId(idNumero, accountId);
    if (!existente) throw new AppError('Mensalidade não encontrada', 404);

    // impedir cancelar mensalidade já paga
    if (existente.status === 'pago') throw new AppError('Não é possível cancelar uma mensalidade já paga', 400);

    // impedir cancelar novamente
    if (existente.status === 'cancelado') throw new AppError('Mensalidade já está cancelada', 400);

    const resultado = await mensalidadeRepository.cancelar(idNumero, accountId);
    if (!resultado.afetadas) throw new AppError('Não foi possível cancelar a mensalidade', 400);

    const atualizado = await mensalidadeRepository.buscarPorId(idNumero, accountId);
    return atualizado;
  }
}

module.exports = new MensalidadeService();
