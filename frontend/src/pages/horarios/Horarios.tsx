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
    <div>
      <div className="page-header">
        <h1 className="page-title">Horários</h1>
        <button onClick={() => { reset(); setEditingId(null); setShowForm(true); }} className="btn btn-primary">Novo Horário</button>
      </div>

      {isLoading && <p className="text-brand-muted">Carregando...</p>}
      {isError && <p className="text-brand-danger">Erro ao carregar horários.</p>}

      {!isLoading && horarios.length === 0 && <div className="empty-state">Nenhum horário cadastrado.</div>}

      {horarios.length > 0 && (
        <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Modalidade</th>
              <th>Profissional</th>
              <th>Dia</th>
              <th>Horário</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {horarios.map((h: any) => (
              <tr key={h.id}>
                <td>{modalidades.find(m => m.id === h.modalidade_id)?.nome || h.modalidade_id}</td>
                <td>{profissionais.find(p => p.id === h.profissional_id)?.nome || h.profissional_id}</td>
                <td>{dias[h.dia_semana]}</td>
                <td>{h.hora_inicio} - {h.hora_fim}</td>
                <td><span className={h.ativo ? 'badge badge-active' : 'badge badge-inactive'}>{h.ativo ? 'Ativo' : 'Inativo'}</span></td>
                <td>
                  <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(h)} className="btn btn-secondary btn-sm">Editar</button>
                  {h.ativo ? (
                    <button onClick={() => { if (confirm('Confirma desativar?')) desativarMut.mutate(h.id); }} className="btn btn-danger btn-sm">Desativar</button>
                  ) : (
                    <button onClick={() => { if (confirm('Confirma ativar?')) ativarMut.mutate(h.id); }} className="btn btn-success btn-sm">Ativar</button>
                  )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
        <div className="modal-content max-w-lg">
          <h2 className="text-xl font-bold text-brand-text mb-4">{editingId ? 'Editar Horário' : 'Novo Horário'}</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label htmlFor="modalidade">Modalidade</label>
              <select id="modalidade" {...register('modalidade_id')}> 
                <option value="">Selecione uma modalidade</option>
                {modalidades.map((m: any) => <option key={m.id} value={m.id}>{m.nome}</option>)}
              </select>
              {errors.modalidade_id && <p className="text-xs text-brand-danger mt-1">{errors.modalidade_id?.message as any}</p>}
            </div>

            <div className="mb-3">
              <label htmlFor="profissional">Profissional</label>
              <select id="profissional" {...register('profissional_id')}>
                <option value="">Selecione um profissional</option>
                {profissionais.map((p: any) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
              {errors.profissional_id && <p className="text-xs text-brand-danger mt-1">{errors.profissional_id?.message as any}</p>}
            </div>

            <div className="mb-3 grid grid-cols-3 gap-3">
              <div>
                <label>Dia da semana</label>
                <select {...register('dia_semana')}>
                  <option value="">Selecione</option>
                  {dias.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              </div>
              <div>
                <label>Hora início</label>
                <input type="time" {...register('hora_inicio')} />
              </div>
              <div>
                <label>Hora fim</label>
                <input type="time" {...register('hora_fim')} />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); reset(); }} className="btn btn-secondary">Cancelar</button>
              <button type="submit" disabled={isSubmitting} className="btn btn-primary">{editingId ? 'Salvar' : 'Criar'}</button>
            </div>
          </form>
        </div>
        </div>
      )}
    </div>
  );
};

export default Horarios;
