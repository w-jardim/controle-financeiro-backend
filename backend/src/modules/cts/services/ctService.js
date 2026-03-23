const ctRepository = require('../repositories/ctRepository');
const AppError = require('../../../shared/errors/AppError');

class CtService {
  async listar(query, accountId) {
    if (!accountId) {
      throw new AppError('accountId é obrigatório', 400);
    }

    const pagina = Number(query.page || query.pagina || 1);
    const limite = Number(query.limit || query.limite || 10);

    if (!Number.isInteger(pagina) || pagina <= 0) {
      throw new AppError('Parâmetro page deve ser um número maior que zero', 400);
    }

    if (!Number.isInteger(limite) || limite <= 0) {
      throw new AppError('Parâmetro limit deve ser um número maior que zero', 400);
    }

    const offset = (pagina - 1) * limite;

    const resultado = await ctRepository.listar({
      limite,
      offset,
      accountId
    });

    return {
      pagina,
      limite,
      total: resultado.total,
      totalPaginas: Math.ceil(resultado.total / limite),
      dados: resultado.dados
    };
  }

  async buscarPorId(id, accountId) {
    if (!accountId) {
      throw new AppError('accountId é obrigatório', 400);
    }

    const idNumero = Number(id);

    if (!Number.isInteger(idNumero) || idNumero <= 0) {
      throw new AppError('ID do CT inválido', 400);
    }

    const ct = await ctRepository.buscarPorId(idNumero, accountId);

    if (!ct) {
      throw new AppError('CT não encontrado', 404);
    }

    return ct;
  }

  async criar(dados, accountId) {
    if (!accountId) {
      throw new AppError('accountId é obrigatório', 400);
    }

    const nome = dados?.nome?.trim();

    if (!nome) {
      throw new AppError('O campo nome é obrigatório', 400);
    }

    const nomeJaExiste = await ctRepository.existePorNome(nome, accountId);

    if (nomeJaExiste) {
      throw new AppError('Já existe um CT com este nome', 409);
    }

    const resultado = await ctRepository.criar({
      accountId,
      nome
    });

    return {
      mensagem: 'CT criado com sucesso',
      id: resultado.id
    };
  }

  async atualizar(id, dados, accountId) {
    if (!accountId) {
      throw new AppError('accountId é obrigatório', 400);
    }

    const idNumero = Number(id);

    if (!Number.isInteger(idNumero) || idNumero <= 0) {
      throw new AppError('ID do CT inválido', 400);
    }

    const nome = dados?.nome?.trim();

    if (!nome) {
      throw new AppError('O campo nome é obrigatório', 400);
    }

    const ctExistente = await ctRepository.buscarPorId(idNumero, accountId);

    if (!ctExistente) {
      throw new AppError('CT não encontrado', 404);
    }

    const nomeJaExiste = await ctRepository.existePorNomeIgnorandoId(
      nome,
      idNumero,
      accountId
    );

    if (nomeJaExiste) {
      throw new AppError('Já existe um CT com este nome', 409);
    }

    const ativo =
      dados?.ativo !== undefined ? Boolean(dados.ativo) : Boolean(ctExistente.ativo);

    const resultado = await ctRepository.atualizar(idNumero, accountId, {
      nome,
      ativo
    });

    if (!resultado.afetadas) {
      throw new AppError('Não foi possível atualizar o CT', 400);
    }

    return {
      mensagem: 'CT atualizado com sucesso'
    };
  }

  async desativar(id, accountId) {
    if (!accountId) {
      throw new AppError('accountId é obrigatório', 400);
    }

    const idNumero = Number(id);

    if (!Number.isInteger(idNumero) || idNumero <= 0) {
      throw new AppError('ID do CT inválido', 400);
    }

    const ctExistente = await ctRepository.buscarPorId(idNumero, accountId);

    if (!ctExistente) {
      throw new AppError('CT não encontrado', 404);
    }

    if (!Boolean(ctExistente.ativo)) {
      return {
        mensagem: 'CT já está desativado'
      };
    }

    const resultado = await ctRepository.desativar(idNumero, accountId);

    if (!resultado.afetadas) {
      throw new AppError('Não foi possível desativar o CT', 400);
    }

    return {
      mensagem: 'CT desativado com sucesso'
    };
  }

  async ativar(id, accountId) {
    if (!accountId) {
      throw new AppError('accountId é obrigatório', 400);
    }

    const idNumero = Number(id);

    if (!Number.isInteger(idNumero) || idNumero <= 0) {
      throw new AppError('ID do CT inválido', 400);
    }

    const ctExistente = await ctRepository.buscarPorId(idNumero, accountId);

    if (!ctExistente) {
      throw new AppError('CT não encontrado', 404);
    }

    if (Boolean(ctExistente.ativo)) {
      return {
        mensagem: 'CT já está ativo'
      };
    }

    const resultado = await ctRepository.ativar(idNumero, accountId);

    if (!resultado.afetadas) {
      throw new AppError('Não foi possível ativar o CT', 400);
    }

    return {
      mensagem: 'CT ativado com sucesso'
    };
  }
}

module.exports = new CtService();