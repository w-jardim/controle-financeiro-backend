const request = require('supertest');
const app = require('../../src/app');
const { limparBanco } = require('../helpers/db');
const { criarContaELogar } = require('../helpers/auth');
const { criarCt } = require('../helpers/ct');

describe('Mensalidade ↔ Transações Integration Tests', () => {
  beforeEach(async () => {
    await limparBanco();
  });

  it('criar mensalidade e pagar não cria transação automaticamente; criação manual funciona', async () => {
    const { token } = await criarContaELogar();
    const ctId = await criarCt(token);

    const aluno = await request(app)
      .post('/alunos')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Aluno MT', ct_id: ctId });

    // criar mensalidade
    const created = await request(app)
      .post('/mensalidades')
      .set('Authorization', `Bearer ${token}`)
      .send({ aluno_id: aluno.body.dados.id, competencia: '2026-12', valor: 150, vencimento: '2026-12-10' });

    expect(created.status).toBe(201);

    // listar transacoes antes - deve estar vazio
    const before = await request(app)
      .get('/transacoes')
      .set('Authorization', `Bearer ${token}`);

    expect(before.status).toBe(200);
    const initialTotal = before.body.dados.length || 0;

    // pagar mensalidade
    const pagar = await request(app)
      .patch(`/mensalidades/${created.body.dados.id}/pagar`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(pagar.status).toBe(200);
    expect(pagar.body.dados.status).toBe('pago');

    // listar transacoes depois - não deve ter criado nenhuma automaticamente
    const after = await request(app)
      .get('/transacoes')
      .set('Authorization', `Bearer ${token}`);

    expect(after.status).toBe(200);
    expect(after.body.dados.length).toBe(initialTotal);

    // criar transacao manualmente
    const trans = await request(app)
      .post('/transacoes')
      .set('Authorization', `Bearer ${token}`)
      .send({ tipo: 'receita', descricao: `Recebimento mensalidade ${created.body.dados.id}`, valor: 150, ct_id: ctId });

    expect(trans.status).toBe(201);
    expect(trans.body.dados).toHaveProperty('id');

    // listar transacoes e confirmar incremento
    const final = await request(app)
      .get('/transacoes')
      .set('Authorization', `Bearer ${token}`);

    expect(final.status).toBe(200);
    expect(final.body.dados.length).toBe(initialTotal + 1);
  });
});
