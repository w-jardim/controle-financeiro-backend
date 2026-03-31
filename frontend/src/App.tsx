import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import AuthenticatedLayout from './layouts/AuthenticatedLayout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/dashboard/Dashboard'
import Alunos from './pages/alunos/Alunos'
import Profissionais from './pages/profissionais/Profissionais'
import Modalidades from './pages/modalidades/Modalidades'
import Horarios from './pages/horarios/Horarios'
import Agendamentos from './pages/agendamentos/Agendamentos'
import Presencas from './pages/presencas/Presencas'
import Mensalidades from './pages/mensalidades/Mensalidades'
import Transacoes from './pages/transacoes/Transacoes'
import Cts from './pages/cts/Cts'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="alunos" element={<Alunos />} />
          <Route path="profissionais" element={<Profissionais />} />
          <Route path="modalidades" element={<Modalidades />} />
          <Route path="cts" element={<Cts />} />
          <Route path="horarios" element={<Horarios />} />
          <Route path="agendamentos" element={<Agendamentos />} />
          <Route path="presencas" element={<Presencas />} />
          <Route path="mensalidades" element={<Mensalidades />} />
          <Route path="transacoes" element={<Transacoes />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
