const authService = require('../services/authService');
const asyncHandler = require('../../../shared/utils/asyncHandler');
const AppError = require('../../../shared/errors/AppError');

const cadastrar = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError('Corpo da requisição vazio', 400);
  }

  const resultado = await authService.cadastrarContaComOwner(req.body);

  return res.status(201).json({
    mensagem: resultado.mensagem,
    accountId: resultado.accountId,
    userId: resultado.userId,
    ctId: resultado.ctId
  });
});

const login = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError('Corpo da requisição vazio', 400);
  }

  const { email, senha } = req.body;

  const { mensagem, token, usuario, account } =
    await authService.login({ email, senha });

  return res.status(200).json({
    mensagem,
    token,
    usuario,
    account
  });
});

module.exports = {
  cadastrar,
  login
};