const rotasHorarios = require('./routes/horarioAulaRoutes');

function registrarRotasHorarios(app) {
  app.use('/horarios-aula', rotasHorarios);
}

module.exports = {
  registrarRotasHorarios
};
