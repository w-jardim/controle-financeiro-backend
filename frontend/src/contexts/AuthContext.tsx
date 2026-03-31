import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { setToken, getToken, clearToken } from '../utils/storage';
import { loginApi } from '../services/api/authService';
import { setLogoutCallback } from '../services/api/axios';

type User = { id: string; email: string } | null;

type AuthContextType = {
  user: User;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async (_email: string, _senha: string) => {
    /* noop */
  },
  logout: () => {
    /* noop */
  },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    setLogoutCallback(logout);
  }, [logout]);

  useEffect(() => {
    const t = getToken();
    if (t) {
      setTokenState(t);
      // Ideally fetch user info here; for now just mark auth complete
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, senha: string) => {
      const t = await loginApi(email, senha);
      setToken(t);
      setTokenState(t);
      setUser({ id: '1', email });
      navigate('/');
    },
    [navigate]
  );

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

