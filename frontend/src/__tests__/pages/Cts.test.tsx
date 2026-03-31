import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

vi.mock('../../services/api/ctsService');
import Cts from '../../pages/cts/Cts';
import * as ctsService from '../../services/api/ctsService';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  Wrapper.displayName = 'Wrapper';
  return Wrapper;
};

describe('CTs', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renderiza lista vazia', async () => {
    vi.mocked(ctsService.listarCtsApi).mockResolvedValue({ pagina: 1, limite: 20, total: 0, totalPaginas: 0, dados: [] });
    render(<Cts />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('Nenhum CT cadastrado.')).toBeInTheDocument());
  });

  it('renderiza lista com dados', async () => {
    vi.mocked(ctsService.listarCtsApi).mockResolvedValue({ pagina: 1, limite: 20, total: 1, totalPaginas: 1, dados: [{ id: 1, nome: 'CT 1', ativo: true }] });
    render(<Cts />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText('CT 1')).toBeInTheDocument());
  });
});
