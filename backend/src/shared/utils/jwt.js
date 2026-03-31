const jwt = require('jsonwebtoken');

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não definido nas variáveis de ambiente');
  }
  return secret;
}

function gerarToken(payload) {
  return jwt.sign(payload, getSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

function verificarToken(token) {
  return jwt.verify(token, getSecret());
}

module.exports = {
  gerarToken,
  verificarToken
};