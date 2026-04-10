import React from 'react'
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/alunos', label: 'Alunos', icon: '👤' },
  { to: '/profissionais', label: 'Profissionais', icon: '🏋️' },
  { to: '/modalidades', label: 'Modalidades', icon: '🥋' },
  { to: '/cts', label: 'CTs', icon: '🏢' },
  { to: '/escalas', label: 'Escalas', icon: '📅' },
  { to: '/agenda-aulas', label: 'Agenda Aulas', icon: '📋' },
  { to: '/agendamentos', label: 'Agendamentos', icon: '🕐' },
  { to: '/presencas', label: 'Presenças', icon: '✅' },
  { to: '/mensalidades', label: 'Mensalidades', icon: '💰' },
  { to: '/transacoes', label: 'Transações', icon: '💳' }
]

export default function Sidebar() {
  return (
    <aside className="w-60 bg-brand-surface border-r border-brand-border flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-brand-border">
        <h1 className="text-xl font-bold text-brand-primary tracking-tight">CT Control</h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((i) => (
          <NavLink
            key={i.to}
            to={i.to}
            end={i.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-brand-muted hover:text-brand-text hover:bg-brand-bg'
              }`
            }
          >
            <span className="text-base">{i.icon}</span>
            {i.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
