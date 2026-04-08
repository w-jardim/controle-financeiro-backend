export interface Mensalidade {
  id: number;
  aluno_id: number;
  competencia: string;
  valor: number;
  vencimento: string;
  status: 'pendente' | 'pago' | 'cancelado';
  data_pagamento?: string | null;
  observacao?: string | null;
}

export interface ListaMensalidadesResponse {
  dados: Mensalidade[];
  meta?: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

export interface MensalidadeResponse {
  dados: Mensalidade | { mensagem: string; id?: number };
}

export interface CriarMensalidadePayload {
  aluno_id: number;
  competencia: string;
  valor: number;
  vencimento: string;
  observacao?: string;
}

export interface AtualizarMensalidadePayload {
  competencia?: string;
  valor?: number;
  vencimento?: string;
  status?: Mensalidade['status'];
  data_pagamento?: string;
  observacao?: string;
}
