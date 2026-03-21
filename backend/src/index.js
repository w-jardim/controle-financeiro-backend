const express = require('express');
const conexao = require('./database');
const rotasTransacoes = require('./routes/transactionsRoutes');

console.log('APLICAÇÃO INICIADA:', new Date().toLocaleString());

const app = express();
const PORTA = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// CORS - Permitir requisições do frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Rotas de saúde
app.get('/saude', (req, res) => {
  res.status(200).json({
    status: 'ok',
    mensagem: 'API do controlador financeiro está funcionando',
    timestamp: new Date().toISOString()
  });
});

app.get('/ping', (req, res) => {
  res.json({
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

// Rotas da aplicação
app.use('/transacoes', rotasTransacoes);

// Rota raiz com informações da API
app.get('/', (req, res) => {
  res.status(200).json({
    mensagem: 'Bem-vindo à API de Controle Financeiro',
    versao: '1.0.0',
    endpoints: {
      saude: '/saude',
      transacoes: '/transacoes',
      documentacao: 'Veja o README.md para documentação completa'
    }
  });
});

// 404 - Rota não encontrada
app.use((req, res) => {
  res.status(404).json({
    erro: 'Rota não encontrada',
    metodo: req.method,
    caminho: req.path
  });
});

// Middleware de tratamento de erros
app.use((erro, req, res, next) => {
  console.error('ERRO GLOBAL:', {
    mensagem: erro.message,
    pilha: erro.stack,
    timestamp: new Date().toISOString()
  });

  res.status(500).json({
    status: 'erro',
    mensagem: 'Erro interno do servidor',
    detalhe: process.env.NODE_ENV === 'development' ? erro.message : 'Erro não especificado'
  });
});

// Iniciar servidor
app.listen(PORTA, '0.0.0.0', () => {
  console.log(`✓ Servidor iniciado na porta ${PORTA}`);
  console.log(`✓ Ambiente: ${process.env.NODE_ENV || 'desenvolvimento'}`);
  console.log(`✓ Acesse: http://localhost:${PORTA}`);
});