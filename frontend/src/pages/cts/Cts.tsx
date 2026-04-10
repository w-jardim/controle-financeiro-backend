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
    <div>
      <div className="page-header">
        <h1 className="page-title">Centros de Treinamento</h1>
        <button onClick={abrirCriar} className="btn btn-primary">Novo CT</button>
      </div>

      {isLoading && <p className="text-brand-muted">Carregando...</p>}
      {isError && <p className="text-brand-danger">Erro ao carregar CTs.</p>}

      {!isLoading && cts.length === 0 && <div className="empty-state">Nenhum CT cadastrado.</div>}

      {cts.length > 0 && (
        <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {cts.map((ct: any) => (
              <tr key={ct.id}>
                <td>{ct.nome}</td>
                <td><span className={ct.ativo ? 'badge badge-active' : 'badge badge-inactive'}>{ct.ativo ? 'Ativo' : 'Inativo'}</span></td>
                <td>
                  <div className="flex items-center gap-2">
                  <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(ct.id)}>Editar</button>
                  {ct.ativo ? (
                    <button className="btn btn-danger btn-sm" onClick={() => { if (confirm('Confirma desativar?')) desativarMut.mutate(ct.id); }}>Desativar</button>
                  ) : (
                    <button className="btn btn-success btn-sm" onClick={() => { if (confirm('Confirma ativar?')) ativarMut.mutate(ct.id); }}>Ativar</button>
                  )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="text-xl font-bold text-brand-text mb-4">{editingId ? 'Editar CT' : 'Novo CT'}</h2>
            {apiError && (
              <div className="alert alert-error mb-4">
                <p>{apiError}</p>
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label htmlFor="nome">Nome *</label>
                <input
                  {...register('nome')}
                  id="nome"
                  type="text"
                />
                {nomeError?.message && (
                  <p className="text-xs text-brand-danger mt-1">{nomeError.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={fecharForm} className="btn btn-secondary">Cancelar</button>
                <button type="submit" disabled={criarMut.isPending || atualizarMut.isPending} className="btn btn-primary">
                  {criarMut.isPending || atualizarMut.isPending ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {feedbackMessage && (
        <div className="toast toast-success">
          {feedbackMessage}
        </div>
      )}
    </div>
  );
};

export default Cts;
