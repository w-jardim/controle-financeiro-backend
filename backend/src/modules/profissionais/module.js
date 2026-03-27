const rotasProfissionais = require('./routes/profissionalRoutes');

function registrarRotasProfissionais(app) {
  app.use('/profissionais', rotasProfissionais);
}

module.exports = {
  registrarRotasProfissionais
};
