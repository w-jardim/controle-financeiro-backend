import api from './axios';
import type { ListaAgendaResponse, CriarAgendaPayload, AtualizarAgendaPayload, AgendaResponse, AgendaFiltros } from '../../types/agendaAula';

export const listarAgendaApi = async (page: number = 1, limit: number = 20, filtros: AgendaFiltros = {}): Promise<ListaAgendaResponse> => {
  const response = await api.get('/agenda-aulas', { params: { page, limit, ...filtros } });
  return response.data;
};

export const buscarAgendaPorIdApi = async (id: number) => {
  const response = await api.get(`/agenda-aulas/${id}`);
  return response.data;
};

export const criarAgendaApi = async (dados: CriarAgendaPayload): Promise<AgendaResponse> => {
  const response = await api.post('/agenda-aulas', dados);
  return response.data;
};

export const atualizarAgendaApi = async (id: number, dados: AtualizarAgendaPayload) => {
  const response = await api.put(`/agenda-aulas/${id}`, dados);
  return response.data;
};

export const liberarAgendaApi = async (id: number) => {
  const response = await api.patch(`/agenda-aulas/${id}/liberar`);
  return response.data;
};

export const cancelarAgendaApi = async (id: number) => {
  const response = await api.patch(`/agenda-aulas/${id}/cancelar`);
  return response.data;
};

export const encerrarAgendaApi = async (id: number) => {
  const response = await api.patch(`/agenda-aulas/${id}/encerrar`);
  return response.data;
};

export const gerarPorEscalaApi = async (payload: { escala_id: number; data_inicio: string; data_fim: string }) => {
  const response = await api.post('/agenda-aulas/gerar-por-escala', payload);
  return response.data;
};
