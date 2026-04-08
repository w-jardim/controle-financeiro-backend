import React, { useMemo, useState } from 'react';
import { useAgendamentos } from '../../hooks/useAgendamentos';
import {
  usePresencas,
  useCriarPresenca,
  useAtualizarStatusPresenca,
  useAtualizarPresenca,
} from '../../hooks/usePresencas';

const STATUS_OPTIONS = ['compareceu', 'faltou', 'reposicao', 'justificada'] as const;

export default function Presencas() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ agendamento_id: '', status: 'compareceu', observacao: '' });

  const { data } = usePresencas();
  const { data: agData } = useAgendamentos();
  const criar = useCriarPresenca();
  const atualizarStatus = useAtualizarStatusPresenca();
  const atualizar = useAtualizarPresenca();

  const presencas = useMemo(() => data?.dados || [], [data]);
  const agendamentos = useMemo(() => agData?.dados || [], [agData]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.agendamento_id) return;

    await criar.mutateAsync({
      agendamento_id: Number(form.agendamento_id),
      status: form.status as any,
      observacao: form.observacao || undefined,
    });
    setForm({ agendamento_id: '', status: 'compareceu', observacao: '' });
    setShowForm(false);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Presenças</h1>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>+ Registrar Presença</button>
      </div>

      {showForm && (
        <div className="card card-body mb-4">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Novo Registro</h2>
          <form onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="form-label">Agendamento</label>
                <select className="form-select" value={form.agendamento_id} onChange={(e) => setForm((f) => ({ ...f, agendamento_id: e.target.value }))}>
                  <option value="">Selecione</option>
                  {agendamentos.map((a: any) => (
                    <option key={a.id} value={a.id}>#{a.id} - {String(a.data_aula).slice(0, 10)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
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
              <th className="table-th">ID</th>
              <th className="table-th">Agendamento</th>
              <th className="table-th">Status</th>
              <th className="table-th">Observação</th>
              <th className="table-th">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {presencas.map((p: any) => (
              <tr key={p.id} className="table-row">
                <td className="table-td">#{p.id}</td>
                <td className="table-td">#{p.agendamento_id}</td>
                <td className="table-td"><span className="badge-active">{p.status}</span></td>
                <td className="table-td">{p.observacao || '-'}</td>
                <td className="table-td">
                  <div className="flex gap-2">
                    <select className="form-select !w-36" defaultValue={p.status} onChange={(e) => atualizarStatus.mutate({ id: p.id, status: e.target.value })}>
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => {
                        const observacao = window.prompt('Atualizar observação', p.observacao || '');
                        if (observacao !== null) atualizar.mutate({ id: p.id, dados: { observacao } });
                      }}
                    >
                      Obs.
                    </button>
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
