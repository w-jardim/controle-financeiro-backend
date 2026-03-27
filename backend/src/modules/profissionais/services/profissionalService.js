const profissionalRepository = require('../repositories/profissionalRepository');
const AppError = require('../../../shared/errors/AppError');

class ProfissionalService {
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

    const resultado = await profissionalRepository.listar({
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
      throw new AppError('ID do profissional inválido', 400);
    }

    const profissional = await profissionalRepository.buscarPorId(idNumero, accountId);

    if (!profissional) {
      throw new AppError('Profissional não encontrado', 404);
    }

    return profissional;
  }

  async criar(dados, accountId) {
    if (!accountId) {
      throw new AppError('accountId é obrigatório', 400);
    }

    const nome = dados?.nome?.trim();

    if (!nome) {
      throw new AppError('O campo nome é obrigatório', 400);
    }

    const telefone = dados?.telefone?.trim() || null;
    const email = dados?.email?.trim() || null;
    const especialidade = dados?.especialidade?.trim() || null;

    // Validação de duplicidade: nome + telefone
    if (nome && telefone) {
      const jaExiste = await profissionalRepository.existePorNomeETelefone(
        nome,
        telefone,
        accountId
      );

      if (jaExiste) {
        throw new AppError('Já existe profissional com mesmo nome e telefone', 409);
      }
    }

    try {
      const resultado = await profissionalRepository.criar({
        accountId,
        nome,
        email,
        telefone,
        especialidade
      });

      return {
        mensagem: 'Profissional criado com sucesso',
        id: resultado.id
      };
    } catch (error) {
      if (error && (error.code === 'ER_DUP_ENTRY' || error.errno === 1062)) {
        throw new AppError('Já existe profissional com mesmo nome e telefone', 409);
      }
      throw error;
    }
  }

  async atualizar(id, dados, accountId) {
    if (!accountId) {
      throw new AppError('accountId é obrigatório', 400);
    }

    const idNumero = Number(id);

    if (!Number.isInteger(idNumero) || idNumero <= 0) {
      throw new AppError('ID do profissional inválido', 400);
    }

    const profissionalExistente = await profissionalRepository.buscarPorId(
      idNumero,
      accountId
    );

    if (!profissionalExistente) {
      throw new AppError('Profissional não encontrado', 404);
    }

    const nome = dados?.nome?.trim() || profissionalExistente.nome;
    const telefone = dados?.telefone?.trim() || profissionalExistente.telefone;

    // Validação de duplicidade: nome + telefone (ignorando o próprio registro)
    if (nome && telefone) {
      const jaExiste = await profissionalRepository.existePorNomeETelefoneIgnorandoId(
        nome,
        telefone,
        accountId,
        idNumero
      );

      if (jaExiste) {
        throw new AppError('Já existe profissional com mesmo nome e telefone', 409);
      }
    }

    const dadosAtualizacao = {};

    if (dados.nome !== undefined) {
      dadosAtualizacao.nome = dados.nome.trim();
    }
    if (dados.email !== undefined) {
      dadosAtualizacao.email = dados.email?.trim() || null;
    }
    if (dados.telefone !== undefined) {
      dadosAtualizacao.telefone = dados.telefone?.trim() || null;
    }
    if (dados.especialidade !== undefined) {
      dadosAtualizacao.especialidade = dados.especialidade?.trim() || null;
    }
    if (dados.ativo !== undefined) {
      dadosAtualizacao.ativo = Boolean(dados.ativo);
    }

    try {
      const resultado = await profissionalRepository.atualizar(
        idNumero,
        accountId,
        dadosAtualizacao
      );

      if (!resultado.afetadas) {
        throw new AppError('Não foi possível atualizar o profissional', 400);
      }

      const profissionalAtualizado = await profissionalRepository.buscarPorId(
        idNumero,
        accountId
      );

      return profissionalAtualizado;
    } catch (error) {
      if (error && (error.code === 'ER_DUP_ENTRY' || error.errno === 1062)) {
        throw new AppError('Já existe profissional com mesmo nome e telefone', 409);
      }
      throw error;
    }
  }

  async desativar(id, accountId) {
    if (!accountId) {
      throw new AppError('accountId é obrigatório', 400);
    }

    const idNumero = Number(id);

    if (!Number.isInteger(idNumero) || idNumero <= 0) {
      throw new AppError('ID do profissional inválido', 400);
    }

    const profissional = await profissionalRepository.buscarPorId(idNumero, accountId);

    if (!profissional) {
      throw new AppError('Profissional não encontrado', 404);
    }

    await profissionalRepository.alterarStatus(idNumero, accountId, false);

    return {
      mensagem: 'Profissional desativado com sucesso'
    };
  }

  async ativar(id, accountId) {
    if (!accountId) {
      throw new AppError('accountId é obrigatório', 400);
    }

    const idNumero = Number(id);

    if (!Number.isInteger(idNumero) || idNumero <= 0) {
      throw new AppError('ID do profissional inválido', 400);
    }

    const profissional = await profissionalRepository.buscarPorId(idNumero, accountId);

    if (!profissional) {
      throw new AppError('Profissional não encontrado', 404);
    }

    await profissionalRepository.alterarStatus(idNumero, accountId, true);

    return {
      mensagem: 'Profissional ativado com sucesso'
    };
  }
}

module.exports = new ProfissionalService();
