import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createCrudRouter } from "./routes/crudRoutes.js";
import { createSplunkPortalsRouter } from "./routes/splunkPortalsRoute.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || process.env.API_PORT || 3001);
const distPath = path.resolve(__dirname, "../dist");

app.disable("x-powered-by");
app.use(express.json({ limit: process.env.JSON_LIMIT || "15mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, service: "plataforma-bellinati-api" });
});

app.use("/api", createSplunkPortalsRouter());
app.use("/api", createCrudRouter());

app.use(express.static(distPath));
app.use((request, response, next) => {
  if (request.method !== "GET" || request.path.startsWith("/api")) {
    return next();
  }

  return response.sendFile(path.join(distPath, "index.html"));
});

app.use((error, _request, response, _next) => {
  const status = error.status || 500;

  response.status(status).json({
    data: null,
    error: {
      message: error.message || "Erro interno do servidor.",
      code: error.code,
    },
  });
});

app.listen(port, () => {
  console.log(`API e SPA disponiveis em http://localhost:${port}`);
});
