const request = require('supertest');
const app = require('../../src/app');
const fs = require('fs');
const path = require('path');

describe('Fase 4 — Encerramento Técnico', () => {

  // ============================================
  // .env.example coerente com envs usadas
  // ============================================

  describe('.env.example', () => {
    const envExamplePath = path.resolve(__dirname, '../../.env.example');
    let envExampleContent;

    beforeAll(() => {
      envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
    });

    it('arquivo .env.example existe', () => {
      expect(fs.existsSync(envExamplePath)).toBe(true);
    });

    const envsEsperadas = [
      'DB_HOST',
      'DB_PORT',
      'DB_USER',
      'DB_PASSWORD',
      'DB_NAME',
      'JWT_SECRET',
      'JWT_EXPIRES_IN',
      'PORT',
      'NODE_ENV',
      'LOG_LEVEL',
      'CORS_ORIGIN'
    ];

    it.each(envsEsperadas)('%s está documentada no .env.example', (envVar) => {
      expect(envExampleContent).toContain(envVar);
    });
  });

  // ============================================
  // Readiness endpoint
  // ============================================

  describe('GET /ready', () => {
    it('retorna 200 ou 503 com estrutura correta', async () => {
      const res = await request(app).get('/ready');
      expect([200, 503]).toContain(res.status);
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('banco');
      expect(res.body).toHaveProperty('timestamp');
    });

    it('retorna X-Request-Id', async () => {
      const res = await request(app).get('/ready');
      expect(res.headers['x-request-id']).toBeDefined();
    });
  });

  // ============================================
  // Rota raiz completa
  // ============================================

  describe('GET /', () => {
    it('retorna versão, ambiente e endpoints essenciais', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('versao');
      expect(res.body).toHaveProperty('ambiente');
      expect(res.body.endpoints).toHaveProperty('documentacao', '/docs');
      expect(res.body.endpoints).toHaveProperty('saude', '/saude');
      expect(res.body.endpoints).toHaveProperty('ready', '/ready');
      expect(res.body.endpoints).toHaveProperty('ping', '/ping');
    });
  });

  // ============================================
  // Coerência de rotas de saúde
  // ============================================

  describe('Rotas de saúde coerentes', () => {
    it('GET /saude → 200', async () => {
      const res = await request(app).get('/saude');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    it('GET /ping → 200', async () => {
      const res = await request(app).get('/ping');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    it('GET /docs.json → spec OpenAPI válida', async () => {
      const res = await request(app).get('/docs.json');
      expect(res.status).toBe(200);
      expect(res.body.openapi).toMatch(/^3\./);
    });
  });

  // ============================================
  // Validação de env obrigatória (validarEnv)
  // ============================================

  describe('validarEnv', () => {
    it('lança erro quando falta variável obrigatória', () => {
      // Salvar valor original
      const original = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      // Re-require para pegar módulo fresh
      jest.resetModules();
      const validarEnv = require('../../src/shared/utils/validarEnv');

      expect(() => validarEnv()).toThrow('JWT_SECRET');

      // Restaurar
      process.env.JWT_SECRET = original;
    });

    it('não lança erro quando todas as variáveis estão presentes', () => {
      jest.resetModules();
      const validarEnv = require('../../src/shared/utils/validarEnv');
      expect(() => validarEnv()).not.toThrow();
    });
  });

  // ============================================
  // CORS com X-Request-Id
  // ============================================

  describe('CORS', () => {
    it('inclui X-Request-Id nos headers permitidos', async () => {
      const res = await request(app)
        .options('/saude')
        .set('Origin', 'http://localhost:4200')
        .set('Access-Control-Request-Method', 'GET')
        .set('Access-Control-Request-Headers', 'X-Request-Id');
      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-headers']).toMatch(/X-Request-Id/i);
    });
  });

  // ============================================
  // Lint config existe
  // ============================================

  describe('Quality gate', () => {
    it('.eslintrc.js existe', () => {
      const eslintPath = path.resolve(__dirname, '../../.eslintrc.js');
      expect(fs.existsSync(eslintPath)).toBe(true);
    });

    it('package.json tem script lint', () => {
      const pkg = require('../../package.json');
      expect(pkg.scripts).toHaveProperty('lint');
    });
  });
});
