const request = require('supertest');
const app = require('../../src/app');
const { limparBanco } = require('../helpers/db');

describe('Auth Integration Tests', () => {
  beforeEach(async () => {
    await limparBanco();
  });

  it('Cadastro com sucesso — POST /auth/cadastro', async () => {
    const payload = {
      nomeResponsavel: 'Wallace',
      email: 'wallace@email.com',
      senha: '123456',
      nomeAccount: 'Conta Wallace',
      tipoAccount: 'ct_owner'
    };

    const res = await request(app).post('/auth/cadastro').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.dados).toHaveProperty('accountId');
    expect(res.body.dados).toHaveProperty('userId');
  });

  it('Login com sucesso — POST /auth/login', async () => {
    const cadastro = {
      nomeResponsavel: 'Wallace',
      email: 'wallace@email.com',
      senha: '123456',
      nomeAccount: 'Conta Wallace',
      tipoAccount: 'ct_owner'
    };

    await request(app).post('/auth/cadastro').send(cadastro);

    const res = await request(app).post('/auth/login').send({
      email: cadastro.email,
      senha: cadastro.senha
    });

    expect(res.status).toBe(200);
    expect(res.body.dados).toHaveProperty('token');
    expect(res.body.dados.token).toBeTruthy();
  });

  it('Login com senha inválida — POST /auth/login retorna 401', async () => {
    const cadastro = {
      nomeResponsavel: 'Teste Usuario',
      email: 'teste@email.com',
      senha: '123456',
      nomeAccount: 'Conta Teste',
      tipoAccount: 'ct_owner'
    };

    await request(app).post('/auth/cadastro').send(cadastro);

    const res = await request(app).post('/auth/login').send({
      email: cadastro.email,
      senha: 'senhaerrada'
    });

    expect(res.status).toBe(401);
  });

  it('Cadastro duplicado (mesmo email) — POST /auth/cadastro retorna 409', async () => {
    const payload = {
      nomeResponsavel: 'Teste Usuario',
      email: 'teste@email.com',
      senha: '123456',
      nomeAccount: 'Conta Teste',
      tipoAccount: 'ct_owner'
    };

    const first = await request(app).post('/auth/cadastro').send(payload);
    expect(first.status).toBe(201);

    const second = await request(app).post('/auth/cadastro').send(payload);
    expect(second.status).toBe(409);
  });
});
