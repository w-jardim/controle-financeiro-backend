const repository = require('../repositories/transacaoRepository');

class TransacaoService {
  async listar(query) {
    const {
      tipo,
      descricao,
      pagina = 1,
      limite = 10,
      ordenar = 'id',
      direcao = 'asc'
    } = query;

    const numeroPagina = Number(pagina);
    const numeroLimite = Number(limite);

    if (isNaN(numeroPagina) || numeroPagina <= 0) {
      throw new Error('Página inválida');
    }

    if (isNaN(numeroLimite) || numeroLimite <= 0) {
      throw new Error('Limite inválido');
    }

    const offset = (numeroPagina - 1) * numeroLimite;

    const resultado = await repository.listar({
      tipo,
      descricao,
      ordenar,
      direcao,
      limite: numeroLimite,
      offset
    });

    const totalPaginas = Math.ceil(resultado.total / numeroLimite);

    return {
      pagina: numeroPagina,
      limite: numeroLimite,
      total: resultado.total,
      totalPaginas,
      dados: resultado.dados
    };
  }
}

module.exports = new TransacaoService();