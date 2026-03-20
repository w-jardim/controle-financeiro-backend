const express = require('express');
const router = express.Router();

const validarTransacao = require('../middlewares/validarTransacao');
const {
  listarTransactions,
  buscarTransactionPorId,
  criarTransaction,
  atualizarTransaction,
  deletarTransaction,
  resumoTransactions,
  resumoMensalTransactions
} = require('../controllers/transactionsController');


router.get('/resumo/mensal', resumoMensalTransactions);
router.get('/resumo', resumoTransactions);
router.get('/', listarTransactions);
router.get('/:id', buscarTransactionPorId);
router.post('/', validarTransacao, criarTransaction);
router.put('/:id', validarTransacao, atualizarTransaction);
router.delete('/:id', deletarTransaction);


module.exports = router;