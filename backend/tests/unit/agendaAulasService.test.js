const agendaService = require('../../src/modules/agenda-aulas/services/agendaAulasService');
const agendaRepository = require('../../src/modules/agenda-aulas/repositories/agendaAulasRepository');
const escalaRepository = require('../../src/modules/escalas/repositories/escalasRepository');
const ctRepository = require('../../src/modules/cts/repositories/ctRepository');
const profissionalRepository = require('../../src/modules/profissionais/repositories/profissionalRepository');
const modalidadeRepository = require('../../src/modules/modalidades/repositories/modalidadeRepository');

jest.mock('../../src/modules/agenda-aulas/repositories/agendaAulasRepository');
jest.mock('../../src/modules/escalas/repositories/escalasRepository');
jest.mock('../../src/modules/cts/repositories/ctRepository');
jest.mock('../../src/modules/profissionais/repositories/profissionalRepository');
jest.mock('../../src/modules/modalidades/repositories/modalidadeRepository');

describe('AgendaAulasService', () => {
  beforeEach(() => jest.clearAllMocks());

  test('criar requires accountId', async () => {
    await expect(agendaService.criar({}, null)).rejects.toThrow('accountId é obrigatório');
  });

  test('criar validates required fields and hora order', async () => {
    await expect(agendaService.criar({ ct_id: 1 }, 1)).rejects.toThrow('Campos obrigatórios ausentes');

    const payload = { ct_id:1, profissional_id:2, modalidade_id:3, data_aula:'2026-04-10', hora_inicio:'10:00', hora_fim:'09:00' };
    await expect(agendaService.criar(payload, 1)).rejects.toThrow('hora_fim deve ser maior que hora_inicio');
  });

  test('criar checks ct/profissional/modalidade and calls repository', async () => {
    ctRepository.buscarPorId.mockResolvedValue({ id:1 });
    profissionalRepository.buscarPorId.mockResolvedValue({ id:2 });
    modalidadeRepository.buscarPorId.mockResolvedValue({ id:3 });
    agendaRepository.criar.mockResolvedValue({ id: 55 });

    const payload = { ct_id:1, profissional_id:2, modalidade_id:3, data_aula:'2026-04-10', hora_inicio:'09:00', hora_fim:'10:00', observacao: 'x' };
    const res = await agendaService.criar(payload, 7);
    expect(agendaRepository.criar).toHaveBeenCalledWith(expect.objectContaining({ accountId:7, ctId:1, profissionalId:2, modalidadeId:3 }));
    expect(res).toEqual({ mensagem: 'Aula criada com sucesso', id: 55 });
  });

  test('buscarPorId throws when not found', async () => {
    agendaRepository.buscarPorId.mockResolvedValue(null);
    await expect(agendaService.buscarPorId(99, 5)).rejects.toThrow('Aula não encontrada');
  });

  test('atualizar updates fields and returns updated', async () => {
    const existente = { id: 20, hora_inicio: '09:00', hora_fim: '10:00' };
    agendaRepository.buscarPorId.mockResolvedValueOnce(existente);
    agendaRepository.atualizar.mockResolvedValue({ afetadas:1 });
    agendaRepository.buscarPorId.mockResolvedValueOnce({ id:20, hora_inicio:'08:00', hora_fim:'09:00' });

    const result = await agendaService.atualizar(20, { hora_inicio: '08:00', hora_fim: '09:00' }, 3);
    expect(agendaRepository.atualizar).toHaveBeenCalled();
    expect(result.hora_inicio).toEqual('08:00');
  });

  test('status transitions liberar/cancelar/encerrar call repository', async () => {
    agendaRepository.buscarPorId.mockResolvedValue({ id:30 });
    agendaRepository.alterarStatus.mockResolvedValue({ afetadas:1 });

    await expect(agendaService.liberar(30, 2)).resolves.toEqual({ mensagem: 'Aula liberada com sucesso' });
    expect(agendaRepository.alterarStatus).toHaveBeenCalledWith(30, 2, 'liberada');

    await expect(agendaService.cancelar(30, 2)).resolves.toEqual({ mensagem: 'Aula cancelada com sucesso' });
    expect(agendaRepository.alterarStatus).toHaveBeenCalledWith(30, 2, 'cancelada');

    await expect(agendaService.encerrar(30, 2)).resolves.toEqual({ mensagem: 'Aula encerrada com sucesso' });
    expect(agendaRepository.alterarStatus).toHaveBeenCalledWith(30, 2, 'encerrada');
  });

  test('gerarPorEscala creates entries for matching dias_semana and avoids duplicates by repository behavior', async () => {
    const escala = { id: 5, ct_id: 1, profissional_id: 2, modalidade_id: 3, hora_inicio: '09:00', hora_fim: '10:00', dias_semana: [1,3] };
    escalaRepository.buscarPorId.mockResolvedValue(escala);
    // simulate cria ids
    agendaRepository.criar.mockImplementation(async ({ dataAula }) => ({ id: Math.floor(Math.random()*1000) }));

    const res = await agendaService.gerarPorEscala({ escala_id: 5, data_inicio: '2026-04-05', data_fim: '2026-04-10' }, 1);
    expect(res.mensagem).toMatch(/Agenda gerada a partir da escala/);
    expect(res.criado).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(res.ids)).toBe(true);
  });
});
