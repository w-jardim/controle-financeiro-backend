import React from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const { logout, user } = useAuth();
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
      <div className="text-lg font-semibold">Controlador Financeiro</div>
      <div className="flex items-center gap-4">
        {user && <span className="text-sm text-gray-600">{user.email}</span>}
        <button
          className="text-sm bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          onClick={logout}
        >
          Sair
        </button>
      </div>
    </header>
  );
}

