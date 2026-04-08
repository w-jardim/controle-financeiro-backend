import React, { useMemo, useState } from 'react';
import { useCts } from '../../hooks/useCts';
import { useDeletarTransacao, useResumoTransacoes, useTransacoes, useCriarTransacao } from '../../hooks/useTransacoes';

export default function Transacoes() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tipo: 'receita', descricao: '', valor: '', ct_id: '' });

  const { data } = useTransacoes();
  const { data: resumo } = useResumoTransacoes();
  const { data: ctsData } = useCts();
  const criar = useCriarTransacao();
  const deletar = useDeletarTransacao();

  const transacoes = useMemo(() => data?.dados || [], [data]);
  const cts = useMemo(() => ctsData?.dados || [], [ctsData]);
  const ctById = useMemo(() => {
    const map = new Map<number, string>();
    for (const ct of cts) map.set(ct.id, ct.nome);
    return map;
  }, [cts]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.descricao || !form.valor) return;

    await criar.mutateAsync({
      tipo: form.tipo as 'receita' | 'despesa',
      descricao: form.descricao,
      valor: Number(form.valor),
      ct_id: form.ct_id ? Number(form.ct_id) : null,
    });

    setForm({ tipo: 'receita', descricao: '', valor: '', ct_id: '' });
    setShowForm(false);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Transações</h1>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>+ Nova Transação</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="card card-body">
          <span className="text-sm text-gray-500">Receitas</span>
          <strong className="text-2xl text-emerald-600">R$ {Number(resumo?.dados.totalReceitas || 0).toFixed(2)}</strong>
        </div>
        <div className="card card-body">
          <span className="text-sm text-gray-500">Despesas</span>
          <strong className="text-2xl text-red-600">R$ {Number(resumo?.dados.totalDespesas || 0).toFixed(2)}</strong>
        </div>
        <div className="card card-body">
          <span className="text-sm text-gray-500">Saldo</span>
          <strong className="text-2xl text-indigo-700">R$ {Number(resumo?.dados.saldo || 0).toFixed(2)}</strong>
        </div>
      </div>

      {showForm && (
        <div className="card card-body mb-4">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Nova Transação</h2>
          <form onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="form-label">Tipo</label>
                <select className="form-select" value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}>
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                </select>
              </div>
              <div>
                <label className="form-label">Valor</label>
                <input type="number" step="0.01" className="form-input" value={form.valor} onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="form-label">Descrição</label>
                <input className="form-input" value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">CT (opcional)</label>
                <select className="form-select" value={form.ct_id} onChange={(e) => setForm((f) => ({ ...f, ct_id: e.target.value }))}>
                  <option value="">Sem CT</option>
                  {cts.map((ct) => <option key={ct.id} value={ct.id}>{ct.nome}</option>)}
                </select>
              </div>
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
              <th className="table-th">Tipo</th>
              <th className="table-th">Descrição</th>
              <th className="table-th">Valor</th>
              <th className="table-th">CT</th>
              <th className="table-th">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transacoes.map((t: any) => (
              <tr key={t.id} className="table-row">
                <td className="table-td"><span className={t.tipo === 'receita' ? 'badge-active' : 'badge-inactive'}>{t.tipo}</span></td>
                <td className="table-td">{t.descricao}</td>
                <td className="table-td">R$ {Number(t.valor || 0).toFixed(2)}</td>
                <td className="table-td">{t.ct_id ? (ctById.get(t.ct_id) || `#${t.ct_id}`) : '-'}</td>
                <td className="table-td">
                  <button className="btn btn-sm btn-danger" onClick={() => deletar.mutate(t.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
