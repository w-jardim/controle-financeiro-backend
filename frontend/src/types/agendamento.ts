export interface Agendamento {
  id: number;
  aluno_id: number;
  horario_aula_id?: number | null;
  agenda_aula_id?: number | null;
  data_aula: string;
  status: 'agendado' | 'cancelado' | 'compareceu' | 'faltou';
  observacao?: string | null;
}

export interface ListaAgendamentosResponse {
  dados: Agendamento[];
  meta?: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

export interface AgendamentoResponse {
  dados: Agendamento | { mensagem: string; id?: number };
}

export interface CriarAgendamentoPayload {
  aluno_id: number;
  data_aula: string;
  horario_aula_id?: number;
  agenda_aula_id?: number;
  observacao?: string;
}

export interface AtualizarAgendamentoPayload {
  status?: Agendamento['status'];
  observacao?: string;
  data_aula?: string;
}
