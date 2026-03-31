const request = require('supertest');
const app = require('../../src/app');
const { limparBanco } = require('../helpers/db');
const { criarContaELogar } = require('../helpers/auth');
const { criarCt } = require('../helpers/ct');

describe('Mensalidades Integration Tests', () => {
  beforeEach(async () => {
    await limparBanco();
  });

  it('acesso negado sem token', async () => {
    const res = await request(app).get('/mensalidades');
    expect(res.status).toBe(401);
  });

  it('criação com sucesso', async () => {
    const { token } = await criarContaELogar();
    const ctId = await criarCt(token);

    const aluno = await request(app)
      .post('/alunos')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Aluno M', ct_id: ctId });

    const res = await request(app)
      .post('/mensalidades')
      .set('Authorization', `Bearer ${token}`)
      .send({ aluno_id: aluno.body.dados.id, competencia: '2026-04', valor: 120.50, vencimento: '2026-04-10' });

    expect(res.status).toBe(201);
    expect(res.body.dados).toHaveProperty('id');
  });

  it('validação de campos obrigatórios', async () => {
    const { token } = await criarContaELogar();

    const res = await request(app)
      .post('/mensalidades')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('validação de competência inválida', async () => {
    const { token } = await criarContaELogar();
    const ctId = await criarCt(token);

    const aluno = await request(app)
      .post('/alunos')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Aluno C', ct_id: ctId });

    const res = await request(app)
      .post('/mensalidades')
      .set('Authorization', `Bearer ${token}`)
      .send({ aluno_id: aluno.body.dados.id, competencia: '2026-13', valor: 100, vencimento: '2026-04-10' });

    expect(res.status).toBe(400);
  });

  it('impedir duplicidade por aluno + competencia', async () => {
    const { token } = await criarContaELogar();
    const ctId = await criarCt(token);

    const aluno = await request(app)
      .post('/alunos')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Aluno D', ct_id: ctId });

    const first = await request(app)
      .post('/mensalidades')
      .set('Authorization', `Bearer ${token}`)
      .send({ aluno_id: aluno.body.dados.id, competencia: '2026-05', valor: 90, vencimento: '2026-05-10' });

    expect(first.status).toBe(201);

    const second = await request(app)
      .post('/mensalidades')
      .set('Authorization', `Bearer ${token}`)
      .send({ aluno_id: aluno.body.dados.id, competencia: '2026-05', valor: 90, vencimento: '2026-05-10' });

    expect(second.status).toBe(409);
  });

  it('listagem com filtros', async () => {
    const { token } = await criarContaELogar();
    const ctId = await criarCt(token);

    const aluno1 = await request(app)
      .post('/alunos')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Aluno L1', ct_id: ctId });

    const aluno2 = await request(app)
      .post('/alunos')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Aluno L2', ct_id: ctId });

    await request(app)
      .post('/mensalidades')
      .set('Authorization', `Bearer ${token}`)
      .send({ aluno_id: aluno1.body.dados.id, competencia: '2026-06', valor: 80, vencimento: '2026-06-10' });

    await request(app)
      .post('/mensalidades')
      .set('Authorization', `Bearer ${token}`)
      .send({ aluno_id: aluno2.body.dados.id, competencia: '2026-07', valor: 85, vencimento: '2026-07-10' });

    const listAll = await request(app)
      .get('/mensalidades')
      .set('Authorization', `Bearer ${token}`);

    expect(listAll.status).toBe(200);
    expect(listAll.body.dados.length).toBeGreaterThanOrEqual(2);
    expect(listAll.body.meta.total).toBeGreaterThanOrEqual(listAll.body.dados.length);

    const filterByAluno = await request(app)
      .get(`/mensalidades?aluno_id=${aluno1.body.dados.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(filterByAluno.status).toBe(200);
    expect(filterByAluno.body.dados.every(m => m.aluno_id === aluno1.body.dados.id)).toBe(true);
    expect(filterByAluno.body.meta.total).toBe(filterByAluno.body.dados.length);

    const filterByCompetencia = await request(app)
      .get('/mensalidades?competencia=2026-07')
      .set('Authorization', `Bearer ${token}`);

    expect(filterByCompetencia.status).toBe(200);
    expect(filterByCompetencia.body.dados.every(m => m.competencia === '2026-07')).toBe(true);
    expect(filterByCompetencia.body.meta.total).toBe(filterByCompetencia.body.dados.length);
  });

  it('busca por id e atualização', async () => {
    const { token } = await criarContaELogar();
    const ctId = await criarCt(token);

    const aluno = await request(app)
      .post('/alunos')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Aluno U', ct_id: ctId });

    const created = await request(app)
      .post('/mensalidades')
      .set('Authorization', `Bearer ${token}`)
      .send({ aluno_id: aluno.body.dados.id, competencia: '2026-08', valor: 100, vencimento: '2026-08-10' });

    const get = await request(app)
      .get(`/mensalidades/${created.body.dados.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(get.status).toBe(200);

    const up = await request(app)
      .put(`/mensalidades/${created.body.dados.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ valor: 120, observacao: 'Ajuste' });

    expect(up.status).toBe(200);
    expect(up.body.dados.valor).toBe(120);
    expect(up.body.dados.observacao).toBe('Ajuste');
  });

  it('marcar como paga e cancelar, e impedir transições inválidas', async () => {
    const { token } = await criarContaELogar();
    const ctId = await criarCt(token);

    const aluno = await request(app)
      .post('/alunos')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Aluno P', ct_id: ctId });

    const created = await request(app)
      .post('/mensalidades')
      .set('Authorization', `Bearer ${token}`)
      .send({ aluno_id: aluno.body.dados.id, competencia: '2026-09', valor: 110, vencimento: '2026-09-10' });

    // pagar
    const pagar = await request(app)
      .patch(`/mensalidades/${created.body.dados.id}/pagar`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(pagar.status).toBe(200);
    expect(pagar.body.dados.status).toBe('pago');

    // impedir cancelar mensalidade paga
    const cancelarDepoisPago = await request(app)
      .patch(`/mensalidades/${created.body.dados.id}/cancelar`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(cancelarDepoisPago.status).toBe(400);

    // criar outra e cancelar
    const created2 = await request(app)
      .post('/mensalidades')
      .set('Authorization', `Bearer ${token}`)
      .send({ aluno_id: aluno.body.dados.id, competencia: '2026-10', valor: 115, vencimento: '2026-10-10' });

    const cancelar = await request(app)
      .patch(`/mensalidades/${created2.body.dados.id}/cancelar`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(cancelar.status).toBe(200);
    expect(cancelar.body.dados.status).toBe('cancelado');

    // impedir pagar mensalidade cancelada
    const pagarCancelada = await request(app)
      .patch(`/mensalidades/${created2.body.dados.id}/pagar`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(pagarCancelada.status).toBe(400);
  });

  it('isolamento por account', async () => {
    const a = await criarContaELogar({ email: `a${Date.now()}@example.com`, nomeAccount: 'Conta A' });
    const b = await criarContaELogar({ email: `b${Date.now()}@example.com`, nomeAccount: 'Conta B' });

    const ctB = await request(app)
      .post('/cts')
      .set('Authorization', `Bearer ${b.token}`)
      .send({ nome: 'CT B' });

    const alunoB = await request(app)
      .post('/alunos')
      .set('Authorization', `Bearer ${b.token}`)
      .send({ nome: 'Aluno B', ct_id: ctB.body.dados.id });

    const createdB = await request(app)
      .post('/mensalidades')
      .set('Authorization', `Bearer ${b.token}`)
      .send({ aluno_id: alunoB.body.dados.id, competencia: '2026-11', valor: 130, vencimento: '2026-11-10' });

    // account A tenta acessar recurso de B
    const getByA = await request(app)
      .get(`/mensalidades/${createdB.body.dados.id}`)
      .set('Authorization', `Bearer ${a.token}`);

    expect(getByA.status).toBe(404);

    const payByA = await request(app)
      .patch(`/mensalidades/${createdB.body.dados.id}/pagar`)
      .set('Authorization', `Bearer ${a.token}`)
      .send({});

    expect(payByA.status).toBe(404);
  });
});

