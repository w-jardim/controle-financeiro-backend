const alunoRepository = require('../repositories/alunoRepository');
const AppError = require('../../../shared/errors/AppError');

class AlunoService {
  criarErro(mensagem, status = 400) {
    return new AppError(mensagem, status);
  }

  validarAccountId(accountId) {
    const numeroAccountId = Number(accountId);

    if (!Number.isInteger(numeroAccountId) || numeroAccountId <= 0) {
      throw this.criarErro('accountId é obrigatório', 400);
    }

    return numeroAccountId;
  }

  validarId(id) {
    const numeroId = Number(id);

    if (!Number.isInteger(numeroId) || numeroId <= 0) {
      throw this.criarErro('ID deve ser um número válido e maior que zero', 400);
    }

    return numeroId;
  }

  async listar(query, accountId) {
    const accountIdValidado = this.validarAccountId(accountId);

    return alunoRepository.listar({
      query,
      accountId: accountIdValidado
    });
  }

  async buscarPorId(id, accountId) {
    const numeroId = this.validarId(id);
    const accountIdValidado = this.validarAccountId(accountId);

    const aluno = await alunoRepository.buscarPorId(numeroId, accountIdValidado);

    if (!aluno) {
      throw this.criarErro('Aluno não encontrado', 404);
    }

    return aluno;
  }

  async criar(dados, accountId) {
    const accountIdValidado = this.validarAccountId(accountId);

    if (!dados.nome || !String(dados.nome).trim()) {
      throw this.criarErro('O campo nome é obrigatório', 400);
    }

    if (!dados.ct_id) {
      throw this.criarErro('O campo ct_id é obrigatório', 400);
    }

    try {
      return await alunoRepository.criar({
        ...dados,
        accountId: accountIdValidado
      });
    } catch (error) {
      if (error && (error.code === 'ER_DUP_ENTRY' || error.errno === 1062)) {
        throw this.criarErro('CPF já cadastrado', 409);
      }
      throw error;
    }
  }

  async atualizar(id, dados, accountId) {
    const numeroId = this.validarId(id);
    const accountIdValidado = this.validarAccountId(accountId);

    const alunoExistente = await alunoRepository.buscarPorId(
      numeroId,
      accountIdValidado
    );

    if (!alunoExistente) {
      throw this.criarErro('Aluno não encontrado', 404);
    }

    try {
      return await alunoRepository.atualizar(numeroId, accountIdValidado, dados);
    } catch (error) {
      if (error && (error.code === 'ER_DUP_ENTRY' || error.errno === 1062)) {
        throw this.criarErro('CPF já cadastrado', 409);
      }
      throw error;
    }
  }

  async desativar(id, accountId) {
    const numeroId = this.validarId(id);
    const accountIdValidado = this.validarAccountId(accountId);

    const alunoExistente = await alunoRepository.buscarPorId(
      numeroId,
      accountIdValidado
    );

    if (!alunoExistente) {
      throw this.criarErro('Aluno não encontrado', 404);
    }

    return alunoRepository.desativar(numeroId, accountIdValidado);
  }

  async ativar(id, accountId) {
    const numeroId = this.validarId(id);
    const accountIdValidado = this.validarAccountId(accountId);

    const alunoExistente = await alunoRepository.buscarPorId(
      numeroId,
      accountIdValidado
    );

    if (!alunoExistente) {
      throw this.criarErro('Aluno não encontrado', 404);
    }

    return alunoRepository.ativar(numeroId, accountIdValidado);
  }
}

module.exports = new AlunoService();