import api from './axios';
import type {
  Profissional,
  ListaProfissionaisResponse,
  CriarProfissionalPayload,
  AtualizarProfissionalPayload,
  ProfissionalResponse,
} from '../../types/profissional';

export const listarProfissionaisApi = async (
  page: number = 1,
  limit: number = 10
): Promise<ListaProfissionaisResponse> => {
  const response = await api.get('/profissionais', { params: { page, limit } });
  return response.data;
};

export const buscarProfissionalPorIdApi = async (id: number): Promise<Profissional> => {
  const response = await api.get(`/profissionais/${id}`);
  return response.data;
};

export const criarProfissionalApi = async (
  dados: CriarProfissionalPayload
): Promise<ProfissionalResponse> => {
  const response = await api.post('/profissionais', dados);
  return response.data;
};

export const atualizarProfissionalApi = async (
  id: number,
  dados: AtualizarProfissionalPayload
): Promise<Profissional> => {
  const response = await api.put(`/profissionais/${id}`, dados);
  return response.data;
};

export const desativarProfissionalApi = async (id: number): Promise<ProfissionalResponse> => {
  const response = await api.patch(`/profissionais/${id}/desativar`);
  return response.data;
};

export const ativarProfissionalApi = async (id: number): Promise<ProfissionalResponse> => {
  const response = await api.patch(`/profissionais/${id}/ativar`);
  return response.data;
};
