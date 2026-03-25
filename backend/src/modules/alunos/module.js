const rotasAlunos = require('./routes/alunoRoutes');
const authMiddleware = require('../../shared/middlewares/authMiddleware');

function registrarRotasAlunos(app) {
  app.use('/alunos', authMiddleware, rotasAlunos);
}

module.exports = {
  registrarRotasAlunos
};