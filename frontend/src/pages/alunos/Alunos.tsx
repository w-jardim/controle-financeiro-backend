import React, { useState, useMemo, useEffect } from 'react';
import { useAlunos, useCriarAluno, useAtualizarAluno, useDesativarAluno, useAtivarAluno } from '../../hooks/useAlunos';
import { useCts } from '../../hooks/useCts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { criarAlunoSchema, atualizarAlunoSchema } from '../../schemas/aluno.schema';
import type { CriarAlunoPayload, AtualizarAlunoPayload } from '../../types/aluno';

const Alunos: React.FC = () => {
  const [filters, _setFilters] = useState<Record<string, any>>({});
  const [editing, setEditing] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedCtId, setSelectedCtId] = useState<number | null>(null);

  const { data, isLoading, isError } = useAlunos(filters);
  const criar = useCriarAluno();
  const atualizar = useAtualizarAluno();
  const desativar = useDesativarAluno();
  const ativar = useAtivarAluno();

  const alunos = useMemo(() => data?.dados || [], [data]);
  const { data: ctsData, isLoading: ctsLoading } = useCts();
  const cts = useMemo(() => ctsData?.dados || [], [ctsData]);

  // map ct id -> nome for display purposes
  const ctById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const ct of cts) {
      if (ct && ct.id != null) map[String(ct.id)] = ct.nome;
    }
    return map;
  }, [cts]);

  useEffect(() => {
    if (!ctsLoading && cts.length === 1) {
      setSelectedCtId(cts[0].id);
    }
  }, [ctsLoading, cts]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CriarAlunoPayload>({
    resolver: zodResolver(editing ? atualizarAlunoSchema : criarAlunoSchema),
  });

  const onSubmit = async (formData: any) => {
    try {
      const payload = { ...formData } as any;
      // ensure ct_id present: if user didn't select but only one CT exists we use it
      if (!payload.ct_id) payload.ct_id = selectedCtId ?? undefined;

      if (editing) {
        await atualizar.mutateAsync({ id: editing, dados: payload as AtualizarAlunoPayload });
      } else {
        await criar.mutateAsync(payload as any);
      }
      reset();
      setShowForm(false);
      setEditing(null);
    } catch (err: any) {
      // API errors surfaced via mutation error state; form remains open to show message
    }
  };

  const handleEdit = (id: number) => {
    const item = alunos.find((a: any) => a.id === id);
    if (!item) return;
    reset({
      ct_id: item.ct_id,
      nome: item.nome,
      cpf: item.cpf ?? undefined,
      data_nascimento: item.data_nascimento ?? undefined,
      sexo: item.sexo ?? undefined,
      telefone: item.telefone ?? undefined,
      email: item.email ?? undefined,
      nome_responsavel: item.nome_responsavel ?? undefined,
      telefone_responsavel: item.telefone_responsavel ?? undefined,
    });
    setEditing(id);
    setShowForm(true);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Alunos</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); reset(); }} className="btn btn-primary">+ Novo Aluno</button>
      </div>

      {isLoading && <p className="state-loading">Carregando...</p>}
      {isError && <p className="alert-error">Erro ao carregar alunos.</p>}

      {!isLoading && alunos.length === 0 && !showForm && (
        <div className="card card-body state-empty">Nenhum aluno cadastrado.</div>
      )}

      {alunos.length > 0 && (
        <div className="table-wrapper">
          <table className="table-base">
            <thead>
              <tr>
                <th className="table-th">Nome</th>
                <th className="table-th">CPF</th>
                <th className="table-th">Telefone</th>
                <th className="table-th">CT</th>
                <th className="table-th">Status</th>
                <th className="table-th">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {alunos.map((a: any) => (
                <tr key={a.id} className="table-row">
                  <td className="table-td font-medium text-gray-900">{a.nome}</td>
                  <td className="table-td">{a.cpf || '-'}</td>
                  <td className="table-td">{a.telefone || '-'}</td>
                  <td className="table-td">{(a.ct_id != null && ctById[String(a.ct_id)]) ? ctById[String(a.ct_id)] : '-'}</td>
                  <td className="table-td">
                    <span className={a.ativo ? 'badge-active' : 'badge-inactive'}>
                      {a.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="table-td">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(a.id)} className="btn btn-sm btn-secondary">Editar</button>
                      {a.ativo ? (
                        <button onClick={() => { if (confirm('Confirma desativar?')) desativar.mutate(a.id); }} className="btn btn-sm btn-danger">Desativar</button>
                      ) : (
                        <button onClick={() => { if (confirm('Confirma ativar?')) ativar.mutate(a.id); }} className="btn btn-sm btn-success">Ativar</button>
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
          <h2 className="text-base font-semibold text-gray-800 mb-4">{editing ? 'Editar Aluno' : 'Novo Aluno'}</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label className="form-label" htmlFor="ct_select">Centro de Treinamento</label>
              <select
                id="ct_select"
                className="form-select"
                value={selectedCtId ?? ''}
                onChange={(e) => setSelectedCtId(Number(e.target.value) || null)}
                aria-label="Centro de Treinamento"
              >
                {ctsLoading ? (
                  <option value="">Carregando CTs...</option>
                ) : cts.length === 0 ? (
                  <option value="">Nenhum CT cadastrado</option>
                ) : (
                  <>
                    <option value="">Selecione um CT</option>
                    {cts.map((ct: any) => (
                      <option key={ct.id} value={ct.id}>{ct.nome}</option>
                    ))}
                  </>
                )}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="nome">Nome</label>
              <input id="nome" {...register('nome')} className="form-input" />
              {errors.nome && <span className="form-error">{errors.nome?.message}</span>}
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="form-label" htmlFor="cpf">CPF</label>
                <input id="cpf" className="form-input" {...register('cpf')} />
              </div>
              <div>
                <label className="form-label" htmlFor="data_nascimento">Data Nascimento</label>
                <input id="data_nascimento" type="date" {...register('data_nascimento')} className="form-input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="form-label" htmlFor="telefone">Telefone</label>
                <input id="telefone" {...register('telefone')} className="form-input" />
              </div>
              <div>
                <label className="form-label" htmlFor="email">Email</label>
                <input id="email" {...register('email')} className="form-input" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="nome_responsavel">Nome do responsável</label>
              <input id="nome_responsavel" {...register('nome_responsavel')} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="telefone_responsavel">Telefone do responsável</label>
              <input id="telefone_responsavel" {...register('telefone_responsavel')} className="form-input" />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button type="submit" disabled={isSubmitting || (!ctsLoading && cts.length === 0)} className="btn btn-primary">
                {editing ? 'Salvar' : 'Criar'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); reset(); }} className="btn btn-secondary">Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Alunos;
