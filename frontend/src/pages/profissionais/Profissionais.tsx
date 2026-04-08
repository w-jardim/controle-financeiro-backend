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
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Profissionais</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); reset(); }} className="btn btn-primary">+ Novo</button>
      </div>

      {isLoading && <p className="state-loading">Carregando...</p>}
      {isError && <p className="alert-error">Erro ao carregar profissionais.</p>}

      {!isLoading && profissionais.length === 0 && !showForm && (
        <div className="card card-body state-empty">Sem profissionais cadastrados.</div>
      )}

      {profissionais.length > 0 && (
        <div className="table-wrapper">
          <table className="table-base">
            <thead>
              <tr>
                <th className="table-th">Nome</th>
                <th className="table-th">Email</th>
                <th className="table-th">Telefone</th>
                <th className="table-th">Especialidade</th>
                <th className="table-th">Status</th>
                <th className="table-th">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {profissionais.map((p: any) => (
                <tr key={p.id} className="table-row">
                  <td className="table-td font-medium text-gray-900">{p.nome}</td>
                  <td className="table-td">{p.email || '-'}</td>
                  <td className="table-td">{p.telefone || '-'}</td>
                  <td className="table-td">{p.especialidade || '-'}</td>
                  <td className="table-td">
                    <span className={p.ativo ? 'badge-active' : 'badge-inactive'}>
                      {p.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="table-td">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(p.id)} className="btn btn-sm btn-secondary">Editar</button>
                      {p.ativo ? (
                        <button onClick={() => desativar.mutate(p.id)} className="btn btn-sm btn-danger">Desativar</button>
                      ) : (
                        <button onClick={() => ativar.mutate(p.id)} className="btn btn-sm btn-success">Ativar</button>
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
        <div className="mt-5 card card-body">
          <h2 className="text-base font-semibold text-gray-800 mb-4">{editing ? 'Editar Profissional' : 'Novo Profissional'}</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label className="form-label">Nome</label>
              <input {...register('nome')} className="form-input" />
              {errors.nome && <span className="form-error">{errors.nome.message}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input {...register('email')} className="form-input" />
              {errors.email && <span className="form-error">{errors.email.message}</span>}
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="form-label">Telefone</label>
                <input {...register('telefone')} className="form-input" />
                {errors.telefone && <span className="form-error">{errors.telefone.message}</span>}
              </div>
              <div>
                <label className="form-label">Especialidade</label>
                <input {...register('especialidade')} className="form-input" />
                {errors.especialidade && <span className="form-error">{errors.especialidade.message}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button type="submit" className="btn btn-primary">{editing ? 'Salvar' : 'Criar'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); reset(); }} className="btn btn-secondary">Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profissionais;
