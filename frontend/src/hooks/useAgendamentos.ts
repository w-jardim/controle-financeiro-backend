import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AtualizarAgendamentoPayload, CriarAgendamentoPayload } from '../types/agendamento';
import {
  atualizarAgendamentoApi,
  atualizarStatusAgendamentoApi,
  buscarAgendamentoPorIdApi,
  cancelarAgendamentoApi,
  criarAgendamentoApi,
  listarAgendamentosApi,
} from '../services/api/agendamentosService';

export const useAgendamentos = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['agendamentos', params || {}],
    queryFn: () => listarAgendamentosApi(params),
  });
};

export const useAgendamento = (id: number | null) => {
  return useQuery({
    queryKey: ['agendamento', id],
    queryFn: () => {
      if (!id) throw new Error('ID inválido');
      return buscarAgendamentoPorIdApi(id);
    },
    enabled: !!id,
  });
};

export const useCriarAgendamento = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dados: CriarAgendamentoPayload) => criarAgendamentoApi(dados),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agendamentos'] }),
  });
};

export const useAtualizarAgendamento = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: AtualizarAgendamentoPayload }) => atualizarAgendamentoApi(id, dados),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['agendamentos'] });
      qc.invalidateQueries({ queryKey: ['agendamento', vars.id] });
    },
  });
};

export const useCancelarAgendamento = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelarAgendamentoApi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agendamentos'] }),
  });
};

export const useAtualizarStatusAgendamento = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => atualizarStatusAgendamentoApi(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agendamentos'] }),
  });
};
