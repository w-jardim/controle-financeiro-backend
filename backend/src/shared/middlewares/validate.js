const AppError = require('../errors/AppError');

function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const mensagem = result.error.issues.map(i => i.message).join('; ');
      return next(new AppError(mensagem, 400));
    }
    req[source] = result.data;
    next();
  };
}

module.exports = validate;
