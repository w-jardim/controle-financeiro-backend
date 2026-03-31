const express = require('express');
const roteador = express.Router();

roteador.use(require('../../../shared/middlewares/authMiddleware'));

const validate = require('../../../shared/middlewares/validate');
const { idParamSchema } = require('../../../shared/validators/common');
const { criarAgendamentoSchema, atualizarAgendamentoSchema, statusAgendamentoSchema } = require('../../../shared/validators/agendamentoValidator');

const {
  listarAgendamentos,
  buscarAgendamentoPorId,
  criarAgendamento,
  atualizarAgendamento,
  cancelarAgendamento,
  atualizarStatusAgendamento
} = require('../controllers/agendamentoController');

roteador.get('/', listarAgendamentos);
roteador.post('/', validate(criarAgendamentoSchema), criarAgendamento);
roteador.get('/:id', validate(idParamSchema, 'params'), buscarAgendamentoPorId);
roteador.put('/:id', validate(idParamSchema, 'params'), validate(atualizarAgendamentoSchema), atualizarAgendamento);
roteador.patch('/:id/cancelar', validate(idParamSchema, 'params'), cancelarAgendamento);
roteador.patch('/:id/status', validate(idParamSchema, 'params'), validate(statusAgendamentoSchema), atualizarStatusAgendamento);

module.exports = roteador;
