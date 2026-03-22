const authRoutes = require('./routes/authRoutes');

function registrarRotasAuth(app) {
  app.use('/auth', authRoutes);
}

module.exports = { registrarRotasAuth };
