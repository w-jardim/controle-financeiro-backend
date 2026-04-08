import React from 'react'

export default function Dashboard() {
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Alunos Ativos', value: '—', color: 'bg-indigo-50 text-indigo-700' },
          { label: 'Profissionais', value: '—', color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Modalidades', value: '—', color: 'bg-amber-50 text-amber-700' },
          { label: 'Mensalidades Pendentes', value: '—', color: 'bg-red-50 text-red-700' },
        ].map((card) => (
          <div key={card.label} className="card card-body flex flex-col gap-1">
            <span className={`text-3xl font-bold ${card.color} rounded-lg px-3 py-1 self-start`}>
              {card.value}
            </span>
            <span className="text-sm text-gray-500 mt-1">{card.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
