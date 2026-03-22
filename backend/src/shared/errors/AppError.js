/**
 * Classe de erro centralizada
 * Todos os erros do app devem usar esta classe
 * Permite tratamento uniforme e consistente
 */
class AppError extends Error {
  constructor(mensagem, status = 500) {
    super(mensagem);
    this.status = status;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
