import React, { useState } from 'react';
import { useEscalas } from '../hooks/useEscalas';
import EscalaForm from '../components/EscalaForm';
import type { Escala } from '../types/escala';

const EscalasPage: React.FC = () => {
  const [page] = useState(1);
  const { data, isLoading, error } = useEscalas(page, 20);
  const [showForm, setShowForm] = useState(false);

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar escalas</div>;

  const escalas = data?.dados as Escala[] | undefined;

  return (
    <div>
      <h1>Escalas</h1>
      <button onClick={() => setShowForm((s) => !s)}>Nova Escala</button>
      {showForm && <EscalaForm onSuccess={() => setShowForm(false)} />}
      <ul>
        {escalas?.map((e) => (
          <li key={e.id}>{`#${e.id} - CT:${e.ct_id} Prof:${e.profissional_id} ${e.hora_inicio}-${e.hora_fim}`}</li>
        ))}
      </ul>
    </div>
  );
};

export default EscalasPage;
