import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AtualizarPresencaPayload, CriarPresencaPayload } from '../types/presenca';
import {
  atualizarPresencaApi,
  atualizarStatusPresencaApi,
  buscarPresencaPorIdApi,
  criarPresencaApi,
  listarPresencasApi,
} from '../services/api/presencasService';

export const usePresencas = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['presencas', params || {}],
    queryFn: () => listarPresencasApi(params),
  });
};

export const usePresenca = (id: number | null) => {
  return useQuery({
    queryKey: ['presenca', id],
    queryFn: () => {
      if (!id) throw new Error('ID inválido');
      return buscarPresencaPorIdApi(id);
    },
    enabled: !!id,
  });
};

export const useCriarPresenca = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dados: CriarPresencaPayload) => criarPresencaApi(dados),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['presencas'] }),
  });
};

export const useAtualizarPresenca = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: AtualizarPresencaPayload }) => atualizarPresencaApi(id, dados),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['presencas'] });
      qc.invalidateQueries({ queryKey: ['presenca', vars.id] });
    },
  });
};

export const useAtualizarStatusPresenca = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => atualizarStatusPresencaApi(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['presencas'] }),
  });
};
