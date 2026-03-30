const request = require('supertest');
const app = require('../../src/app');
const { limparBanco } = require('../helpers/db');
const { criarContaELogar } = require('../helpers/auth');
const { criarCt } = require('../helpers/ct');

describe('Agendamentos Integration Tests', () => {
  beforeEach(async () => {
    await limparBanco();
  });

  it('acesso negado sem token', async () => {
    const res = await request(app).get('/agendamentos');
    expect(res.status).toBe(401);
  });

  it('criação com sucesso', async () => {
    const { token } = await criarContaELogar();
    const ctId = await criarCt(token);

    // criar aluno
    const aluno = await request(app)
      .post('/alunos')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Aluno A', ct_id: ctId });

    // criar profissional e modalidade e horário
    const prof = await request(app)
      .post('/profissionais')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Prof X' });

    const mod = await request(app)
      .post('/modalidades')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Mod X' });

    const horario = await request(app)
      .post('/horarios-aula')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ct_id: ctId,
        profissional_id: prof.body.id,
        modalidade_id: mod.body.id,
        dia_semana: 1,
        hora_inicio: '10:00:00',
        hora_fim: '11:00:00'
      });

    const payload = {
      aluno_id: aluno.body.id,
      horario_aula_id: horario.body.id,
      data_aula: '2026-04-01'
    };

    const res = await request(app)
      .post('/agendamentos')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('validação de campos obrigatórios', async () => {
    const { token } = await criarContaELogar();

    const res = await request(app)
      .post('/agendamentos')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('impedir duplicidade do mesmo aluno no mesmo horário/data', async () => {
    const { token } = await criarContaELogar();
    const ctId = await criarCt(token);

    const aluno = await request(app)
      .post('/alunos')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Aluno Dup', ct_id: ctId });

    const prof = await request(app)
      .post('/profissionais')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Prof Dup' });

    const mod = await request(app)
      .post('/modalidades')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Mod Dup' });

    const horario = await request(app)
      .post('/horarios-aula')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ct_id: ctId,
        profissional_id: prof.body.id,
        modalidade_id: mod.body.id,
        dia_semana: 2,
        hora_inicio: '12:00:00',
        hora_fim: '13:00:00'
      });

    const payload = { aluno_id: aluno.body.id, horario_aula_id: horario.body.id, data_aula: '2026-04-02' };

    const first = await request(app)
      .post('/agendamentos')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(first.status).toBe(201);

    const second = await request(app)
      .post('/agendamentos')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(second.status).toBe(409);
  });

  it('listagem e busca por id', async () => {
    const { token } = await criarContaELogar();
    const ctId = await criarCt(token);

    const aluno = await request(app)
      .post('/alunos')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Aluno List', ct_id: ctId });

    const prof = await request(app)
      .post('/profissionais')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Prof List' });

    const mod = await request(app)
      .post('/modalidades')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Mod List' });

    const horario = await request(app)
      .post('/horarios-aula')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ct_id: ctId,
        profissional_id: prof.body.id,
        modalidade_id: mod.body.id,
        dia_semana: 3,
        hora_inicio: '14:00:00',
        hora_fim: '15:00:00'
      });

    const created = await request(app)
      .post('/agendamentos')
      .set('Authorization', `Bearer ${token}`)
      .send({ aluno_id: aluno.body.id, horario_aula_id: horario.body.id, data_aula: '2026-04-03' });

    const list = await request(app)
      .get('/agendamentos')
      .set('Authorization', `Bearer ${token}`);

    expect(list.status).toBe(200);

    const get = await request(app)
      .get(`/agendamentos/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(get.status).toBe(200);
  });

  it('cancelamento e atualização de status', async () => {
    const { token } = await criarContaELogar();
    const ctId = await criarCt(token);

    const aluno = await request(app)
      .post('/alunos')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Aluno Status', ct_id: ctId });

    const prof = await request(app)
      .post('/profissionais')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Prof Status' });

    const mod = await request(app)
      .post('/modalidades')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Mod Status' });

    const horario = await request(app)
      .post('/horarios-aula')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ct_id: ctId,
        profissional_id: prof.body.id,
        modalidade_id: mod.body.id,
        dia_semana: 4,
        hora_inicio: '16:00:00',
        hora_fim: '17:00:00'
      });

    const created = await request(app)
      .post('/agendamentos')
      .set('Authorization', `Bearer ${token}`)
      .send({ aluno_id: aluno.body.id, horario_aula_id: horario.body.id, data_aula: '2026-04-04' });

    const cancelar = await request(app)
      .patch(`/agendamentos/${created.body.id}/cancelar`)
      .set('Authorization', `Bearer ${token}`);

    expect(cancelar.status).toBe(200);

    const status = await request(app)
      .patch(`/agendamentos/${created.body.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'compareceu' });

    expect(status.status).toBe(200);
  });

  it('isolamento por account e impedir vínculo entre contas', async () => {
    const a = await criarContaELogar({ email: `a${Date.now()}@example.com`, nomeAccount: 'Conta A' });
    const b = await criarContaELogar({ email: `b${Date.now()}@example.com`, nomeAccount: 'Conta B' });

    const ctB = await request(app)
      .post('/cts')
      .set('Authorization', `Bearer ${b.token}`)
      .send({ nome: 'CT B' });

    // criar CT para a conta A e alunoA
    const ctA = await criarCt(a.token);
    const alunoA = await request(app)
      .post('/alunos')
      .set('Authorization', `Bearer ${a.token}`)
      .send({ nome: 'Aluno A', ct_id: ctA });

    const profB = await request(app)
      .post('/profissionais')
      .set('Authorization', `Bearer ${b.token}`)
      .send({ nome: 'Prof B' });

    const modB = await request(app)
      .post('/modalidades')
      .set('Authorization', `Bearer ${b.token}`)
      .send({ nome: 'Mod B' });

    // criar horário em conta B
    const horarioB = await request(app)
      .post('/horarios-aula')
      .set('Authorization', `Bearer ${b.token}`)
      .send({
        ct_id: ctB.body.id,
        profissional_id: profB.body.id,
        modalidade_id: modB.body.id,
        dia_semana: 5,
        hora_inicio: '18:00:00',
        hora_fim: '19:00:00'
      });

    // tentar agendar aluno da conta A no horário da conta B
    const res = await request(app)
      .post('/agendamentos')
      .set('Authorization', `Bearer ${a.token}`)
      .send({ aluno_id: alunoA.body.id, horario_aula_id: horarioB.body.id, data_aula: '2026-04-05' });

    expect(res.status).toBe(404);
  });
});
