import React, { useMemo } from 'react';
import { useAlunos } from '../../hooks/useAlunos';
import { useProfissionais } from '../../hooks/useProfissionais';
import { useAgendamentos } from '../../hooks/useAgendamentos';
import { usePresencas } from '../../hooks/usePresencas';
import { useMensalidades } from '../../hooks/useMensalidades';
import { useResumoTransacoes } from '../../hooks/useTransacoes';

export default function Dashboard() {
  const { data: alunosData } = useAlunos();
  const { data: profissionaisData } = useProfissionais();
  const { data: agData } = useAgendamentos({ limit: 1, page: 1 });
  const { data: presData } = usePresencas({ limit: 1, page: 1 });
  const { data: mensalidadesPendentes } = useMensalidades({ status: 'pendente', limit: 1, page: 1 });
  const { data: resumo } = useResumoTransacoes();

  const alunosAtivos = useMemo(() => (alunosData?.dados || []).filter((a) => a.ativo).length, [alunosData]);
  const profissionaisAtivos = useMemo(() => (profissionaisData?.dados || []).filter((p) => p.ativo).length, [profissionaisData]);

  const totalAgendamentos = agData?.meta?.total ?? (agData?.dados?.length || 0);
  const totalPresencas = presData?.meta?.total ?? (presData?.dados?.length || 0);
  const totalPendentes = mensalidadesPendentes?.meta?.total ?? (mensalidadesPendentes?.dados?.length || 0);
  const saldo = resumo?.dados?.saldo ?? 0;

  const cards = [
    { label: 'Alunos Ativos', value: String(alunosAtivos), color: 'bg-indigo-50 text-indigo-700' },
    { label: 'Profissionais Ativos', value: String(profissionaisAtivos), color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Agendamentos', value: String(totalAgendamentos), color: 'bg-amber-50 text-amber-700' },
    { label: 'Presenças', value: String(totalPresencas), color: 'bg-sky-50 text-sky-700' },
    { label: 'Mensalidades Pendentes', value: String(totalPendentes), color: 'bg-rose-50 text-rose-700' },
    { label: 'Saldo Financeiro', value: `R$ ${Number(saldo).toFixed(2)}`, color: 'bg-violet-50 text-violet-700' },
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="card card-body flex flex-col gap-1">
            <span className={`text-3xl font-bold ${card.color} rounded-lg px-3 py-1 self-start`}>
              {card.value}
            </span>
            <span className="text-sm text-gray-500 mt-1">{card.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
