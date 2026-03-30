const rotasPresencas = require('./routes/presencaRoutes');
const authMiddleware = require('../../shared/middlewares/authMiddleware');

function registrarRotasPresencas(app) {
  app.use('/presencas', authMiddleware, rotasPresencas);
}

module.exports = {
  registrarRotasPresencas
};
