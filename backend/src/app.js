const express = require('express');
const packageJson = require('../package.json');
const corsMiddleware = require('./shared/middlewares/corsConfig');
const errorHandler = require('./shared/middlewares/errorHandler');
const conexao = require('./shared/database/connection');
const requestId = require('./shared/middlewares/requestId');
const setupSwagger = require('./shared/docs/swagger');
const { registrarRotasTransacoes } = require('./modules/transacoes/module');
const { registrarRotasAuth } = require('./modules/auth/module');
const { registrarRotasCts } = require('./modules/cts/module');
const authMiddleware = require('./shared/middlewares/authMiddleware');
const { registrarRotasAlunos } = require('./modules/alunos/module');
const { registrarRotasProfissionais } = require('./modules/profissionais/module');
const { registrarRotasModalidades } = require('./modules/modalidades/module');
const { registrarRotasHorarios } = require('./modules/horarios-aula/module');
const { registrarRotasAgendamentos } = require('./modules/agendamentos/module');
const { registrarRotasPresencas } = require('./modules/presencas/module');
const { registrarRotasMensalidades } = require('./modules/mensalidades/module');
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

app.use(requestId);
app.use(express.json());
app.use(corsMiddleware);

// ============================================
// Documentação Swagger
// ============================================

setupSwagger(app);

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

app.get('/ready', async (req, res) => {
  try {
    await conexao.query('SELECT 1');
    res.status(200).json({
      status: 'ok',
      banco: 'conectado',
      timestamp: new Date().toISOString()
    });
  } catch {
    res.status(503).json({
      status: 'indisponível',
      banco: 'desconectado',
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================
// Rota Raiz (Info da API)
// ============================================

app.get('/', (req, res) => {
  res.status(200).json({
    mensagem: 'Bem-vindo à API de Gestão de CT de Artes Marciais',
    versao: packageJson.version,
    ambiente: process.env.NODE_ENV || 'desenvolvimento',
    endpoints: {
      documentacao: '/docs',
      saude: '/saude',
      ready: '/ready',
      ping: '/ping'
    }
  });
});

// ============================================
// Registro de Módulos
// ============================================

// Agrupar todas as rotas da API sob o prefixo /api
const apiRouter = express.Router();

// Proteger apenas as rotas de transações com JWT
apiRouter.use('/transacoes', authMiddleware);

// Proteger as rotas de CTs com JWT
apiRouter.use('/cts', authMiddleware);

// Proteger as rotas de Profissionais com JWT
apiRouter.use('/profissionais', authMiddleware);

// Proteger as rotas de Modalidades com JWT
apiRouter.use('/modalidades', authMiddleware);

// Proteger as rotas de Horários de Aula com JWT
apiRouter.use('/horarios-aula', authMiddleware);

// Proteger as rotas de Agendamentos com JWT
apiRouter.use('/agendamentos', authMiddleware);

// Proteger as rotas de Presenças com JWT
apiRouter.use('/presencas', authMiddleware);

// Proteger as rotas de Mensalidades com JWT
apiRouter.use('/mensalidades', authMiddleware);

// Registrar módulos na rota /api
registrarRotasTransacoes(apiRouter);
registrarRotasAuth(apiRouter);
registrarRotasCts(apiRouter);
registrarRotasAlunos(apiRouter);
registrarRotasProfissionais(apiRouter);
registrarRotasModalidades(apiRouter);
registrarRotasHorarios(apiRouter);
registrarRotasAgendamentos(apiRouter);
registrarRotasPresencas(apiRouter);
registrarRotasMensalidades(apiRouter);

// Montar o router da API em /api
app.use('/api', apiRouter);

// ============================================
// 404 - Rota Não Encontrada
// ============================================

app.use((req, res) => {
  res.status(404).json({
    erro: {
      mensagem: 'Rota não encontrada',
      codigo: 'NOT_FOUND',
      status: 404
    }
  });
});

// ============================================
// Middleware Global de Tratamento de Erros
// DEVE SER O ÚLTIMO MIDDLEWARE
// ============================================

app.use(errorHandler);

module.exports = app;
