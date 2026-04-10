const path = require('path');

// Carregar variaveis de ambiente de teste ANTES de qualquer import
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env.test')
});

if (process.env.NODE_ENV !== 'test') {
  throw new Error('NODE_ENV deve ser test ao rodar os testes');
}

// Permite que testes unitarios e smoke tests rodem mesmo sem um backend/.env.test real.
// Os testes que dependem de banco continuam falhando no ponto correto, ao tentar conectar.
process.env.DB_HOST ||= '127.0.0.1';
process.env.DB_PORT ||= '3306';
process.env.DB_USER ||= 'root';
process.env.DB_PASSWORD ||= 'root';
process.env.DB_NAME ||= 'gestao_ct_test';
process.env.JWT_SECRET ||= 'test-secret';

// Debug: mostrar variaveis carregadas (so na primeira execucao)
if (process.env.DEBUG_ENV === 'true') {
  console.log('Variaveis de ambiente carregadas:');
  console.log('  DB_NAME:', process.env.DB_NAME);
  console.log('  DB_HOST:', process.env.DB_HOST);
  console.log('  DB_PORT:', process.env.DB_PORT);
  console.log('  DB_USER:', process.env.DB_USER);
}

// Nota: o fechamento do pool e tratado em globalTeardown.js

// Centralizar fechamento do pool apos todos os testes
const pool = require('../../src/shared/database/connection');

afterAll(async () => {
  try {
    if (pool && typeof pool.end === 'function') {
      await pool.end();
    }
  } catch (_) {}
});
