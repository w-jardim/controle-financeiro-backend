import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const { logout, user } = useAuth();
  const [dark, setDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem('theme') === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const body = document.body;
    if (dark) body.classList.add('theme-dark');
    else body.classList.remove('theme-dark');
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch {}
  }, [dark]);

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-brand-surface border-b border-brand-border">
      <div />
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="alternar tema"
          onClick={() => setDark(d => !d)}
          className="btn btn-ghost btn-sm"
        >
          {dark ? '🌙' : '☀️'}
        </button>

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

