const authService = require('../services/authService');
const asyncHandler = require('../../../shared/utils/asyncHandler');
const { sucesso } = require('../../../shared/utils/response');

const cadastrar = asyncHandler(async (req, res) => {
  const resultado = await authService.cadastrarContaComOwner(req.body);
  return sucesso(res, {
    mensagem: resultado.mensagem,
    accountId: resultado.accountId,
    userId: resultado.userId,
    ctId: resultado.ctId
  }, null, 201);
});

const login = asyncHandler(async (req, res) => {
  const resultado = await authService.login(req.body);
  return sucesso(res, resultado);
});

module.exports = {
  cadastrar,
  login
};