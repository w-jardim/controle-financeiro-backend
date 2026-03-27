const request = require('supertest');
const app = require('../../src/app');

async function criarContaELogar(overrides = {}) {
  const unique = Date.now();
  const payload = {
    nomeResponsavel: overrides.nomeResponsavel || `Teste User ${unique}`,
    email: overrides.email || `test+${unique}@example.com`,
    senha: overrides.senha || '123456',
    nomeAccount: overrides.nomeAccount || `Conta Teste ${unique}`,
    tipoAccount: overrides.tipoAccount || 'ct_owner'
  };

  const resCadastro = await request(app).post('/auth/cadastro').send(payload);

  if (resCadastro.status !== 201) {
    throw new Error(`Falha no cadastro de teste (status ${resCadastro.status}): ${JSON.stringify(resCadastro.body)}`);
  }

  const resLogin = await request(app)
    .post('/auth/login')
    .send({ email: payload.email, senha: payload.senha });

  if (resLogin.status !== 200) {
    throw new Error(`Falha no login de teste (status ${resLogin.status}): ${JSON.stringify(resLogin.body)}`);
  }

  return {
    token: resLogin.body.token,
    accountId: resCadastro.body.accountId,
    userId: resCadastro.body.userId,
    ctId: resCadastro.body.ctId
  };
}

module.exports = {
  criarContaELogar
};
