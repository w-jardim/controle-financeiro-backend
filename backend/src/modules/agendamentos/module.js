const rotasAgendamentos = require('./routes/agendamentoRoutes');
const authMiddleware = require('../../shared/middlewares/authMiddleware');

function registrarRotasAgendamentos(app) {
  app.use('/agendamentos', authMiddleware, rotasAgendamentos);
}

module.exports = {
  registrarRotasAgendamentos
};
