import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useModalidades,
  useCriarModalidade,
  useAtualizarModalidade,
  useDesativarModalidade,
  useAtivarModalidade,
} from '../../hooks/useModalidades';
import { criarModalidadeSchema, type CriarModalidadeFormData } from '../../schemas/modalidade.schema';
import type { Modalidade } from '../../types/modalidade';

export default function Modalidades() {
  const [page, setPage] = useState(1);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalidadeEditando, setModalidadeEditando] = useState<Modalidade | null>(null);

  const { data, isLoading, error } = useModalidades(page, 10);
  const criarMutation = useCriarModalidade();
  const atualizarMutation = useAtualizarModalidade();
  const desativarMutation = useDesativarModalidade();
  const ativarMutation = useAtivarModalidade();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CriarModalidadeFormData>({
    resolver: zodResolver(criarModalidadeSchema),
  });

  const [apiError, setApiError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const abrirModalCriar = () => {
    setApiError(null);
    reset({ nome: '', descricao: '' });
    setModalidadeEditando(null);
    setModalAberto(true);
  };

  const abrirModalEditar = (modalidade: Modalidade) => {
    setApiError(null);
    reset({ nome: modalidade.nome, descricao: modalidade.descricao || '' });
    setModalidadeEditando(modalidade);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setModalidadeEditando(null);
    reset();
  };

  const onSubmit = async (dados: CriarModalidadeFormData) => {
    setApiError(null);
    // normalize descricao: never send null, send undefined when empty
    const payload = {
      nome: dados.nome.trim(),
      ...(dados.descricao && dados.descricao.trim() !== '' ? { descricao: dados.descricao.trim() } : {}),
    } as const;

    try {
      if (modalidadeEditando) {
        await atualizarMutation.mutateAsync({ id: modalidadeEditando.id, dados: payload });
      } else {
        await criarMutation.mutateAsync(payload);
      }
      fecharModal();
    } catch (err: any) {
      // extract message from backend shape
      const msg = err?.response?.data?.erro?.mensagem || err?.response?.data?.dados?.mensagem || err?.message || 'Erro ao salvar modalidade';
      setApiError(String(msg));
    }
  };

  const handleDesativar = async (id: number) => {
    const item = data?.dados.find((m) => m.id === id);
    const nome = item?.nome || '';
    if (!confirm(`Tem certeza que deseja desativar a modalidade "${nome}"? Esta ação pode ser revertida.`)) return;

    try {
      const res: any = await desativarMutation.mutateAsync(id);
      const msg = res?.dados?.mensagem || res?.mensagem || 'Modalidade desativada com sucesso';
      setFeedbackMessage(String(msg));
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err: any) {
      const msg = err?.response?.data?.erro?.mensagem || err?.message || 'Erro ao desativar modalidade';
      setApiError(String(msg));
    }
  };

  const handleAtivar = async (id: number) => {
    await ativarMutation.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-brand-muted">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <p>Erro ao carregar modalidades</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Modalidades</h1>
        <button
          onClick={abrirModalCriar}
          className="btn btn-primary"
        >
          Nova Modalidade
        </button>
      </div>

      {data?.dados && data.dados.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma modalidade cadastrada</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th>Status</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data?.dados.map((modalidade) => (
                  <tr key={modalidade.id}>
                    <td className="font-medium">
                      {modalidade.nome}
                    </td>
                    <td className="text-brand-muted">
                      {modalidade.descricao || '-'}
                    </td>
                    <td>
                      <span className={modalidade.ativo ? 'badge badge-active' : 'badge badge-inactive'}>
                        {modalidade.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => abrirModalEditar(modalidade)}
                          className="btn btn-ghost btn-sm"
                        >
                          Editar
                        </button>
                        {modalidade.ativo ? (
                          <button
                            onClick={() => handleDesativar(modalidade.id)}
                            className="btn btn-danger btn-sm"
                            disabled={desativarMutation.isPending}
                          >
                            Desativar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAtivar(modalidade.id)}
                            className="btn btn-success btn-sm"
                            disabled={ativarMutation.isPending}
                          >
                            Ativar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && data.totalPaginas > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-secondary btn-sm"
              >
                Anterior
              </button>
              <span className="pagination-info">
                Página {page} de {data.totalPaginas}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPaginas, p + 1))}
                disabled={page === data.totalPaginas}
                className="btn btn-secondary btn-sm"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}

      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="text-xl font-bold text-brand-text mb-4">
              {modalidadeEditando ? 'Editar Modalidade' : 'Nova Modalidade'}
            </h2>
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
                {errors.nome && (
                  <p className="text-xs text-brand-danger mt-1">{errors.nome.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="descricao">Descrição</label>
                <textarea
                  {...register('descricao')}
                  id="descricao"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={criarMutation.isPending || atualizarMutation.isPending}
                  className="btn btn-primary"
                >
                  {criarMutation.isPending || atualizarMutation.isPending
                    ? 'Salvando...'
                    : 'Salvar'}
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
}

