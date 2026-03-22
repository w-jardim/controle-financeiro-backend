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

console.log('🚀 APLICAÇÃO INICIADA:', new Date().toLocaleString());

const PORTA = process.env.PORT || 3000;

app.listen(PORTA, '0.0.0.0', () => {
  console.log(`✓ Servidor iniciado na porta ${PORTA}`);
  console.log(`✓ Ambiente: ${process.env.NODE_ENV || 'desenvolvimento'}`);
  console.log(`✓ Acesse: http://localhost:${PORTA}`);
});