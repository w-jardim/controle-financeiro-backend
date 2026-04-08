import api from './axios';
import type {
  ListaMensalidadesResponse,
  MensalidadeResponse,
  CriarMensalidadePayload,
  AtualizarMensalidadePayload,
} from '../../types/mensalidade';

export const listarMensalidadesApi = async (params?: Record<string, unknown>): Promise<ListaMensalidadesResponse> => {
  const response = await api.get('/mensalidades', { params });
  return response.data;
};

export const buscarMensalidadePorIdApi = async (id: number): Promise<MensalidadeResponse> => {
  const response = await api.get(`/mensalidades/${id}`);
  return response.data;
};

export const criarMensalidadeApi = async (dados: CriarMensalidadePayload): Promise<MensalidadeResponse> => {
  const response = await api.post('/mensalidades', dados);
  return response.data;
};

export const atualizarMensalidadeApi = async (id: number, dados: AtualizarMensalidadePayload): Promise<MensalidadeResponse> => {
  const response = await api.put(`/mensalidades/${id}`, dados);
  return response.data;
};

export const pagarMensalidadeApi = async (id: number, data_pagamento?: string): Promise<MensalidadeResponse> => {
  const response = await api.patch(`/mensalidades/${id}/pagar`, { data_pagamento });
  return response.data;
};

export const cancelarMensalidadeApi = async (id: number): Promise<MensalidadeResponse> => {
  const response = await api.patch(`/mensalidades/${id}/cancelar`);
  return response.data;
};
