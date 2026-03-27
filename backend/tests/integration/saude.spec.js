const request = require('supertest');
const app = require('../../src/app');

describe('Smoke Tests - API', () => {
  it('GET /saude → 200 e status ok', async () => {
    const res = await request(app).get('/saude');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('GET /ping → 200', async () => {
    const res = await request(app).get('/ping');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('GET / → 200 e info da API', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('mensagem');
    expect(res.body).toHaveProperty('versao');
  });

  it('rota inexistente → 404', async () => {
    const res = await request(app).get('/rota-que-nao-existe');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('erro');
  });
});
