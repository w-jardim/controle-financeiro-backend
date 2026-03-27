const request = require('supertest');
const app = require('../../src/app');
const { limparBanco } = require('../helpers/db');
const { criarContaELogar } = require('../helpers/auth');
const { criarCt } = require('../helpers/ct');

describe('Horários de Aula Integration Tests', () => {
  beforeEach(async () => {
    await limparBanco();
  });

  it('acesso negado sem token', async () => {
    const res = await request(app).get('/horarios-aula');
    expect(res.status).toBe(401);
  });

  it('criação com sucesso', async () => {
    const { token, accountId } = await criarContaELogar();
    const ctId = await criarCt(token);

    // criar profissional e modalidade
    const prof = await request(app)
      .post('/profissionais')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Prof João' });

    const mod = await request(app)
      .post('/modalidades')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Muay Thai' });

    const payload = {
      ct_id: ctId,
      profissional_id: prof.body.id,
      modalidade_id: mod.body.id,
      dia_semana: 1,
      hora_inicio: '19:00:00',
      hora_fim: '20:00:00',
      limite_vagas: 20
    };

    const res = await request(app)
      .post('/horarios-aula')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('validação de horário inválido', async () => {
    const { token } = await criarContaELogar();
    const ctId = await criarCt(token);

    const prof = await request(app)
      .post('/profissionais')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Prof Maria' });

    const mod = await request(app)
      .post('/modalidades')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Jiu-Jitsu' });

    const res = await request(app)
      .post('/horarios-aula')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ct_id: ctId,
        profissional_id: prof.body.id,
        modalidade_id: mod.body.id,
        dia_semana: 2,
        hora_inicio: '18:00:00',
        hora_fim: '17:00:00'
      });

    expect(res.status).toBe(400);
  });

  it('impedir conflito de horário do profissional', async () => {
    const { token } = await criarContaELogar();
    const ctId = await criarCt(token);

    const prof = await request(app)
      .post('/profissionais')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Prof Conflito' });

    const mod = await request(app)
      .post('/modalidades')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Boxe' });

    // criar horário inicial
    const create = await request(app)
      .post('/horarios-aula')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ct_id: ctId,
        profissional_id: prof.body.id,
        modalidade_id: mod.body.id,
        dia_semana: 3,
        hora_inicio: '10:00:00',
        hora_fim: '11:00:00'
      });

    expect(create.status).toBe(201);

    // tentativa de criar conflito
    const conflict = await request(app)
      .post('/horarios-aula')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ct_id: ctId,
        profissional_id: prof.body.id,
        modalidade_id: mod.body.id,
        dia_semana: 3,
        hora_inicio: '10:30:00',
        hora_fim: '11:30:00'
      });

    expect(conflict.status).toBe(409);
  });

  it('listar, buscar por id, atualizar e ativar/desativar', async () => {
    const { token } = await criarContaELogar();
    const ctId = await criarCt(token);

    const prof = await request(app)
      .post('/profissionais')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Prof CRUD' });

    const mod = await request(app)
      .post('/modalidades')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Iniciante' });

    const create = await request(app)
      .post('/horarios-aula')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ct_id: ctId,
        profissional_id: prof.body.id,
        modalidade_id: mod.body.id,
        dia_semana: 4,
        hora_inicio: '08:00:00',
        hora_fim: '09:00:00'
      });

    const id = create.body.id;

    const list = await request(app)
      .get('/horarios-aula')
      .set('Authorization', `Bearer ${token}`);

    expect(list.status).toBe(200);

    const get = await request(app)
      .get(`/horarios-aula/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(get.status).toBe(200);

    const up = await request(app)
      .put(`/horarios-aula/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ hora_inicio: '07:30:00', hora_fim: '08:30:00' });

    expect(up.status).toBe(200);

    await request(app)
      .patch(`/horarios-aula/${id}/desativar`)
      .set('Authorization', `Bearer ${token}`);

    const after = await request(app)
      .get(`/horarios-aula/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(after.status).toBe(200);
    expect(after.body.ativo === 0 || after.body.ativo === false).toBeTruthy();
  });

  it('impedir uso de CT/profissional/modalidade de outra conta', async () => {
    const a = await criarContaELogar({ email: `a${Date.now()}@example.com`, nomeAccount: 'Conta A' });
    const b = await criarContaELogar({ email: `b${Date.now()}@example.com`, nomeAccount: 'Conta B' });

    // criar ct/profissional/modalidade na conta B
    const ctB = await request(app)
      .post('/cts')
      .set('Authorization', `Bearer ${b.token}`)
      .send({ nome: 'CT B' });

    const profB = await request(app)
      .post('/profissionais')
      .set('Authorization', `Bearer ${b.token}`)
      .send({ nome: 'Prof B' });

    const modB = await request(app)
      .post('/modalidades')
      .set('Authorization', `Bearer ${b.token}`)
      .send({ nome: 'Mod B' });

    // tentar criar horário na conta A usando ids da conta B
    const res = await request(app)
      .post('/horarios-aula')
      .set('Authorization', `Bearer ${a.token}`)
      .send({
        ct_id: ctB.body.id,
        profissional_id: profB.body.id,
        modalidade_id: modB.body.id,
        dia_semana: 5,
        hora_inicio: '12:00:00',
        hora_fim: '13:00:00'
      });

    expect(res.status).toBe(404);
  });
});
