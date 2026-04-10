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
    <div>
      <div className="page-header">
        <h1 className="page-title">Profissionais</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); reset(); }} className="btn btn-primary">Novo</button>
      </div>

      {isLoading && <p className="text-brand-muted">Carregando...</p>}
      {isError && <p className="text-brand-danger">Erro ao carregar profissionais.</p>}

      {!isLoading && profissionais.length === 0 && <div className="empty-state">Sem profissionais cadastrados.</div>}

      {profissionais.length > 0 && (
        <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Especialidade</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {profissionais.map((p: any) => (
              <tr key={p.id}>
                <td>{p.nome}</td>
                <td className="text-brand-muted">{p.email || '-'}</td>
                <td>{p.telefone || '-'}</td>
                <td>{p.especialidade || '-'}</td>
                <td><span className={p.ativo ? 'badge badge-active' : 'badge badge-inactive'}>{p.ativo ? 'Ativo' : 'Inativo'}</span></td>
                <td>
                  <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(p.id)} className="btn btn-secondary btn-sm">Editar</button>
                  {p.ativo ? (
                    <button onClick={() => desativar.mutate(p.id)} className="btn btn-danger btn-sm">Desativar</button>
                  ) : (
                    <button onClick={() => ativar.mutate(p.id)} className="btn btn-success btn-sm">Ativar</button>
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
        <div className="modal-content max-w-lg">
          <h2 className="text-xl font-bold text-brand-text mb-4">{editing ? 'Editar Profissional' : 'Novo Profissional'}</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label>Nome</label>
              <input className="input" {...register('nome')} />
              {errors.nome && <p className="text-xs text-brand-danger mt-1">{errors.nome.message}</p>}
            </div>
            <div className="mb-3">
              <label>Email</label>
              <input className="input" {...register('email')} />
              {errors.email && <p className="text-xs text-brand-danger mt-1">{errors.email.message}</p>}
            </div>
            <div className="mb-3">
              <label>Telefone</label>
              <input className="input" {...register('telefone')} />
              {errors.telefone && <p className="text-xs text-brand-danger mt-1">{errors.telefone.message}</p>}
            </div>
            <div className="mb-4">
              <label>Especialidade</label>
              <input className="input" {...register('especialidade')} />
              {errors.especialidade && <p className="text-xs text-brand-danger mt-1">{errors.especialidade.message}</p>}
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); reset(); }} className="btn btn-secondary">Cancelar</button>
              <button type="submit" className="btn btn-primary">{editing ? 'Salvar' : 'Criar'}</button>
            </div>
          </form>
        </div>
        </div>
      )}


    </div>
  );
};

export default Profissionais;
