const express = require('express');
const roteador = express.Router();

roteador.use(require('../../../shared/middlewares/authMiddleware'));

const validate = require('../../../shared/middlewares/validate');
const { idParamSchema } = require('../../../shared/validators/common');
const { criarPresencaSchema, statusPresencaSchema } = require('../../../shared/validators/presencaValidator');

const {
  listarPresencas,
  buscarPresencaPorId,
  criarPresenca,
  atualizarPresenca,
  atualizarStatusPresenca
} = require('../controllers/presencaController');

roteador.get('/', listarPresencas);
roteador.post('/', validate(criarPresencaSchema), criarPresenca);
roteador.get('/:id', validate(idParamSchema, 'params'), buscarPresencaPorId);
roteador.put('/:id', validate(idParamSchema, 'params'), atualizarPresenca);
roteador.patch('/:id/status', validate(idParamSchema, 'params'), validate(statusPresencaSchema), atualizarStatusPresenca);

module.exports = roteador;
