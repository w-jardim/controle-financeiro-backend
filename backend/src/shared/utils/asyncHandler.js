/**
 * Wrapper para controllers async
 * Simplifica tratamento de erros em rotas async
 * 
 * Uso:
 * const meuController = asyncHandler(async (req, res) => {
 *   // seu código
 * });
 */
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
