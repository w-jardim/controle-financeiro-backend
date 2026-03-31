import React, { useState, useMemo } from 'react';
import { useProfissionais, useCriarProfissional, useAtualizarProfissional, useDesativarProfissional, useAtivarProfissional } from '../../hooks/useProfissionais';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { criarProfissionalSchema, atualizarProfissionalSchema } from '../../schemas/profissional.schema';
import type { CriarProfissionalPayload, AtualizarProfissionalPayload } from '../../types/profissional';

const Profissionais: React.FC = () => {
  const [page, _setPage] = useState(1);
  const limit = 10;
  const [editing, setEditing] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading, isError } = useProfissionais(page, limit);
  const criar = useCriarProfissional();
  const atualizar = useAtualizarProfissional();
  const desativar = useDesativarProfissional();
  const ativar = useAtivarProfissional();

  const profissionais = useMemo(() => data?.dados || [], [data]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CriarProfissionalPayload>({
    resolver: zodResolver(editing ? atualizarProfissionalSchema : criarProfissionalSchema),
  });

  const onSubmit = async (formData: any) => {
    try {
      if (editing) {
        await atualizar.mutateAsync({ id: editing, dados: formData as AtualizarProfissionalPayload });
      } else {
        await criar.mutateAsync(formData as CriarProfissionalPayload);
      }
      reset();
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      // Errors handled by mutation error state
    }
  };

  const handleEdit = (id: number) => {
    const item = profissionais.find((p: any) => p.id === id);
    if (!item) return;
    reset({
      nome: item.nome,
      email: item.email || undefined,
      telefone: item.telefone || undefined,
      especialidade: item.especialidade || undefined,
    });
    setEditing(id);
    setShowForm(true);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Profissionais</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); reset(); }} className="btn btn-primary">Novo</button>
      </div>

      {isLoading && <p>Carregando...</p>}
      {isError && <p>Erro ao carregar profissionais.</p>}

      {!isLoading && profissionais.length === 0 && <p>Sem profissionais cadastrados.</p>}

      {profissionais.length > 0 && (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Telefone</th>
              <th className="px-4 py-2">Especialidade</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {profissionais.map((p: any) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-2">{p.nome}</td>
                <td className="px-4 py-2">{p.email || '-'}</td>
                <td className="px-4 py-2">{p.telefone || '-'}</td>
                <td className="px-4 py-2">{p.especialidade || '-'}</td>
                <td className="px-4 py-2">{p.ativo ? 'Ativo' : 'Inativo'}</td>
                <td className="px-4 py-2">
                  <button onClick={() => handleEdit(p.id)} className="btn btn-secondary mr-2">Editar</button>
                  {p.ativo ? (
                    <button onClick={() => desativar.mutate(p.id)} className="btn btn-danger">Desativar</button>
                  ) : (
                    <button onClick={() => ativar.mutate(p.id)} className="btn btn-success">Ativar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-2">
              <label className="block">Nome</label>
              <input {...register('nome')} className="input" />
              {errors.nome && <p className="text-red-600">{errors.nome.message}</p>}
            </div>
            <div className="mb-2">
              <label className="block">Email</label>
              <input {...register('email')} className="input" />
              {errors.email && <p className="text-red-600">{errors.email.message}</p>}
            </div>
            <div className="mb-2">
              <label className="block">Telefone</label>
              <input {...register('telefone')} className="input" />
              {errors.telefone && <p className="text-red-600">{errors.telefone.message}</p>}
            </div>
            <div className="mb-2">
              <label className="block">Especialidade</label>
              <input {...register('especialidade')} className="input" />
              {errors.especialidade && <p className="text-red-600">{errors.especialidade.message}</p>}
            </div>
            <div className="flex items-center gap-2 mt-4">
              <button type="submit" className="btn btn-primary">{editing ? 'Salvar' : 'Criar'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); reset(); }} className="btn">Cancelar</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default Profissionais;
