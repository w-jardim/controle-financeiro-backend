import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CriarEscalaPayload, AtualizarEscalaPayload } from '../types/escala';
import {
  listarEscalasApi,
  buscarEscalaPorIdApi,
  criarEscalaApi,
  atualizarEscalaApi,
  desativarEscalaApi,
  ativarEscalaApi,
} from '../services/api/escalasService';

export const useEscalas = (page: number = 1, limit: number = 20, filters: Record<string, any> = {}) => {
  return useQuery({ queryKey: ['escalas', page, limit, filters], queryFn: () => listarEscalasApi(page, limit, filters) });
};

export const useEscala = (id: number | null) => {
  return useQuery({ queryKey: ['escala', id], queryFn: () => { if (!id) throw new Error('ID inválido'); return buscarEscalaPorIdApi(id); }, enabled: !!id });
};

export const useCriarEscala = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dados: CriarEscalaPayload) => criarEscalaApi(dados), onSuccess: () => qc.invalidateQueries({ queryKey: ['escalas'] }) });
};

export const useAtualizarEscala = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, dados }: { id: number; dados: AtualizarEscalaPayload }) => atualizarEscalaApi(id, dados), onSuccess: (_, variables) => { qc.invalidateQueries({ queryKey: ['escalas'] }); qc.invalidateQueries({ queryKey: ['escala', variables.id] }); } });
};

export const useDesativarEscala = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number) => desativarEscalaApi(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['escalas'] }) });
};

export const useAtivarEscala = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number) => ativarEscalaApi(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['escalas'] }) });
};
