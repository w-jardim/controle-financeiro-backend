import React, { useMemo, useState } from 'react';
import {
  useAgenda,
  useCriarAgenda,
  useGerarPorEscala,
  useLiberarAgenda,
  useCancelarAgenda,
  useEncerrarAgenda,
} from '../../hooks/useAgendaAulas';
import { useEscalas } from '../../hooks/useEscalas';
import { useCts } from '../../hooks/useCts';
import { useModalidades } from '../../hooks/useModalidades';
import { useProfissionais } from '../../hooks/useProfissionais';
import type { AgendaAula, AgendaFiltros, CriarAgendaPayload } from '../../types/agendaAula';
import type { Escala } from '../../types/escala';

const STATUS_LABEL: Record<string, string> = {
  rascunho: 'Rascunho',
  liberada: 'Liberada',
  cancelada: 'Cancelada',
  encerrada: 'Encerrada',
};

const STATUS_COR: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-700',
  liberada: 'bg-green-100 text-green-700',
  cancelada: 'bg-red-100 text-red-700',
  encerrada: 'bg-blue-100 text-blue-700',
};

type Aba = 'lista' | 'manual' | 'escala';

const AgendaAulas: React.FC = () => {
  const [aba, setAba] = useState<Aba>('lista');

  // ─── Filtros ─────────────────────────────────────────────────────────────────
  const [filtros, setFiltros] = useState<AgendaFiltros>({});
  const [filtroTemp, setFiltroTemp] = useState<AgendaFiltros>({});

  const { data, isLoading, isError } = useAgenda(1, 50, filtros);
  const agenda = useMemo<AgendaAula[]>(() => data?.dados || [], [data]);

  // ─── Dependências para selects ────────────────────────────────────────────────
  const { data: ctsData } = useCts();
  const { data: modalidadesData } = useModalidades(1, 100);
  const { data: profissionaisData } = useProfissionais(1, 100);
  const { data: escalasData } = useEscalas(1, 100);

  const cts = useMemo(() => ctsData?.dados || [], [ctsData]);
  const modalidades = useMemo(() => modalidadesData?.dados || [], [modalidadesData]);
  const profissionais = useMemo(() => profissionaisData?.dados || [], [profissionaisData]);
  const escalas = useMemo<Escala[]>(() => escalasData?.dados || [], [escalasData]);
  const escalasAtivas = useMemo(() => escalas.filter((e) => e.ativo), [escalas]);

  // ─── Mutations ────────────────────────────────────────────────────────────────
  const criarMut = useCriarAgenda();
  const gerarMut = useGerarPorEscala();
  const liberarMut = useLiberarAgenda();
  const cancelarMut = useCancelarAgenda();
  const encerrarMut = useEncerrarAgenda();

  // ─── Form manual ─────────────────────────────────────────────────────────────
  const [formManual, setFormManual] = useState<Partial<CriarAgendaPayload>>({});

  const handleCriarManual = async () => {
    const { ct_id, modalidade_id, profissional_id, data_aula, hora_inicio, hora_fim } = formManual;
    if (!ct_id || !modalidade_id || !profissional_id || !data_aula || !hora_inicio || !hora_fim) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }
    try {
      await criarMut.mutateAsync(formManual as CriarAgendaPayload);
      setFormManual({});
      setAba('lista');
    } catch {
      return;
    }
  };

  // ─── Form gerar por escala ────────────────────────────────────────────────────
  const [gerarForm, setGerarForm] = useState<{ escala_id: number | ''; data_inicio: string; data_fim: string }>({
    escala_id: '',
    data_inicio: '',
    data_fim: '',
  });

  const handleGerar = async () => {
    if (!gerarForm.escala_id || !gerarForm.data_inicio || !gerarForm.data_fim) {
      alert('Preencha escala, data início e data fim.');
      return;
    }
    try {
      const res = await gerarMut.mutateAsync({
        escala_id: Number(gerarForm.escala_id),
        data_inicio: gerarForm.data_inicio,
        data_fim: gerarForm.data_fim,
      });
      const msg = res?.dados;
      alert(`Gerado: ${msg?.criado ?? 0} aula(s). Ignoradas (já existentes): ${msg?.ignorados ?? 0}`);
      setAba('lista');
    } catch {
      return;
    }
  };

  const aplicarFiltros = () => setFiltros({ ...filtroTemp });
  const limparFiltros = () => { setFiltroTemp({}); setFiltros({}); };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Agenda de Aulas</h1>
        <div className="flex gap-2">
          <button
            className={`btn ${aba === 'lista' ? 'btn-primary' : ''}`}
            onClick={() => setAba('lista')}
          >
            Lista
          </button>
          <button
            className={`btn ${aba === 'manual' ? 'btn-primary' : ''}`}
            onClick={() => setAba('manual')}
          >
            + Aula Manual
          </button>
          <button
            className={`btn ${aba === 'escala' ? 'btn-primary' : ''}`}
            onClick={() => setAba('escala')}
          >
            Gerar por Escala
          </button>
        </div>
      </div>

      {/* ─── Aba: Gerar por Escala ─────────────────────────────────────────────── */}
      {aba === 'escala' && (
        <div className="mb-6 p-4 border rounded bg-white">
          <h2 className="font-semibold mb-4">Gerar Aulas a partir de Escala</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Escala</label>
              <select
                className="input"
                value={gerarForm.escala_id}
                onChange={(e) => setGerarForm({ ...gerarForm, escala_id: e.target.value ? Number(e.target.value) : '' })}
              >
                <option value="">Selecione uma escala</option>
                {escalasAtivas.map((e) => (
                  <option key={e.id} value={e.id}>
                    #{e.id} — {e.hora_inicio}–{e.hora_fim}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data Início</label>
              <input
                type="date"
                className="input"
                value={gerarForm.data_inicio}
                onChange={(e) => setGerarForm({ ...gerarForm, data_inicio: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data Fim</label>
              <input
                type="date"
                className="input"
                value={gerarForm.data_fim}
                onChange={(e) => setGerarForm({ ...gerarForm, data_fim: e.target.value })}
              />
            </div>
          </div>
          {gerarForm.escala_id && (
            <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
              {(() => {
                const esc = escalasAtivas.find((e) => e.id === gerarForm.escala_id);
                if (!esc) return null;
                const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                return (
                  <span>
                    Escala selecionada: horário <strong>{esc.hora_inicio}–{esc.hora_fim}</strong>
                    {' '}nos dias <strong>{esc.dias_semana.map((d) => DIAS[d]).join(', ')}</strong>
                  </span>
                );
              })()}
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <button
              className="btn btn-primary"
              onClick={handleGerar}
              disabled={gerarMut.isPending}
            >
              {gerarMut.isPending ? 'Gerando...' : 'Gerar Aulas'}
            </button>
            <button className="btn" onClick={() => setAba('lista')}>Cancelar</button>
          </div>
        </div>
      )}

      {/* ─── Aba: Criar Aula Manual ────────────────────────────────────────────── */}
      {aba === 'manual' && (
        <div className="mb-6 p-4 border rounded bg-white">
          <h2 className="font-semibold mb-4">Criar Aula Manual</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">CT</label>
              <select className="input" value={formManual.ct_id || ''} onChange={(e) => setFormManual({ ...formManual, ct_id: Number(e.target.value) })}>
                <option value="">Selecione</option>
                {cts.map((c: any) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Modalidade</label>
              <select className="input" value={formManual.modalidade_id || ''} onChange={(e) => setFormManual({ ...formManual, modalidade_id: Number(e.target.value) })}>
                <option value="">Selecione</option>
                {modalidades.map((m: any) => <option key={m.id} value={m.id}>{m.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Profissional</label>
              <select className="input" value={formManual.profissional_id || ''} onChange={(e) => setFormManual({ ...formManual, profissional_id: Number(e.target.value) })}>
                <option value="">Selecione</option>
                {profissionais.map((p: any) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Escala (opcional)</label>
              <select className="input" value={formManual.escala_id || ''} onChange={(e) => setFormManual({ ...formManual, escala_id: e.target.value ? Number(e.target.value) : null })}>
                <option value="">Sem vínculo com escala</option>
                {escalasAtivas.map((e) => (
                  <option key={e.id} value={e.id}>#{e.id} — {e.hora_inicio}–{e.hora_fim}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data</label>
              <input type="date" className="input" value={formManual.data_aula || ''} onChange={(e) => setFormManual({ ...formManual, data_aula: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hora Início</label>
              <input type="time" className="input" value={formManual.hora_inicio || ''} onChange={(e) => setFormManual({ ...formManual, hora_inicio: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Hora Fim</label>
              <input type="time" className="input" value={formManual.hora_fim || ''} onChange={(e) => setFormManual({ ...formManual, hora_fim: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Observação</label>
              <input type="text" className="input" placeholder="Opcional" value={formManual.observacao || ''} onChange={(e) => setFormManual({ ...formManual, observacao: e.target.value })} />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="btn btn-primary" onClick={handleCriarManual} disabled={criarMut.isPending}>
              {criarMut.isPending ? 'Criando...' : 'Criar Aula'}
            </button>
            <button className="btn" onClick={() => setAba('lista')}>Cancelar</button>
          </div>
        </div>
      )}

      {/* ─── Aba: Lista ───────────────────────────────────────────────────────────── */}
      {aba === 'lista' && (
        <>
          {/* Filtros */}
          <div className="mb-4 p-3 border rounded bg-gray-50">
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Status</label>
                <select className="input" value={filtroTemp.status || ''} onChange={(e) => setFiltroTemp({ ...filtroTemp, status: e.target.value || undefined })}>
                  <option value="">Todos</option>
                  <option value="rascunho">Rascunho</option>
                  <option value="liberada">Liberada</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="encerrada">Encerrada</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Escala</label>
                <select className="input" value={filtroTemp.escala_id || ''} onChange={(e) => setFiltroTemp({ ...filtroTemp, escala_id: e.target.value ? Number(e.target.value) : undefined })}>
                  <option value="">Todas</option>
                  {escalas.map((e) => <option key={e.id} value={e.id}>#{e.id}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Data Início</label>
                <input type="date" className="input" value={filtroTemp.data_inicio || ''} onChange={(e) => setFiltroTemp({ ...filtroTemp, data_inicio: e.target.value || undefined })} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Data Fim</label>
                <input type="date" className="input" value={filtroTemp.data_fim || ''} onChange={(e) => setFiltroTemp({ ...filtroTemp, data_fim: e.target.value || undefined })} />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="btn btn-primary" onClick={aplicarFiltros}>Filtrar</button>
              <button className="btn" onClick={limparFiltros}>Limpar</button>
            </div>
          </div>

          {isLoading && <p>Carregando...</p>}
          {isError && <p className="text-red-600">Erro ao carregar agenda.</p>}
          {!isLoading && agenda.length === 0 && <p className="text-gray-500">Nenhuma aula encontrada.</p>}

          {agenda.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">#</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">CT</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Modalidade</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Profissional</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Data</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Horário</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Escala</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {agenda.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm">{a.id}</td>
                      <td className="px-3 py-2 text-sm">{a.ct_nome || a.ct_id}</td>
                      <td className="px-3 py-2 text-sm">{a.modalidade_nome || a.modalidade_id}</td>
                      <td className="px-3 py-2 text-sm">{a.profissional_nome || a.profissional_id}</td>
                      <td className="px-3 py-2 text-sm">{a.data_aula}</td>
                      <td className="px-3 py-2 text-sm whitespace-nowrap">
                        {a.hora_inicio?.slice(0, 5)} – {a.hora_fim?.slice(0, 5)}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        {a.escala_id ? (
                          <span className="text-blue-600 font-medium">#{a.escala_id}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COR[a.status] || ''}`}>
                          {STATUS_LABEL[a.status] || a.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          {a.status === 'rascunho' && (
                            <button
                              className="btn btn-sm text-xs"
                              onClick={() => liberarMut.mutate(a.id)}
                            >
                              Liberar
                            </button>
                          )}
                          {(a.status === 'rascunho' || a.status === 'liberada') && (
                            <button
                              className="btn btn-sm text-xs text-red-600"
                              onClick={() => cancelarMut.mutate(a.id)}
                            >
                              Cancelar
                            </button>
                          )}
                          {a.status === 'liberada' && (
                            <button
                              className="btn btn-sm text-xs text-blue-600"
                              onClick={() => encerrarMut.mutate(a.id)}
                            >
                              Encerrar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AgendaAulas;
