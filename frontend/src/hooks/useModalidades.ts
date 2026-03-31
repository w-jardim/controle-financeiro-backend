import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  CriarModalidadePayload,
  AtualizarModalidadePayload,
} from '../types/modalidade';
import {
  listarModalidadesApi,
  buscarModalidadePorIdApi,
  criarModalidadeApi,
  atualizarModalidadeApi,
  desativarModalidadeApi,
  ativarModalidadeApi,
} from '../services/api/modalidadesService';

export const useModalidades = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['modalidades', page, limit],
    queryFn: () => listarModalidadesApi(page, limit),
  });
};

export const useModalidade = (id: number | null) => {
  return useQuery({
    queryKey: ['modalidade', id],
    queryFn: () => {
      if (!id) throw new Error('ID inválido');
      return buscarModalidadePorIdApi(id);
    },
    enabled: !!id,
  });
};

export const useCriarModalidade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: CriarModalidadePayload) => criarModalidadeApi(dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modalidades'] });
    },
  });
};

export const useAtualizarModalidade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: AtualizarModalidadePayload }) =>
      atualizarModalidadeApi(id, dados),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['modalidades'] });
      queryClient.invalidateQueries({ queryKey: ['modalidade', variables.id] });
    },
  });
};

export const useDesativarModalidade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => desativarModalidadeApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modalidades'] });
    },
  });
};

export const useAtivarModalidade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ativarModalidadeApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modalidades'] });
    },
  });
};
