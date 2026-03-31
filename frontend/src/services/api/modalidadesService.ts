import api from './axios';
import type {
  Modalidade,
  ListaModalidadesResponse,
  CriarModalidadePayload,
  AtualizarModalidadePayload,
  ModalidadeResponse,
} from '../../types/modalidade';

export const listarModalidadesApi = async (
  page: number = 1,
  limit: number = 10
): Promise<ListaModalidadesResponse> => {
  const response = await api.get('/modalidades', {
    params: { page, limit },
  });
  return response.data;
};

export const buscarModalidadePorIdApi = async (
  id: number
): Promise<Modalidade> => {
  const response = await api.get(`/modalidades/${id}`);
  return response.data;
};

export const criarModalidadeApi = async (
  dados: CriarModalidadePayload
): Promise<ModalidadeResponse> => {
  const response = await api.post('/modalidades', dados);
  return response.data;
};

export const atualizarModalidadeApi = async (
  id: number,
  dados: AtualizarModalidadePayload
): Promise<Modalidade> => {
  const response = await api.put(`/modalidades/${id}`, dados);
  return response.data;
};

export const desativarModalidadeApi = async (
  id: number
): Promise<ModalidadeResponse> => {
  const response = await api.patch(`/modalidades/${id}/desativar`);
  return response.data;
};

export const ativarModalidadeApi = async (
  id: number
): Promise<ModalidadeResponse> => {
  const response = await api.patch(`/modalidades/${id}/ativar`);
  return response.data;
};
