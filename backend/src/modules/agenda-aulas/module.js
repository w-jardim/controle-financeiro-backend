const agendaAulasRoutes = require('./routes/agendaAulasRoutes');

function registrarRotasAgendaAulas(app) {
  app.use('/agenda-aulas', agendaAulasRoutes);
}

module.exports = {
  registrarRotasAgendaAulas
};
