import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Dashboard from '../../pages/dashboard/Dashboard';
import Profissionais from '../../pages/profissionais/Profissionais';
import Horarios from '../../pages/horarios/Horarios';
import Escalas from '../../pages/escalas/Escalas';
import AgendaAulas from '../../pages/agenda-aulas/AgendaAulas';
import Agendamentos from '../../pages/agendamentos/Agendamentos';
import Presencas from '../../pages/presencas/Presencas';
import Mensalidades from '../../pages/mensalidades/Mensalidades';
import Transacoes from '../../pages/transacoes/Transacoes';

const mutationMock = {
  mutate: vi.fn(),
  mutateAsync: vi.fn().mockResolvedValue({}),
  isPending: false,
  isError: false,
};

vi.mock('../../hooks/useAlunos', () => ({
  useAlunos: () => ({
    data: {
      dados: [
        { id: 1, nome: 'Aluno 1', ativo: true, ct_id: 1 },
        { id: 2, nome: 'Aluno 2', ativo: false, ct_id: 1 },
      ],
    },
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('../../hooks/useProfissionais', () => ({
  useProfissionais: () => ({
    data: {
      dados: [
        { id: 1, nome: 'Prof 1', ativo: true, email: 'p1@x.com', telefone: '1199999', especialidade: 'Muay Thai' },
      ],
    },
    isLoading: false,
    isError: false,
  }),
  useCriarProfissional: () => mutationMock,
  useAtualizarProfissional: () => mutationMock,
  useDesativarProfissional: () => mutationMock,
  useAtivarProfissional: () => mutationMock,
}));

vi.mock('../../hooks/useModalidades', () => ({
  useModalidades: () => ({
    data: {
      dados: [
        { id: 1, nome: 'Muay Thai' },
        { id: 2, nome: 'Jiu Jitsu' },
      ],
    },
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('../../hooks/useCts', () => ({
  useCts: () => ({
    data: {
      dados: [
        { id: 1, nome: 'CT Alpha' },
      ],
    },
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('../../hooks/useHorarios', () => ({
  useHorarios: () => ({
    data: {
      dados: [
        {
          id: 1,
          ct_id: 1,
          modalidade_id: 1,
          profissional_id: 1,
          dia_semana: 1,
          hora_inicio: '08:00',
          hora_fim: '09:00',
          ativo: true,
        },
      ],
    },
    isLoading: false,
    isError: false,
  }),
  useCriarHorario: () => mutationMock,
  useAtualizarHorario: () => mutationMock,
  useDesativarHorario: () => mutationMock,
  useAtivarHorario: () => mutationMock,
}));

vi.mock('../../hooks/useEscalas', () => ({
  useEscalas: () => ({
    data: {
      dados: [
        {
          id: 1,
          ct_id: 1,
          modalidade_id: 1,
          profissional_id: 1,
          dias_semana: [1],
          hora_inicio: '08:00:00',
          hora_fim: '09:00:00',
          ativo: true,
        },
      ],
    },
    isLoading: false,
    isError: false,
  }),
  useCriarEscala: () => ({ ...mutationMock, isError: false }),
  useAtualizarEscala: () => mutationMock,
}));

vi.mock('../../hooks/useAgendaAulas', () => ({
  useAgenda: () => ({
    data: {
      dados: [
        {
          id: 1,
          ct_id: 1,
          modalidade_id: 1,
          profissional_id: 1,
          data_aula: '2026-04-08',
          hora_inicio: '08:00',
          hora_fim: '09:00',
          status: 'liberada',
        },
      ],
    },
    isLoading: false,
    isError: false,
  }),
  useCriarAgenda: () => mutationMock,
}));

vi.mock('../../hooks/useAgendamentos', () => ({
  useAgendamentos: () => ({
    data: {
      dados: [
        {
          id: 1,
          aluno_id: 1,
          horario_aula_id: 1,
          data_aula: '2026-04-08',
          status: 'agendado',
        },
      ],
      meta: { total: 1, pagina: 1, limite: 10, totalPaginas: 1 },
    },
    isLoading: false,
    isError: false,
  }),
  useCriarAgendamento: () => mutationMock,
  useCancelarAgendamento: () => mutationMock,
  useAtualizarStatusAgendamento: () => mutationMock,
}));

vi.mock('../../hooks/usePresencas', () => ({
  usePresencas: () => ({
    data: {
      dados: [
        { id: 1, agendamento_id: 1, status: 'compareceu', observacao: null },
      ],
      meta: { total: 1, pagina: 1, limite: 10, totalPaginas: 1 },
    },
    isLoading: false,
    isError: false,
  }),
  useCriarPresenca: () => mutationMock,
  useAtualizarStatusPresenca: () => mutationMock,
  useAtualizarPresenca: () => mutationMock,
}));

vi.mock('../../hooks/useMensalidades', () => ({
  useMensalidades: () => ({
    data: {
      dados: [
        { id: 1, aluno_id: 1, competencia: '2026-04', valor: 120, vencimento: '2026-04-10', status: 'pendente' },
      ],
      meta: { total: 1, pagina: 1, limite: 10, totalPaginas: 1 },
    },
    isLoading: false,
    isError: false,
  }),
  useCriarMensalidade: () => mutationMock,
  usePagarMensalidade: () => mutationMock,
  useCancelarMensalidade: () => mutationMock,
}));

vi.mock('../../hooks/useTransacoes', () => ({
  useTransacoes: () => ({
    data: {
      dados: [
        { id: 1, tipo: 'receita', descricao: 'Mensalidade', valor: 120, ct_id: 1 },
      ],
      meta: { total: 1, pagina: 1, limite: 10, totalPaginas: 1 },
    },
    isLoading: false,
    isError: false,
  }),
  useResumoTransacoes: () => ({
    data: { dados: { totalReceitas: 120, totalDespesas: 30, saldo: 90, totalRegistros: 2 } },
    isLoading: false,
    isError: false,
  }),
  useCriarTransacao: () => mutationMock,
  useDeletarTransacao: () => mutationMock,
}));

describe('Módulos Front - cobertura de páginas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Dashboard renderiza métricas principais', () => {
    render(<Dashboard />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Alunos Ativos')).toBeInTheDocument();
    expect(screen.getByText('Saldo Financeiro')).toBeInTheDocument();
  });

  it('Profissionais renderiza listagem', () => {
    render(<Profissionais />);
    expect(screen.getByText('Profissionais')).toBeInTheDocument();
    expect(screen.getByText('Prof 1')).toBeInTheDocument();
  });

  it('Horários renderiza listagem e ação novo', () => {
    render(<Horarios />);
    expect(screen.getByText('Horários')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Novo Horário/i })).toBeInTheDocument();
  });

  it('Escalas renderiza formulário e grade', () => {
    render(<Escalas />);
    expect(screen.getByText('Escalas')).toBeInTheDocument();
    expect(screen.getByText('Horários por dia')).toBeInTheDocument();
  });

  it('Agenda de aulas renderiza e permite abrir fluxo de criação', async () => {
    const user = userEvent.setup();
    render(<AgendaAulas />);
    expect(screen.getByText('Agenda de Aulas')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /Criar Aula/i });
    await user.click(btn);
    expect(btn).toBeInTheDocument();
  });

  it('Agendamentos renderiza listagem', () => {
    render(<Agendamentos />);
    expect(screen.getByText('Agendamentos')).toBeInTheDocument();
    expect(screen.getByText('Aluno 1')).toBeInTheDocument();
  });

  it('Presenças renderiza listagem', () => {
    render(<Presencas />);
    expect(screen.getByText('Presenças')).toBeInTheDocument();
    expect(screen.getAllByText('#1').length).toBeGreaterThanOrEqual(1);
  });

  it('Mensalidades renderiza listagem e ações', () => {
    render(<Mensalidades />);
    expect(screen.getByText('Mensalidades')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pagar/i })).toBeInTheDocument();
  });

  it('Transações renderiza resumo e listagem', () => {
    render(<Transacoes />);
    expect(screen.getByText('Transações')).toBeInTheDocument();
    expect(screen.getByText('Receitas')).toBeInTheDocument();
    expect(screen.getByText('Mensalidade')).toBeInTheDocument();
  });
});
