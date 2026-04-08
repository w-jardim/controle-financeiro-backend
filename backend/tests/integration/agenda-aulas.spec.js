const request = require('supertest');
const app = require('../../src/app');
const { limparBanco } = require('../helpers/db');
const { criarContaELogar } = require('../helpers/auth');
const { criarBase, criarAgendaAula } = require('../helpers/operacoes');

describe('Agenda-Aulas Integration Tests', () => {
  beforeEach(async () => {
    await limparBanco();
  });

  // ─── Autenticação ───────────────────────────────────────────────────────────

  it('acesso negado sem token', async () => {
    const res = await request(app).get('/agenda-aulas');
    expect(res.status).toBe(401);
  });

  // ─── Criação ────────────────────────────────────────────────────────────────

  it('criar aula com sucesso', async () => {
    const { token } = await criarContaELogar();
    const { ctId, profId, modId } = await criarBase(token);

    const res = await request(app)
      .post('/agenda-aulas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ct_id: ctId,
        profissional_id: profId,
        modalidade_id: modId,
        data_aula: '2026-06-01',
        hora_inicio: '08:00',
        hora_fim: '09:00',
      });

    expect(res.status).toBe(201);
    expect(res.body.dados).toHaveProperty('id');
  });

  it('validação de campos obrigatórios', async () => {
    const { token } = await criarContaELogar();

    const res = await request(app)
      .post('/agenda-aulas')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('hora_fim <= hora_inicio retorna 400', async () => {
    const { token } = await criarContaELogar();
    const { ctId, profId, modId } = await criarBase(token);

    const res = await request(app)
      .post('/agenda-aulas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ct_id: ctId,
        profissional_id: profId,
        modalidade_id: modId,
        data_aula: '2026-06-01',
        hora_inicio: '10:00',
        hora_fim: '09:00',
      });

    expect(res.status).toBe(400);
  });

  it('ct de outra conta retorna 404', async () => {
    const a = await criarContaELogar({ email: `a${Date.now()}@x.com`, nomeAccount: 'AA' });
    const b = await criarContaELogar({ email: `b${Date.now()}@x.com`, nomeAccount: 'BB' });
    const { ctId } = await criarBase(a.token);
    const { profId, modId } = await criarBase(b.token);

    const res = await request(app)
      .post('/agenda-aulas')
      .set('Authorization', `Bearer ${b.token}`)
      .send({
        ct_id: ctId, // ct pertence à conta A, token é da B
        profissional_id: profId,
        modalidade_id: modId,
        data_aula: '2026-06-02',
        hora_inicio: '08:00',
        hora_fim: '09:00',
      });

    expect(res.status).toBe(404);
  });

  // ─── Leitura ─────────────────────────────────────────────────────────────────

  it('listar aulas paginado', async () => {
    const { token } = await criarContaELogar();
    const { ctId, profId, modId } = await criarBase(token);
    await criarAgendaAula(token, { ctId, profId, modId, dataAula: '2026-06-10' });

    const res = await request(app)
      .get('/agenda-aulas')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('dados');
    expect(Array.isArray(res.body.dados)).toBe(true);
    expect(res.body.dados.length).toBeGreaterThanOrEqual(1);
  });

  it('buscar por id existente', async () => {
    const { token } = await criarContaELogar();
    const { ctId, profId, modId } = await criarBase(token);
    const id = await criarAgendaAula(token, { ctId, profId, modId, dataAula: '2026-06-11' });

    const res = await request(app)
      .get(`/agenda-aulas/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.dados).toHaveProperty('id', id);
  });

  it('buscar id inexistente retorna 404', async () => {
    const { token } = await criarContaELogar();

    const res = await request(app)
      .get('/agenda-aulas/9999999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  // ─── Atualização ─────────────────────────────────────────────────────────────

  it('atualizar aula com PUT', async () => {
    const { token } = await criarContaELogar();
    const { ctId, profId, modId } = await criarBase(token);
    const id = await criarAgendaAula(token, { ctId, profId, modId, dataAula: '2026-06-12' });

    const res = await request(app)
      .put(`/agenda-aulas/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ observacao: 'Aula especial' });

    expect(res.status).toBe(200);
  });

  // ─── Mudança de status ────────────────────────────────────────────────────────

  it('liberar aula', async () => {
    const { token } = await criarContaELogar();
    const { ctId, profId, modId } = await criarBase(token);
    const id = await criarAgendaAula(token, { ctId, profId, modId, dataAula: '2026-06-20' });

    const res = await request(app)
      .patch(`/agenda-aulas/${id}/liberar`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('cancelar aula', async () => {
    const { token } = await criarContaELogar();
    const { ctId, profId, modId } = await criarBase(token);
    const id = await criarAgendaAula(token, { ctId, profId, modId, dataAula: '2026-06-21' });

    const res = await request(app)
      .patch(`/agenda-aulas/${id}/cancelar`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('encerrar aula', async () => {
    const { token } = await criarContaELogar();
    const { ctId, profId, modId } = await criarBase(token);
    const id = await criarAgendaAula(token, { ctId, profId, modId, dataAula: '2026-06-22' });

    const res = await request(app)
      .patch(`/agenda-aulas/${id}/encerrar`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('operações em id inexistente retornam 404', async () => {
    const { token } = await criarContaELogar();

    for (const action of ['liberar', 'cancelar', 'encerrar']) {
      const res = await request(app)
        .patch(`/agenda-aulas/9999999/${action}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    }
  });

  // ─── Isolamento entre contas ──────────────────────────────────────────────────

  it('conta A não acessa agenda da conta B', async () => {
    const a = await criarContaELogar({ email: `iso-a-${Date.now()}@x.com`, nomeAccount: 'Iso A' });
    const b = await criarContaELogar({ email: `iso-b-${Date.now()}@x.com`, nomeAccount: 'Iso B' });

    const base = await criarBase(b.token);
    const id = await criarAgendaAula(b.token, { ctId: base.ctId, profId: base.profId, modId: base.modId, dataAula: '2026-07-01' });

    const res = await request(app)
      .get(`/agenda-aulas/${id}`)
      .set('Authorization', `Bearer ${a.token}`);

    expect(res.status).toBe(404);
  });

  // ─── Gerar por escala ─────────────────────────────────────────────────────────

  it('gerar aulas a partir de escala', async () => {
    const { token } = await criarContaELogar();
    const { ctId, profId, modId } = await criarBase(token);

    // Criar escala (dia_semana 1 = segunda)
    const escala = await request(app)
      .post('/escalas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ct_id: ctId,
        profissional_id: profId,
        modalidade_id: modId,
        dias_semana: [1],
        hora_inicio: '08:00',
        hora_fim: '09:00',
      });

    expect(escala.status).toBe(201);
    const escalaId = escala.body.dados.id;

    // Período de 7 dias (contém ao menos 1 segunda)
    const res = await request(app)
      .post('/agenda-aulas/gerar-por-escala')
      .set('Authorization', `Bearer ${token}`)
      .send({
        escala_id: escalaId,
        data_inicio: '2026-06-01',
        data_fim: '2026-06-07',
      });

    expect(res.status).toBe(201);
    expect(res.body.dados).toHaveProperty('criado');
    expect(res.body.dados.criado).toBeGreaterThanOrEqual(1);
  });

  it('gerar-por-escala com escala inexistente retorna 404', async () => {
    const { token } = await criarContaELogar();

    const res = await request(app)
      .post('/agenda-aulas/gerar-por-escala')
      .set('Authorization', `Bearer ${token}`)
      .send({
        escala_id: 9999999,
        data_inicio: '2026-06-01',
        data_fim: '2026-06-07',
      });

    expect(res.status).toBe(404);
  });

  it('gerar-por-escala com data_fim < data_inicio retorna 400', async () => {
    const { token } = await criarContaELogar();
    const { ctId, profId, modId } = await criarBase(token);

    const escala = await request(app)
      .post('/escalas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ct_id: ctId,
        profissional_id: profId,
        modalidade_id: modId,
        dias_semana: [1],
        hora_inicio: '08:00',
        hora_fim: '09:00',
      });

    const res = await request(app)
      .post('/agenda-aulas/gerar-por-escala')
      .set('Authorization', `Bearer ${token}`)
      .send({
        escala_id: escala.body.dados.id,
        data_inicio: '2026-06-10',
        data_fim: '2026-06-01',
      });

    expect(res.status).toBe(400);
  });

  it('criar escala não gera agenda automaticamente; gerar-por-escala gera', async () => {
    const { token } = await criarContaELogar();
    const { ctId, profId, modId } = await criarBase(token);

    // criar escala
    const escala = await request(app)
      .post('/escalas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ct_id: ctId,
        profissional_id: profId,
        modalidade_id: modId,
        dias_semana: [1],
        hora_inicio: '08:00',
        hora_fim: '09:00',
      });

    expect(escala.status).toBe(201);
    const escalaId = escala.body.dados.id;

    // imediatamente após criar escala, não deve haver agenda_aulas geradas
    const before = await request(app)
      .get('/agenda-aulas')
      .set('Authorization', `Bearer ${token}`);

    expect(before.status).toBe(200);
    const foundBefore = (before.body.dados || []).filter(a => a.escala_id === escalaId);
    expect(foundBefore.length).toBe(0);

    // gerar por escala
    const gen = await request(app)
      .post('/agenda-aulas/gerar-por-escala')
      .set('Authorization', `Bearer ${token}`)
      .send({ escala_id: escalaId, data_inicio: '2026-06-01', data_fim: '2026-06-07' });

    expect(gen.status).toBe(201);
    expect(gen.body.dados).toHaveProperty('criado');
    expect(gen.body.dados.criado).toBeGreaterThanOrEqual(1);

    // agora deve existir ao menos um agenda_aula vinculada à escala
    const after = await request(app)
      .get('/agenda-aulas')
      .set('Authorization', `Bearer ${token}`);

    expect(after.status).toBe(200);
    const foundAfter = (after.body.dados || []).filter(a => a.escala_id === escalaId);
    expect(foundAfter.length).toBeGreaterThanOrEqual(1);
  });
});
