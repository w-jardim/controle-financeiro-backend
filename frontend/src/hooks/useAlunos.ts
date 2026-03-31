import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CriarAlunoPayload, AtualizarAlunoPayload } from '../types/aluno';
import { listarAlunosApi, buscarAlunoPorIdApi, criarAlunoApi, atualizarAlunoApi, desativarAlunoApi, ativarAlunoApi } from '../services/api/alunosService';

export const useAlunos = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['alunos', params || {}],
    queryFn: () => listarAlunosApi(params),
  });
};

export const useAluno = (id: number | null) => {
  return useQuery({
    queryKey: ['aluno', id],
    queryFn: () => {
      if (!id) throw new Error('ID inválido');
      return buscarAlunoPorIdApi(id);
    },
    enabled: !!id,
  });
};

export const useCriarAluno = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dados: CriarAlunoPayload) => criarAlunoApi(dados),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alunos'] }),
  });
};

export const useAtualizarAluno = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: AtualizarAlunoPayload }) => atualizarAlunoApi(id, dados),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['alunos'] });
      qc.invalidateQueries({ queryKey: ['aluno', variables.id] });
    },
  });
};

export const useDesativarAluno = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => desativarAlunoApi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alunos'] }),
  });
};

export const useAtivarAluno = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ativarAlunoApi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alunos'] }),
  });
};
