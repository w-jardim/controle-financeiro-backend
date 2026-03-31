import React from 'react'
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: 'Dashboard' },
  { to: '/alunos', label: 'Alunos' },
  { to: '/profissionais', label: 'Profissionais' },
  { to: '/modalidades', label: 'Modalidades' },
  { to: '/cts', label: 'CTs' },
  { to: '/horarios', label: 'Horários' },
  { to: '/agendamentos', label: 'Agendamentos' },
  { to: '/presencas', label: 'Presenças' },
  { to: '/mensalidades', label: 'Mensalidades' },
  { to: '/transacoes', label: 'Transações' }
]

export default function Sidebar() {
  return (
    <aside className="w-56 bg-white border-r p-3">
      <nav className="flex flex-col gap-2">
        {items.map((i) => (
          <NavLink key={i.to} to={i.to} className={({ isActive }) => (isActive ? 'font-semibold' : '')}>
            {i.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
