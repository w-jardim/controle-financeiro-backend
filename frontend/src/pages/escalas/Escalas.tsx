import React, { useMemo } from 'react';
import { useEscalas, useCriarEscala, useAtualizarEscala } from '../../hooks/useEscalas';
import { useCts } from '../../hooks/useCts';
import { useModalidades } from '../../hooks/useModalidades';
import { useProfissionais } from '../../hooks/useProfissionais';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { criarEscalaSchema } from '../../schemas/escala.schema';
import type { CriarEscalaPayload } from '../../types/escala';
import type { CT } from '../../types/ct';
import type { Modalidade } from '../../types/modalidade';
import type { Profissional } from '../../types/profissional';

const DIAS_SEMANA = [
  { valor: 0, label: 'Dom' },
  { valor: 1, label: 'Seg' },
  { valor: 2, label: 'Ter' },
  { valor: 3, label: 'Qua' },
  { valor: 4, label: 'Qui' },
  { valor: 5, label: 'Sex' },
  { valor: 6, label: 'Sáb' },
];

const Escalas: React.FC = () => {
  const page = 1;
  const [filters, setFilters] = React.useState<Record<string, any>>({});
  const { data, isLoading, isError } = useEscalas(page, 50, filters);
  const escalas = useMemo(() => data?.dados || [], [data]);
  const { data: ctsData, isLoading: isLoadingCts } = useCts();
  const { data: modalidadesData, isLoading: isLoadingModalidades } = useModalidades(1, 100);
  const { data: profissionaisData, isLoading: isLoadingProfissionais } = useProfissionais(1, 100);

  const cts = useMemo<CT[]>(() => (ctsData?.dados || []), [ctsData]);
  const modalidades = useMemo<Modalidade[]>(() => (modalidadesData?.dados || []), [modalidadesData]);
  const profissionais = useMemo<Profissional[]>(() => (profissionaisData?.dados || []), [profissionaisData]);

  const ctsMap = useMemo(() => new Map(cts.map((ct) => [ct.id, ct.nome])), [cts]);
  const modalidadesMap = useMemo(() => new Map(modalidades.map((m) => [m.id, m.nome])), [modalidades]);
  const profissionaisMap = useMemo(() => new Map(profissionais.map((p) => [p.id, p.nome])), [profissionais]);

  const criarMut = useCriarEscala();
  const atualizarMut = useAtualizarEscala();
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editingGroup, setEditingGroup] = React.useState<null | { ct_id: number; modalidade_id: number; profissional_id: number }>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting, errors }
  } = useForm<CriarEscalaPayload>({
    resolver: zodResolver(criarEscalaSchema),
    defaultValues: {
      dias_semana: []
    }
  });

  const diasSelecionados = watch('dias_semana') || [];

  const onSubmit = async (dados: CriarEscalaPayload) => {
    const dias = Array.from(new Set(dados.dias_semana || [])).sort((a, b) => a - b);
    if (dias.length === 0) return;

    // Ensure intervals exist for each selected day
    for (const dia of dias) {
      const intervals = horariosPorDia[dia] || [];
      if (intervals.length === 0) {
        alert(`Defina pelo menos um horário para o dia ${DIAS_SEMANA.find(d => d.valor===dia)?.label || dia}`);
        return;
      }
    }

    try {
      if (editingGroup) {
        // Find existing escalas for this group
        const related = escalas.filter((x: any) => x.ct_id === editingGroup.ct_id && x.modalidade_id === editingGroup.modalidade_id && x.profissional_id === editingGroup.profissional_id);

        // For each selected day, for each interval, try to match existing escala by hora_inicio/hora_fim and day
        for (const dia of dias) {
          const intervals = horariosPorDia[dia] || [];
          for (const itv of intervals) {
            // find existing escala with same time and containing this day
            const match = related.find((r: any) => r.hora_inicio.startsWith(itv.hora_inicio) && r.hora_fim.startsWith(itv.hora_fim) && (r.dias_semana || []).includes(dia));
            const payload = {
              ct_id: dados.ct_id,
              modalidade_id: dados.modalidade_id,
              profissional_id: dados.profissional_id,
              dias_semana: [dia],
              hora_inicio: itv.hora_inicio,
              hora_fim: itv.hora_fim,
            } as any;
            if (match) {
              await atualizarMut.mutateAsync({ id: match.id, dados: payload });
            } else {
              await criarMut.mutateAsync(payload);
            }
          }
        }
        setEditingGroup(null);
      } else if (editingId) {
        // fallback: update single escala (preserve previous behavior)
        const dia = dias[0];
        const intervals = horariosPorDia[dia] || [];
        if (intervals.length === 0) {
          alert(`Defina pelo menos um horário para o dia ${DIAS_SEMANA.find(d => d.valor===dia)?.label || dia}`);
          return;
        }
        const itv = intervals[0];
        const payload = {
          ct_id: dados.ct_id,
          modalidade_id: dados.modalidade_id,
          profissional_id: dados.profissional_id,
          dias_semana: [dia],
          hora_inicio: itv.hora_inicio,
          hora_fim: itv.hora_fim,
        } as any;
        await atualizarMut.mutateAsync({ id: editingId, dados: payload });
        setEditingId(null);
      } else {
        for (const dia of dias) {
          const intervals = horariosPorDia[dia] || [];
          for (const itv of intervals) {
            const payload: CriarEscalaPayload = {
              ct_id: dados.ct_id,
              modalidade_id: dados.modalidade_id,
              profissional_id: dados.profissional_id,
              dias_semana: [dia],
              hora_inicio: itv.hora_inicio,
              hora_fim: itv.hora_fim,
            } as CriarEscalaPayload;
            await criarMut.mutateAsync(payload);
          }
        }
      }

      reset({ dias_semana: [] } as CriarEscalaPayload);
      setHorariosPorDia({});
    } catch (err) {
      return;
    }
  };

  const startEdit = (e: any) => {
    // populate form with escala/group data
    setEditingId(null);
    setEditingGroup({ ct_id: e.ct_id, modalidade_id: e.modalidade_id, profissional_id: e.profissional_id });
    setValue('ct_id', e.ct_id);
    setValue('modalidade_id', e.modalidade_id);
    setValue('profissional_id', e.profissional_id);
    // build horariosPorDia from all escalas matching this group
    const related = escalas.filter((x: any) => x.ct_id === e.ct_id && x.modalidade_id === e.modalidade_id && x.profissional_id === e.profissional_id);
    const byDia: Record<number, Array<{ hora_inicio: string; hora_fim: string }>> = {};
    for (const r of related) {
      const dias = Array.isArray(r.dias_semana) ? r.dias_semana : [];
      for (const d of dias) {
        if (!byDia[d]) byDia[d] = [];
        byDia[d].push({ hora_inicio: r.hora_inicio.slice(0,5), hora_fim: r.hora_fim.slice(0,5) });
      }
    }
    setValue('dias_semana', Object.keys(byDia).map(Number));
    setHorariosPorDia(byDia);
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset({ dias_semana: [] } as CriarEscalaPayload);
    setHorariosPorDia({});
  };

  const toggleDiaSemana = (dia: number) => {
    const selecionados = watch('dias_semana') || [];
    const proximo = selecionados.includes(dia)
      ? selecionados.filter((d) => d !== dia)
      : [...selecionados, dia];
    setValue('dias_semana', proximo, { shouldValidate: true, shouldDirty: true });
    // ensure there's at least one intervalo for the newly selected day
    if (!selecionados.includes(dia)) {
      setHorariosPorDia((prev) => {
        if (prev[dia] && prev[dia].length > 0) return prev;
        return { ...prev, [dia]: [{ hora_inicio: '08:00', hora_fim: '09:00' }] };
      });
    }
  };

  // State to hold multiple intervals per selected day
  const [horariosPorDia, setHorariosPorDia] = React.useState<Record<number, Array<{hora_inicio: string; hora_fim: string}>>>({});

  const addIntervalo = (dia: number) => {
    setHorariosPorDia((prev) => {
      const arr = prev[dia] ? [...prev[dia]] : [];
      arr.push({ hora_inicio: '08:00', hora_fim: '09:00' });
      return { ...prev, [dia]: arr };
    });
  };

  const updateIntervalo = (dia: number, idx: number, field: 'hora_inicio' | 'hora_fim', value: string) => {
    setHorariosPorDia((prev) => {
      const arr = prev[dia] ? [...prev[dia]] : [];
      if (!arr[idx]) return prev;
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...prev, [dia]: arr };
    });
  };

  const removeIntervalo = (dia: number, idx: number) => {
    setHorariosPorDia((prev) => {
      const arr = prev[dia] ? [...prev[dia]] : [];
      arr.splice(idx, 1);
      return { ...prev, [dia]: arr };
    });
  };

  const isLoadingDependencias = isLoadingCts || isLoadingModalidades || isLoadingProfissionais;

  const aplicarFiltro = () => {
    const f: Record<string, any> = {};
    // read selected filter values from form fields
    const ctSel = watch('ct_id');
    const modSel = watch('modalidade_id');
    const profSel = watch('profissional_id');
    if (ctSel) f.ct_id = ctSel;
    if (modSel) f.modalidade_id = modSel;
    if (profSel) f.profissional_id = profSel;
    setFilters(f);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Escalas</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label>CT</label>
            <select {...register('ct_id', { valueAsNumber: true })} className="input" disabled={isLoadingDependencias}>
              <option value="">Selecione</option>
              {cts.map((ct) => (
                <option key={ct.id} value={ct.id}>{ct.nome}</option>
              ))}
            </select>
            {errors.ct_id && <p className="text-red-600 text-sm mt-1">{errors.ct_id.message}</p>}
          </div>
          <div>
            <label>Modalidade</label>
            <select {...register('modalidade_id', { valueAsNumber: true })} className="input" disabled={isLoadingDependencias}>
              <option value="">Selecione</option>
              {modalidades.map((m) => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
            </select>
            {errors.modalidade_id && <p className="text-red-600 text-sm mt-1">{errors.modalidade_id.message}</p>}
          </div>
          <div>
            <label>Profissional</label>
            <select {...register('profissional_id', { valueAsNumber: true })} className="input" disabled={isLoadingDependencias}>
              <option value="">Selecione</option>
              {profissionais.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
            {errors.profissional_id && <p className="text-red-600 text-sm mt-1">{errors.profissional_id.message}</p>}
          </div>
        </div>

        <div className="mt-4">
          <label>Dias da semana</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {DIAS_SEMANA.map((dia) => {
              const checked = diasSelecionados.includes(dia.valor);
              return (
                <button
                  key={dia.valor}
                  type="button"
                  className={`px-3 py-1 rounded border ${checked ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
                  onClick={() => toggleDiaSemana(dia.valor)}
                >
                  {dia.label}
                </button>
              );
            })}
          </div>
          {errors.dias_semana && <p className="text-red-600 text-sm mt-1">{errors.dias_semana.message as string}</p>}
        </div>
        <div className="mt-4">
          <label>Horários por dia</label>
          <div className="mt-2 space-y-3">
            {diasSelecionados.length === 0 && <p className="text-sm text-gray-600">Selecione ao menos um dia para adicionar horários</p>}
            {diasSelecionados.map((dia: number) => (
              <div key={dia} className="p-3 border rounded">
                <div className="flex items-center justify-between mb-2">
                  <strong>{DIAS_SEMANA.find(d => d.valor === dia)?.label || dia}</strong>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => addIntervalo(dia)} className="btn btn-sm">Adicionar intervalo</button>
                  </div>
                </div>
                <div className="space-y-2">
                  {(horariosPorDia[dia] || []).map((itv, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input type="time" value={itv.hora_inicio} onChange={(e) => updateIntervalo(dia, idx, 'hora_inicio', e.target.value)} className="input w-32" />
                      <span>—</span>
                      <input type="time" value={itv.hora_fim} onChange={(e) => updateIntervalo(dia, idx, 'hora_fim', e.target.value)} className="input w-32" />
                      <button type="button" onClick={() => removeIntervalo(dia, idx)} className="btn btn-danger">Remover</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <button type="submit" disabled={isSubmitting || isLoadingDependencias} className="btn btn-primary">{isSubmitting ? 'Salvando...' : 'Salvar'}</button>
          <button type="button" onClick={aplicarFiltro} className="btn btn-secondary ml-2">Pesquisar</button>
        </div>
      </form>

      {isLoadingDependencias && <p>Carregando CTs, modalidades e profissionais...</p>}
      {criarMut.isError && <p className="text-red-600">Não foi possível criar a escala. Verifique os dados e tente novamente.</p>}
      {isLoading && <p>Carregando...</p>}
      {isError && <p>Erro ao carregar escalas.</p>}
      {!isLoading && escalas.length === 0 && <p>Nenhuma escala cadastrada.</p>}
      {escalas.length > 0 && (
        (() => {
          const groups = (() => {
            const map = new Map();
            for (const r of escalas) {
              const key = `${r.ct_id}|${r.modalidade_id}|${r.profissional_id}`;
              if (!map.has(key)) {
                map.set(key, { ct_id: r.ct_id, modalidade_id: r.modalidade_id, profissional_id: r.profissional_id, escalas: [] });
              }
              map.get(key).escalas.push(r);
            }
            return Array.from(map.values());
          })();

          return (
            <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2">CT</th>
              <th className="px-4 py-2">Modalidade</th>
              <th className="px-4 py-2">Profissional</th>
              <th className="px-4 py-2">Dias</th>
              <th className="px-4 py-2">Horários</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g: any, gi: number) => {
              const allDias = Array.from(new Set(g.escalas.flatMap((s: any) => s.dias_semana || []))).sort((a: number, b: number) => a - b);
              return (
                <tr key={gi}>
                  <td className="px-4 py-2">{ctsMap.get(g.ct_id) || g.ct_id}</td>
                  <td className="px-4 py-2">{modalidadesMap.get(g.modalidade_id) || g.modalidade_id}</td>
                  <td className="px-4 py-2">{profissionaisMap.get(g.profissional_id) || g.profissional_id}</td>
                  <td className="px-4 py-2">{allDias.map((d: number) => DIAS_SEMANA.find((x) => x.valor === d)?.label || d).join(', ')}</td>
                  <td className="px-4 py-2">
                    {g.escalas.map((s: any, idx: number) => (
                      <div key={idx} className="text-sm">{s.hora_inicio.slice(0,5)} - {s.hora_fim.slice(0,5)} ({(s.dias_semana||[]).map((d:number)=>DIAS_SEMANA.find(x=>x.valor===d)?.label).join(', ')})</div>
                    ))}
                  </td>
                  <td className="px-4 py-2">{g.escalas.some((s:any)=>s.ativo) ? 'Ativo' : 'Inativo'}</td>
                  <td className="px-4 py-2"><button type="button" onClick={() => startEdit(g)} className="btn btn-sm">Editar</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
          );
        })()
      )}
    </div>
  );
};

export default Escalas;
