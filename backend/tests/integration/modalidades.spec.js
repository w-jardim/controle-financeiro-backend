const request = require('supertest');
const app = require('../../src/app');
const { limparBanco } = require('../helpers/db');
const { criarContaELogar } = require('../helpers/auth');

describe('Modalidades Integration Tests', () => {
  beforeEach(async () => {
    await limparBanco();
  });

  it('acesso negado sem token', async () => {
    const res = await request(app).get('/modalidades');
    expect(res.status).toBe(401);
  });

  it('criação com sucesso', async () => {
    const { token } = await criarContaELogar();

    const payload = { nome: 'Jiu-Jitsu', descricao: 'Modalidade principal' };

    const res = await request(app)
      .post('/modalidades')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.dados).toHaveProperty('id');
    expect(res.body.dados).toHaveProperty('mensagem');
  });

  it('validação de campos obrigatórios', async () => {
    const { token } = await criarContaELogar();

    const res = await request(app)
      .post('/modalidades')
      .set('Authorization', `Bearer ${token}`)
      .send({ descricao: 'Sem nome' });

    expect(res.status).toBe(400);
  });

  it('impedir duplicidade de nome por conta', async () => {
    const { token } = await criarContaELogar();

    const payload = { nome: 'Muay Thai' };

    const first = await request(app)
      .post('/modalidades')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(first.status).toBe(201);

    const second = await request(app)
      .post('/modalidades')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(second.status).toBe(409);
  });

  it('listagem e paginação', async () => {
    const { token } = await criarContaELogar();

    for (let i = 1; i <= 12; i++) {
      await request(app)
        .post('/modalidades')
        .set('Authorization', `Bearer ${token}`)
        .send({ nome: `Modalidade ${i}` });
    }

    const res = await request(app)
      .get('/modalidades')
      .set('Authorization', `Bearer ${token}`)
      .query({ pagina: 1, limite: 10 });

    expect(res.status).toBe(200);
    expect(res.body.meta.pagina).toBe(1);
    expect(res.body.dados.length).toBe(10);
    expect(res.body.meta.total).toBe(12);
  });

  it('buscar por id', async () => {
    const { token } = await criarContaELogar();

    const create = await request(app)
      .post('/modalidades')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Boxe' });

    const id = create.body.dados.id;

    const res = await request(app)
      .get(`/modalidades/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.dados).toHaveProperty('id', id);
    expect(res.body.dados).toHaveProperty('nome', 'Boxe');
  });

  it('atualização', async () => {
    const { token } = await criarContaELogar();

    const create = await request(app)
      .post('/modalidades')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Infantil' });

    const id = create.body.dados.id;

    const res = await request(app)
      .put(`/modalidades/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Infantil - Iniciante', descricao: 'Para crianças iniciantes' });

    expect(res.status).toBe(200);
    expect(res.body.dados).toHaveProperty('nome', 'Infantil - Iniciante');
  });

  it('ativar/desativar', async () => {
    const { token } = await criarContaELogar();

    const create = await request(app)
      .post('/modalidades')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Avançado' });

    const id = create.body.dados.id;

    await request(app)
      .patch(`/modalidades/${id}/desativar`)
      .set('Authorization', `Bearer ${token}`);

    const get1 = await request(app)
      .get(`/modalidades/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(get1.status).toBe(200);
    expect(get1.body.dados.ativo === 0 || get1.body.dados.ativo === false).toBeTruthy();

    await request(app)
      .patch(`/modalidades/${id}/ativar`)
      .set('Authorization', `Bearer ${token}`);

    const get2 = await request(app)
      .get(`/modalidades/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(get2.status).toBe(200);
    expect(get2.body.dados.ativo === 1 || get2.body.dados.ativo === true).toBeTruthy();
  });

  it('isolamento por account', async () => {
    const a = await criarContaELogar({ email: `a${Date.now()}@example.com`, nomeAccount: 'Conta A' });
    const b = await criarContaELogar({ email: `b${Date.now()}@example.com`, nomeAccount: 'Conta B' });

    const createB = await request(app)
      .post('/modalidades')
      .set('Authorization', `Bearer ${b.token}`)
      .send({ nome: 'Modalidade Conta B' });

    const idB = createB.body.dados.id;

    const listA = await request(app)
      .get('/modalidades')
      .set('Authorization', `Bearer ${a.token}`);

    expect(listA.status).toBe(200);
    const found = (listA.body.dados || []).find((m) => m.id === idB);
    expect(found).toBeUndefined();

    const getA = await request(app)
      .get(`/modalidades/${idB}`)
      .set('Authorization', `Bearer ${a.token}`);

    expect(getA.status).toBe(404);
  });
});
