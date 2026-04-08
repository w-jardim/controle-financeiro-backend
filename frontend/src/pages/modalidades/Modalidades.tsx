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
    return <p className="state-loading">Carregando...</p>;
  }

  if (error) {
    return <p className="alert-error">Erro ao carregar modalidades</p>;
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Modalidades</h1>
        <button onClick={abrirModalCriar} className="btn btn-primary">+ Nova Modalidade</button>
      </div>

      {data?.dados && data.dados.length === 0 ? (
        <div className="card card-body state-empty">Nenhuma modalidade cadastrada</div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="table-base">
              <thead>
                <tr>
                  <th className="table-th">Nome</th>
                  <th className="table-th">Descrição</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.dados.map((modalidade) => (
                  <tr key={modalidade.id} className="table-row">
                    <td className="table-td font-medium text-gray-900">{modalidade.nome}</td>
                    <td className="table-td">{modalidade.descricao || '-'}</td>
                    <td className="table-td">
                      <span className={modalidade.ativo ? 'badge-active' : 'badge-inactive'}>
                        {modalidade.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => abrirModalEditar(modalidade)} className="btn btn-sm btn-secondary">Editar</button>
                        {modalidade.ativo ? (
                          <button onClick={() => handleDesativar(modalidade.id)} className="btn btn-sm btn-danger" disabled={desativarMutation.isPending}>Desativar</button>
                        ) : (
                          <button onClick={() => handleAtivar(modalidade.id)} className="btn btn-sm btn-success" disabled={ativarMutation.isPending}>Ativar</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && data.totalPaginas > 1 && (
            <div className="flex justify-center items-center gap-4">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-secondary">Anterior</button>
              <span className="text-sm text-gray-600">Página {page} de {data.totalPaginas}</span>
              <button onClick={() => setPage((p) => Math.min(data.totalPaginas, p + 1))} disabled={page === data.totalPaginas} className="btn btn-secondary">Próxima</button>
            </div>
          )}
        </>
      )}

      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card card-body w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {modalidadeEditando ? 'Editar Modalidade' : 'Nova Modalidade'}
            </h2>
            {apiError && <div className="alert-error mb-4">{apiError}</div>}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label htmlFor="nome" className="form-label">Nome *</label>
                <input {...register('nome')} id="nome" type="text" className="form-input" />
                {errors.nome && <span className="form-error">{errors.nome.message}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="descricao" className="form-label">Descrição</label>
                <textarea {...register('descricao')} id="descricao" rows={3} className="form-input" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={fecharModal} className="btn btn-secondary">Cancelar</button>
                <button type="submit" disabled={criarMutation.isPending || atualizarMutation.isPending} className="btn btn-primary">
                  {criarMutation.isPending || atualizarMutation.isPending ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {feedbackMessage && (
        <div className="fixed top-4 right-4 alert-success z-50 shadow-lg">
          {feedbackMessage}
        </div>
      )}
    </div>
  );
}

