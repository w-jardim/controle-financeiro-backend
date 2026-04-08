import api from './axios';
import type {
  ListaPresencasResponse,
  PresencaResponse,
  CriarPresencaPayload,
  AtualizarPresencaPayload,
} from '../../types/presenca';

export const listarPresencasApi = async (params?: Record<string, unknown>): Promise<ListaPresencasResponse> => {
  const response = await api.get('/presencas', { params });
  return response.data;
};

export const buscarPresencaPorIdApi = async (id: number): Promise<PresencaResponse> => {
  const response = await api.get(`/presencas/${id}`);
  return response.data;
};

export const criarPresencaApi = async (dados: CriarPresencaPayload): Promise<PresencaResponse> => {
  const response = await api.post('/presencas', dados);
  return response.data;
};

export const atualizarPresencaApi = async (id: number, dados: AtualizarPresencaPayload): Promise<PresencaResponse> => {
  const response = await api.put(`/presencas/${id}`, dados);
  return response.data;
};

export const atualizarStatusPresencaApi = async (id: number, status: string): Promise<PresencaResponse> => {
  const response = await api.patch(`/presencas/${id}/status`, { status });
  return response.data;
};
