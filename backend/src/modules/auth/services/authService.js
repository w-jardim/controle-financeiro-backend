const bcrypt = require('bcryptjs');
const pool = require('../../../shared/database/connection');
const authRepository = require('../repositories/authRepository');
const AppError = require('../../../shared/errors/AppError');
const { gerarToken } = require('../../../shared/utils/jwt');

class AuthService {
  async cadastrarContaComOwner({
    nomeResponsavel,
    email,
    senha,
    nomeAccount,
    tipoAccount,
    nomeCtInicial
  }) {
    if (!nomeResponsavel) throw new AppError('Nome do responsável é obrigatório', 400);
    if (!email) throw new AppError('Email é obrigatório', 400);
    if (!senha) throw new AppError('Senha é obrigatória', 400);
    if (!nomeAccount) throw new AppError('Nome da conta é obrigatório', 400);
    if (!tipoAccount) throw new AppError('Tipo de conta é obrigatório', 400);

    const tiposValidos = ['ct_owner', 'profissional_autonomo'];
    if (!tiposValidos.includes(tipoAccount)) {
      throw new AppError('Tipo de conta inválido', 400);
    }

    if (senha.length < 6) {
      throw new AppError('Senha deve ter pelo menos 6 caracteres', 400);
    }

    const usuarioExistente = await authRepository.buscarUsuarioPorEmail(email);
    if (usuarioExistente) {
      throw new AppError('Email já cadastrado', 409);
    }

    const senhaHash = bcrypt.hashSync(senha, 10);

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const accountId = await authRepository.criarAccount(
        { nome: nomeAccount, tipo: tipoAccount, plano: 'basic', status: 'ativo' },
        connection
      );

      const userId = await authRepository.criarUsuario(
        { nome: nomeResponsavel, email, senhaHash },
        connection
      );

      await authRepository.vincularUsuarioNaConta(
        { accountId, userId, role: 'owner' },
        connection
      );

      let ctId = null;

      if (tipoAccount === 'ct_owner' && nomeCtInicial) {
        ctId = await authRepository.criarCtInicial(
          { accountId, nome: nomeCtInicial },
          connection
        );
      }

      await connection.commit();

      return {
        mensagem: 'Cadastro realizado com sucesso',
        accountId,
        userId,
        ctId
      };
    } catch (erro) {
      await connection.rollback();
      throw erro;
    } finally {
      connection.release();
    }
  }

  async login({ email, senha }) {
    if (!email) throw new AppError('Email é obrigatório', 400);
    if (!senha) throw new AppError('Senha é obrigatória', 400);

    const usuario = await authRepository.buscarUsuarioPorEmail(email);

    if (!usuario) throw new AppError('Email ou senha incorretos', 401);

    const senhaValida = bcrypt.compareSync(senha, usuario.senha_hash);

    if (!senhaValida) throw new AppError('Email ou senha incorretos', 401);

    const contexto = await authRepository.buscarContextoPrincipalDoUsuario(usuario.id);

    if (!contexto) throw new AppError('Usuário sem conta', 403);

    const token = gerarToken({
      sub: usuario.id,
      accountId: contexto.account_id,
      role: contexto.role
    });

    return {
      mensagem: 'Login realizado com sucesso',
      token
    };
  }
}

module.exports = new AuthService();