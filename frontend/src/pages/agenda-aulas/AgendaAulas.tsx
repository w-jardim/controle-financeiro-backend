import React, { useMemo, useState } from 'react';
import { useAgenda, useCriarAgenda } from '../../hooks/useAgendaAulas';
import type { CriarAgendaPayload } from '../../types/agendaAula';

const AgendaAulas: React.FC = () => {
  const page = 1;
  const { data, isLoading, isError } = useAgenda(page, 50);
  const agenda = useMemo(() => data?.dados || [], [data]);

  const criarMut = useCriarAgenda();

  const [form, setForm] = useState<Partial<CriarAgendaPayload>>({});

  const handleCreate = async () => {
    try {
      await criarMut.mutateAsync(form as CriarAgendaPayload);
      setForm({});
    } catch {
      return;
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Agenda de Aulas</h1>
      </div>

      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-brand-text mb-4">Criar Aula Manual</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label>CT id</label>
            <input className="input" type="number" value={form.ct_id || ''} onChange={(e) => setForm({ ...form, ct_id: Number(e.target.value) })} />
          </div>
          <div>
            <label>Modalidade id</label>
            <input className="input" type="number" value={form.modalidade_id || ''} onChange={(e) => setForm({ ...form, modalidade_id: Number(e.target.value) })} />
          </div>
          <div>
            <label>Profissional id</label>
            <input className="input" type="number" value={form.profissional_id || ''} onChange={(e) => setForm({ ...form, profissional_id: Number(e.target.value) })} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <label>Data</label>
            <input className="input" type="date" value={form.data_aula || ''} onChange={(e) => setForm({ ...form, data_aula: e.target.value })} />
          </div>
          <div>
            <label>Hora início</label>
            <input className="input" type="time" value={form.hora_inicio || ''} onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })} />
          </div>
          <div>
            <label>Hora fim</label>
            <input className="input" type="time" value={form.hora_fim || ''} onChange={(e) => setForm({ ...form, hora_fim: e.target.value })} />
          </div>
        </div>
        <div className="mt-4">
          <button onClick={handleCreate} className="btn btn-primary">Criar Aula</button>
        </div>
      </div>

      {isLoading && <p className="text-brand-muted">Carregando...</p>}
      {isError && <p className="text-brand-danger">Erro ao carregar agenda.</p>}
      {!isLoading && agenda.length === 0 && <div className="empty-state">Nenhuma aula agendada.</div>}
      {agenda.length > 0 && (
        <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>CT</th>
              <th>Modalidade</th>
              <th>Profissional</th>
              <th>Data</th>
              <th>Horário</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {agenda.map((a: any) => (
              <tr key={a.id}> 
                <td>{a.ct_id}</td>
                <td>{a.modalidade_id}</td>
                <td>{a.profissional_id}</td>
                <td>{a.data_aula}</td>
                <td>{a.hora_inicio} - {a.hora_fim}</td>
                <td><span className="badge badge-primary">{a.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
};

export default AgendaAulas;
