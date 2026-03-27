/**
 * Middleware global de tratamento de erros
 * Captura TODOS os erros não tratados e retorna resposta padronizada
 * Deve ser o ÚLTIMO middleware registrado no app
 */
function errorHandler(erro, req, res, next) {
  // Erros de duplicação MySQL (ER_DUP_ENTRY)
  if (erro && erro.code === 'ER_DUP_ENTRY') {
    const sqlMessage = (erro.sqlMessage || '').toString();
    const sqlMessageLower = sqlMessage.toLowerCase();

    // Map known constraint names to friendly messages
    if (sqlMessageLower.includes('uq_transacoes_account_tipo_descricao')) {
      return res.status(409).json({ status: 'erro', mensagem: 'Já existe uma transação com esse tipo e descrição' });
    }

    if (sqlMessageLower.includes('uq_ct_nome_por_account') || sqlMessageLower.includes('uq_ct_nome')) {
      return res.status(409).json({ status: 'erro', mensagem: 'Já existe um CT com este nome' });
    }

    if (sqlMessageLower.includes('uq_alunos_account_cpf') || sqlMessageLower.includes('uq_alunos_nome_data') || sqlMessageLower.includes('uq_alunos_nome_telefone')) {
      // Prefer granular messages from service layer, fallback here
      if (sqlMessageLower.includes('uq_alunos_account_cpf')) {
        return res.status(409).json({ status: 'erro', mensagem: 'CPF já cadastrado' });
      }
      if (sqlMessageLower.includes('uq_alunos_nome_data')) {
        return res.status(409).json({ status: 'erro', mensagem: 'Já existe aluno com mesmo nome e data de nascimento' });
      }
      if (sqlMessageLower.includes('uq_alunos_nome_telefone')) {
        return res.status(409).json({ status: 'erro', mensagem: 'Já existe aluno com mesmo nome e telefone' });
      }
    }

    // Fallback generic message for other duplicate key errors
    return res.status(409).json({ status: 'erro', mensagem: 'Registro duplicado' });
  }

  // Determinar status HTTP
  const status = erro.status || 500;

  // Log do erro (em produção poderia ir para serviço de logging)
  // Evitar poluir saída dos testes automatizados
  if (process.env.NODE_ENV !== 'test') {
    console.error('ERRO GLOBAL:', {
      status,
      mensagem: erro.message,
      pilha: erro.stack,
      timestamp: new Date().toISOString()
    });
  }

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
