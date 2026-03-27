const modalidadeRepository = require('../repositories/modalidadeRepository');
const AppError = require('../../../shared/errors/AppError');

class ModalidadeService {
  async listar(query, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const pagina = Number(query.page || query.pagina || 1);
    const limite = Number(query.limit || query.limite || 10);

    if (!Number.isInteger(pagina) || pagina <= 0) {
      throw new AppError('Parâmetro page deve ser um número maior que zero', 400);
    }

    if (!Number.isInteger(limite) || limite <= 0) {
      throw new AppError('Parâmetro limit deve ser um número maior que zero', 400);
    }

    const offset = (pagina - 1) * limite;

    const resultado = await modalidadeRepository.listar({ limite, offset, accountId });

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
    if (!Number.isInteger(idNumero) || idNumero <= 0) {
      throw new AppError('ID da modalidade inválido', 400);
    }

    const modalidade = await modalidadeRepository.buscarPorId(idNumero, accountId);
    if (!modalidade) throw new AppError('Modalidade não encontrada', 404);

    return modalidade;
  }

  async criar(dados, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const nome = dados?.nome?.trim();
    if (!nome) throw new AppError('O campo nome é obrigatório', 400);

    const descricao = dados?.descricao?.trim() || null;

    try {
      const resultado = await modalidadeRepository.criar({ accountId, nome, descricao });
      return { mensagem: 'Modalidade criada com sucesso', id: resultado.id };
    } catch (error) {
      if (error && (error.code === 'ER_DUP_ENTRY' || error.errno === 1062)) {
        throw new AppError('Já existe modalidade com mesmo nome nesta conta', 409);
      }
      throw error;
    }
  }

  async atualizar(id, dados, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);

    const idNumero = Number(id);
    if (!Number.isInteger(idNumero) || idNumero <= 0) {
      throw new AppError('ID da modalidade inválido', 400);
    }

    const existente = await modalidadeRepository.buscarPorId(idNumero, accountId);
    if (!existente) throw new AppError('Modalidade não encontrada', 404);

    const nome = dados?.nome?.trim() || existente.nome;

    if (nome) {
      const jaExiste = await modalidadeRepository.existePorNomeIgnorandoId(nome, accountId, idNumero);
      if (jaExiste) throw new AppError('Já existe modalidade com mesmo nome nesta conta', 409);
    }

    const dadosAtualizacao = {};
    if (dados.nome !== undefined) dadosAtualizacao.nome = dados.nome.trim();
    if (dados.descricao !== undefined) dadosAtualizacao.descricao = dados.descricao?.trim() || null;
    if (dados.ativo !== undefined) dadosAtualizacao.ativo = Boolean(dados.ativo);

    const resultado = await modalidadeRepository.atualizar(idNumero, accountId, dadosAtualizacao);
    if (!resultado.afetadas) throw new AppError('Não foi possível atualizar a modalidade', 400);

    const atualizada = await modalidadeRepository.buscarPorId(idNumero, accountId);
    return atualizada;
  }

  async desativar(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const idNumero = Number(id);
    if (!Number.isInteger(idNumero) || idNumero <= 0) throw new AppError('ID da modalidade inválido', 400);

    const existente = await modalidadeRepository.buscarPorId(idNumero, accountId);
    if (!existente) throw new AppError('Modalidade não encontrada', 404);

    await modalidadeRepository.alterarStatus(idNumero, accountId, false);
    return { mensagem: 'Modalidade desativada com sucesso' };
  }

  async ativar(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    const idNumero = Number(id);
    if (!Number.isInteger(idNumero) || idNumero <= 0) throw new AppError('ID da modalidade inválido', 400);

    const existente = await modalidadeRepository.buscarPorId(idNumero, accountId);
    if (!existente) throw new AppError('Modalidade não encontrada', 404);

    await modalidadeRepository.alterarStatus(idNumero, accountId, true);
    return { mensagem: 'Modalidade ativada com sucesso' };
  }
}

module.exports = new ModalidadeService();
