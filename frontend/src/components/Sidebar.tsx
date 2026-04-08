import React from 'react'
import { NavLink } from 'react-router-dom'

const groups = [
  {
    label: 'Geral',
    items: [
      { to: '/', label: 'Dashboard', icon: '◈' },
    ],
  },
  {
    label: 'Cadastros',
    items: [
      { to: '/cts', label: 'CTs', icon: '⌂' },
      { to: '/modalidades', label: 'Modalidades', icon: '◉' },
      { to: '/profissionais', label: 'Profissionais', icon: '◐' },
      { to: '/alunos', label: 'Alunos', icon: '◑' },
    ],
  },
  {
    label: 'Operações',
    items: [
      { to: '/escalas', label: 'Escalas', icon: '◷' },
      { to: '/agenda-aulas', label: 'Agenda Aulas', icon: '◻' },
      { to: '/agendamentos', label: 'Agendamentos', icon: '◼' },
      { to: '/presencas', label: 'Presenças', icon: '◈' },
    ],
  },
  {
    label: 'Financeiro',
    items: [
      { to: '/mensalidades', label: 'Mensalidades', icon: '◈' },
      { to: '/transacoes', label: 'Transações', icon: '◈' },
    ],
  },
]

export default function Sidebar() {
  return (
    <aside className="w-60 bg-slate-900 flex flex-col h-full shrink-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-slate-700">
        <span className="text-white font-bold text-lg tracking-tight">CT Control</span>
        <span className="block text-slate-400 text-xs mt-0.5">Gestão de Academia</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1 text-xs font-semibold text-slate-500 uppercase tracking-widest">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <span className="text-base leading-none opacity-70">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
