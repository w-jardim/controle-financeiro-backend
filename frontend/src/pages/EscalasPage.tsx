import React, { useState } from 'react';
import { useEscalas } from '../hooks/useEscalas';
import EscalaForm from '../components/EscalaForm';
import type { Escala } from '../types/escala';

const EscalasPage: React.FC = () => {
  const [page] = useState(1);
  const { data, isLoading, error } = useEscalas(page, 20);
  const [showForm, setShowForm] = useState(false);

  if (isLoading) return <div className="text-brand-muted p-4">Carregando...</div>;
  if (error) return <div className="alert alert-error">Erro ao carregar escalas</div>;

  const escalas = data?.dados as Escala[] | undefined;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Escalas</h1>
        <button onClick={() => setShowForm((s) => !s)} className="btn btn-primary">Nova Escala</button>
      </div>
      {showForm && <EscalaForm onSuccess={() => setShowForm(false)} />}
      <ul className="space-y-2">
        {escalas?.map((e) => (
          <li key={e.id} className="card py-3 px-4 text-sm">{`#${e.id} - CT:${e.ct_id} Prof:${e.profissional_id} ${e.hora_inicio}-${e.hora_fim}`}</li>
        ))}
      </ul>
    </div>
  );
};

export default EscalasPage;
