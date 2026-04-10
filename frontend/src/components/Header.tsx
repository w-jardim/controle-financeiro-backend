import React from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const { logout, user } = useAuth();
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-brand-surface border-b border-brand-border">
      <div />
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-brand-muted">
            {user.email}
          </span>
        )}
        <button className="btn btn-danger btn-sm" onClick={logout}>
          Sair
        </button>
      </div>
    </header>
  );
}

