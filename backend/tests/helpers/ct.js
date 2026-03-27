const request = require('supertest');
const app = require('../../src/app');

async function criarCt(token, nome = `CT Helper ${Date.now()}`) {
  const res = await request(app)
    .post('/cts')
    .set('Authorization', `Bearer ${token}`)
    .send({ nome });

  if (res.status !== 201) {
    throw new Error(`Falha ao criar CT de teste (status ${res.status}): ${JSON.stringify(res.body)}`);
  }

  return res.body.id;
}

module.exports = {
  criarCt
};
