const rotasCts = require('./routes/ctRoutes');

function registrarRotasCts(app) {
  app.use('/cts', rotasCts);
}

module.exports = {
  registrarRotasCts
};