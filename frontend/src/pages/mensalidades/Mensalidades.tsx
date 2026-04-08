import React, { useMemo, useState } from 'react';
import { useAlunos } from '../../hooks/useAlunos';
import {
  useMensalidades,
  useCriarMensalidade,
  usePagarMensalidade,
  useCancelarMensalidade,
} from '../../hooks/useMensalidades';

export default function Mensalidades() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    aluno_id: '',
    competencia: '',
    valor: '',
    vencimento: '',
    observacao: '',
  });

  const { data } = useMensalidades();
  const { data: alunosData } = useAlunos();
  const criar = useCriarMensalidade();
  const pagar = usePagarMensalidade();
  const cancelar = useCancelarMensalidade();

  const mensalidades = useMemo(() => data?.dados || [], [data]);
  const alunos = useMemo(() => alunosData?.dados || [], [alunosData]);
  const alunoById = useMemo(() => {
    const map = new Map<number, string>();
    for (const a of alunos) map.set(a.id, a.nome);
    return map;
  }, [alunos]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.aluno_id || !form.competencia || !form.valor || !form.vencimento) return;

    await criar.mutateAsync({
      aluno_id: Number(form.aluno_id),
      competencia: form.competencia,
      valor: Number(form.valor),
      vencimento: form.vencimento,
      observacao: form.observacao || undefined,
    });

    setForm({ aluno_id: '', competencia: '', valor: '', vencimento: '', observacao: '' });
    setShowForm(false);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Mensalidades</h1>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>+ Nova Mensalidade</button>
      </div>

      {showForm && (
        <div className="card card-body mb-4">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Nova Mensalidade</h2>
          <form onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="form-label">Aluno</label>
                <select className="form-select" value={form.aluno_id} onChange={(e) => setForm((f) => ({ ...f, aluno_id: e.target.value }))}>
                  <option value="">Selecione</option>
                  {alunos.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Competência</label>
                <input type="month" className="form-input" value={form.competencia} onChange={(e) => setForm((f) => ({ ...f, competencia: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="form-label">Valor</label>
                <input type="number" step="0.01" className="form-input" value={form.valor} onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Vencimento</label>
                <input type="date" className="form-input" value={form.vencimento} onChange={(e) => setForm((f) => ({ ...f, vencimento: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Observação</label>
              <input className="form-input" value={form.observacao} onChange={(e) => setForm((f) => ({ ...f, observacao: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={criar.isPending}>Salvar</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-wrapper">
        <table className="table-base">
          <thead>
            <tr>
              <th className="table-th">Aluno</th>
              <th className="table-th">Competência</th>
              <th className="table-th">Valor</th>
              <th className="table-th">Vencimento</th>
              <th className="table-th">Status</th>
              <th className="table-th">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mensalidades.map((m: any) => (
              <tr key={m.id} className="table-row">
                <td className="table-td">{alunoById.get(m.aluno_id) || `#${m.aluno_id}`}</td>
                <td className="table-td">{m.competencia}</td>
                <td className="table-td">R$ {Number(m.valor || 0).toFixed(2)}</td>
                <td className="table-td">{String(m.vencimento).slice(0, 10)}</td>
                <td className="table-td">
                  <span className={m.status === 'pendente' ? 'badge-inactive' : 'badge-active'}>{m.status}</span>
                </td>
                <td className="table-td">
                  <div className="flex gap-2">
                    <button className="btn btn-sm btn-success" disabled={m.status !== 'pendente'} onClick={() => pagar.mutate({ id: m.id })}>Pagar</button>
                    <button className="btn btn-sm btn-danger" disabled={m.status !== 'pendente'} onClick={() => cancelar.mutate(m.id)}>Cancelar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
