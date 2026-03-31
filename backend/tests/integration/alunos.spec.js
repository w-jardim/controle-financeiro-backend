const request = require('supertest');
const app = require('../../src/app');
const { limparBanco } = require('../helpers/db');
const { criarContaELogar } = require('../helpers/auth');
const { criarCt } = require('../helpers/ct');

describe('Alunos Integration Tests', () => {
  beforeEach(async () => {
    await limparBanco();
  });

  it('acesso negado sem token', async () => {
    const res = await request(app).get('/alunos');
    expect(res.status).toBe(401);
  });

  it('listar alunos autenticado (vazio inicialmente)', async () => {
    const { token } = await criarContaELogar();

    const res = await request(app)
      .get('/alunos')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.dados)).toBe(true);
    expect(res.body.dados.length).toBe(0);
  });

  it('validar campos obrigatórios ao criar (nome e ct_id)', async () => {
    const { token } = await criarContaELogar();

    // falta ct_id
    const res1 = await request(app)
      .post('/alunos')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Aluno Teste' });

    expect(res1.status).toBe(400);

    // falta nome
    const ctId = await criarCt(token);
    const res2 = await request(app)
      .post('/alunos')
      .set('Authorization', `Bearer ${token}`)
      .send({ ct_id: ctId });

    expect(res2.status).toBe(400);
  });

  it('criar aluno com sucesso', async () => {
    const { token } = await criarContaELogar();
    const ctId = await criarCt(token);

    const payload = {
      ct_id: ctId,
      nome: 'Aluno Criado',
      cpf: '12345678901'
    };

    const res = await request(app)
      .post('/alunos')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.dados).toHaveProperty('id');
    expect(res.body.dados).toHaveProperty('nome', payload.nome);
  });

  it('buscar aluno por id da própria conta', async () => {
    const { token } = await criarContaELogar();
    const ctId = await criarCt(token);

    const create = await request(app)
      .post('/alunos')
      .set('Authorization', `Bearer ${token}`)
      .send({ ct_id: ctId, nome: 'Aluno Para Buscar' });

    expect(create.status).toBe(201);
    const id = create.body.dados.id;

    const res = await request(app)
      .get(`/alunos/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.dados).toHaveProperty('id', id);
  });

  it('atualizar aluno', async () => {
    const { token } = await criarContaELogar();
    const ctId = await criarCt(token);

    const create = await request(app)
      .post('/alunos')
      .set('Authorization', `Bearer ${token}`)
      .send({ ct_id: ctId, nome: 'Aluno Para Atualizar', telefone: '9999' });

    const id = create.body.dados.id;

    const res = await request(app)
      .put(`/alunos/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Aluno Atualizado', telefone: '8888' });

    expect(res.status).toBe(200);
    expect(res.body.dados).toHaveProperty('nome', 'Aluno Atualizado');
    expect(res.body.dados).toHaveProperty('telefone', '8888');
  });

  it('desativar aluno (exclusão lógica)', async () => {
    const { token } = await criarContaELogar();
    const ctId = await criarCt(token);

    const create = await request(app)
      .post('/alunos')
      .set('Authorization', `Bearer ${token}`)
      .send({ ct_id: ctId, nome: 'Aluno Para Desativar' });

    const id = create.body.dados.id;

    const res = await request(app)
      .delete(`/alunos/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.dados).toHaveProperty('ativo', 0);
  });

  it('garantir isolamento por account para alunos', async () => {
    const a = await criarContaELogar({ email: `a${Date.now()}@example.com`, nomeAccount: 'Conta A' });
    const b = await criarContaELogar({ email: `b${Date.now()}@example.com`, nomeAccount: 'Conta B' });

    const ctB = await criarCt(b.token);

    const createB = await request(app)
      .post('/alunos')
      .set('Authorization', `Bearer ${b.token}`)
      .send({ ct_id: ctB, nome: 'Aluno Conta B' });

    const idB = createB.body.dados.id;

    const listA = await request(app)
      .get('/alunos')
      .set('Authorization', `Bearer ${a.token}`);

    expect(listA.status).toBe(200);
    const found = (listA.body.dados || []).find((al) => al.id === idB);
    expect(found).toBeUndefined();

    const getA = await request(app)
      .get(`/alunos/${idB}`)
      .set('Authorization', `Bearer ${a.token}`);

    expect(getA.status).toBe(404);
  });
});
