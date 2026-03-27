const request = require('supertest');
const app = require('../../src/app');
const { limparBanco } = require('../helpers/db');
const { criarContaELogar } = require('../helpers/auth');

describe('Profissionais Integration Tests', () => {
  beforeEach(async () => {
    await limparBanco();
  });

  it('acesso negado sem token', async () => {
    const res = await request(app).get('/profissionais');
    expect(res.status).toBe(401);
  });

  it('listar profissionais autenticado (vazio inicialmente)', async () => {
    const { token } = await criarContaELogar();

    const res = await request(app)
      .get('/profissionais')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('dados');
    expect(Array.isArray(res.body.dados)).toBe(true);
    expect(res.body.total).toBe(0);
  });

  it('criar profissional com sucesso', async () => {
    const { token } = await criarContaELogar();

    const payload = {
      nome: 'Carlos Silva',
      email: 'carlos@email.com',
      telefone: '21999999999',
      especialidade: 'Jiu-Jitsu'
    };

    const res = await request(app)
      .post('/profissionais')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('mensagem');
  });

  it('validar campos obrigatórios ao criar (nome)', async () => {
    const { token } = await criarContaELogar();

    // falta nome
    const res = await request(app)
      .post('/profissionais')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'teste@email.com' });

    expect(res.status).toBe(400);
  });

  it('impedir duplicidade de nome + telefone por conta', async () => {
    const { token } = await criarContaELogar();

    const payload = {
      nome: 'Profissional Duplicado',
      telefone: '21987654321'
    };

    const first = await request(app)
      .post('/profissionais')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(first.status).toBe(201);

    const second = await request(app)
      .post('/profissionais')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(second.status).toBe(409);
  });

  it('buscar profissional por id da própria conta', async () => {
    const { token } = await criarContaELogar();

    const create = await request(app)
      .post('/profissionais')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Profissional Para Buscar', telefone: '21999999999' });

    expect(create.status).toBe(201);
    const id = create.body.id;

    const res = await request(app)
      .get(`/profissionais/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', id);
    expect(res.body).toHaveProperty('nome', 'Profissional Para Buscar');
  });

  it('atualizar profissional', async () => {
    const { token } = await criarContaELogar();

    const create = await request(app)
      .post('/profissionais')
      .set('Authorization', `Bearer ${token}`)
      .send({ 
        nome: 'Profissional Para Atualizar', 
        telefone: '21999999999',
        especialidade: 'Muay Thai'
      });

    const id = create.body.id;

    const res = await request(app)
      .put(`/profissionais/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ 
        nome: 'Profissional Atualizado', 
        especialidade: 'Jiu-Jitsu'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('nome', 'Profissional Atualizado');
    expect(res.body).toHaveProperty('especialidade', 'Jiu-Jitsu');
  });

  it('desativar profissional', async () => {
    const { token } = await criarContaELogar();

    const create = await request(app)
      .post('/profissionais')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Profissional Para Desativar', telefone: '21999999999' });

    const id = create.body.id;

    const res = await request(app)
      .patch(`/profissionais/${id}/desativar`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('mensagem');

    const get = await request(app)
      .get(`/profissionais/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(get.status).toBe(200);
    expect(get.body.ativo === 0 || get.body.ativo === false).toBeTruthy();
  });

  it('ativar profissional', async () => {
    const { token } = await criarContaELogar();

    const create = await request(app)
      .post('/profissionais')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Profissional Para Ativar', telefone: '21999999999' });

    const id = create.body.id;

    await request(app)
      .patch(`/profissionais/${id}/desativar`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .patch(`/profissionais/${id}/ativar`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);

    const get = await request(app)
      .get(`/profissionais/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(get.status).toBe(200);
    expect(get.body.ativo === 1 || get.body.ativo === true).toBeTruthy();
  });

  it('garantir isolamento por account para profissionais', async () => {
    const a = await criarContaELogar({ 
      email: `a${Date.now()}@example.com`, 
      nomeAccount: 'Conta A' 
    });
    const b = await criarContaELogar({ 
      email: `b${Date.now()}@example.com`, 
      nomeAccount: 'Conta B' 
    });

    const createB = await request(app)
      .post('/profissionais')
      .set('Authorization', `Bearer ${b.token}`)
      .send({ nome: 'Profissional Conta B', telefone: '21999999999' });

    const idB = createB.body.id;

    const listA = await request(app)
      .get('/profissionais')
      .set('Authorization', `Bearer ${a.token}`);

    expect(listA.status).toBe(200);
    const found = (listA.body.dados || []).find((p) => p.id === idB);
    expect(found).toBeUndefined();

    const getA = await request(app)
      .get(`/profissionais/${idB}`)
      .set('Authorization', `Bearer ${a.token}`);

    expect(getA.status).toBe(404);
  });

  it('listar profissionais com paginação', async () => {
    const { token } = await criarContaELogar();

    // Criar 15 profissionais
    for (let i = 1; i <= 15; i++) {
      await request(app)
        .post('/profissionais')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          nome: `Profissional ${i}`, 
          telefone: `2199999${String(i).padStart(4, '0')}`
        });
    }

    const page1 = await request(app)
      .get('/profissionais')
      .set('Authorization', `Bearer ${token}`)
      .query({ pagina: 1, limite: 10 });

    expect(page1.status).toBe(200);
    expect(page1.body.pagina).toBe(1);
    expect(page1.body.dados.length).toBe(10);
    expect(page1.body.total).toBe(15);

    const page2 = await request(app)
      .get('/profissionais')
      .set('Authorization', `Bearer ${token}`)
      .query({ pagina: 2, limite: 10 });

    expect(page2.status).toBe(200);
    expect(page2.body.pagina).toBe(2);
    expect(page2.body.dados.length).toBe(5);
  });
});
