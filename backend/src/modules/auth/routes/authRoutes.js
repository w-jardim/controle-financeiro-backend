const express = require('express');
const { cadastrar } = require('../controllers/authController');

const router = express.Router();

router.post('/cadastro', cadastrar);

module.exports = router;
