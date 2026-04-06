export interface Escala {
  id: number;
  account_id: number;
  ct_id: number;
  modalidade_id: number;
  profissional_id: number;
  dias_semana: number[]; // 0-6
  hora_inicio: string; // HH:MM
  hora_fim: string; // HH:MM
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface ListaEscalasResponse {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
  dados: Escala[];
}

export interface CriarEscalaPayload {
  ct_id: number;
  modalidade_id: number;
  profissional_id: number;
  dias_semana: number[];
  hora_inicio: string;
  hora_fim: string;
}

export interface AtualizarEscalaPayload {
  ct_id?: number;
  modalidade_id?: number;
  profissional_id?: number;
  dias_semana?: number[];
  hora_inicio?: string;
  hora_fim?: string;
  ativo?: boolean;
}

export interface EscalaResponse {
  mensagem: string;
  id?: number;
}
