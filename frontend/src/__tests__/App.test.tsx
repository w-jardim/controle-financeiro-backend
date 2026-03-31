import { test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../App';
import * as storage from '../utils/storage';

vi.mock('../utils/storage');

const qc = new QueryClient();

test('renders login route by default (unauthenticated)', () => {
  (storage.getToken as any).mockReturnValue(null);
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>
  );
  expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();
});

