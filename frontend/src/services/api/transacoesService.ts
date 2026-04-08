import api from './axios';
import type {
  ListaTransacoesResponse,
  TransacaoResponse,
  CriarTransacaoPayload,
  AtualizarTransacaoPayload,
  ResumoTransacoes,
} from '../../types/transacao';

export const listarTransacoesApi = async (params?: Record<string, unknown>): Promise<ListaTransacoesResponse> => {
  const response = await api.get('/transacoes', { params });
  return response.data;
};

export const buscarTransacaoPorIdApi = async (id: number): Promise<TransacaoResponse> => {
  const response = await api.get(`/transacoes/${id}`);
  return response.data;
};

export const criarTransacaoApi = async (dados: CriarTransacaoPayload): Promise<TransacaoResponse> => {
  const response = await api.post('/transacoes', dados);
  return response.data;
};

export const atualizarTransacaoApi = async (id: number, dados: AtualizarTransacaoPayload): Promise<TransacaoResponse> => {
  const response = await api.put(`/transacoes/${id}`, dados);
  return response.data;
};

export const deletarTransacaoApi = async (id: number): Promise<TransacaoResponse> => {
  const response = await api.delete(`/transacoes/${id}`);
  return response.data;
};

export const resumoTransacoesApi = async (params?: Record<string, unknown>): Promise<{ dados: ResumoTransacoes }> => {
  const response = await api.get('/transacoes/resumo', { params });
  return response.data;
};
