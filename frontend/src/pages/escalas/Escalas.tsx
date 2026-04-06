import React, { useMemo } from 'react';
import { useEscalas, useCriarEscala } from '../../hooks/useEscalas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { criarEscalaSchema } from '../../schemas/escala.schema';
import type { CriarEscalaPayload } from '../../types/escala';

const Escalas: React.FC = () => {
  const page = 1;
  const { data, isLoading, isError } = useEscalas(page, 50);
  const escalas = useMemo(() => data?.dados || [], [data]);

  const criarMut = useCriarEscala();

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<CriarEscalaPayload>({ resolver: zodResolver(criarEscalaSchema) });

  const onSubmit = async (dados: CriarEscalaPayload) => {
    try {
      await criarMut.mutateAsync(dados);
      reset();
    } catch {
      return;
    }
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
            <input {...register('ct_id', { valueAsNumber: true })} className="input" />
          </div>
          <div>
            <label>Modalidade</label>
            <input {...register('modalidade_id', { valueAsNumber: true })} className="input" />
          </div>
          <div>
            <label>Profissional</label>
            <input {...register('profissional_id', { valueAsNumber: true })} className="input" />
          </div>
        </div>
        <div className="mt-4">
          <label>Dias da semana (ex: 1,3,5)</label>
          <input {...register('dias_semana')} className="input" />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label>Hora início</label>
            <input {...register('hora_inicio')} className="input" />
          </div>
          <div>
            <label>Hora fim</label>
            <input {...register('hora_fim')} className="input" />
          </div>
        </div>

        <div className="mt-4">
          <button type="submit" disabled={isSubmitting} className="btn btn-primary">{isSubmitting ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </form>

      {isLoading && <p>Carregando...</p>}
      {isError && <p>Erro ao carregar escalas.</p>}
      {!isLoading && escalas.length === 0 && <p>Nenhuma escala cadastrada.</p>}
      {escalas.length > 0 && (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
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
                <td className="px-4 py-2">{e.modalidade_id}</td>
                <td className="px-4 py-2">{e.profissional_id}</td>
                <td className="px-4 py-2">{(e.dias_semana || []).join(', ')}</td>
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
