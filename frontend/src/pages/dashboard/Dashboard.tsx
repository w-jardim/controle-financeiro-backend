import React from 'react'

export default function Dashboard() {
  return (
    <div>
      <h1 className="page-title mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <p className="text-sm text-brand-muted mb-1">Alunos Ativos</p>
          <p className="text-2xl font-bold text-brand-primary">—</p>
        </div>
        <div className="card">
          <p className="text-sm text-brand-muted mb-1">Modalidades</p>
          <p className="text-2xl font-bold text-brand-success">—</p>
        </div>
        <div className="card">
          <p className="text-sm text-brand-muted mb-1">Aulas Hoje</p>
          <p className="text-2xl font-bold text-brand-premium">—</p>
        </div>
        <div className="card">
          <p className="text-sm text-brand-muted mb-1">Receita Mensal</p>
          <p className="text-2xl font-bold text-brand-text">—</p>
        </div>
      </div>
      <div className="card">
        <p className="text-brand-muted text-center py-8">Dados do dashboard serão integrados em breve.</p>
      </div>
    </div>
  )
}
