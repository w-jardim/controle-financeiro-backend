const express = require('express');
const { cadastrar, login } = require('../controllers/authController');
const validate = require('../../../shared/middlewares/validate');
const { cadastroSchema, loginSchema } = require('../../../shared/validators/authValidator');

const router = express.Router();

router.post('/cadastro', validate(cadastroSchema), cadastrar);
router.post('/login', validate(loginSchema), login);

module.exports = router;
