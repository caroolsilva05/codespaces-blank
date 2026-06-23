import { Router } from "express";
import {
  PERIOD_TO_EARLIEST,
  SPLUNK_PORTALS_QUERY,
  parseSplunkExport,
  postSplunkExport,
} from "../../src/server/splunk/index.js";

export function createSplunkPortalsRouter() {
  const router = Router();

  router.get("/splunk-portals", async (request, response) => {
    const baseUrl = process.env.SPLUNK_BASE_URL;
    const authToken = process.env.SPLUNK_AUTH_TOKEN;

    if (!baseUrl || !authToken) {
      return response.status(500).json({
        error:
          "Splunk nao configurado. Defina SPLUNK_BASE_URL e SPLUNK_AUTH_TOKEN nas variaveis de ambiente.",
      });
    }

    const period = String(request.query.period || "Hoje");
    const body = new URLSearchParams({
      search: SPLUNK_PORTALS_QUERY,
      output_mode: "json",
      earliest_time: PERIOD_TO_EARLIEST[period] || PERIOD_TO_EARLIEST.Hoje,
      latest_time: "now",
    });

    try {
      const splunkResponse = await postSplunkExport({
        baseUrl,
        authToken,
        body,
      });

      if (!splunkResponse.ok) {
        return response.status(splunkResponse.status).json({
          error: "Erro ao consultar o Splunk.",
          details: splunkResponse.text.slice(0, 500),
        });
      }

      return response.status(200).json({
        period,
        updatedAt: new Date().toISOString(),
        rows: parseSplunkExport(splunkResponse.text),
      });
    } catch (error) {
      return response.status(500).json({
        error: "Falha ao conectar no Splunk.",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  });

  return router;
}
