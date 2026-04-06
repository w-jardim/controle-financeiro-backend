const escalasRoutes = require('./routes/escalasRoutes');

function registrarRotasEscalas(app) {
  app.use('/escalas', escalasRoutes);
}

module.exports = {
  registrarRotasEscalas
};
