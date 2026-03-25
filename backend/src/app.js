const express = require('express');
const packageJson = require('../package.json');
const corsMiddleware = require('./shared/middlewares/corsConfig');
const errorHandler = require('./shared/middlewares/errorHandler');
const conexao = require('./shared/database/connection');
const { registrarRotasTransacoes } = require('./modules/transacoes/module');
const { registrarRotasAuth } = require('./modules/auth/module');
const { registrarRotasCts } = require('./modules/cts/module');
const authMiddleware = require('./shared/middlewares/authMiddleware');
const { registrarRotasAlunos } = require('./modules/alunos/module');
/**
 * Cria e configura a aplicação Express
 * Não faz listen neste arquivo
 * 
 * Uso:
 * const app = require('./app');
 * app.listen(3000);
 */

const app = express();

// ============================================
// Middleware Global
// ============================================

app.use(express.json());
app.use(corsMiddleware);

// ============================================
// Rotas de Saúde e Status
// ============================================

app.get('/saude', (req, res) => {
  res.status(200).json({
    status: 'ok',
    mensagem: 'API de Gestão de CT funcionando',
    timestamp: new Date().toISOString()
  });
});

app.get('/ping', (req, res) => {
  res.status(200).json({
    rota: 'ping',
    status: 'ok'
  });
});

app.get('/teste-banco', async (req, res, next) => {
  try {
    const [resultado] = await conexao.query('SELECT 1 AS banco_ativo');

    res.status(200).json({
      status: 'ok',
      mensagem: 'Conexão com MySQL funcionando',
      resultado
    });
  } catch (erro) {
    next(erro);
  }
});

// ============================================
// Rota Raiz (Info da API)
// ============================================

app.get('/', (req, res) => {
  res.status(200).json({
    mensagem: 'Bem-vindo à API de Gestão de CT de Artes Marciais',
    versao: packageJson.version,
    endpoints: {
      saude: '/saude',
      transacoes: '/transacoes',
      documentacao: 'Veja o README.md para documentação completa'
    }
  });
});

// ============================================
// Registro de Módulos
// ============================================

// Proteger apenas as rotas de transações com JWT
app.use('/transacoes', authMiddleware);


// Proteger as rotas de CTs com JWT
app.use('/cts', authMiddleware);

registrarRotasTransacoes(app);
registrarRotasAuth(app);
registrarRotasCts(app);
registrarRotasAlunos(app);

// ============================================
// 404 - Rota Não Encontrada
// ============================================

app.use((req, res) => {
  res.status(404).json({
    erro: 'Rota não encontrada',
    metodo: req.method,
    caminho: req.path
  });
});

// ============================================
// Middleware Global de Tratamento de Erros
// DEVE SER O ÚLTIMO MIDDLEWARE
// ============================================

app.use(errorHandler);

module.exports = app;
