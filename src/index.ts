import express from "express";
import fs from "fs";
import path from "path";
import swaggerUi from "swagger-ui-express";

const app = express();
const PORT = 3000;
const ROOT = path.join(__dirname, "api-specs");

const services = fs.readdirSync(ROOT, { withFileTypes: true })
  .filter(d => d.isDirectory() && fs.existsSync(path.join(ROOT, d.name, "openapi.json")))
  .map(d => ({ name: d.name, url: `/specs/${d.name}/openapi.json` }));

services.forEach(svc => {
  app.get(`/specs/${svc.name}/openapi.json`, (req, res) => {
    res.sendFile(path.join(ROOT, svc.name, "openapi.json"));
  });
});

// Swagger UI на "/"
app.use("/", (req, res, next) => {
  const middleware = swaggerUi.serve;
  middleware(req, res, () => {
    swaggerUi.setup(undefined, { explorer: true, swaggerOptions: { urls: services } })(req, res, next);
  });
});

app.listen(PORT, () => console.log(`Swagger UI running at http://localhost:${PORT}`));
