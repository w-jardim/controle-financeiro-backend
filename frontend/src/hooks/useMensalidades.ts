import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AtualizarMensalidadePayload, CriarMensalidadePayload } from '../types/mensalidade';
import {
  atualizarMensalidadeApi,
  buscarMensalidadePorIdApi,
  cancelarMensalidadeApi,
  criarMensalidadeApi,
  listarMensalidadesApi,
  pagarMensalidadeApi,
} from '../services/api/mensalidadesService';

export const useMensalidades = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['mensalidades', params || {}],
    queryFn: () => listarMensalidadesApi(params),
  });
};

export const useMensalidade = (id: number | null) => {
  return useQuery({
    queryKey: ['mensalidade', id],
    queryFn: () => {
      if (!id) throw new Error('ID inválido');
      return buscarMensalidadePorIdApi(id);
    },
    enabled: !!id,
  });
};

export const useCriarMensalidade = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dados: CriarMensalidadePayload) => criarMensalidadeApi(dados),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mensalidades'] }),
  });
};

export const useAtualizarMensalidade = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: AtualizarMensalidadePayload }) => atualizarMensalidadeApi(id, dados),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['mensalidades'] });
      qc.invalidateQueries({ queryKey: ['mensalidade', vars.id] });
    },
  });
};

export const usePagarMensalidade = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data_pagamento }: { id: number; data_pagamento?: string }) => pagarMensalidadeApi(id, data_pagamento),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mensalidades'] }),
  });
};

export const useCancelarMensalidade = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelarMensalidadeApi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mensalidades'] }),
  });
};
