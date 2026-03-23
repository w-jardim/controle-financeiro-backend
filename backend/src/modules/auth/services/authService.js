const bcrypt = require('bcryptjs');
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
    // Validações obrigatórias
    if (!nomeResponsavel || nomeResponsavel.trim() === '') {
      throw new AppError('Nome do responsável é obrigatório', 400);
    }

    if (!email || email.trim() === '') {
      throw new AppError('Email é obrigatório', 400);
    }

    if (!senha || senha.trim() === '') {
      throw new AppError('Senha é obrigatória', 400);
    }

    if (!nomeAccount || nomeAccount.trim() === '') {
      throw new AppError('Nome da conta é obrigatório', 400);
    }

    if (!tipoAccount || tipoAccount.trim() === '') {
      throw new AppError('Tipo de conta é obrigatório', 400);
    }

    // Validar tipo de conta
    const tipos_validos = ['ct_owner', 'profissional_autonomo'];
    if (!tipos_validos.includes(tipoAccount)) {
      throw new AppError(
        'Tipo de conta deve ser ct_owner ou profissional_autonomo',
        400
      );
    }

    // Validar comprimento da senha (mínimo 6 caracteres)
    if (senha.length < 6) {
      throw new AppError('Senha deve ter pelo menos 6 caracteres', 400);
    }

    // Verificar se email já existe
    const usuarioExistente = await authRepository.buscarUsuarioPorEmail(email);
    if (usuarioExistente) {
      throw new AppError('Email já cadastrado', 409);
    }

    // Gerar hash da senha (bcryptjs - síncrono para simplicidade)
    const senhaHash = bcrypt.hashSync(senha, 10);

    // Criar account
    const accountId = await authRepository.criarAccount({
      nome: nomeAccount,
      tipo: tipoAccount,
      plano: 'basic',
      status: 'ativo'
    });

    // Criar usuário
    const userId = await authRepository.criarUsuario({
      nome: nomeResponsavel,
      email: email,
      senhaHash: senhaHash
    });

    // Vincular usuário na account com role owner
    await authRepository.vincularUsuarioNaConta({
      accountId: accountId,
      userId: userId,
      role: 'owner'
    });

    // Se ct_owner e tiver nome CT inicial, criar o CT
    let ctId = null;
    if (tipoAccount === 'ct_owner' && nomeCtInicial && nomeCtInicial.trim() !== '') {
      ctId = await authRepository.criarCtInicial({
        accountId: accountId,
        nome: nomeCtInicial
      });
    }

    return {
      mensagem: 'Cadastro realizado com sucesso',
      accountId,
      userId,
      ctId
    };
  }

  async login({ email, senha }) {
    // Validações obrigatórias
    if (!email || email.trim() === '') {
      throw new AppError('Email é obrigatório', 400);
    }

    if (!senha || senha.trim() === '') {
      throw new AppError('Senha é obrigatória', 400);
    }

    // Buscar usuário pelo email
    const usuario = await authRepository.buscarUsuarioPorEmail(email);
    if (!usuario) {
      throw new AppError('Email ou senha incorretos', 401);
    }

    // Validar acesso do usuário
    if (usuario.ativo === false || usuario.ativo === 0) {
      throw new AppError('Usuário inativo', 403);
    }

    // Comparar senha fornecida com hash armazenado (bcryptjs síncrono)
    const senhaValida = bcrypt.compareSync(senha, usuario.senha_hash);
    if (!senhaValida) {
      throw new AppError('Email ou senha incorretos', 401);
    }

    // Gerar token JWT
    const token = gerarToken({
      userId: usuario.id,
      email: usuario.email
    });

    return {
      mensagem: 'Login realizado com sucesso',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    };
  }
}

module.exports = new AuthService();
