const escalaService = require('../../src/modules/escalas/services/escalasService');
const escalaRepository = require('../../src/modules/escalas/repositories/escalasRepository');
const ctRepository = require('../../src/modules/cts/repositories/ctRepository');
const profissionalRepository = require('../../src/modules/profissionais/repositories/profissionalRepository');
const modalidadeRepository = require('../../src/modules/modalidades/repositories/modalidadeRepository');
const AppError = require('../../src/shared/errors/AppError');

jest.mock('../../src/modules/escalas/repositories/escalasRepository');
jest.mock('../../src/modules/cts/repositories/ctRepository');
jest.mock('../../src/modules/profissionais/repositories/profissionalRepository');
jest.mock('../../src/modules/modalidades/repositories/modalidadeRepository');

describe('EscalasService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('criar throws when accountId is missing', async () => {
    await expect(escalaService.criar({}, null)).rejects.toThrow('accountId é obrigatório');
  });

  test('criar throws when required fields missing', async () => {
    await expect(escalaService.criar({ ct_id: 1 }, 1)).rejects.toThrow('Campos obrigatórios ausentes');
  });

  test('criar throws when hora_fim <= hora_inicio', async () => {
    const payload = { ct_id: 1, profissional_id: 2, modalidade_id: 3, dias_semana: [1], hora_inicio: '10:00', hora_fim: '09:00' };
    await expect(escalaService.criar(payload, 1)).rejects.toThrow('hora_fim deve ser maior que hora_inicio');
  });

  test('criar throws when ct not found', async () => {
    ctRepository.buscarPorId.mockResolvedValue(null);
    profissionalRepository.buscarPorId.mockResolvedValue({ id: 2 });
    modalidadeRepository.buscarPorId.mockResolvedValue({ id: 3 });

    const payload = { ct_id: 1, profissional_id: 2, modalidade_id: 3, dias_semana: [1], hora_inicio: '09:00', hora_fim: '10:00' };
    await expect(escalaService.criar(payload, 5)).rejects.toThrow('CT não encontrado ou não pertence à conta');
  });

  test('criar throws when profissional not found', async () => {
    ctRepository.buscarPorId.mockResolvedValue({ id: 1 });
    profissionalRepository.buscarPorId.mockResolvedValue(null);
    modalidadeRepository.buscarPorId.mockResolvedValue({ id: 3 });

    const payload = { ct_id: 1, profissional_id: 2, modalidade_id: 3, dias_semana: [1], hora_inicio: '09:00', hora_fim: '10:00' };
    await expect(escalaService.criar(payload, 5)).rejects.toThrow('Profissional não encontrado ou não pertence à conta');
  });

  test('criar throws when modalidade not found', async () => {
    ctRepository.buscarPorId.mockResolvedValue({ id: 1 });
    profissionalRepository.buscarPorId.mockResolvedValue({ id: 2 });
    modalidadeRepository.buscarPorId.mockResolvedValue(null);

    const payload = { ct_id: 1, profissional_id: 2, modalidade_id: 3, dias_semana: [1], hora_inicio: '09:00', hora_fim: '10:00' };
    await expect(escalaService.criar(payload, 5)).rejects.toThrow('Modalidade não encontrada ou não pertence à conta');
  });

  test('criar calls repository and returns id on success', async () => {
    ctRepository.buscarPorId.mockResolvedValue({ id: 1 });
    profissionalRepository.buscarPorId.mockResolvedValue({ id: 2 });
    modalidadeRepository.buscarPorId.mockResolvedValue({ id: 3 });
    escalaRepository.criar.mockResolvedValue({ id: 123 });

    const payload = { ct_id: 1, profissional_id: 2, modalidade_id: 3, dias_semana: [1, 3], hora_inicio: '09:00', hora_fim: '10:00' };
    const result = await escalaService.criar(payload, 7);
    expect(escalaRepository.criar).toHaveBeenCalledWith(expect.objectContaining({ accountId: 7, ctId: 1, profissionalId: 2, modalidadeId: 3, diasSemana: [1, 3] }));
    expect(result).toEqual({ mensagem: 'Escala criada com sucesso', id: 123 });
  });

  test('listar requires accountId', async () => {
    await expect(escalaService.listar({}, null)).rejects.toThrow('accountId é obrigatório');
  });

  test('buscarPorId throws when not found', async () => {
    escalaRepository.buscarPorId.mockResolvedValue(null);
    await expect(escalaService.buscarPorId(99, 5)).rejects.toThrow('Escala não encontrada');
  });

  test('atualizar updates dias_semana and fields', async () => {
    const existente = { id: 10, hora_inicio: '09:00', hora_fim: '10:00' };
    escalaRepository.buscarPorId.mockResolvedValue(existente);
    escalaRepository.atualizar.mockResolvedValue({ afetadas: 1 });
    escalaRepository.buscarPorId.mockResolvedValueOnce(existente).mockResolvedValueOnce({ ...existente, hora_inicio: '08:00', hora_fim: '09:00', dias_semana: [2,4] });

    const result = await escalaService.atualizar(10, { hora_inicio: '08:00', hora_fim: '09:00', dias_semana: [2,4] }, 5);
    expect(escalaRepository.atualizar).toHaveBeenCalled();
    expect(result.dias_semana).toEqual([2,4]);
  });

  test('desativar and ativar call repository alterarStatus with account scope', async () => {
    const existente = { id: 11 };
    escalaRepository.buscarPorId.mockResolvedValue(existente);
    escalaRepository.alterarStatus.mockResolvedValue({ afetadas: 1 });

    await expect(escalaService.desativar(11, 8)).resolves.toEqual({ mensagem: 'Escala desativada com sucesso' });
    expect(escalaRepository.alterarStatus).toHaveBeenCalledWith(11, 8, false);

    await expect(escalaService.ativar(11, 8)).resolves.toEqual({ mensagem: 'Escala ativada com sucesso' });
    expect(escalaRepository.alterarStatus).toHaveBeenCalledWith(11, 8, true);
  });
});
