const alunoRepository = require('../repositories/alunoRepository');
const ctRepository = require('../../cts/repositories/ctRepository');
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

    const ctExiste = await ctRepository.buscarPorId(dados.ct_id, accountIdValidado);
    if (!ctExiste) {
      throw this.criarErro('CT não encontrado para a conta informada', 404);
    }

    // Validações de duplicidade
    if (dados.cpf && String(dados.cpf).trim()) {
      const cpfExiste = await alunoRepository.existePorCpf(dados.cpf, accountIdValidado);
      if (cpfExiste) {
        throw this.criarErro('Já existe aluno com este CPF', 409);
      }
    }

    if (dados.nome && dados.data_nascimento) {
      const nomeDataExiste = await alunoRepository.existePorNomeEDataNascimento(
        dados.nome,
        dados.data_nascimento,
        accountIdValidado
      );
      if (nomeDataExiste) {
        throw this.criarErro('Já existe aluno com mesmo nome e data de nascimento', 409);
      }
    }

    if (dados.nome && dados.telefone) {
      const nomeTelefoneExiste = await alunoRepository.existePorNomeETelefone(
        dados.nome,
        dados.telefone,
        accountIdValidado
      );
      if (nomeTelefoneExiste) {
        throw this.criarErro('Já existe aluno com mesmo nome e telefone', 409);
      }
    }

    try {
      return await alunoRepository.criar({
        ...dados,
        accountId: accountIdValidado
      });
    } catch (error) {
      if (error && (error.code === 'ER_DUP_ENTRY' || error.errno === 1062)) {
        const sqlMessage = (error && error.sqlMessage) || '';
        if (sqlMessage.includes('uq_alunos_account_cpf')) {
          throw this.criarErro('CPF já cadastrado', 409);
        }
        if (sqlMessage.includes('uq_alunos_nome_data')) {
          throw this.criarErro('Já existe aluno com mesmo nome e data de nascimento', 409);
        }
        if (sqlMessage.includes('uq_alunos_nome_telefone')) {
          throw this.criarErro('Já existe aluno com mesmo nome e telefone', 409);
        }
        throw this.criarErro('Registro duplicado', 409);
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

    if (dados.ct_id) {
      const ctExiste = await ctRepository.buscarPorId(dados.ct_id, accountIdValidado);
      if (!ctExiste) {
        throw this.criarErro('CT não encontrado para a conta informada', 404);
      }
    }

    // Ajustes para validações de duplicidade (trim obrigatório e fallback para campos)
    const nome = dados.nome ?? alunoExistente.nome;
    const dataNascimento = dados.data_nascimento ?? alunoExistente.data_nascimento;
    const telefone = dados.telefone ?? alunoExistente.telefone;

    // Validações de duplicidade
    if (dados.cpf && String(dados.cpf).trim()) {
      const cpfExiste = await alunoRepository.existePorCpfIgnorandoId(
        dados.cpf,
        accountIdValidado,
        numeroId
      );
      if (cpfExiste) {
        throw this.criarErro('Já existe aluno com este CPF', 409);
      }
    }

    if (nome && dataNascimento) {
      const nomeDataExiste = await alunoRepository.existePorNomeEDataNascimentoIgnorandoId(
        nome,
        dataNascimento,
        accountIdValidado,
        numeroId
      );
      if (nomeDataExiste) {
        throw this.criarErro('Já existe aluno com mesmo nome e data de nascimento', 409);
      }
    }

    if (nome && telefone) {
      const nomeTelefoneExiste = await alunoRepository.existePorNomeETelefoneIgnorandoId(
        nome,
        telefone,
        accountIdValidado,
        numeroId
      );
      if (nomeTelefoneExiste) {
        throw this.criarErro('Já existe aluno com mesmo nome e telefone', 409);
      }
    }

    try {
      return await alunoRepository.atualizar(numeroId, accountIdValidado, dados);
    } catch (error) {
        if (error && (error.code === 'ER_DUP_ENTRY' || error.errno === 1062)) {
          const sqlMessage = (error && error.sqlMessage) || '';
          if (sqlMessage.includes('uq_alunos_account_cpf')) {
            throw this.criarErro('CPF já cadastrado', 409);
          }
          if (sqlMessage.includes('uq_alunos_nome_data')) {
            throw this.criarErro('Já existe aluno com mesmo nome e data de nascimento', 409);
          }
          if (sqlMessage.includes('uq_alunos_nome_telefone')) {
            throw this.criarErro('Já existe aluno com mesmo nome e telefone', 409);
          }
          throw this.criarErro('Registro duplicado', 409);
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