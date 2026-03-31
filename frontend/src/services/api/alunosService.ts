import api from './axios';
import type { ListaAlunosResponse, CriarAlunoPayload, AtualizarAlunoPayload, AlunoResponse } from '../../types/aluno';

export const listarAlunosApi = async (params?: Record<string, any>): Promise<ListaAlunosResponse> => {
  const response = await api.get('/alunos', { params });
  return response.data;
};

export const buscarAlunoPorIdApi = async (id: number): Promise<AlunoResponse> => {
  const response = await api.get(`/alunos/${id}`);
  return response.data;
};

export const criarAlunoApi = async (dados: CriarAlunoPayload): Promise<AlunoResponse> => {
  const response = await api.post('/alunos', dados);
  return response.data;
};

export const atualizarAlunoApi = async (id: number, dados: AtualizarAlunoPayload): Promise<AlunoResponse> => {
  const response = await api.put(`/alunos/${id}`, dados);
  return response.data;
};

export const desativarAlunoApi = async (id: number): Promise<AlunoResponse> => {
  const response = await api.delete(`/alunos/${id}`);
  return response.data;
};

export const ativarAlunoApi = async (id: number): Promise<AlunoResponse> => {
  const response = await api.patch(`/alunos/${id}/ativar`);
  return response.data;
};
