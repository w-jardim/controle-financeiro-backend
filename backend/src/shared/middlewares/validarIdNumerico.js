function validarIdNumerico(req, res, next) {
  const { id } = req.params || {};

  if (!/^[0-9]+$/.test(String(id))) {
    return res.status(400).json({ erro: 'Parâmetro id inválido' });
  }

  return next();
}

module.exports = validarIdNumerico;
