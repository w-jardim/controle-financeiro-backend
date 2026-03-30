const request = require('supertest');
const app = require('../../src/app');
const { limparBanco } = require('../helpers/db');
const { criarContaELogar } = require('../helpers/auth');
const { criarCt } = require('../helpers/ct');

describe('Presenças Integration Tests', () => {
  beforeEach(async () => {
    await limparBanco();
  });

  it('acesso negado sem token', async () => {
    const res = await request(app).get('/presencas');
    expect(res.status).toBe(401);
  });

  it('registro com sucesso', async () => {
    const { token } = await criarContaELogar();
    const ctId = await criarCt(token);

    // criar aluno
    const aluno = await request(app)
      .post('/alunos')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Aluno P', ct_id: ctId });

    // criar profissional, modalidade e horário
    const prof = await request(app)
      .post('/profissionais')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Prof P' });

    const mod = await request(app)
      .post('/modalidades')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Mod P' });

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

    // criar agendamento
    const agendamento = await request(app)
      .post('/agendamentos')
      .set('Authorization', `Bearer ${token}`)
      .send({ aluno_id: aluno.body.id, horario_aula_id: horario.body.id, data_aula: '2026-04-10' });

    const res = await request(app)
      .post('/presencas')
      .set('Authorization', `Bearer ${token}`)
      .send({ agendamento_id: agendamento.body.id, status: 'compareceu' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('validação de campos obrigatórios', async () => {
    const { token } = await criarContaELogar();

    const res = await request(app)
      .post('/presencas')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('impedir presença para agendamento inexistente', async () => {
    const { token } = await criarContaELogar();

    const res = await request(app)
      .post('/presencas')
      .set('Authorization', `Bearer ${token}`)
      .send({ agendamento_id: 9999, status: 'faltou' });

    expect(res.status).toBe(404);
  });

  it('impedir vínculo entre contas', async () => {
    const a = await criarContaELogar({ email: `a${Date.now()}@example.com`, nomeAccount: 'Conta A' });
    const b = await criarContaELogar({ email: `b${Date.now()}@example.com`, nomeAccount: 'Conta B' });

    const ctB = await request(app)
      .post('/cts')
      .set('Authorization', `Bearer ${b.token}`)
      .send({ nome: 'CT B' });

    const alunoB = await request(app)
      .post('/alunos')
      .set('Authorization', `Bearer ${b.token}`)
      .send({ nome: 'Aluno B', ct_id: ctB.body.id });

    const profB = await request(app)
      .post('/profissionais')
      .set('Authorization', `Bearer ${b.token}`)
      .send({ nome: 'Prof B' });

    const modB = await request(app)
      .post('/modalidades')
      .set('Authorization', `Bearer ${b.token}`)
      .send({ nome: 'Mod B' });

    const horarioB = await request(app)
      .post('/horarios-aula')
      .set('Authorization', `Bearer ${b.token}`)
      .send({
        ct_id: ctB.body.id,
        profissional_id: profB.body.id,
        modalidade_id: modB.body.id,
        dia_semana: 2,
        hora_inicio: '12:00:00',
        hora_fim: '13:00:00'
      });

    const agendamentoB = await request(app)
      .post('/agendamentos')
      .set('Authorization', `Bearer ${b.token}`)
      .send({ aluno_id: alunoB.body.id, horario_aula_id: horarioB.body.id, data_aula: '2026-04-11' });

    // tentar registrar presença na conta A para agendamento da conta B
    const res = await request(app)
      .post('/presencas')
      .set('Authorization', `Bearer ${a.token}`)
      .send({ agendamento_id: agendamentoB.body.id, status: 'compareceu' });

    expect(res.status).toBe(404);
  });

  it('impedir duplicidade por agendamento', async () => {
    const { token } = await criarContaELogar();
    const ctId = await criarCt(token);

    const aluno = await request(app)
      .post('/alunos')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Aluno D', ct_id: ctId });

    const prof = await request(app)
      .post('/profissionais')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Prof D' });

    const mod = await request(app)
      .post('/modalidades')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Mod D' });

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

    const agendamento = await request(app)
      .post('/agendamentos')
      .set('Authorization', `Bearer ${token}`)
      .send({ aluno_id: aluno.body.id, horario_aula_id: horario.body.id, data_aula: '2026-04-12' });

    const first = await request(app)
      .post('/presencas')
      .set('Authorization', `Bearer ${token}`)
      .send({ agendamento_id: agendamento.body.id, status: 'compareceu' });

    expect(first.status).toBe(201);

    const second = await request(app)
      .post('/presencas')
      .set('Authorization', `Bearer ${token}`)
      .send({ agendamento_id: agendamento.body.id, status: 'faltou' });

    expect(second.status).toBe(409);
  });

  it('atualização de status, listagem e busca por id', async () => {
    const { token } = await criarContaELogar();
    const ctId = await criarCt(token);

    const aluno = await request(app)
      .post('/alunos')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Aluno S', ct_id: ctId });

    const prof = await request(app)
      .post('/profissionais')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Prof S' });

    const mod = await request(app)
      .post('/modalidades')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Mod S' });

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

    const agendamento = await request(app)
      .post('/agendamentos')
      .set('Authorization', `Bearer ${token}`)
      .send({ aluno_id: aluno.body.id, horario_aula_id: horario.body.id, data_aula: '2026-04-13' });

    const created = await request(app)
      .post('/presencas')
      .set('Authorization', `Bearer ${token}`)
      .send({ agendamento_id: agendamento.body.id, status: 'compareceu' });

    const up = await request(app)
      .patch(`/presencas/${created.body.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'justificada' });

    expect(up.status).toBe(200);

    const list = await request(app)
      .get('/presencas')
      .set('Authorization', `Bearer ${token}`);

    expect(list.status).toBe(200);

    const get = await request(app)
      .get(`/presencas/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(get.status).toBe(200);
  });
});
