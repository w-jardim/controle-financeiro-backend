function sucesso(res, dados, meta = null, status = 200) {
  const body = { dados };
  if (meta && Object.keys(meta).length > 0) body.meta = meta;
  return res.status(status).json(body);
}

function codigoPorStatus(status) {
  const mapa = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'UNPROCESSABLE_ENTITY',
    500: 'INTERNAL_ERROR'
  };
  return mapa[status] || 'ERROR';
}

module.exports = { sucesso, codigoPorStatus };
