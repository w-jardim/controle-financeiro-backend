const rotasMensalidades = require('./routes/mensalidadeRoutes');
const authMiddleware = require('../../shared/middlewares/authMiddleware');

function registrarRotasMensalidades(app) {
  app.use('/mensalidades', authMiddleware, rotasMensalidades);
}

module.exports = {
  registrarRotasMensalidades
};
