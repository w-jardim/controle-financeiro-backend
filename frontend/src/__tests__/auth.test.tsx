import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import App from '../App';
import * as authService from '../services/api/authService';
import * as storage from '../utils/storage';

vi.mock('../services/api/authService');
vi.mock('../utils/storage');

const qc = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

describe('Auth Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (storage.getToken as any).mockReturnValue(null);
  });

  test('renders login page when not authenticated', () => {
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={['/login']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();
  });

  test('redirects to login when accessing protected route without token', async () => {
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();
    });
  });

  test('shows error message on failed login', async () => {
    (authService.loginApi as any).mockRejectedValue({
      response: { data: { mensagem: 'Email ou senha incorretos' } },
    });

    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={['/login']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const user = userEvent.setup();
    const emailInput = screen.getByLabelText(/Email/i);
    const senhaInput = screen.getByLabelText(/Senha/i);
    const submitBtn = screen.getByRole('button', { name: /Entrar/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(senhaInput, 'senha123');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Email ou senha incorretos/i)).toBeInTheDocument();
    });
  });

  test('navigates to dashboard on successful login', async () => {
    (authService.loginApi as any).mockResolvedValue('fake-jwt-token');
    (storage.setToken as any).mockImplementation(() => {});
    (storage.getToken as any).mockReturnValue('fake-jwt-token');

    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={['/login']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const user = userEvent.setup();
    const emailInput = screen.getByLabelText(/Email/i);
    const senhaInput = screen.getByLabelText(/Senha/i);
    const submitBtn = screen.getByRole('button', { name: /Entrar/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(senhaInput, 'senha123');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Sair/i })).toBeInTheDocument();
    });
  });
});
