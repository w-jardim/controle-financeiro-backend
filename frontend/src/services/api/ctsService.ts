import api from './axios';

export const listarCtsApi = async (params?: Record<string, any>) => {
  const response = await api.get('/cts', { params });
  return response.data; // { dados: [...], total }
};

export const buscarCtPorIdApi = async (id: number) => {
  const response = await api.get(`/cts/${id}`);
  return response.data;
};
