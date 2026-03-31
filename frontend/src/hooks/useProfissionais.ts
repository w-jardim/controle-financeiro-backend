import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CriarProfissionalPayload, AtualizarProfissionalPayload } from '../types/profissional';
import {
  listarProfissionaisApi,
  buscarProfissionalPorIdApi,
  criarProfissionalApi,
  atualizarProfissionalApi,
  desativarProfissionalApi,
  ativarProfissionalApi,
} from '../services/api/profissionaisService';

export const useProfissionais = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['profissionais', page, limit],
    queryFn: () => listarProfissionaisApi(page, limit),
  });
};

export const useProfissional = (id: number | null) => {
  return useQuery({
    queryKey: ['profissional', id],
    queryFn: () => {
      if (!id) throw new Error('ID inválido');
      return buscarProfissionalPorIdApi(id);
    },
    enabled: !!id,
  });
};

export const useCriarProfissional = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: CriarProfissionalPayload) => criarProfissionalApi(dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profissionais'] });
    },
  });
};

export const useAtualizarProfissional = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: AtualizarProfissionalPayload }) =>
      atualizarProfissionalApi(id, dados),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profissionais'] });
      queryClient.invalidateQueries({ queryKey: ['profissional', variables.id] });
    },
  });
};

export const useDesativarProfissional = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => desativarProfissionalApi(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profissionais'] }),
  });
};

export const useAtivarProfissional = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ativarProfissionalApi(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profissionais'] }),
  });
};
