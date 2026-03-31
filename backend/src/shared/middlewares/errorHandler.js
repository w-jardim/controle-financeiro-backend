/**
 * Middleware global de tratamento de erros
 * Captura TODOS os erros não tratados e retorna resposta padronizada
 * Deve ser o ÚLTIMO middleware registrado no app
 */
const { codigoPorStatus } = require('../utils/response');
const logger = require('../utils/logger');

function errorHandler(erro, req, res, next) {
  const requestId = req.requestId || null;
  // Erros de duplicação MySQL (ER_DUP_ENTRY)
  if (erro && erro.code === 'ER_DUP_ENTRY') {
    const sqlMessage = (erro.sqlMessage || '').toString().toLowerCase();

    const constraintMap = {
      'uq_transacoes_account_tipo_descricao': 'Já existe uma transação com esse tipo e descrição',
      'uq_ct_nome_por_account': 'Já existe um CT com este nome',
      'uq_ct_nome': 'Já existe um CT com este nome',
      'uq_alunos_account_cpf': 'CPF já cadastrado',
      'uq_alunos_nome_data': 'Já existe aluno com mesmo nome e data de nascimento',
      'uq_alunos_nome_telefone': 'Já existe aluno com mesmo nome e telefone',
      'uq_profissionais_nome_telefone': 'Já existe profissional com mesmo nome e telefone',
      'uq_mensalidade_aluno_competencia': 'Mensalidade já cadastrada para esse aluno e competência',
      'uq_agendamento_unico': 'Aluno já agendado para esse horário e data',
      'uq_presenca_agendamento': 'Presença já registrada para esse agendamento',
      'uq_modalidades_account_nome': 'Já existe uma modalidade com este nome'
    };

    for (const [constraint, msg] of Object.entries(constraintMap)) {
      if (sqlMessage.includes(constraint)) {
        return res.status(409).json({
          erro: { mensagem: msg, codigo: 'CONFLICT', status: 409 }
        });
      }
    }

    return res.status(409).json({
      erro: { mensagem: 'Registro duplicado', codigo: 'CONFLICT', status: 409 }
    });
  }

  // ER_NO_REFERENCED_ROW (FK violation on insert/update)
  if (erro && (erro.code === 'ER_NO_REFERENCED_ROW' || erro.code === 'ER_NO_REFERENCED_ROW_2')) {
    return res.status(400).json({
      erro: { mensagem: 'Referência inválida: registro relacionado não encontrado', codigo: 'BAD_REQUEST', status: 400 }
    });
  }

  // ER_ROW_IS_REFERENCED (FK constraint prevents delete)
  if (erro && (erro.code === 'ER_ROW_IS_REFERENCED' || erro.code === 'ER_ROW_IS_REFERENCED_2')) {
    return res.status(409).json({
      erro: { mensagem: 'Não é possível remover: existem registros dependentes', codigo: 'CONFLICT', status: 409 }
    });
  }

  // Determinar status HTTP
  const status = erro.status || 500;

  // Log estruturado
  const logPayload = { requestId, status, mensagem: erro.message, stack: erro.stack };
  if (status >= 500) {
    logger.error(logPayload, 'Erro interno');
  } else if (status >= 400) {
    logger.warn(logPayload, 'Erro de cliente');
  }

  // Resposta padronizada
  const resposta = {
    erro: {
      mensagem: status === 500 ? 'Erro interno do servidor' : erro.message,
      codigo: codigoPorStatus(status),
      status
    }
  };
  if (requestId) resposta.erro.requestId = requestId;
  return res.status(status).json(resposta);
}

module.exports = errorHandler;
