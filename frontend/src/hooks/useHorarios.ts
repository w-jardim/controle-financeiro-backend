import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CriarHorarioPayload, AtualizarHorarioPayload } from '../types/horario';
import {
  listarHorariosApi,
  buscarHorarioPorIdApi,
  criarHorarioApi,
  atualizarHorarioApi,
  desativarHorarioApi,
  ativarHorarioApi,
} from '../services/api/horariosService';

export const useHorarios = (page: number = 1, limit: number = 20) => {
  return useQuery({ queryKey: ['horarios', page, limit], queryFn: () => listarHorariosApi(page, limit) });
};

export const useHorario = (id: number | null) => {
  return useQuery({ queryKey: ['horario', id], queryFn: () => { if (!id) throw new Error('ID inválido'); return buscarHorarioPorIdApi(id); }, enabled: !!id });
};

export const useCriarHorario = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dados: CriarHorarioPayload) => criarHorarioApi(dados), onSuccess: () => qc.invalidateQueries({ queryKey: ['horarios'] }) });
};

export const useAtualizarHorario = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, dados }: { id: number; dados: AtualizarHorarioPayload }) => atualizarHorarioApi(id, dados), onSuccess: (_, variables) => { qc.invalidateQueries({ queryKey: ['horarios'] }); qc.invalidateQueries({ queryKey: ['horario', variables.id] }); } });
};

export const useDesativarHorario = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number) => desativarHorarioApi(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['horarios'] }) });
};

export const useAtivarHorario = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number) => ativarHorarioApi(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['horarios'] }) });
};
