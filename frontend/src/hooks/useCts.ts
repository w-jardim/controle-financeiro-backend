import { useQuery } from '@tanstack/react-query';
import { listarCtsApi } from '../services/api/ctsService';

export const useCts = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['cts', params || {}],
    queryFn: async () => {
      const response = await listarCtsApi(params);
      return response ?? { dados: [] };
    },
  });
};
