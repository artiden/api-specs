import express from 'express';
import fs from 'fs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';

const app = express();
const PORT = 3000;
const SERVICES_DIR = path.join(__dirname, '..'); // корень репозитория

// Получаем список сервисов (только те, где есть openapi.json)
const services = fs.readdirSync(SERVICES_DIR)
  .filter((name) => {
    const filePath = path.join(SERVICES_DIR, name, 'openapi.json');
    return fs.existsSync(filePath) && fs.statSync(path.join(SERVICES_DIR, name)).isDirectory();
  })
  .map((name) => ({ name, url: `/${name}/openapi.json` }));

// Эндпоинты для отдачи каждого JSON
services.forEach((service) => {
  const jsonPath = path.join(SERVICES_DIR, service.name, 'openapi.json');
  app.get(service.url, (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(jsonPath);
  });
});

// Swagger UI с выпадающим списком сервисов
app.use('/', swaggerUi.serve);
app.get('/', (req, res, next) => {
  swaggerUi.setup(undefined, { explorer: true, swaggerOptions: { urls: services } })(req, res, next);
});

app.listen(PORT, () => {
  console.log(`Swagger UI listening on http://localhost:${PORT}`);
});
