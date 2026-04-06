import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CriarEscalaForm } from '../schemas/escala.schema';
import { criarEscalaSchema } from '../schemas/escala.schema';
import { useCriarEscala } from '../hooks/useEscalas';

interface Props {
  onSuccess?: () => void;
  initialValues?: Partial<CriarEscalaForm>;
}

const EscalaForm: React.FC<Props> = ({ onSuccess, initialValues }) => {
  const criar = useCriarEscala();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CriarEscalaForm>({
    resolver: zodResolver(criarEscalaSchema),
    defaultValues: initialValues as any,
  });

  const onSubmit = async (data: CriarEscalaForm) => {
    await criar.mutateAsync(data);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>CT ID</label>
        <input type="number" {...register('ct_id', { valueAsNumber: true })} />
        {errors.ct_id && <span>{errors.ct_id.message}</span>}
      </div>
      <div>
        <label>Modalidade ID</label>
        <input type="number" {...register('modalidade_id', { valueAsNumber: true })} />
        {errors.modalidade_id && <span>{errors.modalidade_id.message}</span>}
      </div>
      <div>
        <label>Profissional ID</label>
        <input type="number" {...register('profissional_id', { valueAsNumber: true })} />
        {errors.profissional_id && <span>{errors.profissional_id.message}</span>}
      </div>
      <div>
        <label>Dias da semana (ex: 0,1,2)</label>
        <input type="text" {...register('dias_semana', { setValueAs: (v) => (typeof v === 'string' ? v.split(',').map((s) => Number(s.trim())) : v) })} />
        {errors.dias_semana && <span>{errors.dias_semana.message}</span>}
      </div>
      <div>
        <label>Hora início (HH:MM)</label>
        <input type="text" {...register('hora_inicio')} />
        {errors.hora_inicio && <span>{errors.hora_inicio.message}</span>}
      </div>
      <div>
        <label>Hora fim (HH:MM)</label>
        <input type="text" {...register('hora_fim')} />
        {errors.hora_fim && <span>{errors.hora_fim.message}</span>}
      </div>
      <button type="submit" disabled={isSubmitting}>Salvar</button>
    </form>
  );
};

export default EscalaForm;
