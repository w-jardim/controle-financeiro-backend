import React, { useMemo } from 'react';
import { useEscalas, useCriarEscala } from '../../hooks/useEscalas';
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
  const { data, isLoading, isError } = useEscalas(page, 50);
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
      reset({ dias_semana: [] } as CriarEscalaPayload);
      setHorariosPorDia({});
    } catch (err) {
      return;
    }
  };

  const toggleDiaSemana = (dia: number) => {
    const selecionados = watch('dias_semana') || [];
    const proximo = selecionados.includes(dia)
      ? selecionados.filter((d) => d !== dia)
      : [...selecionados, dia];
    setValue('dias_semana', proximo, { shouldValidate: true, shouldDirty: true });
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
        </div>
      </form>

      {isLoadingDependencias && <p>Carregando CTs, modalidades e profissionais...</p>}
      {criarMut.isError && <p className="text-red-600">Não foi possível criar a escala. Verifique os dados e tente novamente.</p>}
      {isLoading && <p>Carregando...</p>}
      {isError && <p>Erro ao carregar escalas.</p>}
      {!isLoading && escalas.length === 0 && <p>Nenhuma escala cadastrada.</p>}
      {escalas.length > 0 && (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2">CT</th>
              <th className="px-4 py-2">Modalidade</th>
              <th className="px-4 py-2">Profissional</th>
              <th className="px-4 py-2">Dias</th>
              <th className="px-4 py-2">Horário</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {escalas.map((e: any) => (
              <tr key={e.id}>
                <td className="px-4 py-2">{ctsMap.get(e.ct_id) || e.ct_id}</td>
                <td className="px-4 py-2">{modalidadesMap.get(e.modalidade_id) || e.modalidade_id}</td>
                <td className="px-4 py-2">{profissionaisMap.get(e.profissional_id) || e.profissional_id}</td>
                <td className="px-4 py-2">{(e.dias_semana || []).map((d: number) => DIAS_SEMANA.find((x) => x.valor === d)?.label || d).join(', ')}</td>
                <td className="px-4 py-2">{e.hora_inicio} - {e.hora_fim}</td>
                <td className="px-4 py-2">{e.ativo ? 'Ativo' : 'Inativo'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Escalas;
