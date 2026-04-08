import api from './axios';
import type {
  ListaAgendamentosResponse,
  AgendamentoResponse,
  CriarAgendamentoPayload,
  AtualizarAgendamentoPayload,
} from '../../types/agendamento';

export const listarAgendamentosApi = async (params?: Record<string, unknown>): Promise<ListaAgendamentosResponse> => {
  const response = await api.get('/agendamentos', { params });
  return response.data;
};

export const buscarAgendamentoPorIdApi = async (id: number): Promise<AgendamentoResponse> => {
  const response = await api.get(`/agendamentos/${id}`);
  return response.data;
};

export const criarAgendamentoApi = async (dados: CriarAgendamentoPayload): Promise<AgendamentoResponse> => {
  const response = await api.post('/agendamentos', dados);
  return response.data;
};

export const atualizarAgendamentoApi = async (id: number, dados: AtualizarAgendamentoPayload): Promise<AgendamentoResponse> => {
  const response = await api.put(`/agendamentos/${id}`, dados);
  return response.data;
};

export const cancelarAgendamentoApi = async (id: number): Promise<AgendamentoResponse> => {
  const response = await api.patch(`/agendamentos/${id}/cancelar`);
  return response.data;
};

export const atualizarStatusAgendamentoApi = async (id: number, status: string): Promise<AgendamentoResponse> => {
  const response = await api.patch(`/agendamentos/${id}/status`, { status });
  return response.data;
};
