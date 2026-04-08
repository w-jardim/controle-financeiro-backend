import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AtualizarTransacaoPayload, CriarTransacaoPayload } from '../types/transacao';
import {
  atualizarTransacaoApi,
  buscarTransacaoPorIdApi,
  criarTransacaoApi,
  deletarTransacaoApi,
  listarTransacoesApi,
  resumoTransacoesApi,
} from '../services/api/transacoesService';

export const useTransacoes = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['transacoes', params || {}],
    queryFn: () => listarTransacoesApi(params),
  });
};

export const useTransacao = (id: number | null) => {
  return useQuery({
    queryKey: ['transacao', id],
    queryFn: () => {
      if (!id) throw new Error('ID inválido');
      return buscarTransacaoPorIdApi(id);
    },
    enabled: !!id,
  });
};

export const useResumoTransacoes = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['transacoes-resumo', params || {}],
    queryFn: () => resumoTransacoesApi(params),
  });
};

export const useCriarTransacao = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dados: CriarTransacaoPayload) => criarTransacaoApi(dados),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transacoes'] });
      qc.invalidateQueries({ queryKey: ['transacoes-resumo'] });
    },
  });
};

export const useAtualizarTransacao = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: AtualizarTransacaoPayload }) => atualizarTransacaoApi(id, dados),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['transacoes'] });
      qc.invalidateQueries({ queryKey: ['transacao', vars.id] });
      qc.invalidateQueries({ queryKey: ['transacoes-resumo'] });
    },
  });
};

export const useDeletarTransacao = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletarTransacaoApi(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transacoes'] });
      qc.invalidateQueries({ queryKey: ['transacoes-resumo'] });
    },
  });
};
