const conexao = require('../../../shared/database/connection');
const AppError = require('../../../shared/errors/AppError');

class AlunoRepository {
  naoImplementado() {
    throw new AppError('AlunoRepository ainda não implementado', 501);
  }

  async listar({ query = {}, accountId }) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    void query;
    void conexao;
    this.naoImplementado();
  }

  async buscarPorId(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    void id;
    void conexao;
    this.naoImplementado();
  }

  async criar({ accountId, ct_id, nome, cpf }) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    void ct_id;
    void nome;
    void cpf;
    void conexao;
    this.naoImplementado();
  }

  async atualizar(id, accountId, dados) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    void id;
    void dados;
    void conexao;
    this.naoImplementado();
  }

  async desativar(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    void id;
    void conexao;
    this.naoImplementado();
  }

  async ativar(id, accountId) {
    if (!accountId) throw new AppError('accountId é obrigatório', 400);
    void id;
    void conexao;
    this.naoImplementado();
  }
}

module.exports = new AlunoRepository();