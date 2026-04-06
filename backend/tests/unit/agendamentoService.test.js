const agendamentoService = require('../../src/modules/agendamentos/services/agendamentoService');
const agendamentoRepository = require('../../src/modules/agendamentos/repositories/agendamentoRepository');
const alunoRepository = require('../../src/modules/alunos/repositories/alunoRepository');
const horarioRepository = require('../../src/modules/horarios-aula/repositories/horarioAulaRepository');
const agendaAulasRepository = require('../../src/modules/agenda-aulas/repositories/agendaAulasRepository');

jest.mock('../../src/modules/agendamentos/repositories/agendamentoRepository');
jest.mock('../../src/modules/alunos/repositories/alunoRepository');
jest.mock('../../src/modules/horarios-aula/repositories/horarioAulaRepository');
jest.mock('../../src/modules/agenda-aulas/repositories/agendaAulasRepository');

describe('AgendamentoService compatibilidade dual', () => {
  beforeEach(() => jest.clearAllMocks());

  test('criar com horario_aula_id funciona (legado)', async () => {
    alunoRepository.buscarPorId.mockResolvedValue({ id: 1 });
    horarioRepository.buscarPorId.mockResolvedValue({ id: 2, limite_vagas: null });
    agendamentoRepository.criar.mockResolvedValue({ id: 101 });

    const payload = { aluno_id: 1, horario_aula_id: 2, data_aula: '2026-04-10' };
    const res = await agendamentoService.criar(payload, 7);
    expect(res).toEqual({ mensagem: 'Agendamento criado com sucesso', id: 101 });
    expect(agendamentoRepository.criar).toHaveBeenCalledWith(expect.objectContaining({ horarioAulaId: 2, agendaAulaId: null }));
  });

  test('criar com agenda_aula_id funciona (novo vínculo) e previne duplicidade', async () => {
    alunoRepository.buscarPorId.mockResolvedValue({ id: 1 });
    agendaAulasRepository.buscarPorId.mockResolvedValue({ id: 55 });
    agendamentoRepository.existeDuplicidadeAlunoAgenda.mockResolvedValue(false);
    agendamentoRepository.criar.mockResolvedValue({ id: 202 });

    const payload = { aluno_id: 1, agenda_aula_id: 55, data_aula: '2026-04-12' };
    const res = await agendamentoService.criar(payload, 9);
    expect(res).toEqual({ mensagem: 'Agendamento criado com sucesso', id: 202 });
    expect(agendamentoRepository.criar).toHaveBeenCalledWith(expect.objectContaining({ horarioAulaId: null, agendaAulaId: 55 }));
  });

  test('criar com agenda_aula_id existente falha por duplicidade', async () => {
    alunoRepository.buscarPorId.mockResolvedValue({ id: 1 });
    agendaAulasRepository.buscarPorId.mockResolvedValue({ id: 55 });
    agendamentoRepository.existeDuplicidadeAlunoAgenda.mockResolvedValue(true);

    const payload = { aluno_id: 1, agenda_aula_id: 55, data_aula: '2026-04-12' };
    await expect(agendamentoService.criar(payload, 9)).rejects.toThrow('Aluno já agendado para essa aula');
  });
});
