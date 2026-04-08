import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CriarAgendaPayload, AtualizarAgendaPayload, AgendaFiltros } from '../types/agendaAula';
import {
  listarAgendaApi,
  buscarAgendaPorIdApi,
  criarAgendaApi,
  atualizarAgendaApi,
  liberarAgendaApi,
  cancelarAgendaApi,
  encerrarAgendaApi,
  gerarPorEscalaApi,
} from '../services/api/agendaAulasService';

export const useAgenda = (page: number = 1, limit: number = 20, filtros: AgendaFiltros = {}) => {
  return useQuery({ queryKey: ['agenda', page, limit, filtros], queryFn: () => listarAgendaApi(page, limit, filtros) });
};

export const useAgendaItem = (id: number | null) => {
  return useQuery({ queryKey: ['agendaItem', id], queryFn: () => { if (!id) throw new Error('ID inválido'); return buscarAgendaPorIdApi(id); }, enabled: !!id });
};

export const useCriarAgenda = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dados: CriarAgendaPayload) => criarAgendaApi(dados), onSuccess: () => qc.invalidateQueries({ queryKey: ['agenda'] }) });
};

export const useAtualizarAgenda = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, dados }: { id: number; dados: AtualizarAgendaPayload }) => atualizarAgendaApi(id, dados), onSuccess: (_, variables) => { qc.invalidateQueries({ queryKey: ['agenda'] }); qc.invalidateQueries({ queryKey: ['agendaItem', variables.id] }); } });
};

export const useLiberarAgenda = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number) => liberarAgendaApi(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['agenda'] }) });
};

export const useCancelarAgenda = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number) => cancelarAgendaApi(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['agenda'] }) });
};

export const useEncerrarAgenda = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number) => encerrarAgendaApi(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['agenda'] }) });
};

export const useGerarPorEscala = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (payload: { escala_id: number; data_inicio: string; data_fim: string }) => gerarPorEscalaApi(payload), onSuccess: () => qc.invalidateQueries({ queryKey: ['agenda'] }) });
};
