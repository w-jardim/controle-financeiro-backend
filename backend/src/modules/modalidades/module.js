const rotasModalidades = require('./routes/modalidadeRoutes');

function registrarRotasModalidades(app) {
  app.use('/modalidades', rotasModalidades);
}

module.exports = {
  registrarRotasModalidades
};
