const logger = require('./logger');

const REQUIRED_VARS = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];

function validarEnv() {
  const ausentes = REQUIRED_VARS.filter((v) => !process.env[v]);
  if (ausentes.length > 0) {
    const msg = `Variáveis de ambiente obrigatórias ausentes: ${ausentes.join(', ')}`;
    logger.fatal({ ausentes }, msg);
    throw new Error(msg);
  }
}

module.exports = validarEnv;
