const path = require('path');

// Garantir que dotenv está carregado (fallback de segurança)
// Jest já carrega via setupFilesAfterEnv, mas isso garante mesmo se executado diretamente
if (!process.env.DB_NAME && process.env.NODE_ENV === 'test') {
  require('dotenv').config({
    path: path.resolve(__dirname, '../../.env.test')
  });
}

const conexao = require('../../src/shared/database/connection');

const TABELAS = [
  // ordem: tabelas filhas primeiro para evitar violação de FK ao truncar
  'presencas',
  'mensalidades',
  'agendamentos',
  'agenda_aulas',
  'escala_dias',
  'escalas',
  'transacoes',
  'horarios_aula',
  'alunos',
  'profissionais',
  'modalidades',
  'cts',
  'account_users',
  'users',
  'accounts'
];

async function limparBanco() {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('limparBanco só pode ser executado em NODE_ENV=test');
  }

  const dbName = process.env.DB_NAME || '';
  if (!dbName.includes('test')) {
    throw new Error(`Banco "${dbName}" não parece ser de teste. Abortando.`);
  }

  // Use a single dedicated connection so session variables (FOREIGN_KEY_CHECKS)
  // apply to all subsequent statements. When using a pool, execute() may
  // run on different connections, making SET FOREIGN_KEY_CHECKS ineffective.
  const conn = await conexao.getConnection();
  try {
    await conn.execute('SET FOREIGN_KEY_CHECKS = 0');

    for (const tabela of TABELAS) {
      // TRUNCATE can fail if table doesn't exist; surface a clearer error
      await conn.execute(`TRUNCATE TABLE ${tabela}`);
    }

    await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
  } finally {
    // release the dedicated connection back to the pool
    conn.release();
  }
}

async function fecharConexao() {
  await conexao.end();
}

module.exports = {
  limparBanco,
  fecharConexao,
  conexao
};
