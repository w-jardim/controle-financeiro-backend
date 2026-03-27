const request = require('supertest');
const app = require('../../src/app');
const { limparBanco } = require('../helpers/db');
const { criarContaELogar } = require('../helpers/auth');
const { criarCt } = require('../helpers/ct');

describe('Transações Integration Tests', () => {
  beforeEach(async () => {
    await limparBanco();
  });

  it('acesso negado sem token', async () => {
    const res = await request(app).get('/transacoes');
    expect(res.status).toBe(401);
  });

  it('criar transação com sucesso', async () => {
    const { token } = await criarContaELogar();
    const ctId = await criarCt(token);

    const payload = { tipo: 'receita', descricao: 'Mensalidade', valor: 100.5, ct_id: ctId };

    const res = await request(app)
      .post('/transacoes')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('validar campos obrigatórios ao criar', async () => {
    const { token } = await criarContaELogar();
    const res = await request(app)
      .post('/transacoes')
      .set('Authorization', `Bearer ${token}`)
      .send({ descricao: 'Sem tipo', valor: 10 });

    expect(res.status).toBe(400);
  });

  it('listar transações autenticado e filtrar por tipo', async () => {
    const { token } = await criarContaELogar();
    const ctId = await criarCt(token);

    await request(app)
      .post('/transacoes')
      .set('Authorization', `Bearer ${token}`)
      .send({ tipo: 'receita', descricao: 'A', valor: 10, ct_id: ctId });

    await request(app)
      .post('/transacoes')
      .set('Authorization', `Bearer ${token}`)
      .send({ tipo: 'despesa', descricao: 'B', valor: 20, ct_id: ctId });

    const resAll = await request(app)
      .get('/transacoes')
      .set('Authorization', `Bearer ${token}`);

    expect(resAll.status).toBe(200);
    expect(resAll.body).toHaveProperty('dados');
    expect(resAll.body.total).toBe(2);

    const resFiltro = await request(app)
      .get('/transacoes')
      .set('Authorization', `Bearer ${token}`)
      .query({ tipo: 'receita' });

    expect(resFiltro.status).toBe(200);
    expect(resFiltro.body.total).toBe(1);
  });

  it('filtrar por descrição parcial e paginação', async () => {
    const { token } = await criarContaELogar();
    const ctId = await criarCt(token);

    for (let i = 0; i < 15; i++) {
      await request(app)
        .post('/transacoes')
        .set('Authorization', `Bearer ${token}`)
        .send({ tipo: 'receita', descricao: `Venda ${i}`, valor: 5 + i, ct_id: ctId });
    }

    const page1 = await request(app)
      .get('/transacoes')
      .set('Authorization', `Bearer ${token}`)
      .query({ pagina: 1, limite: 10 });

    expect(page1.status).toBe(200);
    expect(page1.body.pagina).toBe(1);
    expect(page1.body.dados.length).toBe(10);

    const page2 = await request(app)
      .get('/transacoes')
      .set('Authorization', `Bearer ${token}`)
      .query({ pagina: 2, limite: 10 });

    expect(page2.status).toBe(200);
    expect(page2.body.pagina).toBe(2);
    expect(page2.body.dados.length).toBe(5);

    const filtroDesc = await request(app)
      .get('/transacoes')
      .set('Authorization', `Bearer ${token}`)
      .query({ descricao: 'Venda 1' });

    expect(filtroDesc.status).toBe(200);
    expect(filtroDesc.body.total).toBeGreaterThanOrEqual(1);
  });

  it('buscar, atualizar e deletar transação', async () => {
    const { token } = await criarContaELogar();
    const ctId = await criarCt(token);

    const create = await request(app)
      .post('/transacoes')
      .set('Authorization', `Bearer ${token}`)
      .send({ tipo: 'receita', descricao: 'ToEdit', valor: 50, ct_id: ctId });

    const id = create.body.id;

    const get = await request(app)
      .get(`/transacoes/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(get.status).toBe(200);
    expect(get.body).toHaveProperty('id', id);

    const up = await request(app)
      .put(`/transacoes/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ tipo: 'despesa', descricao: 'Edited', valor: 60, ct_id: ctId });

    expect(up.status).toBe(200);

    const del = await request(app)
      .delete(`/transacoes/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(del.status).toBe(200);

    const getAfter = await request(app)
      .get(`/transacoes/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(getAfter.status).toBe(404);
  });

  it('garantir isolamento por account para transações', async () => {
    const a = await criarContaELogar({ email: `a${Date.now()}@example.com`, nomeAccount: 'Conta A' });
    const b = await criarContaELogar({ email: `b${Date.now()}@example.com`, nomeAccount: 'Conta B' });

    const ctB = await criarCt(b.token);

    const createB = await request(app)
      .post('/transacoes')
      .set('Authorization', `Bearer ${b.token}`)
      .send({ tipo: 'receita', descricao: 'Trans B', valor: 10, ct_id: ctB });

    const idB = createB.body.id;

    const listA = await request(app)
      .get('/transacoes')
      .set('Authorization', `Bearer ${a.token}`);

    expect(listA.status).toBe(200);
    const found = (listA.body.dados || []).find((t) => t.id === idB);
    expect(found).toBeUndefined();

    const getA = await request(app)
      .get(`/transacoes/${idB}`)
      .set('Authorization', `Bearer ${a.token}`);

    expect(getA.status).toBe(404);
  });
});
