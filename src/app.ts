import express from "express";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

// Root folder
const SERVICES_DIR = path.join(__dirname, "api-specs");

// Each folder, which contains `openapi.json` file - service
function getServices() {
  const entries = fs.readdirSync(SERVICES_DIR, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((dir) => {
      const filePath = path.join(SERVICES_DIR, dir.name, "openapi.json");
      if (fs.existsSync(filePath)) {
        return {
          name: dir.name,
          url: `/specs/${dir.name}/openapi.json`,
        };
      }
      return null;
    })
    .filter(Boolean) as { name: string; url: string }[];
}

const services = getServices();

// serves openapi.json by URL like: /specs/:service/openapi.json
app.use("/specs", express.static(SERVICES_DIR));

app.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    explorer: true,
    swaggerOptions: {
      urls: services, // list of services
    },
  })
);

app.listen(PORT, () => {
  console.log(`Swagger UI available at http://localhost:${PORT}`);
});
