const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  enabled: process.env.NODE_ENV !== 'test',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino/file', options: { destination: 1 } }
    : undefined,
  formatters: {
    level(label) {
      return { level: label };
    }
  },
  base: { servico: 'controlador-financeiro' },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ['senha', 'senha_hash', 'senhaHash', 'token', 'authorization', 'req.headers.authorization'],
    censor: '[REDACTED]'
  }
});

module.exports = logger;
