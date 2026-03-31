const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const { limparBanco } = require('../helpers/db');
const { criarContaELogar } = require('../helpers/auth');

describe('Fase 3 — Infraestrutura', () => {

  // ============================================
  // Swagger / OpenAPI
  // ============================================

  describe('Swagger UI', () => {
    it('GET /docs → redireciona para Swagger UI (301/302)', async () => {
      const res = await request(app).get('/docs');
      // swagger-ui-express redireciona /docs para /docs/
      expect([200, 301, 302]).toContain(res.status);
    });

    it('GET /docs/ → 200 com HTML', async () => {
      const res = await request(app).get('/docs/');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/html/);
    });

    it('GET /docs.json → 200 com spec OpenAPI', async () => {
      const res = await request(app).get('/docs.json');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('openapi');
      expect(res.body).toHaveProperty('paths');
      expect(res.body).toHaveProperty('info');
    });
  });

  // ============================================
  // Request-ID
  // ============================================

  describe('Request-ID', () => {
    it('gera X-Request-Id automaticamente', async () => {
      const res = await request(app).get('/saude');
      expect(res.headers['x-request-id']).toBeDefined();
      // UUID v4 format
      expect(res.headers['x-request-id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it('propaga X-Request-Id recebido no header', async () => {
      const customId = 'meu-id-customizado-123';
      const res = await request(app)
        .get('/saude')
        .set('X-Request-Id', customId);
      expect(res.headers['x-request-id']).toBe(customId);
    });

    it('inclui requestId em resposta de erro', async () => {
      const res = await request(app)
        .get('/transacoes')
        .set('X-Request-Id', 'req-erro-teste');
      expect(res.status).toBe(401);
      expect(res.body.erro).toHaveProperty('requestId', 'req-erro-teste');
    });
  });

  // ============================================
  // JWT Hardening
  // ============================================

  describe('JWT Hardening', () => {
    beforeEach(async () => {
      await limparBanco();
    });

    it('rejeita token ausente com 401', async () => {
      const res = await request(app).get('/transacoes');
      expect(res.status).toBe(401);
      expect(res.body.erro.mensagem).toBe('Token não informado');
    });

    it('rejeita token com formato inválido (sem Bearer)', async () => {
      const res = await request(app)
        .get('/transacoes')
        .set('Authorization', 'InvalidFormat abc123');
      expect(res.status).toBe(401);
      expect(res.body.erro.mensagem).toBe('Formato de token inválido');
    });

    it('rejeita token inválido (assinatura errada)', async () => {
      const tokenFalso = jwt.sign(
        { sub: 1, accountId: 1, role: 'ct_owner' },
        'segredo-errado',
        { expiresIn: '1h' }
      );
      const res = await request(app)
        .get('/transacoes')
        .set('Authorization', `Bearer ${tokenFalso}`);
      expect(res.status).toBe(401);
      expect(res.body.erro.mensagem).toBe('Token inválido');
    });

    it('rejeita token expirado', async () => {
      const tokenExpirado = jwt.sign(
        { sub: 1, accountId: 1, role: 'ct_owner' },
        process.env.JWT_SECRET,
        { expiresIn: '0s' }
      );
      // Aguardar 1s para garantir expiração
      await new Promise(resolve => setTimeout(resolve, 1100));

      const res = await request(app)
        .get('/transacoes')
        .set('Authorization', `Bearer ${tokenExpirado}`);
      expect(res.status).toBe(401);
      expect(res.body.erro.mensagem).toBe('Token expirado');
    });

    it('aceita token válido', async () => {
      const { token } = await criarContaELogar();
      const res = await request(app)
        .get('/transacoes')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });

  // ============================================
  // Rota raiz com documentacao atualizada
  // ============================================

  describe('Rota raiz', () => {
    it('GET / → documentacao aponta para /docs', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body.endpoints.documentacao).toBe('/docs');
    });
  });
});
