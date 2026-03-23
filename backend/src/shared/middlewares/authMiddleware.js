const { verificarToken } = require('../utils/jwt');
const AppError = require('../errors/AppError');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('Token não informado', 401);
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new AppError('Formato de token inválido', 401);
  }

  const token = parts[1];

  try {
    const dadosToken = verificarToken(token);

    if (!dadosToken || !dadosToken.sub || !dadosToken.accountId || !dadosToken.role) {
      throw new AppError('Token inválido', 401);
    }

    req.user = {
      id: dadosToken.sub,
      accountId: dadosToken.accountId,
      role: dadosToken.role
    };

    return next();
  } catch (error) {
    throw new AppError('Token inválido ou expirado', 401);
  }
}

module.exports = authMiddleware;