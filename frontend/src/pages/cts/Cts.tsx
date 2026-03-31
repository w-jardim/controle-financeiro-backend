import React, { useState, useMemo } from 'react';
import { useCts } from '../../hooks/useCts';
import { useForm } from 'react-hook-form';
import type { FieldError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { criarCtSchema } from '../../schemas/ct.schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api/axios';

const Cts: React.FC = () => {
  const [page] = useState(1);
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useCts({ page, limit: 20 });
  const cts = useMemo(() => data?.dados || [], [data]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(criarCtSchema),
  });
  // Narrow the field error type so we render only the string message
  const nomeError = errors.nome as FieldError | undefined;

  const criarMut = useMutation({
    mutationFn: (dados: any) => api.post('/cts', dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cts'] });
      setFeedbackMessage('CT salvo com sucesso');
      setTimeout(() => setFeedbackMessage(null), 3000);
      setShowForm(false);
      setEditingId(null);
      reset();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.erro?.mensagem || err?.message || 'Erro ao salvar CT';
      setApiError(String(msg));
    },
  });

  const atualizarMut = useMutation({
    mutationFn: ({ id, dados }: any) => api.put(`/cts/${id}`, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cts'] });
      setFeedbackMessage('CT atualizado com sucesso');
      setTimeout(() => setFeedbackMessage(null), 3000);
      setShowForm(false);
      setEditingId(null);
      reset();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.erro?.mensagem || err?.message || 'Erro ao atualizar CT';
      setApiError(String(msg));
    },
  });

  const desativarMut = useMutation({
    mutationFn: (id: number) => api.patch(`/cts/${id}/desativar`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cts'] }),
  });

  const ativarMut = useMutation({
    mutationFn: (id: number) => api.patch(`/cts/${id}/ativar`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cts'] }),
  });

  const onSubmit = async (formData: any) => {
    setApiError(null);
    const payload = { nome: String(formData.nome).trim() };
    try {
      if (editingId) {
        await atualizarMut.mutateAsync({ id: editingId, dados: payload });
      } else {
        await criarMut.mutateAsync(payload);
      }
    } catch (err) {
      // handled in onError
    }
  };

  const handleEdit = (id: number) => {
    const item = cts.find((c: any) => c.id === id);
    if (!item) return;
    reset({ nome: item.nome });
    setEditingId(id);
    setApiError(null);
    setShowForm(true);
  };

  const abrirCriar = () => {
    reset({ nome: '' });
    setEditingId(null);
    setApiError(null);
    setShowForm(true);
  };

  const fecharForm = () => {
    setShowForm(false);
    setEditingId(null);
    reset();
    setApiError(null);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Centros de Treinamento</h1>
        <button onClick={abrirCriar} className="btn btn-primary">Novo CT</button>
      </div>

      {isLoading && <p>Carregando...</p>}
      {isError && <p>Erro ao carregar CTs.</p>}

      {!isLoading && cts.length === 0 && <p>Nenhum CT cadastrado.</p>}

      {cts.length > 0 && (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {cts.map((ct: any) => (
              <tr key={ct.id} className="border-t">
                <td className="px-4 py-2">{ct.nome}</td>
                <td className="px-4 py-2">{ct.ativo ? 'Ativo' : 'Inativo'}</td>
                <td className="px-4 py-2">
                  <button className="btn btn-secondary mr-2" onClick={() => handleEdit(ct.id)}>Editar</button>
                  {ct.ativo ? (
                    <button className="btn btn-danger" onClick={() => { if (global.confirm?.('Confirma desativar?')) desativarMut.mutate(ct.id); }}>Desativar</button>
                  ) : (
                    <button className="btn btn-success" onClick={() => { if (global.confirm?.('Confirma ativar?')) ativarMut.mutate(ct.id); }}>Ativar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Editar CT' : 'Novo CT'}</h2>
            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                <p className="text-red-800 text-sm">{apiError}</p>
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  {...register('nome')}
                  id="nome"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {nomeError?.message && (
                  <p className="text-red-500 text-sm mt-1">{nomeError.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={fecharForm} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={criarMut.isPending || atualizarMut.isPending} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                  {criarMut.isPending || atualizarMut.isPending ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {feedbackMessage && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-800 rounded px-4 py-2 z-50">
          {feedbackMessage}
        </div>
      )}
    </div>
  );
};

export default Cts;
