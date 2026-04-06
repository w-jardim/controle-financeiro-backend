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
    try {
      const payload = {
        ...dados,
        dias_semana: Array.from(new Set(dados.dias_semana)).sort((a, b) => a - b),
      };
      await criarMut.mutateAsync(payload);
      reset({ dias_semana: [] } as CriarEscalaPayload);
    } catch {
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
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label>Hora início</label>
            <input type="time" {...register('hora_inicio')} className="input" />
            {errors.hora_inicio && <p className="text-red-600 text-sm mt-1">{errors.hora_inicio.message}</p>}
          </div>
          <div>
            <label>Hora fim</label>
            <input type="time" {...register('hora_fim')} className="input" />
            {errors.hora_fim && <p className="text-red-600 text-sm mt-1">{errors.hora_fim.message}</p>}
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
