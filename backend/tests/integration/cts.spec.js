const request = require('supertest');
const app = require('../../src/app');
const { limparBanco } = require('../helpers/db');
const { criarContaELogar } = require('../helpers/auth');

describe('CTs Integration Tests', () => {
  beforeEach(async () => {
    await limparBanco();
  });

  it('acesso negado sem token', async () => {
    const res = await request(app).get('/cts');
    expect(res.status).toBe(401);
  });

  it('listar CTs autenticado (vazio inicialmente)', async () => {
    const { token } = await criarContaELogar();

    const res = await request(app)
      .get('/cts')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.dados)).toBe(true);
    expect(res.body.total).toBe(0);
  });

  it('criar CT com sucesso', async () => {
    const { token } = await criarContaELogar();

    const res = await request(app)
      .post('/cts')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'CT Teste' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('impedir duplicidade de nome por conta', async () => {
    const { token } = await criarContaELogar();

    const payload = { nome: 'CT Duplicado' };

    const first = await request(app)
      .post('/cts')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(first.status).toBe(201);

    const second = await request(app)
      .post('/cts')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(second.status).toBe(409);
  });

  it('buscar CT por id da própria conta', async () => {
    const { token } = await criarContaELogar();

    const create = await request(app)
      .post('/cts')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'CT Para Buscar' });

    expect(create.status).toBe(201);
    const id = create.body.id;

    const res = await request(app)
      .get(`/cts/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', id);
  });

  it('atualizar CT', async () => {
    const { token } = await criarContaELogar();

    const create = await request(app)
      .post('/cts')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'CT Para Atualizar' });

    const id = create.body.id;

    const res = await request(app)
      .put(`/cts/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'CT Atualizado', ativo: true });

    expect(res.status).toBe(200);

    const get = await request(app)
      .get(`/cts/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(get.status).toBe(200);
    expect(get.body).toHaveProperty('nome', 'CT Atualizado');
  });

  it('desativar CT', async () => {
    const { token } = await criarContaELogar();

    const create = await request(app)
      .post('/cts')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'CT Para Desativar' });

    const id = create.body.id;

    const res = await request(app)
      .patch(`/cts/${id}/desativar`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);

    const get = await request(app)
      .get(`/cts/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(get.status).toBe(200);
    expect(get.body.ativo === 0 || get.body.ativo === false).toBeTruthy();
  });

  it('ativar CT', async () => {
    const { token } = await criarContaELogar();

    const create = await request(app)
      .post('/cts')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'CT Para Ativar' });

    const id = create.body.id;

    await request(app)
      .patch(`/cts/${id}/desativar`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .patch(`/cts/${id}/ativar`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);

    const get = await request(app)
      .get(`/cts/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(get.status).toBe(200);
    expect(get.body.ativo === 1 || get.body.ativo === true).toBeTruthy();
  });

  it('garantir isolamento por account', async () => {
    const a = await criarContaELogar({ email: `a${Date.now()}@example.com`, nomeAccount: 'Conta A' });
    const b = await criarContaELogar({ email: `b${Date.now()}@example.com`, nomeAccount: 'Conta B' });

    const createB = await request(app)
      .post('/cts')
      .set('Authorization', `Bearer ${b.token}`)
      .send({ nome: 'CT Conta B' });

    const idB = createB.body.id;

    const listA = await request(app)
      .get('/cts')
      .set('Authorization', `Bearer ${a.token}`);

    expect(listA.status).toBe(200);
    const found = (listA.body.dados || []).find((c) => c.id === idB);
    expect(found).toBeUndefined();

    const getA = await request(app)
      .get(`/cts/${idB}`)
      .set('Authorization', `Bearer ${a.token}`);

    expect(getA.status).toBe(404);
  });
});
