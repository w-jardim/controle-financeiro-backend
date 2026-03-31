const path = require('path');

// Carregar variáveis de ambiente de teste ANTES de qualquer import
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env.test')
});

// Validar que as variáveis críticas foram carregadas
if (!process.env.DB_NAME) {
  throw new Error('ERRO: DB_NAME não foi carregado. Verifique se backend/.env.test existe.');
}

if (process.env.NODE_ENV !== 'test') {
  throw new Error('NODE_ENV deve ser test ao rodar os testes');
}

// Debug: mostrar variáveis carregadas (só na primeira execução)
if (process.env.DEBUG_ENV === 'true') {
  console.log('✓ Variáveis de ambiente carregadas:');
  console.log('  DB_NAME:', process.env.DB_NAME);
  console.log('  DB_HOST:', process.env.DB_HOST);
  console.log('  DB_PORT:', process.env.DB_PORT);
  console.log('  DB_USER:', process.env.DB_USER);
}

// Nota: o fechamento do pool é tratado em globalTeardown.js

// Centralizar fechamento do pool após todos os testes
const pool = require('../../src/shared/database/connection');

afterAll(async () => {
  try {
    if (pool && typeof pool.end === 'function') {
      await pool.end();
    }
  } catch (_) {}
});
