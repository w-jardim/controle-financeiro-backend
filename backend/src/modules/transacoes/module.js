/**
 * Módulo de Transações
 * 
 * Este é o entry point do módulo de transações.
 * Exporta funções para registrar as rotas no aplicativo principal.
 * 
 * Uso em app.js:
 * const { registrarRotasTransacoes } = require('./modules/transacoes/module');
 * registrarRotasTransacoes(app);
 */

const rotasTransacoes = require('./routes/transacaoRoutes');

/**
 * Registra todas as rotas do módulo de transações no aplicativo
 * @param {Express} app - Instância do Express
 */
function registrarRotasTransacoes(app) {
  app.use('/transacoes', rotasTransacoes);
}

module.exports = {
  registrarRotasTransacoes
};
