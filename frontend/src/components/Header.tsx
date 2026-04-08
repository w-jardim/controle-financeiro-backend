import React from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const { logout, user } = useAuth();
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : '??';

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-gray-200 shadow-sm shrink-0">
      <div className="text-sm text-gray-500 font-medium">
        {/* breadcrumb area — pode expandir depois */}
      </div>
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
            <span className="text-sm text-gray-600 hidden sm:block">{user.email}</span>
          </div>
        )}
        <button
          className="btn btn-sm btn-ghost text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={logout}
        >
          Sair
        </button>
      </div>
    </header>
  );
}

