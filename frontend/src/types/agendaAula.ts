export interface AgendaAula {
  id: number;
  account_id: number;
  ct_id: number;
  escala_id?: number | null;
  modalidade_id: number;
  profissional_id: number;
  data_aula: string; // YYYY-MM-DD
  hora_inicio: string; // HH:MM
  hora_fim: string; // HH:MM
  status: 'rascunho' | 'liberada' | 'cancelada' | 'encerrada';
  observacao?: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface ListaAgendaResponse {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
  dados: AgendaAula[];
}

export interface CriarAgendaPayload {
  ct_id: number;
  escala_id?: number | null;
  modalidade_id: number;
  profissional_id: number;
  data_aula: string;
  hora_inicio: string;
  hora_fim: string;
  observacao?: string | null;
}

export interface AtualizarAgendaPayload {
  ct_id?: number;
  modalidade_id?: number;
  profissional_id?: number;
  data_aula?: string;
  hora_inicio?: string;
  hora_fim?: string;
  status?: string;
  observacao?: string | null;
}

export interface AgendaResponse {
  mensagem: string;
  id?: number;
}
