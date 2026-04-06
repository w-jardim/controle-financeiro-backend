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
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Agenda de Aulas</h1>
      </div>

      <div className="mb-6">
        <h2 className="font-semibold">Criar Aula Manual</h2>
        <div className="grid grid-cols-3 gap-4">
          <input placeholder="CT id" value={form.ct_id || ''} onChange={(e) => setForm({ ...form, ct_id: Number(e.target.value) })} className="input" />
          <input placeholder="Modalidade id" value={form.modalidade_id || ''} onChange={(e) => setForm({ ...form, modalidade_id: Number(e.target.value) })} className="input" />
          <input placeholder="Profissional id" value={form.profissional_id || ''} onChange={(e) => setForm({ ...form, profissional_id: Number(e.target.value) })} className="input" />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <input placeholder="Data (YYYY-MM-DD)" value={form.data_aula || ''} onChange={(e) => setForm({ ...form, data_aula: e.target.value })} className="input" />
          <input placeholder="Hora início" value={form.hora_inicio || ''} onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })} className="input" />
          <input placeholder="Hora fim" value={form.hora_fim || ''} onChange={(e) => setForm({ ...form, hora_fim: e.target.value })} className="input" />
        </div>
        <div className="mt-4">
          <button onClick={handleCreate} className="btn btn-primary">Criar Aula</button>
        </div>
      </div>

      {isLoading && <p>Carregando...</p>}
      {isError && <p>Erro ao carregar agenda.</p>}
      {!isLoading && agenda.length === 0 && <p>Nenhuma aula agendada.</p>}
      {agenda.length > 0 && (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2">CT</th>
              <th className="px-4 py-2">Modalidade</th>
              <th className="px-4 py-2">Profissional</th>
              <th className="px-4 py-2">Data</th>
              <th className="px-4 py-2">Horário</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {agenda.map((a: any) => (
              <tr key={a.id}> 
                <td className="px-4 py-2">{a.ct_id}</td>
                <td className="px-4 py-2">{a.modalidade_id}</td>
                <td className="px-4 py-2">{a.profissional_id}</td>
                <td className="px-4 py-2">{a.data_aula}</td>
                <td className="px-4 py-2">{a.hora_inicio} - {a.hora_fim}</td>
                <td className="px-4 py-2">{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AgendaAulas;
