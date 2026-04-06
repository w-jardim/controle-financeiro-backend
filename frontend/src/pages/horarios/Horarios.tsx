import React, { useState, useMemo } from 'react';
import { useHorarios, useCriarHorario, useAtualizarHorario, useDesativarHorario, useAtivarHorario } from '../../hooks/useHorarios';
import { useModalidades } from '../../hooks/useModalidades';
import { useProfissionais } from '../../hooks/useProfissionais';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { criarHorarioSchema } from '../../schemas/horario.schema';
import type { CriarHorarioForm } from '../../schemas/horario.schema';

const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

const Horarios: React.FC = () => {
  const [page] = useState(1);
  const { data, isLoading, isError } = useHorarios(page, 50);
  const horarios = useMemo(() => data?.dados || [], [data]);

  const { data: modData } = useModalidades(page, 100);
  const modalidades = useMemo(() => modData?.dados || [], [modData]);

  const { data: profData } = useProfissionais(page, 100);
  const profissionais = useMemo(() => profData?.dados || [], [profData]);

  const criarMut = useCriarHorario();
  const atualizarMut = useAtualizarHorario();
  const desativarMut = useDesativarHorario();
  const ativarMut = useAtivarHorario();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CriarHorarioForm>({ resolver: zodResolver(criarHorarioSchema) });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const onSubmit = async (formData: any) => {
    try {
      if (editingId) {
        await atualizarMut.mutateAsync({ id: editingId, dados: formData });
      } else {
        await criarMut.mutateAsync(formData);
      }
      reset();
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      // handled in mutation onError if needed
    }
  };

  const handleEdit = (h: any) => {
    setEditingId(h.id);
    reset({
      ct_id: h.ct_id,
      modalidade_id: h.modalidade_id,
      profissional_id: h.profissional_id,
      dia_semana: h.dia_semana,
      hora_inicio: h.hora_inicio,
      hora_fim: h.hora_fim,
      limite_vagas: h.limite_vagas,
    });
    setShowForm(true);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Horários</h1>
        <button onClick={() => { reset(); setEditingId(null); setShowForm(true); }} className="btn btn-primary">Novo Horário</button>
      </div>

      {isLoading && <p>Carregando...</p>}
      {isError && <p>Erro ao carregar horários.</p>}

      {!isLoading && horarios.length === 0 && <p>Nenhum horário cadastrado.</p>}

      {horarios.length > 0 && (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2">Modalidade</th>
              <th className="px-4 py-2">Profissional</th>
              <th className="px-4 py-2">Dia</th>
              <th className="px-4 py-2">Horário</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {horarios.map((h: any) => (
              <tr key={h.id} className="border-t">
                <td className="px-4 py-2">{modalidades.find(m => m.id === h.modalidade_id)?.nome || h.modalidade_id}</td>
                <td className="px-4 py-2">{profissionais.find(p => p.id === h.profissional_id)?.nome || h.profissional_id}</td>
                <td className="px-4 py-2">{dias[h.dia_semana]}</td>
                <td className="px-4 py-2">{h.hora_inicio} - {h.hora_fim}</td>
                <td className="px-4 py-2">{h.ativo ? 'Ativo' : 'Inativo'}</td>
                <td className="px-4 py-2">
                  <button onClick={() => handleEdit(h)} className="btn btn-secondary mr-2">Editar</button>
                  {h.ativo ? (
                    <button onClick={() => { if (confirm('Confirma desativar?')) desativarMut.mutate(h.id); }} className="btn btn-danger">Desativar</button>
                  ) : (
                    <button onClick={() => { if (confirm('Confirma ativar?')) ativarMut.mutate(h.id); }} className="btn btn-success">Ativar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-2">
              <label className="block" htmlFor="modalidade">Modalidade</label>
              <select id="modalidade" className="input" {...register('modalidade_id')}> 
                <option value="">Selecione uma modalidade</option>
                {modalidades.map((m: any) => <option key={m.id} value={m.id}>{m.nome}</option>)}
              </select>
              {errors.modalidade_id && <p className="text-red-600">{errors.modalidade_id?.message as any}</p>}
            </div>

            <div className="mb-2">
              <label className="block" htmlFor="profissional">Profissional</label>
              <select id="profissional" className="input" {...register('profissional_id')}>
                <option value="">Selecione um profissional</option>
                {profissionais.map((p: any) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
              {errors.profissional_id && <p className="text-red-600">{errors.profissional_id?.message as any}</p>}
            </div>

            <div className="mb-2 grid grid-cols-3 gap-2">
              <div>
                <label className="block">Dia da semana</label>
                <select {...register('dia_semana')} className="input">
                  <option value="">Selecione</option>
                  {dias.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block">Hora início</label>
                <input type="time" {...register('hora_inicio')} className="input" />
              </div>
              <div>
                <label className="block">Hora fim</label>
                <input type="time" {...register('hora_fim')} className="input" />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <button type="submit" disabled={isSubmitting} className="btn btn-primary">{editingId ? 'Salvar' : 'Criar'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); reset(); }} className="btn">Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Horarios;
