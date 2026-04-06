import api from './axios';
import type { ListaEscalasResponse, CriarEscalaPayload, AtualizarEscalaPayload, EscalaResponse } from '../../types/escala';

export const listarEscalasApi = async (page: number = 1, limit: number = 20): Promise<ListaEscalasResponse> => {
  const response = await api.get('/escalas', { params: { page, limit } });
  return response.data;
};

export const buscarEscalaPorIdApi = async (id: number) => {
  const response = await api.get(`/escalas/${id}`);
  return response.data;
};

export const criarEscalaApi = async (dados: CriarEscalaPayload): Promise<EscalaResponse> => {
  const response = await api.post('/escalas', dados);
  return response.data;
};

export const atualizarEscalaApi = async (id: number, dados: AtualizarEscalaPayload) => {
  const response = await api.put(`/escalas/${id}`, dados);
  return response.data;
};

export const desativarEscalaApi = async (id: number) => {
  const response = await api.patch(`/escalas/${id}/desativar`);
  return response.data;
};

export const ativarEscalaApi = async (id: number) => {
  const response = await api.patch(`/escalas/${id}/ativar`);
  return response.data;
};
