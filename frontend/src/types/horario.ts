export interface Horario {
  id: number;
  ct_id: number;
  modalidade_id: number;
  profissional_id: number;
  dia_semana: number; // 0-6
  hora_inicio: string; // HH:MM
  hora_fim: string; // HH:MM
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface ListaHorariosResponse {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
  dados: Horario[];
}

export interface CriarHorarioPayload {
  ct_id: number;
  modalidade_id: number;
  profissional_id: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  limite_vagas?: number | null;
}

export interface AtualizarHorarioPayload {
  modalidade_id?: number;
  profissional_id?: number;
  dia_semana?: number;
  hora_inicio?: string;
  hora_fim?: string;
  ativo?: boolean;
  limite_vagas?: number | null;
}

export interface HorarioResponse {
  mensagem: string;
  id?: number;
}
