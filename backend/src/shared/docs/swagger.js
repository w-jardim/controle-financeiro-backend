const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const specPath = path.join(__dirname, 'openapi.yaml');
const specContent = fs.readFileSync(specPath, 'utf8');
const swaggerDocument = yaml.load(specContent);

function setupSwagger(app) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'Controlador Financeiro — API Docs',
    customCss: '.swagger-ui .topbar { display: none }'
  }));

  app.get('/docs.json', (_req, res) => {
    res.json(swaggerDocument);
  });
}

module.exports = setupSwagger;
