import React, { useMemo, useState } from 'react';
import { useAlunos } from '../../hooks/useAlunos';
import { useHorarios } from '../../hooks/useHorarios';
import { useAgenda } from '../../hooks/useAgendaAulas';
import {
  useAgendamentos,
  useCriarAgendamento,
  useCancelarAgendamento,
  useAtualizarStatusAgendamento,
} from '../../hooks/useAgendamentos';

const STATUS_OPTIONS = ['agendado', 'cancelado', 'compareceu', 'faltou'] as const;

export default function Agendamentos() {
  const [showForm, setShowForm] = useState(false);
  const [referencia, setReferencia] = useState<'horario' | 'agenda'>('horario');
  const [form, setForm] = useState({
    aluno_id: '',
    horario_aula_id: '',
    agenda_aula_id: '',
    data_aula: '',
    observacao: '',
  });

  const { data, isLoading, isError } = useAgendamentos();
  const { data: alunosData } = useAlunos();
  const { data: horariosData } = useHorarios(1, 100);
  const { data: agendaData } = useAgenda(1, 100);
  const criar = useCriarAgendamento();
  const cancelar = useCancelarAgendamento();
  const atualizarStatus = useAtualizarStatusAgendamento();

  const agendamentos = useMemo(() => data?.dados || [], [data]);
  const alunos = useMemo(() => alunosData?.dados || [], [alunosData]);
  const horarios = useMemo(() => horariosData?.dados || [], [horariosData]);
  const agendaAulas = useMemo(() => agendaData?.dados || [], [agendaData]);

  const alunoById = useMemo(() => {
    const map = new Map<number, string>();
    for (const aluno of alunos) map.set(aluno.id, aluno.nome);
    return map;
  }, [alunos]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.aluno_id || !form.data_aula) return;

    const payload: Record<string, unknown> = {
      aluno_id: Number(form.aluno_id),
      data_aula: form.data_aula,
      observacao: form.observacao || undefined,
    };

    if (referencia === 'horario') payload.horario_aula_id = Number(form.horario_aula_id);
    if (referencia === 'agenda') payload.agenda_aula_id = Number(form.agenda_aula_id);

    await criar.mutateAsync(payload as any);

    setForm({ aluno_id: '', horario_aula_id: '', agenda_aula_id: '', data_aula: '', observacao: '' });
    setShowForm(false);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Agendamentos</h1>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>+ Novo Agendamento</button>
      </div>

      {isLoading && <p className="state-loading">Carregando...</p>}
      {isError && <p className="alert-error">Erro ao carregar agendamentos.</p>}

      {showForm && (
        <div className="card card-body mb-4">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Novo Agendamento</h2>
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
                <label className="form-label">Data da Aula</label>
                <input type="date" className="form-input" value={form.data_aula} onChange={(e) => setForm((f) => ({ ...f, data_aula: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="form-label">Referência</label>
                <select className="form-select" value={referencia} onChange={(e) => setReferencia(e.target.value as 'horario' | 'agenda')}>
                  <option value="horario">Horário</option>
                  <option value="agenda">Agenda Aula</option>
                </select>
              </div>
              <div>
                {referencia === 'horario' ? (
                  <>
                    <label className="form-label">Horário</label>
                    <select className="form-select" value={form.horario_aula_id} onChange={(e) => setForm((f) => ({ ...f, horario_aula_id: e.target.value }))}>
                      <option value="">Selecione</option>
                      {horarios.map((h) => (
                        <option key={h.id} value={h.id}>#{h.id} - {h.hora_inicio} às {h.hora_fim}</option>
                      ))}
                    </select>
                  </>
                ) : (
                  <>
                    <label className="form-label">Agenda Aula</label>
                    <select className="form-select" value={form.agenda_aula_id} onChange={(e) => setForm((f) => ({ ...f, agenda_aula_id: e.target.value }))}>
                      <option value="">Selecione</option>
                      {agendaAulas.map((a) => (
                        <option key={a.id} value={a.id}>#{a.id} - {a.data_aula} {a.hora_inicio}-{a.hora_fim}</option>
                      ))}
                    </select>
                  </>
                )}
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
              <th className="table-th">Data</th>
              <th className="table-th">Referência</th>
              <th className="table-th">Status</th>
              <th className="table-th">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {agendamentos.map((a: any) => (
              <tr key={a.id} className="table-row">
                <td className="table-td">{alunoById.get(a.aluno_id) || `#${a.aluno_id}`}</td>
                <td className="table-td">{String(a.data_aula).slice(0, 10)}</td>
                <td className="table-td">{a.agenda_aula_id ? `Agenda #${a.agenda_aula_id}` : `Horário #${a.horario_aula_id}`}</td>
                <td className="table-td">
                  <span className={a.status === 'cancelado' ? 'badge-inactive' : 'badge-active'}>{a.status}</span>
                </td>
                <td className="table-td">
                  <div className="flex gap-2">
                    <select
                      className="form-select !w-36"
                      defaultValue={a.status}
                      onChange={(e) => atualizarStatus.mutate({ id: a.id, status: e.target.value })}
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button className="btn btn-sm btn-danger" onClick={() => cancelar.mutate(a.id)}>
                      Cancelar
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
