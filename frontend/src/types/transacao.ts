export interface Transacao {
  id: number;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  ct_id?: number | null;
  criado_em?: string;
  atualizado_em?: string;
}

export interface ListaTransacoesResponse {
  dados: Transacao[];
  meta?: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

export interface ResumoTransacoes {
  filtro?: {
    ct_id: number | null;
    mes: number | null;
    ano: number | null;
  };
  totalRegistros: number;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  mensagem?: string;
}

export interface TransacaoResponse {
  dados: Transacao | { mensagem: string; id?: number };
}

export interface CriarTransacaoPayload {
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  ct_id?: number | null;
}

export interface AtualizarTransacaoPayload extends CriarTransacaoPayload {}
