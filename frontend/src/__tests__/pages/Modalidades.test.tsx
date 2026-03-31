import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import Modalidades from '../../pages/modalidades/Modalidades';
import * as modalidadesService from '../../services/api/modalidadesService';

vi.mock('../../services/api/modalidadesService');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  Wrapper.displayName = 'Wrapper';
  return Wrapper;
};

describe('Modalidades', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // mock window.confirm used by the component
    global.confirm = vi.fn(() => true) as unknown as (message?: string) => boolean;
  });

  it('deve renderizar lista vazia', async () => {
    vi.mocked(modalidadesService.listarModalidadesApi).mockResolvedValue({
      pagina: 1,
      limite: 10,
      total: 0,
      totalPaginas: 0,
      dados: [],
    });

    render(<Modalidades />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Nenhuma modalidade cadastrada')).toBeInTheDocument();
    });
  });

  it('deve renderizar lista com dados', async () => {
    vi.mocked(modalidadesService.listarModalidadesApi).mockResolvedValue({
      pagina: 1,
      limite: 10,
      total: 2,
      totalPaginas: 1,
      dados: [
        {
          id: 1,
          nome: 'Teste 1',
          descricao: 'Descrição 1',
          ativo: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: 2,
          nome: 'Teste 2',
          descricao: null,
          ativo: false,
          createdAt: '2024-01-02',
          updatedAt: '2024-01-02',
        },
      ],
    });

    render(<Modalidades />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Teste 1')).toBeInTheDocument();
      expect(screen.getByText('Teste 2')).toBeInTheDocument();
    });
  });

  it('deve abrir modal de criação', async () => {
    vi.mocked(modalidadesService.listarModalidadesApi).mockResolvedValue({
      pagina: 1,
      limite: 10,
      total: 0,
      totalPaginas: 0,
      dados: [],
    });

    const user = userEvent.setup();
    render(<Modalidades />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Nova Modalidade')).toBeInTheDocument();
    });

    const botaoNovo = screen.getByText('Nova Modalidade');
    await user.click(botaoNovo);

    await waitFor(() => {
      expect(screen.getByText('Nova Modalidade', { selector: 'h2' })).toBeInTheDocument();
    });
  });

  it('deve criar nova modalidade', async () => {
    vi.mocked(modalidadesService.listarModalidadesApi).mockResolvedValue({
      pagina: 1,
      limite: 10,
      total: 0,
      totalPaginas: 0,
      dados: [],
    });

    vi.mocked(modalidadesService.criarModalidadeApi).mockResolvedValue({
      mensagem: 'Modalidade criada com sucesso',
      id: 1,
    });

    const user = userEvent.setup();
    render(<Modalidades />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Nova Modalidade')).toBeInTheDocument();
    });

    const botaoNovo = screen.getByText('Nova Modalidade');
    await user.click(botaoNovo);

    const inputNome = screen.getByLabelText(/Nome/i);
    await user.type(inputNome, 'Nova Modalidade Teste');

    const botaoSalvar = screen.getByText('Salvar');
    await user.click(botaoSalvar);

    await waitFor(() => {
      expect(modalidadesService.criarModalidadeApi).toHaveBeenCalledWith({
        nome: 'Nova Modalidade Teste',
        descricao: '',
      });
    });
  });

  it('deve exibir erro ao carregar', async () => {
    vi.mocked(modalidadesService.listarModalidadesApi).mockRejectedValue(
      new Error('Erro ao carregar')
    );

    render(<Modalidades />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar modalidades')).toBeInTheDocument();
    });
  });

  it('deve desativar modalidade e atualizar lista', async () => {
    // first call: returns one active modalidade
    vi.mocked(modalidadesService.listarModalidadesApi)
      .mockResolvedValueOnce({
        pagina: 1,
        limite: 10,
        total: 1,
        totalPaginas: 1,
        dados: [
          {
            id: 10,
            nome: 'Para Desativar',
            descricao: 'desc',
            ativo: true,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
        ],
      })
      // second call after mutation: returns same item as inactive
      .mockResolvedValueOnce({
        pagina: 1,
        limite: 10,
        total: 1,
        totalPaginas: 1,
        dados: [
          {
            id: 10,
            nome: 'Para Desativar',
            descricao: 'desc',
            ativo: false,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
        ],
      });

    vi.mocked(modalidadesService.desativarModalidadeApi).mockResolvedValue({ mensagem: 'Modalidade desativada com sucesso' });

    const user = userEvent.setup();
    render(<Modalidades />, { wrapper: createWrapper() });

    // wait initial render
    await waitFor(() => expect(screen.getByText('Para Desativar')).toBeInTheDocument());

    const botaoDesativar = screen.getByText('Desativar');
    await user.click(botaoDesativar);

    await waitFor(() => {
      expect(modalidadesService.desativarModalidadeApi).toHaveBeenCalledWith(10);
    });

    // after mutation and refetch, UI should show 'Inativo'
    await waitFor(() => expect(screen.getByText('Inativo')).toBeInTheDocument());
  });
});
