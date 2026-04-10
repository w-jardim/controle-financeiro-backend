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
    <div>
      <div className="page-header">
        <h1 className="page-title">Escalas</h1>
      </div>

      <div className="card mb-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label>CT</label>
            <select {...register('ct_id', { valueAsNumber: true })} disabled={isLoadingDependencias}>
              <option value="">Selecione</option>
              {cts.map((ct) => (
                <option key={ct.id} value={ct.id}>{ct.nome}</option>
              ))}
            </select>
            {errors.ct_id && <p className="text-xs text-brand-danger mt-1">{errors.ct_id.message}</p>}
          </div>
          <div>
            <label>Modalidade</label>
            <select {...register('modalidade_id', { valueAsNumber: true })} disabled={isLoadingDependencias}>
              <option value="">Selecione</option>
              {modalidades.map((m) => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
            </select>
            {errors.modalidade_id && <p className="text-xs text-brand-danger mt-1">{errors.modalidade_id.message}</p>}
          </div>
          <div>
            <label>Profissional</label>
            <select {...register('profissional_id', { valueAsNumber: true })} disabled={isLoadingDependencias}>
              <option value="">Selecione</option>
              {profissionais.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
            {errors.profissional_id && <p className="text-xs text-brand-danger mt-1">{errors.profissional_id.message}</p>}
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
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${checked ? 'bg-brand-primary text-white border-brand-primary' : 'bg-brand-bg text-brand-muted border-brand-border hover:text-brand-text hover:border-brand-primary/50'}`}
                  onClick={() => toggleDiaSemana(dia.valor)}
                >
                  {dia.label}
                </button>
              );
            })}
          </div>
          {errors.dias_semana && <p className="text-xs text-brand-danger mt-1">{errors.dias_semana.message as string}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label>Hora início</label>
            <input type="time" {...register('hora_inicio')} />
            {errors.hora_inicio && <p className="text-xs text-brand-danger mt-1">{errors.hora_inicio.message}</p>}
          </div>
          <div>
            <label>Hora fim</label>
            <input type="time" {...register('hora_fim')} />
            {errors.hora_fim && <p className="text-xs text-brand-danger mt-1">{errors.hora_fim.message}</p>}
          </div>
        </div>

        <div className="mt-4">
          <button type="submit" disabled={isSubmitting || isLoadingDependencias} className="btn btn-primary">{isSubmitting ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </form>
      </div>

      {isLoadingDependencias && <p className="text-brand-muted">Carregando CTs, modalidades e profissionais...</p>}
      {criarMut.isError && <p className="text-brand-danger">Não foi possível criar a escala. Verifique os dados e tente novamente.</p>}
      {isLoading && <p className="text-brand-muted">Carregando...</p>}
      {isError && <p className="text-brand-danger">Erro ao carregar escalas.</p>}
      {!isLoading && escalas.length === 0 && <div className="empty-state">Nenhuma escala cadastrada.</div>}
      {escalas.length > 0 && (
        <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>CT</th>
              <th>Modalidade</th>
              <th>Profissional</th>
              <th>Dias</th>
              <th>Horário</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {escalas.map((e: any) => (
              <tr key={e.id}>
                <td>{ctsMap.get(e.ct_id) || e.ct_id}</td>
                <td>{modalidadesMap.get(e.modalidade_id) || e.modalidade_id}</td>
                <td>{profissionaisMap.get(e.profissional_id) || e.profissional_id}</td>
                <td>{(e.dias_semana || []).map((d: number) => DIAS_SEMANA.find((x) => x.valor === d)?.label || d).join(', ')}</td>
                <td>{e.hora_inicio} - {e.hora_fim}</td>
                <td><span className={e.ativo ? 'badge badge-active' : 'badge badge-inactive'}>{e.ativo ? 'Ativo' : 'Inativo'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
};

export default Escalas;
