export interface Presenca {
  id: number;
  agendamento_id: number;
  status: 'compareceu' | 'faltou' | 'reposicao' | 'justificada';
  observacao?: string | null;
}

export interface ListaPresencasResponse {
  dados: Presenca[];
  meta?: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

export interface PresencaResponse {
  dados: Presenca | { mensagem: string; id?: number };
}

export interface CriarPresencaPayload {
  agendamento_id: number;
  status: Presenca['status'];
  observacao?: string;
}

export interface AtualizarPresencaPayload {
  status?: Presenca['status'];
  observacao?: string;
}
