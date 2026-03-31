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

  const abrirModalCriar = () => {
    reset({ nome: '', descricao: '' });
    setModalidadeEditando(null);
    setModalAberto(true);
  };

  const abrirModalEditar = (modalidade: Modalidade) => {
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
    try {
      if (modalidadeEditando) {
        await atualizarMutation.mutateAsync({
          id: modalidadeEditando.id,
          dados,
        });
      } else {
        await criarMutation.mutateAsync(dados);
      }
      fecharModal();
    } catch (err) {
      console.error('Erro ao salvar modalidade:', err);
    }
  };

  const handleDesativar = async (id: number) => {
    if (confirm('Deseja desativar esta modalidade?')) {
      await desativarMutation.mutateAsync(id);
    }
  };

  const handleAtivar = async (id: number) => {
    await ativarMutation.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <p className="text-red-800">Erro ao carregar modalidades</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Modalidades</h1>
        <button
          onClick={abrirModalCriar}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Nova Modalidade
        </button>
      </div>

      {data?.dados && data.dados.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded p-8 text-center">
          <p className="text-gray-600">Nenhuma modalidade cadastrada</p>
        </div>
      ) : (
        <>
          <div className="bg-white shadow-md rounded overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.dados.map((modalidade) => (
                  <tr key={modalidade.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {modalidade.nome}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {modalidade.descricao || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          modalidade.ativo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {modalidade.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => abrirModalEditar(modalidade)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Editar
                      </button>
                      {modalidade.ativo ? (
                        <button
                          onClick={() => handleDesativar(modalidade.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={desativarMutation.isPending}
                        >
                          Desativar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAtivar(modalidade.id)}
                          className="text-green-600 hover:text-green-900"
                          disabled={ativarMutation.isPending}
                        >
                          Ativar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && data.totalPaginas > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página {page} de {data.totalPaginas}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPaginas, p + 1))}
                disabled={page === data.totalPaginas}
                className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}

      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {modalidadeEditando ? 'Editar Modalidade' : 'Nova Modalidade'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  {...register('nome')}
                  id="nome"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.nome && (
                  <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  {...register('descricao')}
                  id="descricao"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={criarMutation.isPending || atualizarMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
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
    </div>
  );
}

