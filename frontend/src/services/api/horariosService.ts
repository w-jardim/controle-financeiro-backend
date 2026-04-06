import api from './axios';
import type { ListaHorariosResponse, CriarHorarioPayload, AtualizarHorarioPayload, HorarioResponse } from '../../types/horario';

export const listarHorariosApi = async (page: number = 1, limit: number = 20): Promise<ListaHorariosResponse> => {
  const response = await api.get('/horarios-aula', { params: { page, limit } });
  return response.data;
};

export const buscarHorarioPorIdApi = async (id: number) => {
  const response = await api.get(`/horarios-aula/${id}`);
  return response.data;
};

export const criarHorarioApi = async (dados: CriarHorarioPayload): Promise<HorarioResponse> => {
  const response = await api.post('/horarios-aula', dados);
  return response.data;
};

export const atualizarHorarioApi = async (id: number, dados: AtualizarHorarioPayload) => {
  const response = await api.put(`/horarios-aula/${id}`, dados);
  return response.data;
};

export const desativarHorarioApi = async (id: number) => {
  const response = await api.patch(`/horarios-aula/${id}/desativar`);
  return response.data;
};

export const ativarHorarioApi = async (id: number) => {
  const response = await api.patch(`/horarios-aula/${id}/ativar`);
  return response.data;
};
