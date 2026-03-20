const express = require('express');
const conexao = require('./database');
const transactionsRoutes = require('./routes/transactionsRoutes');

console.log('ARQUIVO EXECUTADO:', __filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    mensagem: 'API do controlador financeiro está funcionando'
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

app.use('/transactions', transactionsRoutes);

app.use((erro, req, res, next) => {
  console.error('ERRO GLOBAL:', erro);

  res.status(500).json({
    status: 'erro',
    mensagem: 'Erro interno do servidor',
    detalhe: erro.message
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});