import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
vi.mock('../../services/api/alunosService');
vi.mock('../../services/api/ctsService');
import Alunos from '../../pages/alunos/Alunos';
import * as alunosService from '../../services/api/alunosService';
import * as ctsService from '../../services/api/ctsService';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  Wrapper.displayName = 'Wrapper';
  return Wrapper;
};

describe('Alunos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.confirm = vi.fn(() => true) as unknown as (message?: string) => boolean;
  });

  it('renderiza lista vazia', async () => {
    vi.mocked(alunosService.listarAlunosApi).mockResolvedValue({ dados: [] });

    render(<Alunos />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Nenhum aluno cadastrado.')).toBeInTheDocument();
    });
  });

  it('renderiza lista com dados', async () => {
    vi.mocked(alunosService.listarAlunosApi).mockResolvedValue({
      dados: [
        { id: 1, account_id: 1, ct_id: 2, nome: 'Aluno 1', cpf: '123', ativo: true },
        { id: 2, account_id: 1, ct_id: 3, nome: 'Aluno 2', cpf: null, ativo: false },
      ],
    });

    render(<Alunos />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Aluno 1')).toBeInTheDocument();
      expect(screen.getByText('Aluno 2')).toBeInTheDocument();
    });
  });

  it('abre formulário e preenche campos com CT auto-resolvido', async () => {
    vi.mocked(alunosService.listarAlunosApi).mockResolvedValue({ dados: [] });
    vi.mocked(ctsService.listarCtsApi).mockResolvedValue({ dados: [{ id: 1, nome: 'CT 1' }] });

    const user = userEvent.setup();
    render(<Alunos />, { wrapper: createWrapper() });

    await waitFor(() => expect(screen.getByText('Novo Aluno')).toBeInTheDocument());
    await user.click(screen.getByText('Novo Aluno'));

    // No CT input should be visible because only one CT exists
    expect(screen.queryByLabelText(/CT ID/i)).toBeNull();

    const inputNome = screen.getByLabelText('Nome') as HTMLInputElement;
    fireEvent.change(inputNome, { target: { value: 'Novo' } });

    expect(inputNome.value).toBe('Novo');
  });

  it('exibe erro ao carregar', async () => {
    vi.mocked(alunosService.listarAlunosApi).mockRejectedValue(new Error('Erro ao carregar'));

    render(<Alunos />, { wrapper: createWrapper() });

    await waitFor(() => expect(screen.getByText('Erro ao carregar alunos.')).toBeInTheDocument());
  });
});
