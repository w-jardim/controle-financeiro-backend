/**
 * Middleware global de tratamento de erros
 * Captura TODOS os erros não tratados e retorna resposta padronizada
 * Deve ser o ÚLTIMO middleware registrado no app
 */
function errorHandler(erro, req, res, next) {
  // Erros de duplicação MySQL
  if (erro.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      status: 'erro',
      mensagem: 'Já existe uma transação com esse tipo e descrição'
    });
  }

  // Determinar status HTTP
  const status = erro.status || 500;

  // Log do erro (em produção poderia ir para serviço de logging)
  console.error('ERRO GLOBAL:', {
    status,
    mensagem: erro.message,
    pilha: erro.stack,
    timestamp: new Date().toISOString()
  });

  // Resposta
  return res.status(status).json({
    status: 'erro',
    mensagem: status === 500 ? 'Erro interno do servidor' : erro.message,
    detalhe:
      process.env.NODE_ENV === 'development'
        ? erro.message
        : undefined
  });
}

module.exports = errorHandler;
