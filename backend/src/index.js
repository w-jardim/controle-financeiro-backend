/**
 * Bootstrap da aplicação
 * 
 * Este arquivo é responsável por:
 * 1. Importar a aplicação configurada (app.js)
 * 2. Iniciar o servidor HTTP
 * 3. Log de status
 * 
 * Não deve conter lógica de negócio ou configuração de middlewares
 */

const app = require('./app');
const logger = require('./shared/utils/logger');
const validarEnv = require('./shared/utils/validarEnv');

// Falha explícita se faltar configuração obrigatória
validarEnv();

const PORTA = process.env.PORT || 3000;

app.listen(PORTA, '0.0.0.0', () => {
  logger.info({ porta: PORTA, ambiente: process.env.NODE_ENV || 'desenvolvimento' }, 'Servidor iniciado');
});