const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env.test')
});

if (process.env.NODE_ENV !== 'test') {
  throw new Error('NODE_ENV deve ser test ao rodar os testes');
}

afterAll(async () => {
  const pool = require('../../src/shared/database/connection');
  await pool.end();
});
