const authService = require('../services/authService');
const asyncHandler = require('../../../shared/utils/asyncHandler');

const cadastrar = asyncHandler(async (req, res) => {
  const resultado = await authService.cadastrarContaComOwner(req.body);
  return res.status(201).json(resultado);
});

const login = asyncHandler(async (req, res) => {
  const resultado = await authService.login(req.body);
  return res.status(200).json(resultado);
});

module.exports = {
  cadastrar,
  login
};
