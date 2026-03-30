const express = require('express');
const roteador = express.Router();

roteador.use(require('../../../shared/middlewares/authMiddleware'));

const {
  listarAgendamentos,
  buscarAgendamentoPorId,
  criarAgendamento,
  atualizarAgendamento,
  cancelarAgendamento,
  atualizarStatusAgendamento
} = require('../controllers/agendamentoController');

roteador.get('/', listarAgendamentos);
roteador.post('/', criarAgendamento);
roteador.get('/:id', buscarAgendamentoPorId);
roteador.put('/:id', atualizarAgendamento);
roteador.patch('/:id/cancelar', cancelarAgendamento);
roteador.patch('/:id/status', atualizarStatusAgendamento);

module.exports = roteador;
