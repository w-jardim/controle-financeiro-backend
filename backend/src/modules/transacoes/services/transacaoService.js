const repository = require('../repositories/transacaoRepository');
const AppError = require('../../../shared/errors/AppError');

class TransacaoService {
  criarErro(mensagem, status = 400) {
    return new AppError(mensagem, status);
  }

  validarAccountId(accountId) {
    const numeroAccountId = Number(accountId);

    if (!Number.isInteger(numeroAccountId) || numeroAccountId <= 0) {
      throw this.criarErro('Contexto de account_id ausente ou inválido', 403);
    }

    return numeroAccountId;
  }

  validarId(id) {
    const numeroId = Number(id);

    if (!Number.isInteger(numeroId) || numeroId <= 0) {
      throw this.criarErro('ID deve ser um número válido e maior que zero', 400);
    }

    return numeroId;
  }

  validarAno(ano) {
    const anoNumero = Number(ano);
    const anoAtual = new Date().getFullYear();

    if (
      !Number.isInteger(anoNumero) ||
      anoNumero < 2000 ||
      anoNumero > anoAtual + 1
    ) {
      throw this.criarErro(
        `Parâmetro ano deve estar entre 2000 e ${anoAtual + 1}`,
        400
      );
    }

    return anoNumero;
  }

  validarMes(mes) {
    const mesNumero = Number(mes);

    if (!Number.isInteger(mesNumero) || mesNumero < 1 || mesNumero > 12) {
      throw this.criarErro(
        'Parâmetro mes deve ser um número inteiro entre 1 e 12',
        400
      );
    }

    return mesNumero;
  }

  async listar(query, accountId) {
    const {
      tipo,
      descricao,
      pagina = 1,
      limite = 10,
      ordenar = 'id',
      direcao = 'asc'
    } = query;

    const accountIdValidado = this.validarAccountId(accountId);

    const numeroPagina = Number(pagina);
    const numeroLimite = Number(limite);

    if (isNaN(numeroPagina) || numeroPagina <= 0) {
      throw this.criarErro(
        'Parâmetro pagina deve ser um número maior que zero',
        400
      );
    }

    if (isNaN(numeroLimite) || numeroLimite <= 0) {
      throw this.criarErro(
        'Parâmetro limite deve ser um número maior que zero',
        400
      );
    }

    const camposPermitidos = ['id', 'tipo', 'descricao', 'valor', 'criado_em'];
    if (!camposPermitidos.includes(ordenar)) {
      throw this.criarErro('Parâmetro ordenar inválido', 400);
    }

    const direcaoFormatada = String(direcao).toLowerCase();
    if (!['asc', 'desc'].includes(direcaoFormatada)) {
      throw this.criarErro('Parâmetro direcao deve ser asc ou desc', 400);
    }

    if (tipo && !['receita', 'despesa'].includes(tipo)) {
      throw this.criarErro('Filtro tipo deve ser receita ou despesa', 400);
    }

    const offset = (numeroPagina - 1) * numeroLimite;

    const resultado = await repository.listar({
      accountId: accountIdValidado,
      tipo,
      descricao,
      ordenar,
      direcao: direcaoFormatada,
      limite: numeroLimite,
      offset
    });

    const totalPaginas = Math.ceil(resultado.total / numeroLimite);

    return {
      pagina: numeroPagina,
      limite: numeroLimite,
      total: resultado.total,
      totalPaginas,
      filtros: {
        tipo: tipo || null,
        descricao: descricao || null
      },
      ordenacao: {
        campo: ordenar,
        direcao: direcaoFormatada
      },
      dados: resultado.dados
    };
  }

  async buscarPorId(id, accountId) {
    const numeroId = this.validarId(id);
    const accountIdValidado = this.validarAccountId(accountId);

    const transacao = await repository.buscarPorId(
      numeroId,
      accountIdValidado
    );

    if (!transacao) {
      throw this.criarErro('Transação não encontrada', 404);
    }

    return transacao;
  }

  async criar(dados, accountId) {
    const accountIdValidado = this.validarAccountId(accountId);
    const { tipo, descricao, valor } = dados;

    const jaExiste = await repository.existePorTipoEDescricao(
      tipo,
      descricao,
      accountIdValidado
    );

    if (jaExiste) {
      throw this.criarErro(
        'Já existe uma transação com esse tipo e descrição',
        409
      );
    }

    const resultado = await repository.criar({
      accountId: accountIdValidado,
      tipo,
      descricao,
      valor
    });

    return {
      mensagem: 'Transação criada com sucesso',
      id: resultado.id
    };
  }

  async atualizar(id, dados, accountId) {
    const numeroId = this.validarId(id);
    const accountIdValidado = this.validarAccountId(accountId);
    const { tipo, descricao, valor } = dados;

    const jaExiste = await repository.existePorTipoEDescricaoIgnorandoId(
      tipo,
      descricao,
      numeroId,
      accountIdValidado
    );

    if (jaExiste) {
      throw this.criarErro(
        'Já existe uma transação com esse tipo e descrição',
        409
      );
    }

    const resultado = await repository.atualizar(
      numeroId,
      accountIdValidado,
      {
        tipo,
        descricao,
        valor
      }
    );

    if (resultado.afetadas === 0) {
      throw this.criarErro('Transação não encontrada', 404);
    }

    return {
      mensagem: 'Transação atualizada com sucesso'
    };
  }

  async deletar(id, accountId) {
    const numeroId = this.validarId(id);
    const accountIdValidado = this.validarAccountId(accountId);

    const resultado = await repository.deletar(numeroId, accountIdValidado);

    if (resultado.afetadas === 0) {
      throw this.criarErro('Transação não encontrada', 404);
    }

    return {
      mensagem: 'Transação deletada com sucesso'
    };
  }

  async resumo(query, accountId) {
    const { mes, ano } = query;
    const accountIdValidado = this.validarAccountId(accountId);

    if ((mes && !ano) || (!mes && ano)) {
      throw this.criarErro('Informe mes e ano juntos', 400);
    }

    let mesNumero = null;
    let anoNumero = null;

    if (mes && ano) {
      mesNumero = this.validarMes(mes);
      anoNumero = this.validarAno(ano);
    }

    const totalRegistros = await repository.contarPorPeriodo({
      accountId: accountIdValidado,
      mes: mesNumero,
      ano: anoNumero
    });

    if (totalRegistros === 0) {
      return {
        filtro: {
          mes: mesNumero,
          ano: anoNumero
        },
        mensagem: 'Nenhum lançamento encontrado para o período informado',
        totalRegistros: 0,
        totalReceitas: 0,
        totalDespesas: 0,
        saldo: 0
      };
    }

    const resumo = await repository.resumoPorPeriodo({
      accountId: accountIdValidado,
      mes: mesNumero,
      ano: anoNumero
    });

    const saldo = resumo.totalReceitas - resumo.totalDespesas;

    return {
      filtro: {
        mes: mesNumero,
        ano: anoNumero
      },
      totalRegistros,
      totalReceitas: resumo.totalReceitas,
      totalDespesas: resumo.totalDespesas,
      saldo
    };
  }

  async resumoMensal(query, accountId) {
    const { ano } = query;
    const accountIdValidado = this.validarAccountId(accountId);

    if (ano === undefined) {
      throw this.criarErro('Parâmetro ano é obrigatório', 400);
    }

    const anoNumero = this.validarAno(ano);

    const nomesMeses = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro'
    ];

    const linhas = await repository.resumoMensalPorAno(
      accountIdValidado,
      anoNumero
    );

    const mapaMeses = {};

    for (const linha of linhas) {
      const mes = Number(linha.mes);
      const totalReceitas = Number(linha.totalReceitas);
      const totalDespesas = Number(linha.totalDespesas);

      mapaMeses[mes] = {
        ano: anoNumero,
        mes,
        nomeMes: nomesMeses[mes - 1],
        totalReceitas,
        totalDespesas,
        saldo: totalReceitas - totalDespesas
      };
    }

    const resultado = [];

    for (let mes = 1; mes <= 12; mes++) {
      if (mapaMeses[mes]) {
        resultado.push(mapaMeses[mes]);
      } else {
        resultado.push({
          ano: anoNumero,
          mes,
          nomeMes: nomesMeses[mes - 1],
          totalReceitas: 0,
          totalDespesas: 0,
          saldo: 0
        });
      }
    }

    return resultado;
  }
}

module.exports = new TransacaoService();