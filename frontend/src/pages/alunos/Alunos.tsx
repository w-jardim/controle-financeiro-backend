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
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Alunos</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); reset(); }} className="btn btn-primary">Novo Aluno</button>
      </div>

      {isLoading && <p>Carregando...</p>}
      {isError && <p>Erro ao carregar alunos.</p>}

      {!isLoading && alunos.length === 0 && <p>Nenhum aluno cadastrado.</p>}

      {alunos.length > 0 && (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">CPF</th>
              <th className="px-4 py-2">Telefone</th>
              <th className="px-4 py-2">CT</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {alunos.map((a: any) => (
              <tr key={a.id} className="border-t">
                <td className="px-4 py-2">{a.nome}</td>
                <td className="px-4 py-2">{a.cpf || '-'}</td>
                <td className="px-4 py-2">{a.telefone || '-'}</td>
                <td className="px-4 py-2">{(a.ct_id != null && ctById[String(a.ct_id)]) ? ctById[String(a.ct_id)] : '-'}</td>
                <td className="px-4 py-2">{a.ativo ? 'Ativo' : 'Inativo'}</td>
                <td className="px-4 py-2">
                  <button onClick={() => handleEdit(a.id)} className="btn btn-secondary mr-2">Editar</button>
                  {a.ativo ? (
                    <button onClick={() => { if (global.confirm?.('Confirma desativar?')) desativar.mutate(a.id); }} className="btn btn-danger">Desativar</button>
                  ) : (
                    <button onClick={() => { if (global.confirm?.('Confirma ativar?')) ativar.mutate(a.id); }} className="btn btn-success">Ativar</button>
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
            {/* CT is resolved automatically. If multiple CTs exist, show friendly selector. */}
            {cts.length > 1 && (
              <div className="mb-2">
                <label className="block" htmlFor="ct_select">Centro de Treinamento</label>
                <select id="ct_select" name="ct_select" className="input" value={selectedCtId ?? ''} onChange={(e) => setSelectedCtId(Number(e.target.value) || null)}>
                  <option value="">Selecione</option>
                  {cts.map((ct: any) => (
                    <option key={ct.id} value={ct.id}>{ct.nome}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="mb-2">
              <label className="block" htmlFor="nome">Nome</label>
              <input id="nome" name="nome" {...register('nome')} className="input" />
              {errors.nome && <p className="text-red-600">{errors.nome.message}</p>}
            </div>
            <div className="mb-2 grid grid-cols-2 gap-2">
              <div>
                <label className="block" htmlFor="cpf">CPF</label>
                <input id="cpf" name="cpf" className="input" {...register('cpf')} />
              </div>
              <div>
                <label className="block" htmlFor="data_nascimento">Data Nascimento</label>
                <input id="data_nascimento" name="data_nascimento" type="date" {...register('data_nascimento')} className="input" />
              </div>
            </div>
            <div className="mb-2 grid grid-cols-2 gap-2">
              <div>
                <label className="block" htmlFor="telefone">Telefone</label>
                <input id="telefone" name="telefone" {...register('telefone')} className="input" />
              </div>
              <div>
                <label className="block" htmlFor="email">Email</label>
                <input id="email" name="email" {...register('email')} className="input" />
              </div>
            </div>
            <div className="mb-2">
              <label className="block" htmlFor="nome_responsavel">Nome do responsável</label>
              <input id="nome_responsavel" name="nome_responsavel" {...register('nome_responsavel')} className="input" />
            </div>
            <div className="mb-2">
              <label className="block" htmlFor="telefone_responsavel">Telefone do responsável</label>
              <input id="telefone_responsavel" name="telefone_responsavel" {...register('telefone_responsavel')} className="input" />
            </div>
            <div className="flex items-center gap-2 mt-4">
              <button type="submit" disabled={isSubmitting} className="btn btn-primary">{editing ? 'Salvar' : 'Criar'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); reset(); }} className="btn">Cancelar</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default Alunos;
